import { createFileRoute, Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { BookOpen01Icon, File01Icon, GridIcon, Layers01Icon } from "@hugeicons/core-free-icons";

import { PortalShell } from "@/components/portal/PortalShell";
import { useProfile, useProjects, useSession } from "@/hooks/usePortal";

export const Route = createFileRoute("/_authenticated/client/dashboard")({
  head: () => ({ meta: [
    { title: "Your projects | Brix Client Portal" },
    { name: "description", content: "View your assigned Brix projects and brand resources." },
    { property: "og:title", content: "Your projects | Brix Client Portal" },
    { property: "og:description", content: "Your private Brix project workspace." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  component: ClientDashboard,
});

const areas = [
  { to: "/client/phases", label: "Phases", detail: "Track progress and review stages", icon: Layers01Icon },
  { to: "/client/library", label: "Asset & Brand Library", detail: "Approved files ready to use", icon: GridIcon },
  { to: "/client/guidelines", label: "Guidelines", detail: "Logo, type, color, and usage rules", icon: BookOpen01Icon },
  { to: "/client/documents", label: "Documents", detail: "Briefs, agreements, and notes", icon: File01Icon },
] as const;

function ClientDashboard() {
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id, user?.user_metadata as Record<string, unknown> | undefined);
  const { data: projects, isPending } = useProjects();
  return (
    <PortalShell clientMode title="Dashboard" description="Your active Brix projects and shared brand resources." role="client" profileName={profile?.full_name} avatarUrl={profile?.avatar_url}>
      <section className="border-y border-border py-6">
        <p className="label-caps text-muted-foreground">Assigned projects</p>
        {isPending ? <p className="mt-5 text-muted-foreground">Loading your projects.</p> : projects && projects.length > 0 ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {projects.map((project) => <article key={project.id} className="border border-border bg-card p-5"><div className="flex items-center justify-between gap-4"><h2 className="text-lg font-medium">{project.name}</h2><span className="label-caps text-brand">{project.status.replace("_", " ")}</span></div>{project.description ? <p className="mt-3 text-sm text-muted-foreground">{project.description}</p> : null}<div className="mt-6 h-1 bg-muted"><div className="h-full w-2/3 bg-accent" /></div></article>)}
          </div>
        ) : <p className="mt-5 border border-border p-5 text-muted-foreground">No projects have been shared with you yet.</p>}
      </section>
      <section className="mt-10 grid gap-px bg-border sm:grid-cols-2" aria-label="Portal areas">
        {areas.map((area) => <Link key={area.to} to={area.to} className="group bg-background p-6 transition-colors hover:bg-muted"><HugeiconsIcon icon={area.icon} size={22} strokeWidth={1.5} className="text-brand" aria-hidden /><h2 className="mt-8 text-lg font-medium">{area.label}</h2><p className="mt-2 text-sm text-muted-foreground">{area.detail}</p></Link>)}
      </section>
    </PortalShell>
  );
}