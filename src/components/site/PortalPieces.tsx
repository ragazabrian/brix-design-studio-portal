import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";

import { Reveal } from "@/components/site/Primitives";

export function FeatureGridItem({
  icon,
  title,
  description,
}: {
  icon: IconSvgElement;
  title: string;
  description: string;
}) {
  return (
    <Reveal className="h-full">
      <article className="flex h-full flex-col rounded-3xl border border-border bg-paper p-6 md:p-8">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-frost text-ink">
          <HugeiconsIcon icon={icon} size={24} strokeWidth={1.6} />
        </span>
        <h3 className="mt-6 text-[20px] font-medium leading-tight">{title}</h3>
        <p className="mt-3 text-muted-foreground">{description}</p>
      </article>
    </Reveal>
  );
}

export function TestimonialBlock({
  quote,
  avatar,
  name,
  role,
}: {
  quote: string;
  avatar: string;
  name: string;
  role: string;
}) {
  return (
    <section className="page-shell py-16 md:py-24">
      <Reveal>
        <figure className="mx-auto max-w-3xl text-center">
          <blockquote className="display-serif text-[clamp(1.5rem,3.6vw,2.5rem)]">
            &ldquo;{quote}&rdquo;
          </blockquote>
          <figcaption className="mt-8 flex items-center justify-center gap-4">
            <img
              src={avatar}
              alt={`Portrait of ${name}`}
              width={56}
              height={56}
              loading="lazy"
              className="grayscale-media h-14 w-14 rounded-full object-cover"
            />
            <span className="text-left text-sm">
              <span className="block font-medium">{name}</span>
              <span className="block text-muted-foreground">{role}</span>
            </span>
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}

export function DashboardMockup({
  main,
  sidebar,
  mainAlt,
  sidebarAlt,
}: {
  main: string;
  sidebar: string;
  mainAlt: string;
  sidebarAlt: string;
}) {
  return (
    <Reveal className="relative mx-auto w-full max-w-5xl">
      <div className="overflow-hidden rounded-3xl border border-border bg-paper">
        <img
          src={main}
          alt={mainAlt}
          loading="lazy"
          className="grayscale-media w-full object-cover"
        />
      </div>
      <div className="absolute -bottom-8 -left-2 hidden w-40 overflow-hidden rounded-2xl border border-border bg-paper md:block lg:-left-10 lg:w-52">
        <img
          src={sidebar}
          alt={sidebarAlt}
          loading="lazy"
          className="grayscale-media w-full object-cover"
        />
      </div>
    </Reveal>
  );
}
