import { Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download04Icon, File01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { useMemo, useState } from "react";

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

function PageFrame({ title, description, clientMode = false, children }: { title: string; description: string; clientMode?: boolean; children: React.ReactNode }) {
  const { user } = useSession();
  const identity = user?.user_metadata as Record<string, unknown> | undefined;
  const { data: profile } = useProfile(user?.id, identity);
  const { data: roles } = useRoles(user?.id);
  return <PortalShell clientMode={clientMode} title={title} description={description} role={roleFrom(roles)} profileName={profile?.full_name} avatarUrl={profile?.avatar_url}>{children}</PortalShell>;
}

export function LibraryPage({ kind, clientMode = false }: { kind: "brand" | "module"; clientMode?: boolean }) {
  const { data: projects } = useProjects();
  const { activeId, selectProject } = useActiveProject(projects);
  const { data: assets, isPending } = useLibraryAssets(activeId ?? undefined, kind);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const title = kind === "brand" ? "Asset & brand library" : "Module library";
  const description = kind === "brand" ? "The latest approved marks, artwork, templates and files for your team." : "Reusable modules and patterns made for your project.";
  const tags = useMemo(() => Array.from(new Set((assets ?? []).flatMap((asset) => asset.tags ?? []))).sort(), [assets]);
  const visible = useMemo(() => (assets ?? []).filter((asset) => {
    const term = query.trim().toLowerCase();
    const matchesTerm = !term || asset.name.toLowerCase().includes(term) || (asset.description ?? "").toLowerCase().includes(term) || (asset.tags ?? []).some((item) => item.toLowerCase().includes(term));
    return matchesTerm && (tag === "all" || asset.tags?.includes(tag));
  }), [assets, query, tag]);
  return (
    <PageFrame title={title} description={description} clientMode={clientMode}>
      <div className="grid gap-3 border-y border-border py-4 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.65fr)]">
        <ProjectPicker projects={projects} activeId={activeId} onSelect={selectProject} />
        <label className="relative"><span className="sr-only">Search {title}</span><HugeiconsIcon icon={Search01Icon} size={17} strokeWidth={1.5} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder={kind === "brand" ? "Search logos, images, templates" : "Search modules and patterns"} className="h-11 w-full border border-input bg-card pl-10 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
      </div>
      {tags.length > 0 ? <div className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label="Filter by tag"><button type="button" onClick={() => setTag("all")} className={`shrink-0 border px-3 py-1.5 text-xs ${tag === "all" ? "border-accent bg-accent text-accent-foreground" : "border-border"}`}>All</button>{tags.map((item) => <button key={item} type="button" onClick={() => setTag(item)} className={`shrink-0 border px-3 py-1.5 text-xs ${tag === item ? "border-accent bg-accent text-accent-foreground" : "border-border"}`}>{item}</button>)}</div> : null}
      {isPending ? <Loading /> : visible.length > 0 ? <ul className="mt-8 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">{visible.map((asset) => <li key={asset.id} className="group bg-background"><div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted">{asset.previewUrl ? <img src={asset.previewUrl} alt={asset.name} className="grayscale-media h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" /> : <HugeiconsIcon icon={File01Icon} size={32} strokeWidth={1.2} className="text-muted-foreground" aria-label={asset.mime_type ?? "File"} />}{asset.fileUrl ? <a href={asset.fileUrl} target="_blank" rel="noreferrer" aria-label={`Open ${asset.name}`} className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center bg-background text-foreground opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"><HugeiconsIcon icon={Download04Icon} size={17} strokeWidth={1.6} aria-hidden /></a> : null}</div><div className="p-4"><p className="truncate font-medium">{asset.name}</p><p className="mt-1 line-clamp-2 min-h-10 text-caption text-muted-foreground">{asset.description ?? (asset.tags?.join(" · ") || "Approved project asset")}</p><div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>{asset.mime_type?.split("/").pop()?.toUpperCase() ?? "FILE"}</span><span>{formatBytes(asset.size_bytes)}</span></div></div></li>)}</ul> : <Empty text={query || tag !== "all" ? "No library items match these filters." : kind === "brand" ? "Your approved assets will appear here." : "Your reusable modules will appear here."} />}
    </PageFrame>
  );
}

export function GuidelinesPage({ clientMode = false }: { clientMode?: boolean } = {}) {
  const { data: projects } = useProjects();
  const { activeId, selectProject } = useActiveProject(projects);
  const { data: items, isPending } = useGuidelines(activeId ?? undefined);
  const sections = Array.from(new Set((items ?? []).map((item) => item.section)));
  return <PageFrame title="Brand guidelines" description="The current rules for using your identity clearly and consistently." clientMode={clientMode}><ProjectPicker projects={projects} activeId={activeId} onSelect={selectProject} />{sections.length > 0 ? <nav aria-label="Guideline sections" className="mt-6 flex gap-2 overflow-x-auto border-b border-border pb-3">{sections.map((section) => <a key={section} href={`#guide-${section.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`} className="shrink-0 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">{section}</a>)}</nav> : null}{isPending ? <Loading /> : items && items.length > 0 ? <div className="mt-8 divide-y divide-border border-y border-border">{items.map((item, index) => <article id={`guide-${item.section.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`} key={item.id} className={`grid scroll-mt-8 gap-8 py-10 md:grid-cols-2 md:py-14 ${index % 2 === 1 ? "md:[&>div]:order-2" : ""}`}><div className="max-w-lg"><p className="label-caps text-brand">{item.section}</p><h2 className="mt-4 text-3xl font-semibold">{item.title}</h2><p className="mt-5 whitespace-pre-line leading-7 text-muted-foreground">{item.body}</p></div>{item.imageUrl ? <img src={item.imageUrl} alt={`${item.title} guideline example`} className="grayscale-media aspect-[4/3] w-full border border-border object-cover" loading="lazy" /> : <div className="flex aspect-[4/3] items-end bg-muted p-6"><span className="text-6xl font-semibold text-foreground/15">{String(index + 1).padStart(2, "0")}</span></div>}</article>)}</div> : <Empty text="Your project guidelines will appear here." />}</PageFrame>;
}

export function DocumentsPage({ clientMode = false }: { clientMode?: boolean } = {}) {
  const { data: projects } = useProjects();
  const { activeId, selectProject } = useActiveProject(projects);
  const { data: documents, isPending } = useDocuments(activeId ?? undefined);
  return <PageFrame title="Documents" description="Quotes, agreements and project documents in one place." clientMode={clientMode}><ProjectPicker projects={projects} activeId={activeId} onSelect={selectProject} />{isPending ? <Loading /> : documents && documents.length > 0 ? <ul className="mt-8 divide-y divide-border border-y border-border">{documents.map((document) => <li key={document.id} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div><p className="font-medium">{document.title}</p><p className="mt-1 text-caption text-muted-foreground">Updated {new Date(document.updated_at).toLocaleDateString()}</p></div>{document.external_url ? <a href={document.external_url} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">Open document</a> : null}</li>)}</ul> : <Empty text="Your project documents will appear here." />}</PageFrame>;
}

const phaseOrder = ["todo", "in_progress", "review", "done"] as const;
const phaseLabels: Record<(typeof phaseOrder)[number], string> = {
  todo: "Planned",
  in_progress: "In progress",
  review: "Review",
  done: "Complete",
};

export function PhasesPage({ clientMode = false }: { clientMode?: boolean } = {}) {
  const { data: projects } = useProjects();
  const { activeId, selectProject } = useActiveProject(projects);
  const { data: tasks, isPending } = useTasks(activeId ?? undefined);
  const activeProject = projects?.find((project) => project.id === activeId);
  const completed = (tasks ?? []).filter((task) => task.status === "done").length;
  const progress = tasks?.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <PageFrame title="Phases" description="See what is planned, in progress, under review and complete." clientMode={clientMode}>
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
function Empty({ text }: { text: string }) { return <p className="mt-8 border border-border bg-muted p-6 text-muted-foreground">{text}</p>; }
function formatBytes(value: number | null) { if (!value) return "—"; if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`; return `${(value / 1024 / 1024).toFixed(1)} MB`; }
