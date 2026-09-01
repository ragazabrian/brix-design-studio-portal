import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { HugeiconsIcon } from "@hugeicons/react";
import { Attachment01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  usePromptInputAttachments,
  type PromptInputMessage,

} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { uploadToStudioDrive } from "@/lib/drive.functions";
import { supabase } from "@/integrations/supabase/client";
import { chatModels, findChatModel } from "@/lib/chat-models";
import brixMark from "@/assets/brix-wordmark-dark.svg.asset.json";

const authedFetch: typeof fetch = async (input, init) => {
  const { data } = await supabase.auth.getSession();
  const headers = new Headers(init?.headers);
  const token = data.session?.access_token;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
};

function fileToBase64(file: File) {
  return file.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  });
}

function AttachmentPreview({ onFilesChange }: { onFilesChange: (count: number) => void }) {
  const attachments = usePromptInputAttachments();
  useEffect(() => onFilesChange(attachments.files.length), [attachments.files.length, onFilesChange]);
  if (attachments.files.length === 0) return null;

  return (
    <ul aria-label="Files attached to this message" className="flex gap-2 overflow-x-auto pb-1">
      {attachments.files.map((file) => (
        <li key={file.id} className="relative w-16 shrink-0">
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open preview of ${file.filename ?? "attached file"}`}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
              {file.mediaType?.startsWith("image/") ? (
                <img
                  src={file.url}
                  alt={`Preview of ${file.filename ?? "attached file"}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <HugeiconsIcon icon={Attachment01Icon} size={21} strokeWidth={1.5} aria-hidden />
              )}
            </div>
          </a>
          <span className="mt-1 block truncate text-[10px] text-muted-foreground" title={file.filename}>
            {file.filename ?? "Attachment"}
          </span>
          <button
            type="button"
            onClick={() => attachments.remove(file.id)}
            aria-label={`Remove ${file.filename ?? "attached file"}`}
            className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}

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
  const upload = useServerFn(uploadToStudioDrive);
  const [model, setModel] = useState(() => findChatModel(initialModel).id);
  const [input, setInput] = useState("");
  const [attachmentCount, setAttachmentCount] = useState(0);
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

  async function handleSubmit(message: PromptInputMessage, event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const text = message.text.trim();
    const files = message.files.filter((item) => Boolean(item.url));
    if (!text && files.length === 0) return;

    const uploaded: string[] = [];
    for (const item of files) {
      const url = item.url;
      if (!url) continue;
      try {
        const response = await fetch(url);
        const name = item.filename ?? "attachment";
        const file = new File([await response.blob()], name, {
          type: item.mediaType ?? "application/octet-stream",
        });
        const saved = await upload({
          data: {
            name: file.name,
            mimeType: file.type,
            data: await fileToBase64(file),
            threadId,
          },
        });
        uploaded.push(saved.name);
      } catch {
        toast.error(`${item.filename ?? "That file"} could not be saved to the studio drive.`);
        return;
      }
    }

    const attachmentNote = uploaded.length > 0 ? `\n\nAttached to this request: ${uploaded.join(", ")}.` : "";
    setInput("");
    await sendMessage({ text: `${text || "Please review the attached file."}${attachmentNote}` });
    textareaRef.current?.focus();
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] bg-background">
      <Conversation className="min-h-0 bg-background">
        <ConversationContent className="mx-auto w-full max-w-3xl gap-7 px-5 py-8 md:px-8">
          {messages.length === 0 ? (
            <div className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center text-center">
              <img src={brixMark.url} alt="Brix Design Studio" width={1939} height={573} className="mx-auto h-5 w-auto" />
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
                    <p key={index} className="border-l-2 border-border pl-3 text-caption text-muted-foreground">
                      {part.text}
                    </p>
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ))}

          {status === "submitted" ? (
            <Message from="assistant">
              <MessageContent><Shimmer>Thinking...</Shimmer></MessageContent>
            </Message>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:px-8">
        <div className="mx-auto grid w-full max-w-3xl gap-2">
          <PromptInput
            onSubmit={handleSubmit}
            maxFiles={10}
            maxFileSize={20 * 1024 * 1024}
            onError={(error) => toast.error(error.message)}
            className="rounded-2xl border-border bg-card shadow-lg"
          >
            <AttachmentPreview onFilesChange={setAttachmentCount} />
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Message Brix"
              aria-label="Message the studio assistant"
              className="min-h-20"
            />
            <PromptInputFooter className="justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger tooltip="Attach a file" />
                  <PromptInputActionMenuContent side="top" align="start" className="z-[90]">
                    <PromptInputActionAddAttachments label="Attach from your device" />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <label className="min-w-0 text-caption text-muted-foreground">
                  <span className="sr-only">Model</span>
                  <select
                    value={model}
                    onChange={(event) => setModel(event.target.value)}
                    aria-label="Choose the model that answers"
                    className="max-w-[12rem] truncate rounded-md border-0 bg-transparent px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {chatModels.map((item) => (
                      <option key={item.id} value={item.id}>{item.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <PromptInputSubmit
                status={status}
                disabled={!busy && !input.trim() && attachmentCount === 0}
                onStop={() => void stop()}
              />
            </PromptInputFooter>
          </PromptInput>
          <p className="px-2 text-center text-caption text-muted-foreground">
            {findChatModel(model).note}
          </p>
        </div>
      </div>
    </div>
  );
}
