import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { PortalShell } from "@/components/portal/PortalShell";
import { AssistantChat } from "@/components/portal/AssistantChat";
import { useProfile, useRoles, useSession, type AppRole } from "@/hooks/usePortal";
import {
  useChatMessages,
  useChatThread,
  useChatThreads,
  useCreateChatThread,
  useDeleteChatThread,
} from "@/hooks/useAssistant";
import { defaultChatModel } from "@/lib/chat-models";

export const Route = createFileRoute("/_authenticated/assistant/$threadId")({
  head: () => ({
    meta: [
      { title: "Studio assistant | Brix Design Studio" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Chat with the Brix studio assistant about briefs, feedback and timelines.",
      },
    ],
  }),
  component: AssistantThreadPage,
});

function AssistantThreadPage() {
  const { threadId } = Route.useParams();
  const { user } = useSession();
  const identity = user?.user_metadata as Record<string, unknown> | undefined;
  const { data: profile } = useProfile(user?.id, identity);
  const { data: roles } = useRoles(user?.id);
  const { data: threads } = useChatThreads(user?.id);
  const { data: thread, isPending: threadPending } = useChatThread(threadId);
  const { data: messages, isPending: messagesPending } = useChatMessages(threadId);
  const createThread = useCreateChatThread(user?.id);
  const deleteThread = useDeleteChatThread(user?.id);
  const navigate = useNavigate();

  const role: AppRole | undefined = roles?.includes("admin")
    ? "admin"
    : roles?.includes("designer")
      ? "designer"
      : roles?.includes("client")
        ? "client"
        : undefined;

  function startChat() {
    createThread.mutate(thread?.model ?? defaultChatModel, {
      onSuccess: (created) => {
        void navigate({ to: "/assistant/$threadId", params: { threadId: created.id } });
      },
      onError: () => toast.error("The chat could not be started. Please try again."),
    });
  }

  function removeChat(id: string) {
    deleteThread.mutate(id, {
      onSuccess: () => {
        toast.success("Chat deleted.");
        if (id === threadId) void navigate({ to: "/assistant", replace: true });
      },
      onError: () => toast.error("The chat could not be deleted."),
    });
  }

  return (
    <PortalShell
      title="Studio assistant"
      description="Ask about briefs, feedback, timelines and anything else on your projects."
      role={role}
      profileName={profile?.full_name}
      avatarUrl={profile?.avatar_url}
      hideAssistantDock
      immersive
    >
      <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)] lg:grid-rows-1">
        <aside className="flex min-w-0 items-center gap-2 overflow-x-auto border-b border-border bg-card p-3 lg:flex-col lg:items-stretch lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-4">
          <button
            type="button"
            onClick={startChat}
            disabled={createThread.isPending}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={17} strokeWidth={1.8} aria-hidden />
            New chat
          </button>

          <nav aria-label="Your chats" className="flex gap-1 lg:grid">
            {(threads ?? []).map((item) => {
              const active = item.id === threadId;
              return (
                <div
                  key={item.id}
                  className={`grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-1 rounded-md px-1 ${
                    active ? "bg-muted" : ""
                  }`}
                >
                  <Link
                    to="/assistant/$threadId"
                    params={{ threadId: item.id }}
                    className="max-w-40 truncate rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted lg:max-w-none"
                    aria-current={active ? "page" : undefined}
                  >
                    {item.title}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeChat(item.id)}
                    aria-label={`Delete chat ${item.title}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.6} aria-hidden />
                  </button>
                </div>
              );
            })}
          </nav>
        </aside>

        <section aria-label="Conversation" className="min-h-0 overflow-hidden">
          {threadPending || messagesPending ? (
            <p className="text-muted-foreground">Loading this chat.</p>
          ) : !thread ? (
            <div className="m-6 rounded-lg border border-border p-6">
              <p className="font-medium">This chat is no longer here.</p>
              <p className="mt-2 text-caption text-muted-foreground">
                It may have been deleted. Start a new one to keep going.
              </p>
            </div>
          ) : (
            <AssistantChat
              key={thread.id}
              threadId={thread.id}
              initialMessages={messages ?? []}
              initialModel={thread.model}
            />
          )}
        </section>
      </div>
    </PortalShell>
  );
}
