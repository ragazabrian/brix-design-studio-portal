import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { findChatModel } from "@/lib/chat-models";

const SYSTEM_PROMPT = [
  "You are the Brix Design Studio portal assistant.",
  "You help clients and the studio team with project work: briefs, copy, design feedback,",
  "timelines, meeting notes and general questions.",
  "Be direct and practical. Use plain language, short paragraphs and lists where they help.",
  "Say when you are unsure rather than guessing.",
].join(" ");

type ChatRequestBody = {
  messages?: unknown;
  model?: unknown;
  threadId?: unknown;
};

function messageText(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["OPENAI_API_KEY"];
        const supabaseUrl = process.env["SUPABASE_URL"];
        const supabaseKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!apiKey || !supabaseUrl || !supabaseKey) {
          return new Response("The assistant is not configured yet.", { status: 500 });
        }

        const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
        if (!token) return new Response("Please sign in again.", { status: 401 });

        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false },
          global: {
            fetch: (input, init) => {
              const headers = new Headers(init?.headers);
              headers.set("apikey", supabaseKey);
              headers.set("Authorization", `Bearer ${token}`);
              return fetch(input, { ...init, headers });
            },
          },
        });

        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        const user = userData?.user;
        if (userError || !user) return new Response("Please sign in again.", { status: 401 });

        const body = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(body.messages)) {
          return new Response("No messages were sent.", { status: 400 });
        }
        if (typeof body.threadId !== "string" || body.threadId.length === 0) {
          return new Response("This chat could not be found.", { status: 400 });
        }

        const threadId = body.threadId;
        const messages = body.messages as UIMessage[];
        const model = findChatModel(typeof body.model === "string" ? body.model : null);

        const { data: thread, error: threadError } = await supabase
          .from("chat_threads")
          .select("id")
          .eq("id", threadId)
          .maybeSingle();
        if (threadError || !thread) {
          return new Response("This chat could not be found.", { status: 404 });
        }

        const latest = messages[messages.length - 1];
        if (latest?.role === "user") {
          const { error: insertError } = await supabase.from("chat_messages").insert({
            thread_id: threadId,
            user_id: user.id,
            role: "user",
            parts: latest.parts as unknown as never,
            content: messageText(latest),
            sdk_message_id: latest.id ?? null,
          });
          if (insertError) console.error("chat: saving question failed", insertError);

          const firstTurn = messages.filter((item) => item.role === "user").length === 1;
          const patch: Record<string, string> = { model: model.id };
          if (firstTurn) patch["title"] = messageText(latest).slice(0, 60) || "New chat";
          const { error: threadPatchError } = await supabase
            .from("chat_threads")
            .update(patch)
            .eq("id", threadId);
          if (threadPatchError) console.error("chat: updating chat failed", threadPatchError);
        }

        const modelMessages = await convertToModelMessages(messages);

        async function persistAnswer(message: UIMessage) {
          const { error } = await supabase.from("chat_messages").insert({
            thread_id: threadId,
            user_id: user!.id,
            role: "assistant",
            parts: message.parts as unknown as never,
            content: messageText(message),
            sdk_message_id: message.id ?? null,
          });
          if (error) console.error("chat: saving answer failed", error);
        }

        try {
          const openai = createOpenAI({ apiKey });

          if (model.responses) {
            const reasoning =
              model.id === "gpt-4o-mini"
                ? { store: false }
                : {
                    forceReasoning: true,
                    reasoningEffort: "medium",
                    reasoningSummary: "auto",
                    store: false,
                    include: ["reasoning.encrypted_content"],
                  };

            const result = streamText({
              model: openai.responses(model.id),
              system: SYSTEM_PROMPT,
              messages: modelMessages,
              abortSignal: request.signal,
              providerOptions: { openai: reasoning },
            });

            return result.toUIMessageStreamResponse({
              originalMessages: messages,
              sendReasoning: true,
              onFinish: ({ responseMessage }) => persistAnswer(responseMessage),
            });
          }

          const result = streamText({
            model: openai(model.id),
            system: SYSTEM_PROMPT,
            messages: modelMessages,
            abortSignal: request.signal,
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages,
            onFinish: ({ responseMessage }) => persistAnswer(responseMessage),
          });
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            return new Response("Stopped", { status: 499 });
          }
          console.error("chat: model call failed", error);
          return new Response("The assistant could not answer just now.", { status: 502 });
        }
      },
    },
  },
});
