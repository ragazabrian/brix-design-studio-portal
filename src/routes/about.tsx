import { createFileRoute } from "@tanstack/react-router";

import studioImage from "@/assets/hero-studio.jpg";
import ctaImage from "@/assets/cta-collaborate.jpg";
import { studio } from "@/data/site";
import { PageHeader, SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Primitives";
import { CTABanner } from "@/components/site/CTABanner";

const services = [
  {
    title: "Brand identity",
    body: "Naming support, wordmarks, type systems and the rules that keep them consistent across teams.",
  },
  {
    title: "Packaging and print",
    body: "Structural design through to press checks, specified so your printer can repeat it.",
  },
  {
    title: "Editorial systems",
    body: "Grids, templates and production files for reports, catalogues and books.",
  },
  {
    title: "Digital product",
    body: "Interface design and component libraries your developers can maintain without us.",
  },
];

const stats = [
  { value: "2016", label: "Studio founded" },
  { value: "84", label: "Projects delivered" },
  { value: "11", label: "Countries shipped to" },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About: How Brix Design Studio Works | Brix Design Studio" },
      {
        name: "description",
        content:
          "Brix Design Studio is a small brand and design practice led by Brian Jess Ragaza, working in identity, packaging, editorial and product design.",
      },
      { property: "og:title", content: "About | Brix Design Studio" },
      {
        property: "og:description",
        content:
          "A small brand and design practice working in identity, packaging, editorial and product design.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteShell>
      <PageHeader
        label="About"
        title="A small studio, deliberately."
        intro="We keep the team tight so the people who pitch the work are the people who make it. Fewer handovers, clearer decisions, faster answers."
      />

      <section className="page-shell py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <img
              src={studioImage}
              alt="The Brix Design Studio workspace with printed work laid out on a table"
              width={1920}
              height={1080}
              loading="lazy"
              className="grayscale-media aspect-[4/3] w-full rounded-3xl object-cover"
            />
          </Reveal>
          <Reveal className="space-y-6">
            <h2 className="display-serif text-[clamp(1.75rem,3.4vw,2.75rem)]">
              We start with how the work will be used.
            </h2>
            <p className="text-muted-foreground md:text-[17px]">
              Most identities fail in production, not in the presentation. So we design against real
              constraints from week one: the printer you use, the platform your team publishes on,
              the person who has to place a logo on a Tuesday afternoon.
            </p>
            <p className="text-muted-foreground md:text-[17px]">
              {studio.contactName} leads every project and stays on it through delivery. When a
              project needs a photographer, a copywriter or a developer, we bring in people we have
              worked with for years.
            </p>
          </Reveal>
        </div>

        <dl className="mt-16 grid gap-6 border-t border-border pt-10 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="label-caps text-muted-foreground">{stat.label}</dt>
              <dd className="display-serif mt-2 text-4xl tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="page-shell border-t border-border py-14 md:py-20">
        <h2 className="label-caps text-muted-foreground">What we do</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {services.map((service) => (
            <Reveal key={service.title} className="h-full">
              <article className="h-full rounded-3xl bg-frost p-6 md:p-8">
                <h3 className="text-[20px] font-medium">{service.title}</h3>
                <p className="mt-3 text-muted-foreground">{service.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <CTABanner
        image={ctaImage}
        eyebrow="Working together"
        title="Most projects start with a 30 minute call about what is not working."
        linkLabel="Book a meeting"
        to="/contact"
      />
    </SiteShell>
  );
}
