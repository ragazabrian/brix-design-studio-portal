import { createFileRoute } from "@tanstack/react-router";
import { DocumentsPage } from "@/components/portal/PortalFeaturePage";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({ meta: [{ title: "Documents | Brix Client Portal" }, { name: "description", content: "Find your Brix project documents." }, { name: "robots", content: "noindex" }] }),
  component: DocumentsPage,
});
