import { createFileRoute } from "@tanstack/react-router";
import { LibraryPage } from "@/components/portal/PortalFeaturePage";

export const Route = createFileRoute("/_authenticated/modules")({
  head: () => ({ meta: [{ title: "Module library | Brix Client Portal" }, { name: "description", content: "Browse reusable project modules and patterns." }, { name: "robots", content: "noindex" }] }),
  component: () => <LibraryPage kind="module" />,
});
