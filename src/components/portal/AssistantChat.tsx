import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { supabase } from "@/integrations/supabase/client";
import { chatModels, findChatModel } from "@/lib/chat-models";
import brixMark from "@/assets/brix-wordmark-dark.svg.asset.json";

/** Adds the signed-in person's token so the chat endpoint can check who is asking. */
const authedFetch: typeof fetch = async (input, init) => {
  const { data } = await supabase.auth.getSession();
  const headers = new Headers(init?.headers);
  const token = data.session?.access_token;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
};

export function AssistantChat({
  threadId,
  initialMessages,
  initialModel,
}: {
  threadId: string;
  initialMessages: UIMessage[];
  initialModel: string;
}) {
  const queryClient = useQueryClient();
  const [model, setModel] = useState(() => findChatModel(initialModel).id);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: authedFetch,
      prepareSendMessagesRequest: ({ messages: outgoing, body }) => ({
        body: { ...body, messages: outgoing, threadId, model },
      }),
    }),
    onFinish: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
      textareaRef.current?.focus();
    },
    onError: (error) => {
      toast.error(error.message || "The assistant could not answer just now.");
    },
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void sendMessage({ text });
    textareaRef.current?.focus();
  }

  return (
    <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-4">
      <Conversation className="min-h-[24rem] rounded-3xl border border-border bg-paper">
        <ConversationContent className="gap-6">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-md py-12 text-center">
              <img
                src={brixMark.url}
                alt="Brix Design Studio"
                width={1939}
                height={573}
                className="mx-auto h-5 w-auto"
              />
              <p className="mt-5 text-[17px] font-medium">Ask about your projects</p>
              <p className="mt-2 text-caption text-muted-foreground">
                Draft a brief, tidy up feedback, plan a timeline or summarise a call. Pick a model
                below if you want a faster or a deeper answer.
              </p>
            </div>
          ) : null}

          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.parts.map((part, index) =>
                  part.type === "text" ? (
                    <MessageResponse key={index}>{part.text}</MessageResponse>
                  ) : part.type === "reasoning" && part.text ? (
                    <p
                      key={index}
                      className="border-l-2 border-border pl-3 text-caption text-muted-foreground"
                    >
                      {part.text}
                    </p>
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ))}

          {status === "submitted" ? (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking...</Shimmer>
              </MessageContent>
            </Message>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="grid gap-3">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask the studio assistant"
            aria-label="Message the studio assistant"
          />
          <PromptInputFooter className="justify-between gap-3">
            <label className="flex items-center gap-2 text-caption text-muted-foreground">
              <span className="sr-only sm:not-sr-only">Model</span>
              <select
                value={model}
                onChange={(event) => setModel(event.target.value)}
                aria-label="Choose the model that answers"
                className="max-w-[14rem] rounded-full border border-border bg-paper px-3 py-1.5 text-sm"
              >
                {chatModels.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <PromptInputSubmit
              status={status}
              disabled={!busy && input.trim().length === 0}
              onClick={busy ? () => void stop() : undefined}
            />
          </PromptInputFooter>
        </PromptInput>
        <p className="text-caption text-muted-foreground">{findChatModel(model).note}</p>
      </div>
    </div>
  );
}
