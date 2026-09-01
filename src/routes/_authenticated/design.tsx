import { createFileRoute } from "@tanstack/react-router";
import { DesignPage } from "@/components/portal/PortalFeaturePage";

export const Route = createFileRoute("/_authenticated/design")({
  head: () => ({
    meta: [
      { title: "Project design | Brix Client Portal" },
      { name: "description", content: "Review approved design work and project guidelines." },
      { property: "og:title", content: "Project design | Brix Client Portal" },
      { property: "og:description", content: "Review approved design work and project guidelines." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DesignPage,
});