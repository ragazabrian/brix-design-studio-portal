import { Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

import type { Project } from "@/data/site";
import { cn } from "@/lib/utils";

export function WorkCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  return (
    <Link
      to="/work/$slug"
      params={{ slug: project.slug }}
      className={cn(
        "group relative block overflow-hidden rounded-3xl bg-frost transition-shadow duration-500 hover:shadow-[0_24px_60px_-32px_oklch(0.452_0.276_264.6/0.45)]",
        project.span === "wide" ? "md:col-span-2" : "",
      )}
    >
      <div className={cn("overflow-hidden", project.span === "wide" ? "aspect-[16/9]" : "aspect-[4/3]")}>
        <img
          src={project.image}
          alt={`${project.title}: ${project.tag}`}
          loading={priority ? "eager" : "lazy"}
          className="grayscale-media h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      </div>

      <span className="label-caps absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1.5 text-ink">
        {project.tag}
      </span>

      <div className="flex items-center justify-between gap-4 p-5 md:p-6">
        <div className="min-w-0">
          <h3 className="truncate font-display text-xl md:text-2xl">{project.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{project.year}</p>
        </div>
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/15 transition-all duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-paper">
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={20} strokeWidth={1.7} />
          <span className="sr-only">View project</span>
        </span>
      </div>
    </Link>
  );
}
