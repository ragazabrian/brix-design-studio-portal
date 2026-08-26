import { createFileRoute } from "@tanstack/react-router";

import heroImage from "@/assets/hero-studio.jpg";
import ctaImage from "@/assets/cta-collaborate.jpg";
import socialTile from "@/assets/social-tile.jpg";
import { news, projects, spotlights, studio } from "@/data/site";
import { SiteShell } from "@/components/site/SiteShell";
import { ArrowLink, PillLink, Reveal, SectionIntro } from "@/components/site/Primitives";
import { WorkCard } from "@/components/site/WorkCard";
import { SpotlightBlock } from "@/components/site/SpotlightBlock";
import { LogoMarquee } from "@/components/site/LogoMarquee";
import { NewsAccordionItem } from "@/components/site/NewsAccordionItem";
import { CTABanner } from "@/components/site/CTABanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brix Design Studio: Brand and Design for Growing Companies" },
      {
        name: "description",
        content:
          "Brix Design Studio makes brand identities, editorial systems and digital products, and gives every client one portal for files, guidelines and hours.",
      },
      {
        property: "og:title",
        content: "Brix Design Studio: Brand and Design for Growing Companies",
      },
      {
        property: "og:description",
        content:
          "Brand identities, editorial systems and digital products, plus a client portal for files, guidelines and hours.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteShell overHero>
      <section className="relative min-h-[92svh] overflow-hidden bg-ink">
        <img
          src={heroImage}
          alt="A design studio workspace with printed brand books spread across a long table"
          width={1920}
          height={1080}
          className="grayscale-media absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="page-shell relative flex min-h-[92svh] flex-col justify-end pb-16 pt-28 md:pb-24">
          <p className="label-caps max-w-md text-paper/70">
            {studio.name}, a brand and design practice working in print, product and place.
          </p>
          <h1 className="display-serif mt-6 max-w-4xl text-[clamp(2.5rem,7.5vw,5.5rem)] text-paper">
            We build brands that
            <br />
            hold their shape
            <br />
            long after launch.
          </h1>
          <p className="mt-7 max-w-xl text-paper/75 md:text-[17px]">
            One system for identity, packaging, editorial and product. Drawn to be used by your team
            every day, not just admired in a deck.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <PillLink to="/contact" variant="onDark">
              Book a meeting
            </PillLink>
            <PillLink to="/work" variant="onDark" className="border-paper/30">
              See the work
            </PillLink>
          </div>
        </div>
      </section>

      <section className="page-shell py-16 md:py-24">
        <SectionIntro label="Work" showScrollHint />

        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          {projects.slice(0, 3).map((project, index) => (
            <Reveal
              key={project.slug}
              className={project.span === "wide" ? "md:col-span-2" : undefined}
            >
              <WorkCard project={project} priority={index === 0} />
            </Reveal>
          ))}

          <SpotlightBlock spotlight={spotlights[0]} />

          {projects.slice(3).map((project) => (
            <Reveal
              key={project.slug}
              className={project.span === "wide" ? "md:col-span-2" : undefined}
            >
              <WorkCard project={project} />
            </Reveal>
          ))}

          <SpotlightBlock spotlight={spotlights[1]} />
        </div>

        <div className="mt-12 flex justify-center">
          <PillLink to="/work" variant="outline">
            View all projects
          </PillLink>
        </div>
      </section>

      <LogoMarquee />

      <section className="page-shell py-16 md:py-24">
        <SectionIntro label="News" showScrollHint />
        <div>
          {news.map((item) => (
            <NewsAccordionItem key={item.id} item={item} />
          ))}
        </div>
        <div className="mt-10">
          <ArrowLink to="/news">Read more news</ArrowLink>
        </div>
      </section>

      <CTABanner
        image={ctaImage}
        eyebrow="Collaboration"
        title="Tell us what you are launching. We will tell you what it needs."
        linkLabel="Contact us"
        to="/contact"
      />

      <section className="page-shell pb-20 md:pb-28">
        <Reveal>
          <div className="grid items-center gap-8 rounded-3xl bg-frost p-6 md:grid-cols-2 md:p-10">
            <div>
              <p className="label-caps text-muted-foreground">Follow us</p>
              <h2 className="display-serif mt-5 text-[clamp(1.75rem,3.4vw,2.75rem)]">
                Process, offcuts and press checks, posted as they happen.
              </h2>
              <div className="mt-7">
                <ArrowLink href={studio.socials[0].href}>Go to Instagram</ArrowLink>
              </div>
            </div>
            <img
              src={socialTile}
              alt="Printed type specimens pinned in a grid on a studio wall"
              width={1200}
              height={1200}
              loading="lazy"
              className="grayscale-media aspect-square w-full rounded-2xl object-cover"
            />
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}
