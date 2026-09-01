import { createFileRoute, Outlet } from "@tanstack/react-router";

import { requirePortalRole } from "@/lib/portal-access";

export const Route = createFileRoute("/_authenticated/client")({
  beforeLoad: () => requirePortalRole("client"),
  component: () => <Outlet />,
});