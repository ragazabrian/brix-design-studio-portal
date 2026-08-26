import type { Spotlight } from "@/data/site";
import { ArrowLink, Reveal } from "@/components/site/Primitives";
import { cn } from "@/lib/utils";

export function SpotlightBlock({ spotlight }: { spotlight: Spotlight }) {
  return (
    <Reveal className="md:col-span-2">
      <article
        className={cn(
          "grid items-center gap-8 overflow-hidden rounded-3xl bg-frost p-6 md:gap-12 md:p-10 lg:grid-cols-2",
          spotlight.side === "right" ? "lg:[&>figure]:order-2" : "",
        )}
      >
        <figure className="overflow-hidden rounded-2xl">
          <img
            src={spotlight.image}
            alt={`${spotlight.title} project imagery`}
            loading="lazy"
            className="grayscale-media aspect-[4/3] w-full object-cover"
          />
        </figure>
        <div className="max-w-md">
          <h3 className="display-serif text-[clamp(1.75rem,3.2vw,2.5rem)]">{spotlight.title}</h3>
          <p className="mt-4 text-muted-foreground md:text-[17px]">{spotlight.line}</p>
          <div className="mt-7">
            <ArrowLink to="/work">View project</ArrowLink>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
