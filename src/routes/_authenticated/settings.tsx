import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PortalShell } from "@/components/portal/PortalShell";
import { supabase } from "@/integrations/supabase/client";
import {
  notify,
  useIntegrations,
  useProfile,
  useRoles,
  useSession,
  type AppRole,
} from "@/hooks/usePortal";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Portal settings | Brix Client Portal" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content:
          "Manage connected accounts, review what each connection can see, and disconnect cleanly.",
      },
    ],
  }),
  component: SettingsPage,
});

const providers = [
  {
    key: "google_drive",
    label: "Google Drive",
    permissions: "Read and add files in the folders you pick.",
  },
  {
    key: "google_calendar",
    label: "Google Calendar",
    permissions: "Read free and busy times so meetings land in open slots.",
  },
  { key: "notion", label: "Notion", permissions: "Read and update the pages you share with us." },
  { key: "monday", label: "Monday.com", permissions: "Read boards and mirror task status." },
  {
    key: "atlassian",
    label: "Atlassian",
    permissions: "Read Jira issues and Confluence pages you share.",
  },
];

const statusCopy: Record<string, string> = {
  requested: "Waiting on us to finish the connection",
  connected: "Connected and syncing",
  error: "Something went wrong. Try connecting again.",
  disconnected: "Not connected",
};

function SettingsPage() {
  const { user } = useSession();
  const identity = user?.user_metadata as Record<string, unknown> | undefined;
  const { data: profile } = useProfile(user?.id, identity);
  const { data: roles } = useRoles(user?.id);
  const { data: connections } = useIntegrations();
  const queryClient = useQueryClient();

  const role: AppRole | undefined = roles?.includes("admin")
    ? "admin"
    : roles?.includes("designer")
      ? "designer"
      : roles?.includes("client")
        ? "client"
        : undefined;

  async function connect(provider: string, label: string) {
    const { error } = await supabase
      .from("integration_connections")
      .insert({ provider, user_id: user!.id, status: "requested" });
    if (error) {
      toast.error(`${label} was not requested. Please try again.`);
      await notify(user!.id, `${label} request failed`, "Please try again in a moment.", "error");
      return;
    }
    toast.success(`${label} request sent.`);
    await notify(
      user!.id,
      `${label} connection requested`,
      "You will get a message here once it is live.",
      "info",
    );
    await queryClient.invalidateQueries({ queryKey: ["integrations"] });
    await queryClient.invalidateQueries({ queryKey: ["notifications", user!.id] });
  }

  async function disconnect(id: string, label: string) {
    const { error } = await supabase.from("integration_connections").delete().eq("id", id);
    if (error) {
      toast.error(`${label} was not disconnected.`);
      await notify(user!.id, `${label} disconnect failed`, "The connection is still active.", "error");
      return;
    }
    toast.success(`${label} disconnected. Nothing is syncing from it now.`);
    await notify(user!.id, `${label} disconnected`, "Access has been removed.", "success");
    await queryClient.invalidateQueries({ queryKey: ["integrations"] });
    await queryClient.invalidateQueries({ queryKey: ["notifications", user!.id] });
  }

  async function setNotifyPreference(key: "notify_in_app" | "notify_email", value: boolean) {
    const patch =
      key === "notify_in_app" ? { notify_in_app: value } : { notify_email: value };
    const { error } = await supabase.from("profiles").update(patch).eq("id", user!.id);
    if (error) {
      toast.error("That preference was not saved.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile", user!.id] });
  }

  return (
    <PortalShell
      title="Settings"
      description="Your connected accounts, what each one can see, and how we reach you."
      role={role}
      profileName={profile?.full_name}
      avatarUrl={profile?.avatar_url}
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:gap-16">
        <section aria-labelledby="connections-heading">
          <h2 id="connections-heading" className="text-[20px] font-medium">
            Connected accounts
          </h2>
          <ul className="mt-6 divide-y divide-border rounded-3xl border border-border">
            {providers.map((provider) => {
              const connection = connections?.find((item) => item.provider === provider.key);
              const status = connection?.status ?? "disconnected";
              return (
                <li key={provider.key} className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium">{provider.label}</p>
                    <p className="mt-1 text-caption text-muted-foreground">
                      {statusCopy[status] ?? status}
                    </p>
                    <p className="mt-2 text-caption text-muted-foreground">
                      {provider.permissions}
                    </p>
                    {connection?.last_synced_at ? (
                      <p className="mt-1 text-caption text-muted-foreground tabular-nums">
                        Last sync {new Date(connection.last_synced_at).toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-start">
                    {connection ? (
                      <button
                        type="button"
                        onClick={() => disconnect(connection.id, provider.label)}
                        className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-frost"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => connect(provider.key, provider.label)}
                        className="rounded-full bg-ink px-4 py-2 text-sm text-paper transition-colors hover:bg-ink/85"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="prefs-heading">
          <h2 id="prefs-heading" className="text-[20px] font-medium">
            Messages
          </h2>
          <div className="mt-6 space-y-4 rounded-3xl border border-border p-5">
            <label className="flex items-center gap-3 text-[15px]">
              <input
                type="checkbox"
                checked={profile?.notify_in_app ?? true}
                onChange={(event) => setNotifyPreference("notify_in_app", event.target.checked)}
                className="h-4 w-4"
              />
              Show updates in the portal
            </label>
            <label className="flex items-center gap-3 text-[15px]">
              <input
                type="checkbox"
                checked={profile?.notify_email ?? true}
                onChange={(event) => setNotifyPreference("notify_email", event.target.checked)}
                className="h-4 w-4"
              />
              Email me about project updates
            </label>
          </div>

          <h2 className="mt-10 text-[20px] font-medium">Your access</h2>
          <p className="mt-3 text-caption text-muted-foreground">
            {role === "admin"
              ? "Admin: manage people, projects, files, tasks and hours."
              : role === "designer"
                ? "Designer: manage projects, files, tasks and hours you are assigned to."
                : "Client: view your projects, download files, and follow progress."}
          </p>
        </section>
      </div>
    </PortalShell>
  );
}
