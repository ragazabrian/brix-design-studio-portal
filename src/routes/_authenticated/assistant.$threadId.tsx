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
      { title: "Studio assistant | Brix Client Portal" },
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
    >
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
        <aside className="grid content-start gap-3">
          <button
            type="button"
            onClick={startChat}
            disabled={createThread.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={17} strokeWidth={1.8} aria-hidden />
            New chat
          </button>

          <nav aria-label="Your chats" className="grid gap-1">
            {(threads ?? []).map((item) => {
              const active = item.id === threadId;
              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1 rounded-2xl px-1 ${
                    active ? "bg-frost" : ""
                  }`}
                >
                  <Link
                    to="/assistant/$threadId"
                    params={{ threadId: item.id }}
                    className="truncate rounded-2xl px-3 py-2.5 text-sm transition-colors hover:bg-frost"
                    aria-current={active ? "page" : undefined}
                  >
                    {item.title}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeChat(item.id)}
                    aria-label={`Delete chat ${item.title}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-paper hover:text-ink"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.6} aria-hidden />
                  </button>
                </div>
              );
            })}
          </nav>
        </aside>

        <section aria-label="Conversation">
          {threadPending || messagesPending ? (
            <p className="text-muted-foreground">Loading this chat.</p>
          ) : !thread ? (
            <div className="rounded-3xl border border-border p-6">
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
