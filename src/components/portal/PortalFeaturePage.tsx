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
import { useProfile, useProjects, useRoles, useSession, type AppRole } from "@/hooks/usePortal";

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
