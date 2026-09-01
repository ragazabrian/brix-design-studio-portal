import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Attachment01Icon, Cancel01Icon, Message01Icon } from "@hugeicons/core-free-icons";

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
} from "@/components/ai-elements/prompt-input";
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { uploadToStudioDrive } from "@/lib/drive.functions";
import { useChatMessages, useChatThreads } from "@/hooks/useAssistant";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/usePortal";

const authedFetch: typeof fetch = async (input, init) => {
  const { data } = await supabase.auth.getSession();
  const headers = new Headers(init?.headers);
  if (data.session?.access_token) {
    headers.set("Authorization", `Bearer ${data.session.access_token}`);
  }
  return fetch(input, { ...init, headers });
};

function AttachmentPreview() {
  const attachments = usePromptInputAttachments();
  if (attachments.files.length === 0) return null;

  return (
    <ul aria-label="Files attached to this message" className="flex gap-2 overflow-x-auto pb-1">
      {attachments.files.map((file) => (
        <li key={file.id} className="relative w-16 shrink-0">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
            {file.mediaType?.startsWith("image/") ? (
              <img src={file.url} alt={`Preview of ${file.filename}`} className="h-full w-full object-cover" />
            ) : (
              <HugeiconsIcon icon={Attachment01Icon} size={21} strokeWidth={1.5} aria-hidden />
            )}
          </div>
          <span className="mt-1 block truncate text-[10px] text-muted-foreground" title={file.filename}>
            {file.filename}
          </span>
          <button
            type="button"
            onClick={() => attachments.remove(file.id)}
            aria-label={`Remove ${file.filename}`}
            className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}

function fileToBase64(file: File) {
  return file.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  });
}

export function AssistantDock() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { data: threads } = useChatThreads(user?.id);
  const activeThread = threads?.[0];
  const { data: initialMessages } = useChatMessages(activeThread?.id);
  const upload = useServerFn(uploadToStudioDrive);
  const [open, setOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chat = useChat({
    id: activeThread?.id ?? "portal-assistant",
    messages: (initialMessages ?? []) as UIMessage[],
    transport: new DefaultChatTransport({ api: "/api/chat", fetch: authedFetch }),
    onError: (error) => toast.error(error.message || "The assistant could not answer just now."),
    onFinish: () => textareaRef.current?.focus(),
  });

  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  async function submit(
    message: { text?: string; files?: Array<{ url?: string; filename?: string; mediaType?: string }> },
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (!activeThread || chat.status === "submitted" || chat.status === "streaming") return;
    const text = (message.text ?? "").trim();
    const files = (message.files ?? []).filter((item) => Boolean(item.url));
    if (!text && files.length === 0) return;

    const uploaded: string[] = [];
    for (const item of files) {
      try {
        const response = await fetch(item.url!);
        const name = item.filename ?? "attachment";
        const file = new File([await response.blob()], name, { type: item.mediaType ?? "application/octet-stream" });
        const saved = await upload({ data: { name: file.name, mimeType: file.type, data: await fileToBase64(file), threadId: activeThread.id } });
        uploaded.push(saved.name);
      } catch {
        toast.error(`${item.filename ?? "That file"} could not be saved to the studio drive.`);
        return;
      }
    }

    const attachmentNote = uploaded.length > 0 ? `\n\nAttached to this request: ${uploaded.join(", ")}.` : "";
    await chat.sendMessage({ text: `${text || "Please review the attached file."}${attachmentNote}` });
    textareaRef.current?.focus();
  }

  if (!activeThread) return null;
  const busy = chat.status === "submitted" || chat.status === "streaming";

  return (
    <aside className="fixed bottom-5 right-5 z-50 w-[min(25rem,calc(100vw-2.5rem))]" aria-label="Studio assistant">
      {open ? (
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand text-paper">
                <HugeiconsIcon icon={Message01Icon} size={16} strokeWidth={1.7} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium">Studio assistant</p>
                <p className="text-caption text-muted-foreground">Ask about this project</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
              <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.6} aria-hidden />
            </button>
          </div>
          <Conversation className="h-72 rounded-none border-0 bg-card">
            <ConversationContent className="gap-4 p-4">
              {chat.messages.length === 0 ? <p className="py-8 text-center text-caption text-muted-foreground">Ask for a brief, a timeline, or a clear next step.</p> : null}
              {chat.messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.parts.map((part, index) => part.type === "text" ? <MessageResponse key={index}>{part.text}</MessageResponse> : null)}
                  </MessageContent>
                </Message>
              ))}
              {chat.status === "submitted" ? <Message from="assistant"><MessageContent><Shimmer>Thinking...</Shimmer></MessageContent></Message> : null}
            </ConversationContent>
          </Conversation>
          <div className="border-t border-border p-3">
            <PromptInput onSubmit={submit} maxFiles={10} maxFileSize={20 * 1024 * 1024} onError={(error) => toast.error(error.message)}>
              <AttachmentPreview />
              <PromptInputTextarea ref={textareaRef} placeholder="Ask the studio assistant" aria-label="Message the studio assistant" />
              <PromptInputFooter>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger tooltip="Attach a file" />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments label="Attach from your device" />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <PromptInputSubmit status={chat.status} onStop={() => void chat.stop()} />
              </PromptInputFooter>
            </PromptInput>
          </div>
          <button type="button" onClick={() => navigate({ to: "/assistant/$threadId", params: { threadId: activeThread.id } })} className="w-full border-t border-border px-4 py-2 text-center text-caption text-muted-foreground hover:text-foreground">Open full assistant</button>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="ml-auto inline-flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-medium text-paper shadow-xl transition-transform hover:-translate-y-0.5">
          <HugeiconsIcon icon={Message01Icon} size={18} strokeWidth={1.7} aria-hidden />
          Ask the assistant
        </button>
      )}
    </aside>
  );
}
