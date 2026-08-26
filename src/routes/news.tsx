import { createFileRoute } from "@tanstack/react-router";

import { news } from "@/data/site";
import { PageHeader, SiteShell } from "@/components/site/SiteShell";
import { NewsAccordionItem } from "@/components/site/NewsAccordionItem";
import ctaImage from "@/assets/cta-collaborate.jpg";
import { CTABanner } from "@/components/site/CTABanner";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News: Studio Updates and Launches | Brix Design Studio" },
      {
        name: "description",
        content:
          "Launches, hires and studio notes from Brix Design Studio. Short updates, published when something actually ships.",
      },
      { property: "og:title", content: "News | Brix Design Studio" },
      {
        property: "og:description",
        content: "Launches, hires and studio notes from Brix Design Studio.",
      },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  return (
    <SiteShell>
      <PageHeader
        label="News"
        title="What we shipped, and what changed because of it."
        intro="Expand any entry for the detail. We post when work goes live, not on a content calendar."
      />

      <section className="page-shell py-12 md:py-16">
        {news.map((item) => (
          <NewsAccordionItem key={item.id} item={item} />
        ))}
      </section>

      <CTABanner
        image={ctaImage}
        eyebrow="Studio"
        title="Want to be the next entry on this page?"
        linkLabel="Start a project"
        to="/contact"
      />
    </SiteShell>
  );
}
