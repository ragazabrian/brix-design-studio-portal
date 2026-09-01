import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { PortalShell } from "@/components/portal/PortalShell";
import { PillButton } from "@/components/site/Primitives";
import { supabase } from "@/integrations/supabase/client";
import { createPortalInvitation } from "@/lib/invitations.functions";
import {
  useInvitations,
  useProfile,
  useProjects,
  useRoles,
  useSession,
  useTeam,
  type AppRole,
} from "@/hooks/usePortal";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Team and access | Brix Client Portal" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Invite people to the Brix Client Portal, set their role and deactivate accounts.",
      },
    ],
  }),
  component: AdminPage,
});

const roles: AppRole[] = ["admin", "designer", "client"];
const roleLabel: Record<AppRole, string> = {
  admin: "Admin",
  designer: "Designer",
  client: "Client",
};

function AdminPage() {
  const { user } = useSession();
  const identity = user?.user_metadata as Record<string, unknown> | undefined;
  const { data: profile } = useProfile(user?.id, identity);
  const { data: myRoles, isPending: rolesPending } = useRoles(user?.id);
  const isAdmin = Boolean(myRoles?.includes("admin"));

  const { data: team } = useTeam(isAdmin);
  const { data: invitations } = useInvitations(isAdmin);
  const { data: projects } = useProjects();
  const queryClient = useQueryClient();
  const sendInvitation = useServerFn(createPortalInvitation);
  const [busy, setBusy] = useState(false);

  async function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    try {
      await sendInvitation({
        data: {
          email: String(data.get("email") ?? ""),
          role: String(data.get("role") ?? "client") as AppRole,
          note: String(data.get("note") ?? "") || undefined,
          projectIds: data.getAll("projectIds").map(String),
        },
      });
    } catch (error) {
      setBusy(false);
      toast.error(error instanceof Error ? error.message : "The invitation could not be sent.");
      return;
    }
    setBusy(false);
    form.reset();
    await queryClient.invalidateQueries({ queryKey: ["invitations"] });
    toast.success("Invitation sent with a secure acceptance link.");
  }

  async function setRole(userId: string, role: AppRole) {
    const { error: removeError } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (removeError) {
      toast.error("The role was not changed.");
      return;
    }
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) {
      toast.error("The role was not changed.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["team"] });
    await supabase.from("notifications").insert({
      user_id: userId,
      title: `Your portal role is now ${roleLabel[role]}`,
      body: "Sign out and back in if you do not see the change straight away.",
      kind: "info",
    });
    toast.success(`Role set to ${roleLabel[role]}.`);
  }

  async function setActive(userId: string, isActive: boolean) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: isActive })
      .eq("id", userId);
    if (error) {
      toast.error("The account was not updated.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["team"] });
    toast.success(isActive ? "Account reactivated." : "Account deactivated.");
  }

  async function cancelInvite(id: string) {
    const { error } = await supabase
      .from("invitations")
      .update({ status: "revoked" })
      .eq("id", id);
    if (error) {
      toast.error("The invite was not cancelled.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["invitations"] });
  }

  if (!rolesPending && !isAdmin) {
    return (
      <PortalShell
        title="Team and access"
        description="This page is for admins. Ask an admin if you need someone added."
        profileName={profile?.full_name}
        avatarUrl={profile?.avatar_url}
      >
        <p className="rounded-3xl bg-muted p-6 text-muted-foreground">
          You do not have access to team settings.
        </p>
      </PortalShell>
    );
  }

  const field =
    "w-full rounded-3xl border border-input bg-card px-5 py-3 text-[15px] placeholder:text-muted-foreground";

  return (
    <PortalShell
      title="Team and access"
      description="Invite people, set what they can see, and turn accounts off when someone leaves."
      role="admin"
      profileName={profile?.full_name}
      avatarUrl={profile?.avatar_url}
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-16">
        <section aria-labelledby="invite-heading">
          <h2 id="invite-heading" className="text-[20px] font-medium">
            Invite someone
          </h2>
          <form onSubmit={invite} className="mt-6 space-y-5">
            <div>
              <label htmlFor="email" className="label-caps mb-2 block text-muted-foreground">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={field}
              />
            </div>
            <div>
              <label htmlFor="role" className="label-caps mb-2 block text-muted-foreground">
                Role
              </label>
              <select id="role" name="role" defaultValue="client" className={field}>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel[role]}
                  </option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="label-caps mb-2 text-muted-foreground">Client projects</legend>
              <div className="max-h-48 space-y-1 overflow-y-auto border-y border-border py-2">
                {(projects ?? []).map((project) => (
                  <label key={project.id} className="flex cursor-pointer items-center gap-3 px-2 py-2 text-sm hover:bg-muted">
                    <input type="checkbox" name="projectIds" value={project.id} className="h-4 w-4 accent-accent" />
                    <span className="truncate">{project.name}</span>
                  </label>
                ))}
                {projects?.length === 0 ? <p className="px-2 py-2 text-caption text-muted-foreground">Create a project before inviting a client.</p> : null}
              </div>
              <p className="mt-2 text-caption text-muted-foreground">Required for clients. Staff roles can access every project.</p>
            </fieldset>
            <div>
              <label htmlFor="note" className="label-caps mb-2 block text-muted-foreground">
                Note (optional)
              </label>
              <input id="note" name="note" className={field} placeholder="Which project they join" />
            </div>
            <PillButton type="submit" disabled={busy} className="disabled:opacity-60">
              {busy ? "Sending" : "Send invitation"}
            </PillButton>
          </form>

          <h3 className="label-caps mt-10 text-muted-foreground">Open invites</h3>
          {invitations && invitations.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {invitations.map((invite) => (
                <li
                  key={invite.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border px-4 py-3"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[15px]">{invite.email}</span>
                    <span className="block text-caption text-muted-foreground">
                      {roleLabel[invite.role as AppRole]} · {invite.status}
                    </span>
                  </span>
                  {invite.status === "pending" ? (
                    <button
                      type="button"
                      onClick={() => cancelInvite(invite.id)}
                      className="text-sm underline underline-offset-4"
                    >
                      Cancel
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-caption text-muted-foreground">No invites waiting.</p>
          )}
        </section>

        <section aria-labelledby="people-heading">
          <h2 id="people-heading" className="text-[20px] font-medium">
            People
          </h2>
          {team && team.length > 0 ? (
            <ul className="mt-6 divide-y divide-border rounded-3xl border border-border">
              {team.map((person) => (
                <li key={person.id} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium">
                      {person.full_name ?? person.email ?? "Portal member"}
                    </p>
                    <p className="truncate text-caption text-muted-foreground">
                      {person.email}
                      {person.is_active ? "" : " · deactivated"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label htmlFor={`role-${person.id}`} className="sr-only">
                      Role for {person.full_name ?? person.email}
                    </label>
                    <select
                      id={`role-${person.id}`}
                      value={person.roles[0] ?? "client"}
                      onChange={(event) => setRole(person.id, event.target.value as AppRole)}
                      className="rounded-full border border-input bg-card px-4 py-2 text-sm"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {roleLabel[role]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setActive(person.id, !person.is_active)}
                      className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      {person.is_active ? "Deactivate" : "Reactivate"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 rounded-3xl bg-muted p-6 text-muted-foreground">
              No one has signed in yet.
            </p>
          )}
        </section>
      </div>
    </PortalShell>
  );
}
