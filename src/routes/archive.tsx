import { createFileRoute, Link } from "@tanstack/react-router";

import { projects } from "@/data/site";
import { PageHeader, SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Primitives";

export const Route = createFileRoute("/archive")({
  head: () => ({
    meta: [
      { title: "Archive: Every Project by Year | Brix Design Studio" },
      {
        name: "description",
        content:
          "A plain list of Brix Design Studio projects by year, with scope and client, for anyone who prefers reading to scrolling.",
      },
      { property: "og:title", content: "Archive | Brix Design Studio" },
      {
        property: "og:description",
        content: "Every Brix Design Studio project by year, listed with scope and client.",
      },
    ],
  }),
  component: ArchivePage,
});

function ArchivePage() {
  const rows = [...projects].sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <SiteShell>
      <PageHeader
        label="Archive"
        title="The whole list, no pictures."
        intro="Sorted newest first. Select a row to read the project in full."
      />

      <section className="page-shell py-12 md:py-16">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Brix Design Studio projects by year</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="label-caps py-4 text-muted-foreground">
                Year
              </th>
              <th scope="col" className="label-caps py-4 text-muted-foreground">
                Project
              </th>
              <th scope="col" className="label-caps hidden py-4 text-muted-foreground md:table-cell">
                Scope
              </th>
              <th scope="col" className="py-4">
                <span className="sr-only">Link</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((project) => (
              <tr key={project.slug} className="border-b border-border align-top">
                <td className="py-5 pr-4 text-muted-foreground tabular-nums">{project.year}</td>
                <td className="py-5 pr-4">
                  <span className="font-display text-lg md:text-xl">{project.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground md:hidden">
                    {project.tag}
                  </span>
                </td>
                <td className="hidden py-5 pr-4 text-muted-foreground md:table-cell">
                  {project.scope.join(", ")}
                </td>
                <td className="py-5 text-right">
                  <Link
                    to="/work/$slug"
                    params={{ slug: project.slug }}
                    className="inline-flex items-center gap-2 text-[15px] font-medium underline-offset-4 hover:underline"
                  >
                    Read
                    <span aria-hidden>&rarr;</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Reveal className="mt-12">
          <p className="text-muted-foreground">
            Older work from before 2023 is available on request. Ask and we will send a selection
            relevant to your sector.
          </p>
        </Reveal>
      </section>
    </SiteShell>
  );
}
