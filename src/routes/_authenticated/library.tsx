import { createFileRoute } from "@tanstack/react-router";
import { LibraryPage } from "@/components/portal/PortalFeaturePage";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({ meta: [{ title: "Asset library | Brix Client Portal" }, { name: "description", content: "Browse approved Brix project assets and brand files." }, { name: "robots", content: "noindex" }] }),
  component: () => <LibraryPage kind="brand" />,
});
