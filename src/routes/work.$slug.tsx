import { createFileRoute, notFound } from "@tanstack/react-router";

import { projects } from "@/data/site";
import { PageHeader, SiteShell } from "@/components/site/SiteShell";
import { ArrowLink, Reveal } from "@/components/site/Primitives";
import { WorkCard } from "@/components/site/WorkCard";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const project = projects.find((item) => item.slug === params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Project not found | Brix Design Studio" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { project } = loaderData;
    return {
      meta: [
        { title: `${project.title}: ${project.tag} | Brix Design Studio` },
        { name: "description", content: project.summary },
        { property: "og:title", content: `${project.title} | Brix Design Studio` },
        { property: "og:description", content: project.summary },
      ],
    };
  },
  notFoundComponent: ProjectNotFound,
  component: ProjectDetail,
});

function ProjectNotFound() {
  return (
    <SiteShell>
      <PageHeader
        label="Work"
        title="We could not find that project."
        intro="It may have moved. The full list of work is one click away."
      />
      <div className="page-shell py-12">
        <ArrowLink to="/work">Back to all work</ArrowLink>
      </div>
    </SiteShell>
  );
}

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  const related = projects.filter((item) => item.slug !== project.slug).slice(0, 2);

  return (
    <SiteShell>
      <PageHeader label={project.tag} title={project.title} intro={project.summary} />

      <section className="page-shell py-12 md:py-16">
        <Reveal>
          <img
            src={project.image}
            alt={`${project.title} project imagery`}
            width={1400}
            height={1050}
            className="grayscale-media aspect-[16/10] w-full rounded-3xl object-cover"
          />
        </Reveal>

        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-16">
          <div className="space-y-6">
            {project.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="text-muted-foreground md:text-[17px]">
                {paragraph}
              </p>
            ))}
          </div>
          <dl className="space-y-6 rounded-3xl bg-frost p-6 md:p-8">
            <div>
              <dt className="label-caps text-muted-foreground">Year</dt>
              <dd className="mt-2">{project.year}</dd>
            </div>
            <div>
              <dt className="label-caps text-muted-foreground">Scope</dt>
              <dd className="mt-2 space-y-1">
                {project.scope.map((item) => (
                  <span key={item} className="block">
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="page-shell border-t border-border py-14 md:py-20">
        <h2 className="label-caps text-muted-foreground">More work</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 md:gap-6">
          {related.map((item) => (
            <Reveal key={item.slug}>
              <WorkCard project={{ ...item, span: "standard" }} />
            </Reveal>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
