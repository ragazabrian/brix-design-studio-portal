import { createFileRoute } from "@tanstack/react-router";
import { GuidelinesPage } from "@/components/portal/PortalFeaturePage";

export const Route = createFileRoute("/_authenticated/guidelines")({
  head: () => ({ meta: [{ title: "Brand guidelines | Brix Client Portal" }, { name: "description", content: "Review your project's visual brand guidelines." }, { name: "robots", content: "noindex" }] }),
  component: GuidelinesPage,
});
