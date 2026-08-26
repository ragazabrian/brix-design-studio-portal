import { createFileRoute } from "@tanstack/react-router";
import {
  Folder01Icon,
  PaletteIcon,
  Layers01Icon,
  Clock01Icon,
  Calendar03Icon,
  File01Icon,
} from "@hugeicons/core-free-icons";

import dashboardImage from "@/assets/portal-dashboard.jpg";
import sidebarImage from "@/assets/portal-sidebar.jpg";
import guidelinesImage from "@/assets/portal-guidelines.jpg";
import laptopImage from "@/assets/portal-laptop.jpg";
import avatarImage from "@/assets/testimonial-avatar.jpg";
import ctaImage from "@/assets/cta-collaborate.jpg";
import { clientNames } from "@/data/site";
import { SiteShell } from "@/components/site/SiteShell";
import { PillLink, Reveal, SectionIntro } from "@/components/site/Primitives";
import {
  DashboardMockup,
  FeatureGridItem,
  TestimonialBlock,
} from "@/components/site/PortalPieces";
import { CTABanner } from "@/components/site/CTABanner";

const features = [
  {
    icon: Folder01Icon,
    title: "Asset library",
    description:
      "Logos, photography and source files in one place, with thumbnails so you can see what you are downloading.",
  },
  {
    icon: PaletteIcon,
    title: "Brand guidelines",
    description: "Colour values, type styles and usage rules, kept current instead of in an old PDF.",
  },
  {
    icon: Layers01Icon,
    title: "Task board",
    description: "See what is in progress, what is waiting on you, and what shipped last week.",
  },
  {
    icon: Clock01Icon,
    title: "Hours",
    description: "Every logged hour against your retainer, with the work it covered written plainly.",
  },
  {
    icon: Calendar03Icon,
    title: "Meetings",
    description: "Book review calls against real studio availability through your Google calendar.",
  },
  {
    icon: File01Icon,
    title: "Documents",
    description: "Briefs, scopes and notes that stay attached to the project they belong to.",
  },
];

export const Route = createFileRoute("/client-portal")({
  head: () => ({
    meta: [
      { title: "Client Portal: One Home for Your Brand Work | Brix Design Studio" },
      {
        name: "description",
        content:
          "The Brix Client Portal keeps files, brand guidelines, tasks, documents and hours in one place. Sign in with Google and invite your team.",
      },
      { property: "og:title", content: "Client Portal | Brix Design Studio" },
      {
        property: "og:description",
        content:
          "Files, brand guidelines, tasks, documents and hours in one place, with Google sign in and roles for your team.",
      },
    ],
  }),
  component: ClientPortalPage,
});

function ClientPortalPage() {
  return (
    <SiteShell>
      <section className="page-shell pb-28 pt-14 text-center md:pb-36 md:pt-20">
        <p className="label-caps text-muted-foreground">Client Portal</p>
        <h1 className="display-serif mx-auto mt-6 max-w-3xl text-[clamp(2.25rem,6vw,4.5rem)]">
          One home for every file we make for you.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground md:text-[17px]">
          Stop searching old email threads. Your assets, guidelines, tasks, documents and hours sit
          in one place, open to the people you invite.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <PillLink to="/portal">Sign up</PillLink>
          <PillLink to="/contact" variant="outline">
            Ask a question
          </PillLink>
        </div>

        <div className="mt-16 md:mt-20">
          <DashboardMockup
            main={dashboardImage}
            mainAlt="Portal dashboard showing project assets with file thumbnails and a recent activity list"
            sidebar={sidebarImage}
            sidebarAlt="Portal sidebar navigation with sections for projects, tasks and settings"
          />
        </div>

        <ul className="mt-24 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:mt-28">
          {clientNames.slice(0, 5).map((name) => (
            <li key={name} className="font-display text-lg text-muted-foreground">
              {name}
            </li>
          ))}
        </ul>
      </section>

      <section className="page-shell border-t border-border py-16 md:py-24">
        <SectionIntro
          label="Our platform"
          title="Six things your team asks for, in one place."
          description="Built from the questions clients actually send us: where is the file, which colour is right, how many hours are left."
          action={<PillLink to="/portal">Sign up</PillLink>}
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureGridItem
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>

      <TestimonialBlock
        quote="We used to lose half a day every launch hunting for the right logo file. Now the whole team pulls from one place and nobody asks us for a resend."
        avatar={avatarImage}
        name="Ingrid Halden"
        role="Head of Marketing, Halden Ceramics"
      />

      <section className="page-shell border-t border-border py-16 md:py-24">
        <SectionIntro
          label="Guidelines"
          title="Explore your brand guidelines without opening a PDF."
          description="Colour values copy in one click. Type styles show real specimens. When we update a rule, your team sees it the same day."
          action={<PillLink to="/portal">Sign up</PillLink>}
        />

        <Reveal>
          <img
            src={guidelinesImage}
            alt="Brand guidelines screen showing colour swatches with values, type specimens and a spacing scale"
            width={1600}
            height={1000}
            loading="lazy"
            className="grayscale-media w-full rounded-3xl border border-border object-cover"
          />
        </Reveal>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Reveal>
            <figure className="rounded-3xl bg-frost p-5">
              <img
                src={guidelinesImage}
                alt="Colour swatch row with copyable hex values"
                loading="lazy"
                className="grayscale-media aspect-[16/9] w-full rounded-2xl object-cover object-left-top"
              />
              <figcaption className="mt-4 text-muted-foreground">
                Apply your colours without guessing a value.
              </figcaption>
            </figure>
          </Reveal>
          <Reveal delay={0.05}>
            <figure className="rounded-3xl bg-frost p-5">
              <img
                src={guidelinesImage}
                alt="Typography specimen panel showing heading and body styles"
                loading="lazy"
                className="grayscale-media aspect-[16/9] w-full rounded-2xl object-cover object-bottom"
              />
              <figcaption className="mt-4 text-muted-foreground">
                Full typography styles, sizes and line heights.
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="page-shell border-t border-border py-16 md:py-24">
        <SectionIntro
          label="Retainers"
          title="Know where your hours went, before you ask."
          description="Request new assets, check what is queued, and move unused hours into next month. No spreadsheet, no reconciling."
          action={<PillLink to="/portal">Sign up</PillLink>}
        />

        <Reveal>
          <img
            src={laptopImage}
            alt="Laptop showing the portal project view with tasks and logged hours"
            width={1600}
            height={1000}
            loading="lazy"
            className="grayscale-media w-full rounded-3xl object-cover"
          />
        </Reveal>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Reveal>
            <figure className="rounded-3xl bg-frost p-5">
              <img
                src={dashboardImage}
                alt="Asset request form inside the portal"
                loading="lazy"
                className="grayscale-media aspect-[16/9] w-full rounded-2xl object-cover"
              />
              <figcaption className="mt-4 text-muted-foreground">
                Request new assets in the project they belong to.
              </figcaption>
            </figure>
          </Reveal>
          <Reveal delay={0.05}>
            <figure className="rounded-3xl bg-frost p-5">
              <img
                src={dashboardImage}
                alt="Hours summary showing time logged against a retainer"
                loading="lazy"
                className="grayscale-media aspect-[16/9] w-full rounded-2xl object-cover object-right"
              />
              <figcaption className="mt-4 text-muted-foreground">
                Transfer unused hours to the next month.
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <CTABanner
        image={ctaImage}
        eyebrow="Client Portal"
        title="Set up your portal in a few minutes. Invite your team in one more."
        linkLabel="Sign up"
        to="/portal"
      />
    </SiteShell>
  );
}
