import { createFileRoute } from "@tanstack/react-router";
import { PhasesPage } from "@/components/portal/PortalFeaturePage";

export const Route = createFileRoute("/_authenticated/phases")({
  head: () => ({
    meta: [
      { title: "Project phases | Brix Client Portal" },
      { name: "description", content: "Track planned, active, review and completed project work." },
      { property: "og:title", content: "Project phases | Brix Client Portal" },
      { property: "og:description", content: "Track planned, active, review and completed project work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PhasesPage,
});