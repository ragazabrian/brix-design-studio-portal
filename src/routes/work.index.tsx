import { createFileRoute } from "@tanstack/react-router";

import { projects } from "@/data/site";
import { PageHeader, SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Primitives";
import { WorkCard } from "@/components/site/WorkCard";
import { LogoMarquee } from "@/components/site/LogoMarquee";

export const Route = createFileRoute("/work/")({
  head: () => ({
    meta: [
      { title: "Work: Brand, Editorial and Product Projects | Brix Design Studio" },
      {
        name: "description",
        content:
          "Selected projects from Brix Design Studio, covering brand identity, packaging, wayfinding, editorial systems and product design.",
      },
      { property: "og:title", content: "Work | Brix Design Studio" },
      {
        property: "og:description",
        content:
          "Brand identity, packaging, wayfinding, editorial and product work from Brix Design Studio.",
      },
    ],
  }),
  component: WorkIndex,
});

function WorkIndex() {
  return (
    <SiteShell>
      <PageHeader
        label="Work"
        title="Systems built to be used, not just presented."
        intro="Every project here shipped with the specs, files and guidance a team needs to keep it going without us in the room."
      />

      <section className="page-shell py-14 md:py-20">
        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          {projects.map((project, index) => (
            <Reveal
              key={project.slug}
              className={project.span === "wide" ? "md:col-span-2" : undefined}
            >
              <WorkCard project={project} priority={index === 0} />
            </Reveal>
          ))}
        </div>
      </section>

      <LogoMarquee />
    </SiteShell>
  );
}
