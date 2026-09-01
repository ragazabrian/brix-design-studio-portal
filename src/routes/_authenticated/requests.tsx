import { createFileRoute } from "@tanstack/react-router";
import { RequestsPage } from "@/components/portal/PortalFeaturePage";

export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({ meta: [{ title: "Requests | Brix Client Portal" }, { name: "description", content: "Request new project assets and studio support." }, { name: "robots", content: "noindex" }] }),
  component: RequestsPage,
});
