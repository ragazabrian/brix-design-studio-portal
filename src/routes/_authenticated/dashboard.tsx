import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PortalShell } from "@/components/portal/PortalShell";
import { FileGrid } from "@/components/portal/FileGrid";
import { PillButton } from "@/components/site/Primitives";
import { supabase } from "@/integrations/supabase/client";
import {
  useActivity,
  useProfile,
  useProjects,
  useRoles,
  useSession,
  useTasks,
  type AppRole,
} from "@/hooks/usePortal";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your projects | Brix Client Portal" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Your Brix Client Portal projects, files and tasks." },
    ],
  }),
  component: DashboardPage,
});

const statusLabel: Record<string, string> = {
  discovery: "Discovery",
  in_progress: "In progress",
  review: "In review",
  delivered: "Delivered",
  archived: "Archived",
};

function DashboardPage() {
  const { user } = useSession();
  const identity = user?.user_metadata as Record<string, unknown> | undefined;
  const { data: profile } = useProfile(user?.id, identity);
  const { data: roles } = useRoles(user?.id);
  const { data: projects, isPending: projectsPending } = useProjects();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();

  const role: AppRole | undefined = roles?.includes("admin")
    ? "admin"
    : roles?.includes("designer")
      ? "designer"
      : roles?.includes("client")
        ? "client"
        : undefined;

  const isStaff = role === "admin" || role === "designer";

  useEffect(() => {
    if (!activeId && projects && projects.length > 0) setActiveId(projects[0]!.id);
  }, [projects, activeId]);

  const visibleProjects = useMemo(
    () =>
      (projects ?? []).filter(
        (project) =>
          term.length === 0 ||
          project.name.toLowerCase().includes(term) ||
          (project.client_name ?? "").toLowerCase().includes(term) ||
          (project.status ?? "").toLowerCase().includes(term),
      ),
    [projects, term],
  );

  const activeProject = useMemo(
    () => projects?.find((project) => project.id === activeId) ?? null,
    [projects, activeId],
  );

  if (profile && !profile.onboarded) {
    return <Onboarding userId={user!.id} profile={profile} />;
  }

  return (
    <PortalShell
      title="Dashboard"
      description="Everything we are making for you, with the latest files, tasks and next steps in one place."
      role={role}
      profileName={profile?.full_name}
      avatarUrl={profile?.avatar_url}
    >
      <section
        aria-labelledby="assistant-heading"
        className="mb-10 grid gap-4 rounded-3xl bg-frost p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8"
      >
        <div>
          <h2 id="assistant-heading" className="text-[19px] font-medium">
            Studio assistant
          </h2>
          <p className="mt-2 max-w-xl text-caption text-muted-foreground">
            Draft a brief, tidy up feedback, plan a timeline or summarise a call. Your chats are
            saved to your account, and you can switch models any time.
          </p>
        </div>
        <Link
          to="/assistant"
          className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition-opacity hover:opacity-90"
        >
          Open assistant
        </Link>
      </section>

      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="mb-10 max-w-xl"
      >
        <label htmlFor="portal-search" className="label-caps mb-2 block text-muted-foreground">
          Search the portal
        </label>
        <input
          id="portal-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Projects, tasks or files"
          className="w-full rounded-3xl border border-input bg-paper px-5 py-3 text-[15px] placeholder:text-muted-foreground"
        />
        <p className="mt-2 text-caption text-muted-foreground">
          Filters the project list and everything shown for the selected project.
        </p>
      </form>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-12">
        <aside>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="label-caps text-muted-foreground">Projects</h2>
            {isStaff ? <NewProjectButton userId={user!.id} onCreated={setActiveId} /> : null}
          </div>

          {projectsPending ? (
            <p className="mt-4 text-muted-foreground">Loading projects.</p>
          ) : visibleProjects.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {visibleProjects.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(project.id)}
                    aria-current={project.id === activeId}
                    className={`w-full rounded-2xl px-4 py-3 text-left transition-colors ${
                      project.id === activeId ? "bg-ink text-paper" : "bg-frost hover:bg-frost/70"
                    }`}
                  >
                    <span className="block truncate text-[15px] font-medium">{project.name}</span>
                    <span
                      className={`mt-0.5 block text-caption ${
                        project.id === activeId ? "text-paper/70" : "text-muted-foreground"
                      }`}
                    >
                      {statusLabel[project.status] ?? project.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-3xl bg-frost p-5 text-muted-foreground">
              {term.length > 0
                ? "No projects match that search."
                : isStaff
                  ? "No projects yet. Create one to start adding files."
                  : "No projects yet. We will add yours shortly."}
            </p>
          )}

          
        </aside>

        <div className="space-y-12">
          {activeProject ? (
            <>
              <section className="rounded-3xl bg-frost p-6 md:p-8">
                <h2 className="font-display text-2xl">{activeProject.name}</h2>
                {activeProject.client_name ? (
                  <p className="mt-1 text-muted-foreground">{activeProject.client_name}</p>
                ) : null}
                {activeProject.description ? (
                  <p className="mt-4 max-w-2xl text-muted-foreground">
                    {activeProject.description}
                  </p>
                ) : null}
                <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="label-caps text-muted-foreground">Status</dt>
                    <dd className="mt-1">{statusLabel[activeProject.status]}</dd>
                  </div>
                  <div>
                    <dt className="label-caps text-muted-foreground">Started</dt>
                    <dd className="mt-1 tabular-nums">{activeProject.starts_on ?? "Not set"}</dd>
                  </div>
                  <div>
                    <dt className="label-caps text-muted-foreground">Due</dt>
                    <dd className="mt-1 tabular-nums">{activeProject.due_on ?? "Not set"}</dd>
                  </div>
                </dl>
              </section>

              <FileGrid
                projectId={activeProject.id}
                canUpload={Boolean(user)}
                userId={user!.id}
                query={query}
              />
              <Tasks projectId={activeProject.id} canEdit={isStaff} query={query} />
              <ActivityLog projectId={activeProject.id} />
            </>
          ) : (
            <p className="rounded-3xl bg-frost p-6 text-muted-foreground">
              Select a project to see its files and tasks.
            </p>
          )}
        </div>
      </div>
    </PortalShell>
  );
}

function Onboarding({
  userId,
  profile,
}: {
  userId: string;
  profile: { full_name: string | null; company: string | null; job_title: string | null };
}) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: String(data.get("full_name") ?? ""),
        company: String(data.get("company") ?? "") || null,
        job_title: String(data.get("job_title") ?? "") || null,
        onboarded: true,
      })
      .eq("id", userId);
    setBusy(false);

    if (error) {
      toast.error("We could not save that. Please try again.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
  }

  const field =
    "w-full rounded-3xl border border-input bg-paper px-5 py-3 text-[15px] placeholder:text-muted-foreground";

  return (
    <PortalShell
      title="Two quick details"
      description="This is how your name appears to the rest of the project team. You can change it later."
    >
      <form onSubmit={onSubmit} className="max-w-lg space-y-5">
        <div>
          <label htmlFor="full_name" className="label-caps mb-2 block text-muted-foreground">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            required
            defaultValue={profile.full_name ?? ""}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="company" className="label-caps mb-2 block text-muted-foreground">
            Company
          </label>
          <input id="company" name="company" defaultValue={profile.company ?? ""} className={field} />
        </div>
        <div>
          <label htmlFor="job_title" className="label-caps mb-2 block text-muted-foreground">
            Job title
          </label>
          <input
            id="job_title"
            name="job_title"
            defaultValue={profile.job_title ?? ""}
            className={field}
          />
        </div>
        <PillButton type="submit" disabled={busy} className="disabled:opacity-60">
          {busy ? "Saving" : "Enter the portal"}
        </PillButton>
      </form>
    </PortalShell>
  );
}

function NewProjectButton({
  userId,
  onCreated,
}: {
  userId: string;
  onCreated: (id: string) => void;
}) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function create() {
    const name = window.prompt("Project name");
    if (!name) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("projects")
      .insert({ name, created_by: userId })
      .select("id")
      .maybeSingle();
    setBusy(false);
    if (error || !data) {
      toast.error("The project was not created.");
      return;
    }
    await supabase.from("project_members").insert({ project_id: data.id, user_id: userId });
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
    onCreated(data.id);
    toast.success("Project created.");
  }

  return (
    <button
      type="button"
      onClick={create}
      disabled={busy}
      className="rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:bg-frost disabled:opacity-60"
    >
      New
    </button>
  );
}

function Tasks({
  projectId,
  canEdit,
  query,
}: {
  projectId: string;
  canEdit: boolean;
  query: string;
}) {
  const { data: tasks } = useTasks(projectId);
  const term = query.trim().toLowerCase();
  const queryClient = useQueryClient();

  async function addTask() {
    const title = window.prompt("Task title");
    if (!title) return;
    const { error } = await supabase.from("tasks").insert({ project_id: projectId, title });
    if (error) {
      toast.error("The task was not added.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
  }

  async function advance(id: string, status: string) {
    const order = ["todo", "in_progress", "review", "done"];
    const next = order[Math.min(order.indexOf(status) + 1, order.length - 1)];
    const { error } = await supabase
      .from("tasks")
      .update({ status: next as never })
      .eq("id", id);
    if (error) {
      toast.error("The task was not updated.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
  }

  const visibleTasks = (tasks ?? []).filter(
    (task) =>
      term.length === 0 ||
      task.title.toLowerCase().includes(term) ||
      (task.description ?? "").toLowerCase().includes(term),
  );

  const labels: Record<string, string> = {
    todo: "To do",
    in_progress: "In progress",
    review: "In review",
    done: "Done",
  };

  return (
    <section aria-labelledby="tasks-heading">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <h2 id="tasks-heading" className="text-[20px] font-medium">
          Tasks
        </h2>
        {canEdit ? (
          <button
            type="button"
            onClick={addTask}
            className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-frost"
          >
            Add task
          </button>
        ) : null}
      </div>

      {visibleTasks.length > 0 ? (
        <ul className="mt-6 divide-y divide-border rounded-3xl border border-border">
          {visibleTasks.map((task) => (
            <li key={task.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium">{task.title}</p>
                <p className="mt-1 text-caption text-muted-foreground">
                  {labels[task.status]}
                  {task.due_on ? ` · due ${task.due_on}` : ""}
                </p>
              </div>
              {canEdit && task.status !== "done" ? (
                <button
                  type="button"
                  onClick={() => advance(task.id, task.status)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:bg-frost"
                >
                  Move on
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-3xl bg-frost p-6 text-muted-foreground">
          {term.length > 0 ? "No tasks match that search." : "Nothing on the board yet."}
        </p>
      )}
    </section>
  );
}


function ActivityLog({ projectId }: { projectId: string }) {
  const { data: entries } = useActivity(projectId);

  return (
    <section aria-labelledby="activity-heading">
      <h2 id="activity-heading" className="text-[20px] font-medium">
        Activity
      </h2>
      {entries && entries.length > 0 ? (
        <ol className="mt-6 divide-y divide-border rounded-3xl border border-border">
          {entries.map((entry) => (
            <li key={entry.id} className="grid gap-1 p-4">
              <span className="text-[15px]">{entry.summary}</span>
              <span className="text-caption text-muted-foreground tabular-nums">
                {new Date(entry.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-6 rounded-3xl bg-frost p-6 text-muted-foreground">
          Uploads, file updates and restores will be listed here.
        </p>
      )}
    </section>
  );
}
