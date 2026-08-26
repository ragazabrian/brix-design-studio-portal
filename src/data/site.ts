export const studio = {
  name: "Brix Design Studio",
  shortName: "Brix",
  contactName: "Brian Jess Ragaza",
  email: "ragazabrian@gmail.com",
  location: "Manila, Philippines",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/bjhamburger/" },
    { label: "Facebook", href: "https://www.facebook.com/ragazabrian" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/ragazabrian/" },
  ],
};

export type NavLink = { label: string; to: string; badge?: string };

export const navLinks: NavLink[] = [
  { label: "Work", to: "/work" },
  { label: "News", to: "/news" },
  { label: "Client Portal", to: "/client-portal", badge: "New" },
  { label: "Archive", to: "/archive" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export const menuLinks: NavLink[] = [{ label: "Home", to: "/" }, ...navLinks];

export type Project = {
  slug: string;
  title: string;
  tag: string;
  year: string;
  span: "wide" | "standard";
  summary: string;
  scope: string[];
  image: string;
  body: string[];
};

export type Spotlight = {
  slug: string;
  title: string;
  line: string;
  image: string;
  side: "left" | "right";
};

export type NewsItem = {
  id: string;
  date: string;
  title: string;
  body: string;
  links: { label: string; to?: string; href?: string }[];
};

export const clientNames = [
  "ICTechnology",
  "Trademaster",
  "Volver Studios",
  "Reflektor",
  "Oxford Shop",
  "Glue Store",
  "Rede Advokater",
  "Explore Equity",
  "Nunchi",
  "Oslo Event Hub",
];

import work1 from "@/assets/work-1.jpg";
import work2 from "@/assets/work-2.jpg";
import work3 from "@/assets/work-3.jpg";
import work4 from "@/assets/work-4.jpg";
import work5 from "@/assets/work-5.jpg";
import work6 from "@/assets/work-6.jpg";
import work7 from "@/assets/work-7.jpg";
import work8 from "@/assets/work-8.jpg";
import work9 from "@/assets/work-9.jpg";
import work10 from "@/assets/work-10.jpg";
import spotlightA from "@/assets/spotlight-1.jpg";
import spotlightB from "@/assets/spotlight-2.jpg";

export const projects: Project[] = [
  {
    slug: "volver-studios",
    title: "Volver Studios",
    tag: "Brand Identity & Web",
    year: "2026",
    span: "wide",
    summary:
      "A production house with strong work and a quiet front door. We gave it a mark, a grid and a site that puts the reel first.",
    scope: ["Brand identity", "Art direction", "Website"],
    image: work1,
    body: [
      "Volver had years of film work spread across social posts and client folders. Nothing pointed back to the studio itself.",
      "We drew a single wordmark, set two type weights and built a site where the reel loads before any copy does. Everything else sits one scroll below.",
      "Enquiries now arrive with a brief attached, because prospects can see the range before they write.",
    ],
  },
  {
    slug: "digit",
    title: "DIGIT",
    tag: "Identity & Design System",
    year: "2025",
    span: "standard",
    summary:
      "A software team that needed one visual language across product, sales and hiring.",
    scope: ["Identity", "Design system", "Web"],
    image: work2,
    body: [
      "Three teams were making their own slides, so the company looked like three companies.",
      "We built a token set, a component library and a short set of rules the team can follow without asking us. New pages now ship in a day.",
    ],
  },
  {
    slug: "ictechnology",
    title: "ICTechnology",
    tag: "Brand & Web Platform",
    year: "2025",
    span: "standard",
    summary:
      "Twenty years of network expertise, finally readable in under a minute on the homepage.",
    scope: ["Positioning", "Brand", "Website"],
    image: work3,
    body: [
      "The old site listed services in the order the company had added them, which buried the work clients actually buy.",
      "We led with reliability, cut the service list to four clear lines and moved proof up the page. Contact form starts rose after the first month.",
    ],
  },
  {
    slug: "libertine-vinbar",
    title: "Libertine Vinbar",
    tag: "Identity & Packaging",
    year: "2025",
    span: "wide",
    summary:
      "A wine bar identity drawn for candlelight, printed on labels, menus and the door.",
    scope: ["Identity", "Packaging", "Print"],
    image: work4,
    body: [
      "The room was already full most nights. What it lacked was anything to take home.",
      "We set a warm display face against plain stock, so labels, coasters and the takeaway list all read as one place. The mark works at door size and at label size without redrawing.",
    ],
  },
  {
    slug: "trademaster",
    title: "Trademaster",
    tag: "Digital & E-commerce",
    year: "2024",
    span: "standard",
    summary:
      "A raw materials distributor whose catalogue finally behaves like a tool for trade buyers.",
    scope: ["UX", "E-commerce", "Design system"],
    image: work5,
    body: [
      "Buyers know exactly what they want and were being asked to browse.",
      "We rebuilt search around product codes and finishes, cut the checkout to three steps and kept the print catalogue in step with the site.",
    ],
  },
  {
    slug: "reflektor",
    title: "Reflektor",
    tag: "Logo & Brand System",
    year: "2024",
    span: "standard",
    summary:
      "A studio mark and system built to hold up in one colour, at any size.",
    scope: ["Logo", "Brand system", "Guidelines"],
    image: work6,
    body: [
      "Reflektor needed a mark that survived embroidery, favicons and a projected wall.",
      "We drew one geometric form, tested it at 16 pixels and on fabric, and wrote guidelines short enough that people read them.",
    ],
  },
  {
    slug: "rede-advokater",
    title: "Rede Advokater",
    tag: "Visual Identity & Print",
    year: "2024",
    span: "standard",
    summary:
      "A law practice identity that reads as careful rather than conservative.",
    scope: ["Identity", "Stationery", "Web"],
    image: work7,
    body: [
      "Legal branding tends to reach for navy and columns. Rede wanted precision without the costume.",
      "We paired a quiet serif with generous margins and one restrained accent, then applied it across letterheads, contracts and the site.",
    ],
  },
  {
    slug: "explore-equity",
    title: "Explore Equity",
    tag: "Brand & Report Design",
    year: "2023",
    span: "standard",
    summary:
      "An investment brand plus the annual report a shareholder can actually navigate.",
    scope: ["Brand", "Editorial", "Data design"],
    image: work8,
    body: [
      "Numbers were correct and impossible to find. Every chart had its own style.",
      "We standardised the chart set, fixed a four column grid and put a figure index on page three. The report now takes minutes to read, not an afternoon.",
    ],
  },
  {
    slug: "glue-store",
    title: "Glue Store",
    tag: "Campaign & Content",
    year: "2023",
    span: "wide",
    summary:
      "A retail campaign system built so the in-house team can run it season after season.",
    scope: ["Art direction", "Campaign", "Templates"],
    image: work9,
    body: [
      "Each drop was being designed from nothing, which cost time and made the brand hard to recognise.",
      "We set a shooting spec, a type lockup and a template pack. The team now produces a full seasonal set without briefing us in.",
    ],
  },
  {
    slug: "nunchi",
    title: "Nunchi",
    tag: "Website & Motion",
    year: "2023",
    span: "standard",
    summary:
      "A product site where motion carries the explanation instead of decorating it.",
    scope: ["Web design", "Motion", "Copy structure"],
    image: work10,
    body: [
      "The product was easy to use and hard to describe in text.",
      "We replaced three paragraphs with short looping demonstrations, each tied to one sentence. Time on the page went up and support questions went down.",
    ],
  },
];

export const spotlights: Spotlight[] = [
  {
    slug: "oslo-event-hub",
    title: "Oslo Event Hub",
    line: "One identity that has to work on a lanyard, a stage screen and a street poster in the same week.",
    image: spotlightA,
    side: "left",
  },
  {
    slug: "oxford-shop",
    title: "Oxford Shop",
    line: "A menswear retailer rebuilt around fit, fabric and the two clicks between them.",
    image: spotlightB,
    side: "right",
  },
];

export const news: NewsItem[] = [
  {
    id: "portal",
    date: "18.08.26",
    title: "Client Portal is open to every studio client",
    body: "Files, brand guidelines, tasks, and hours now sit in one place, with sign in through Google and roles for admins, designers, and clients.",
    links: [
      { label: "See the portal", to: "/client-portal" },
      { label: "Sign in", to: "/portal" },
    ],
  },
  {
    id: "norrland",
    date: "02.07.26",
    title: "Volver Studios launches its new identity",
    body: "The mark, the grid and the site went live together. The reel now loads before any copy, which is how the studio wanted to be met.",
    links: [
      { label: "View project", to: "/work/volver-studios" },
      { label: "Read more", to: "/news" },
    ],
  },
  {
    id: "fold",
    date: "21.05.26",
    title: "Libertine Vinbar opens with the full identity in place",
    body: "Labels, menus, coasters and signage all came from one system, printed on plain stock and finished in a week.",
    links: [{ label: "View project", to: "/work/libertine-vinbar" }],
  },
  {
    id: "team",
    date: "09.03.26",
    title: "We are looking for a designer with production instincts",
    body: "Two years or more, comfortable in print specs and component libraries alike. Send work and a short note.",
    links: [{ label: "Get in touch", to: "/contact" }],
  },
];
