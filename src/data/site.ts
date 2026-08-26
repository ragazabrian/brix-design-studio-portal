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
  "Norrland Kaffe",
  "Halden Ceramics",
  "Meridian Bank",
  "Studio Vika",
  "Osten Publishing",
  "Fold Architects",
  "Larsen Optics",
  "Ateljé Nord",
  "Kvist Furniture",
  "Bright Harbour",
];

import work1 from "@/assets/work-1.jpg";
import work2 from "@/assets/work-2.jpg";
import work3 from "@/assets/work-3.jpg";
import work4 from "@/assets/work-4.jpg";
import work5 from "@/assets/work-5.jpg";
import work6 from "@/assets/work-6.jpg";
import spotlightA from "@/assets/spotlight-1.jpg";
import spotlightB from "@/assets/spotlight-2.jpg";

export const projects: Project[] = [
  {
    slug: "norrland-kaffe",
    title: "Norrland Kaffe",
    tag: "Brand Identity & Packaging",
    year: "2025",
    span: "wide",
    summary:
      "A roaster with twelve years of regulars and no shelf presence. We rebuilt the mark, the bag, and the way the counter reads from the door.",
    scope: ["Brand identity", "Packaging", "Print"],
    image: work1,
    body: [
      "Norrland had built a loyal following on flavour and nothing else. Every bag looked like a different company, which made the shelf feel accidental rather than considered.",
      "We drew a single wordmark, set a two-weight type system, and reduced the palette to paper and ink so origin labels could carry the only variation. Retail partners now stock four blends without confusing shoppers.",
      "First quarter after launch, wholesale enquiries doubled and the roastery moved to a printer that could hold the tighter spec.",
    ],
  },
  {
    slug: "halden-ceramics",
    title: "Halden Ceramics",
    tag: "Identity & Art Direction",
    year: "2025",
    span: "standard",
    summary:
      "A ceramics workshop that needed its catalogue to feel as quiet as the objects inside it.",
    scope: ["Identity", "Art direction", "Catalogue"],
    image: work2,
    body: [
      "Halden makes small batches for restaurants and private clients. The old catalogue crowded every page, so nothing held attention.",
      "We set one object per spread, standardised the light, and let captions carry the detail. The system now scales to seasonal drops without a redesign.",
    ],
  },
  {
    slug: "meridian-bank",
    title: "Meridian",
    tag: "Product Design & Web",
    year: "2024",
    span: "standard",
    summary:
      "A retail bank app rebuilt around the three things people actually open it for.",
    scope: ["Product design", "Design system", "Web"],
    image: work3,
    body: [
      "Meridian's app had grown to forty screens. Support tickets showed people were only ever checking balance, moving money, or finding a card control.",
      "We rewrote the information architecture around those tasks and shipped a component library the internal team maintains. Average session dropped by a third, which was the point.",
    ],
  },
  {
    slug: "fold-architects",
    title: "Fold Architects",
    tag: "Wayfinding & Signage",
    year: "2024",
    span: "wide",
    summary:
      "Environmental graphics for a gallery extension, drawn to sit inside the architecture rather than on top of it.",
    scope: ["Wayfinding", "Signage", "Typography"],
    image: work4,
    body: [
      "The extension had three entrances and no clear front door. Visitors were arriving through the service side.",
      "We cut a single condensed face into the concrete plane and used shadow depth to mark hierarchy. Nothing is backlit, so the signage reads differently through the day and disappears at night.",
    ],
  },
  {
    slug: "osten-publishing",
    title: "Osten Publishing",
    tag: "Editorial & Print",
    year: "2023",
    span: "standard",
    summary:
      "An imprint of photography books that needed one grid flexible enough for fifteen photographers.",
    scope: ["Editorial design", "Grid system", "Print production"],
    image: work5,
    body: [
      "Every Osten title had been designed from scratch, which made the imprint invisible on a bookshelf.",
      "We built a four-column grid with fixed margins and three image scales. Designers still make choices, but the spine, the caption style, and the paper stay constant.",
    ],
  },
  {
    slug: "larsen-optics",
    title: "Larsen Optics",
    tag: "Packaging & Retail",
    year: "2023",
    span: "standard",
    summary:
      "Frames sold in optician chains, packaged so the product is the first thing you see.",
    scope: ["Packaging", "Retail", "Photography"],
    image: work6,
    body: [
      "Larsen frames were arriving in cases that cost more than the display space they occupied.",
      "We reduced the box to one board weight and a blind deboss, then rebuilt the photography around a single light setup that any supplier can repeat.",
    ],
  },
];

export const spotlights: Spotlight[] = [
  {
    slug: "kvist-furniture",
    title: "Kvist Furniture",
    line: "A showroom identity built for one chair at a time, from the floor plan to the price card.",
    image: spotlightA,
    side: "left",
  },
  {
    slug: "meridian-bank",
    title: "Meridian Annual Report",
    line: "Fourteen years of numbers, set so a shareholder can find one figure in under a minute.",
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
    title: "Norrland Kaffe reaches national retail",
    body: "The packaging system we drew last year is now stocked in 240 stores. The bag held up at scale, which is the only test that counts.",
    links: [
      { label: "View project", to: "/work/norrland-kaffe" },
      { label: "Read more", to: "/news" },
    ],
  },
  {
    id: "fold",
    date: "21.05.26",
    title: "Fold Architects extension opens to the public",
    body: "Our wayfinding runs across three entrances and 900 square metres of concrete. Visitors now arrive through the front.",
    links: [{ label: "View project", to: "/work/fold-architects" }],
  },
  {
    id: "team",
    date: "09.03.26",
    title: "We are looking for a designer with production instincts",
    body: "Two years or more, comfortable in print specs and component libraries alike. Send work and a short note.",
    links: [{ label: "Get in touch", to: "/contact" }],
  },
];
