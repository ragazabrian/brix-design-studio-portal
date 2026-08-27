import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { PortalShell } from "@/components/portal/PortalShell";
import { useProfile, useRoles, useSession, type AppRole } from "@/hooks/usePortal";
import { useChatThreads, useCreateChatThread } from "@/hooks/useAssistant";

export const Route = createFileRoute("/_authenticated/assistant/")({
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
  component: AssistantIndexPage,
});

function AssistantIndexPage() {
  const { user } = useSession();
  const identity = user?.user_metadata as Record<string, unknown> | undefined;
  const { data: profile } = useProfile(user?.id, identity);
  const { data: roles } = useRoles(user?.id);
  const { data: threads, isPending } = useChatThreads(user?.id);
  const createThread = useCreateChatThread(user?.id);
  const navigate = useNavigate();

  const role: AppRole | undefined = roles?.includes("admin")
    ? "admin"
    : roles?.includes("designer")
      ? "designer"
      : roles?.includes("client")
        ? "client"
        : undefined;

  useEffect(() => {
    if (!user || isPending || !threads) return;
    const newest = threads[0];
    if (newest) {
      void navigate({
        to: "/assistant/$threadId",
        params: { threadId: newest.id },
        replace: true,
      });
      return;
    }
    if (createThread.isPending || createThread.isSuccess) return;
    createThread.mutate(undefined, {
      onSuccess: (thread) => {
        void navigate({
          to: "/assistant/$threadId",
          params: { threadId: thread.id },
          replace: true,
        });
      },
    });
  }, [user, isPending, threads, createThread, navigate]);

  return (
    <PortalShell
      title="Studio assistant"
      description="Opening your latest chat."
      role={role}
      profileName={profile?.full_name}
      avatarUrl={profile?.avatar_url}
    >
      <p className="text-muted-foreground">One moment.</p>
    </PortalShell>
  );
}
