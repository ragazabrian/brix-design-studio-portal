import { Link } from "@tanstack/react-router";

import { ProjectPicker } from "@/components/portal/ProjectPicker";
import { PortalShell } from "@/components/portal/PortalShell";
import {
  useActiveProject,
  useAssetRequests,
  useDocuments,
  useGuidelines,
  useLibraryAssets,
  useMeetings,
} from "@/hooks/usePortalFeatures";
import { useProfile, useProjects, useRoles, useSession, useTasks, type AppRole } from "@/hooks/usePortal";

function roleFrom(roles: AppRole[] | undefined): AppRole | undefined {
  return roles?.includes("admin") ? "admin" : roles?.includes("designer") ? "designer" : roles?.includes("client") ? "client" : undefined;
}

function PageFrame({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  const { user } = useSession();
  const identity = user?.user_metadata as Record<string, unknown> | undefined;
  const { data: profile } = useProfile(user?.id, identity);
  const { data: roles } = useRoles(user?.id);
  return <PortalShell title={title} description={description} role={roleFrom(roles)} profileName={profile?.full_name} avatarUrl={profile?.avatar_url}>{children}</PortalShell>;
}

export function LibraryPage({ kind }: { kind: "brand" | "module" }) {
  const { data: projects } = useProjects();
  const { activeId, selectProject } = useActiveProject(projects);
  const { data: assets, isPending } = useLibraryAssets(activeId ?? undefined, kind);
  const title = kind === "brand" ? "Asset & brand library" : "Module library";
  const description = kind === "brand" ? "The latest approved marks, artwork, templates and files for your team." : "Reusable modules and patterns made for your project.";
  return <PageFrame title={title} description={description}><ProjectPicker projects={projects} activeId={activeId} onSelect={selectProject} />{isPending ? <Loading /> : assets && assets.length > 0 ? <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{assets.map((asset) => <li key={asset.id} className="overflow-hidden rounded-3xl border border-border bg-card"><div className="flex aspect-[4/3] items-center justify-center bg-muted">{asset.previewUrl ? <img src={asset.previewUrl} alt={asset.name} className="grayscale-media h-full w-full object-cover" loading="lazy" /> : <span className="text-caption text-muted-foreground">{asset.mime_type ?? "File"}</span>}</div><div className="p-4"><p className="truncate font-medium">{asset.name}</p><p className="mt-1 text-caption text-muted-foreground">{asset.description ?? asset.tags?.join(" · ") ?? "Approved project asset"}</p>{asset.fileUrl ? <a href={asset.fileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm underline underline-offset-4">Open file</a> : null}</div></li>)}</ul> : <Empty text={kind === "brand" ? "Your approved assets will appear here." : "Your reusable modules will appear here."} />}</PageFrame>;
}

export function GuidelinesPage() {
  const { data: projects } = useProjects();
  const { activeId, selectProject } = useActiveProject(projects);
  const { data: items, isPending } = useGuidelines(activeId ?? undefined);
  return <PageFrame title="Brand guidelines" description="A clear reference for using the Brix system with confidence."><ProjectPicker projects={projects} activeId={activeId} onSelect={selectProject} />{isPending ? <Loading /> : items && items.length > 0 ? <div className="mt-8 space-y-5">{items.map((item) => <article key={item.id} className="grid gap-6 rounded-3xl border border-border p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:p-7"><div><p className="label-caps text-muted-foreground">{item.section}</p><h2 className="mt-2 text-2xl font-medium">{item.title}</h2><p className="mt-4 whitespace-pre-line text-muted-foreground">{item.body}</p></div>{item.imageUrl ? <img src={item.imageUrl} alt={`${item.title} guideline example`} className="grayscale-media aspect-[4/3] w-full rounded-2xl object-cover" loading="lazy" /> : null}</article>)}</div> : <Empty text="Your project guidelines will appear here." />}</PageFrame>;
}

export function DocumentsPage() {
  const { data: projects } = useProjects();
  const { activeId, selectProject } = useActiveProject(projects);
  const { data: documents, isPending } = useDocuments(activeId ?? undefined);
  return <PageFrame title="Documents" description="Quotes, agreements and project documents in one place."><ProjectPicker projects={projects} activeId={activeId} onSelect={selectProject} />{isPending ? <Loading /> : documents && documents.length > 0 ? <ul className="mt-8 divide-y divide-border rounded-3xl border border-border">{documents.map((document) => <li key={document.id} className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div><p className="font-medium">{document.title}</p><p className="mt-1 text-caption text-muted-foreground">Updated {new Date(document.updated_at).toLocaleDateString()}</p></div>{document.external_url ? <a href={document.external_url} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">Open document</a> : null}</li>)}</ul> : <Empty text="Your project documents will appear here." />}</PageFrame>;
}

const phaseOrder = ["todo", "in_progress", "review", "done"] as const;
const phaseLabels: Record<(typeof phaseOrder)[number], string> = {
  todo: "Planned",
  in_progress: "In progress",
  review: "Review",
  done: "Complete",
};

export function PhasesPage() {
  const { data: projects } = useProjects();
  const { activeId, selectProject } = useActiveProject(projects);
  const { data: tasks, isPending } = useTasks(activeId ?? undefined);
  const activeProject = projects?.find((project) => project.id === activeId);
  const completed = (tasks ?? []).filter((task) => task.status === "done").length;
  const progress = tasks?.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <PageFrame title="Phases" description="See what is planned, in progress, under review and complete.">
      <ProjectPicker projects={projects} activeId={activeId} onSelect={selectProject} />
      {activeProject ? (
        <section className="mt-8 border-y border-border py-5" aria-label="Project progress">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="label-caps text-muted-foreground">Overall progress</p>
              <p className="mt-1 text-lg font-medium">{activeProject.name}</p>
            </div>
            <p className="text-sm tabular-nums text-muted-foreground">{progress}%</p>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${progress}%` }} />
          </div>
        </section>
      ) : null}
      {isPending ? (
        <Loading />
      ) : tasks && tasks.length > 0 ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {phaseOrder.map((phase) => {
            const phaseTasks = tasks.filter((task) => task.status === phase);
            return (
              <section key={phase} aria-labelledby={`phase-${phase}`} className="min-h-56 rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                  <h2 id={`phase-${phase}`} className="text-sm font-medium">{phaseLabels[phase]}</h2>
                  <span className="text-caption tabular-nums text-muted-foreground">{phaseTasks.length}</span>
                </div>
                {phaseTasks.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {phaseTasks.map((task) => (
                      <li key={task.id} className="rounded-md bg-muted p-3">
                        <p className="text-sm font-medium">{task.title}</p>
                        {task.due_on ? <p className="mt-2 text-caption text-muted-foreground">Due {new Date(task.due_on).toLocaleDateString()}</p> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-caption text-muted-foreground">No items in this phase.</p>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <Empty text="Project phases will appear here as work is planned." />
      )}
    </PageFrame>
  );
}

export function DesignPage() {
  const { data: projects } = useProjects();
  const { activeId, selectProject } = useActiveProject(projects);
  const { data: assets, isPending: assetsPending } = useLibraryAssets(activeId ?? undefined, "brand");
  const { data: guidelines, isPending: guidelinesPending } = useGuidelines(activeId ?? undefined);
  const isPending = assetsPending || guidelinesPending;

  return (
    <PageFrame title="Design" description="Review approved design work and the guidelines behind it.">
      <ProjectPicker projects={projects} activeId={activeId} onSelect={selectProject} />
      {isPending ? <Loading /> : (
        <div className="mt-8 space-y-12">
          <section aria-labelledby="design-files-heading">
            <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
              <h2 id="design-files-heading" className="text-lg font-medium">Latest design</h2>
              <Link to="/library" className="text-sm text-muted-foreground underline underline-offset-4">View library</Link>
            </div>
            {assets && assets.length > 0 ? (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {assets.slice(0, 6).map((asset) => (
                  <li key={asset.id} className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="flex aspect-[4/3] items-center justify-center bg-muted">
                      {asset.previewUrl ? <img src={asset.previewUrl} alt={asset.name} className="grayscale-media h-full w-full object-cover" loading="lazy" /> : <span className="text-caption text-muted-foreground">{asset.mime_type ?? "Design file"}</span>}
                    </div>
                    <div className="p-4"><p className="truncate text-sm font-medium">{asset.name}</p></div>
                  </li>
                ))}
              </ul>
            ) : <Empty text="Approved design files will appear here." />}
          </section>
          <section aria-labelledby="design-guidelines-heading">
            <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
              <h2 id="design-guidelines-heading" className="text-lg font-medium">Guidelines</h2>
              <Link to="/guidelines" className="text-sm text-muted-foreground underline underline-offset-4">View all</Link>
            </div>
            {guidelines && guidelines.length > 0 ? (
              <ul className="mt-4 grid gap-3 md:grid-cols-2">
                {guidelines.slice(0, 4).map((item) => (
                  <li key={item.id} className="rounded-lg border border-border p-4">
                    <p className="label-caps text-muted-foreground">{item.section}</p>
                    <p className="mt-2 font-medium">{item.title}</p>
                  </li>
                ))}
              </ul>
            ) : <Empty text="Design guidelines will appear here." />}
          </section>
        </div>
      )}
    </PageFrame>
  );
}

export function MeetingsPage() {
  const { data: projects } = useProjects();
  const { activeId, selectProject } = useActiveProject(projects);
  const { data: meetings, isPending } = useMeetings(activeId ?? undefined);
  return <PageFrame title="Meetings" description="Keep reviews, check-ins and next steps easy to find."><ProjectPicker projects={projects} activeId={activeId} onSelect={selectProject} />{isPending ? <Loading /> : meetings && meetings.length > 0 ? <ul className="mt-8 space-y-3">{meetings.map((meeting) => <li key={meeting.id} className="grid gap-4 rounded-3xl border border-border p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"><time className="text-sm tabular-nums text-muted-foreground" dateTime={meeting.starts_at}>{new Date(meeting.starts_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</time><div><p className="font-medium">{meeting.title}</p><p className="mt-1 text-caption text-muted-foreground">{meeting.agenda ?? "Project meeting"}</p></div>{meeting.meeting_url ? <a href={meeting.meeting_url} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">Join meeting</a> : <span className="text-caption text-muted-foreground">{meeting.status}</span>}</li>)}</ul> : <Empty text="Upcoming project meetings will appear here." />}</PageFrame>;
}

export function RequestsPage() {
  const { data: projects } = useProjects();
  const { activeId, selectProject } = useActiveProject(projects);
  const { data: requests, isPending } = useAssetRequests(activeId ?? undefined);
  return <PageFrame title="Requests" description="Ask for a new asset, a change, or help moving the project forward."><ProjectPicker projects={projects} activeId={activeId} onSelect={selectProject} /><div className="mt-8 flex flex-wrap gap-3"><Link to="/contact" className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">Make a request</Link><span className="self-center text-caption text-muted-foreground">New requests are reviewed by the studio.</span></div>{isPending ? <Loading /> : requests && requests.length > 0 ? <ul className="mt-8 divide-y divide-border rounded-3xl border border-border">{requests.map((request) => <li key={request.id} className="grid gap-2 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div><p className="font-medium">{request.title}</p><p className="mt-1 text-caption text-muted-foreground">{request.kind} {request.hours_requested ? `· ${request.hours_requested} hours requested` : ""}</p></div><span className="label-caps text-muted-foreground">{request.status}</span></li>)}</ul> : <Empty text="Your asset and service requests will appear here." />}</PageFrame>;
}

function Loading() { return <p className="mt-8 text-muted-foreground">Loading this project area.</p>; }
function Empty({ text }: { text: string }) { return <p className="mt-8 rounded-3xl bg-muted p-6 text-muted-foreground">{text}</p>; }
