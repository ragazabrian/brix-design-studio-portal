import { createFileRoute } from "@tanstack/react-router";
import { MeetingsPage } from "@/components/portal/PortalFeaturePage";

export const Route = createFileRoute("/_authenticated/meetings")({
  head: () => ({ meta: [{ title: "Meetings | Brix Client Portal" }, { name: "description", content: "See upcoming Brix project meetings." }, { name: "robots", content: "noindex" }] }),
  component: MeetingsPage,
});
