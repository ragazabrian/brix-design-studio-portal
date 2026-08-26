# Studio Hub

Agency name: Brix Design Studio
Icons: Hugeicons
Favicon attachment
No label of edit on Lovable
Make it responsive in each breakpoint. 
On Client Portal: https://www.ew.studio/client-portal Make it full functional, the has the onboarding, login, dashboard, integrated on Google, we can upload the files and has thumbnail on each files in the portal. get the idea on the link. Also the add feature should be like users (Admin, Designer, Client) Sync Google's Profile Infos and similar feature with Notion, Monday.com and Atlassian
Make sure it runs on Python 

No AI Jargons, no emdashes, make it UX copy consideration and accessibility

Contact page: 
ragazabrian@gmail.com
Brian Jess Ragaza
https://www.facebook.com/ragazabrian
https://www.instagram.com/bjhamburger/
https://www.linkedin.com/in/ragazabrian/


0. PROJECT SUMMARY

Build a multi-page marketing site for a brand & design studio, plus a separate "Client Portal" marketing page. Match the layout system, grid, navigation pattern, and content rhythm of a premium Scandinavian design studio site: full-bleed hero video, horizontal work grid interrupted by full-width case-study spotlights, an auto-scrolling client logo marquee, an accordion-style news feed, and a full-screen overlay nav menu.

Critical global rule: every image, video, and video-poster placeholder in the entire site must render in grayscale (CSS filter: grayscale(100%) on the media element, not on containers, so hover states/overlays keep color if any). Use #1a1a1a–#2a2a2a desaturated placeholder stills where real video isn't available yet.

Tech: React + Tailwind. Use Framer Motion for scroll reveals, marquee, and the overlay menu transition. Mobile-first, but this is a desktop-primary portfolio site — build desktop layout first, then collapse to mobile nav.

1. DESIGN SYSTEM

Color palette (monochrome, high-contrast):

Background: #FAFAF8 (off-white) for light sections, #0E0E0E for dark sections

Text primary: #0E0E0E on light, #FAFAF8 on dark

Text secondary/muted: #6B6B68

Borders/dividers: #E4E4E1 on light, #2A2A2A on dark

Accent: none — this system is strictly grayscale, including all media (per Section 0)

All images/video: grayscale(100%), slight contrast boost (contrast(1.05)) to keep them from looking washed out

Typography:

Display/headline font: a clean grotesque (e.g. "Neue Montreal", "General Sans", or fallback Inter/Helvetica Neue) — large, tight tracking, tight leading (0.95–1.0)

Body font: same family, regular weight, generous line-height (1.5–1.6)

Scale: hero H1 ~clamp(2.5rem, 6vw, 6rem); section headers ~clamp(1.5rem, 3vw, 2.5rem); body ~1rem–1.125rem

Nav links and small labels: uppercase, letter-spacing 0.05em, small size (12–13px)

Grid & spacing:

12-column grid, max-width container ~1600px, generous outer margin (5–6vw on desktop, 20px mobile)

Section vertical rhythm: 96–160px padding top/bottom between major sections

Card grid: 2–3 columns desktop, 1 column mobile, consistent gutter (~24px)

Motion:

Scroll-triggered fade+slide-up (16px, 400ms ease-out) on section entry

Hover on project cards: subtle scale (1.02) + video autoplay-on-hover if video card

Logo marquee: continuous linear horizontal scroll, pause on hover

Nav overlay: full-screen panel slides/fades in over 400–500ms, staggers link reveal

2. GLOBAL NAVBAR

Fixed/sticky top bar, transparent over hero, solid background on scroll.

Layout: logo/wordmark left · nav links center-right · "Login" button far right · hamburger/menu trigger far right (opens full-screen overlay).

Top-level links: Work · News · Client Portal (badge: "New") · Archive · About · Contact

Full-screen overlay menu (triggered by menu icon):

Covers 100vw/100vh, dark background

Large stacked link list (Home, Work, News, Client Portal, Archive, About, Contact) — each link large display-type, animates in with stagger

Bottom-left: social links (Instagram, Facebook, LinkedIn) as small vertical or horizontal list

Bottom-right: contact email + phone, copyright line

Close via "X" icon top-right or click-outside

3. HOMEPAGE — SECTION BY SECTION

3.1 Hero

Full-bleed background video (grayscale filter applied), desktop and mobile source variants, autoplay/muted/loop

Overlaid top-left or center: eyebrow line (small, muted) — one sentence about the studio's craft/positioning

Large multi-line H1 (3–4 lines, tight leading) — your core positioning statement

Supporting paragraph below, ~2 lines, muted color

Primary CTA button: "Book a meeting" style — pill or rectangular button, outlined, fills on hover

3.2 Work — intro row

Small section label "Work" left-aligned + down-arrow/scroll indicator right-aligned

3.3 Work grid (mixed video/image cards)

Asymmetric grid: mix of large (2-col span) and standard (1-col) cards

Each card: media (video-on-hover or static grayscale image), small category tag top-left overlay (e.g. "Brand Identity & Web"), title bottom-left overlay, hover reveals a "View project" arrow link

Interrupt the grid ~every 4–6 cards with a full-width spotlight block: large video/image left or right half, project name + one-line description + "View project" link on the other half

3.4 Client logo marquee

Full-width horizontal auto-scrolling strip of client wordmarks/logos, grayscale, separated by small circle/dot dividers

Two rows scrolling in opposite directions (optional, matches premium studio pattern) or single continuous loop

3.5 "View all projects" CTA

Centered button/link below the grid, arrow icon, links to /work

3.6 News / Journal feed

Section label "News" + down-arrow, same pattern as Work intro

List (not grid) of news entries, each row expandable/accordion style:

Date (DD . MM . YY format, stacked vertically like a stamp)

Headline (one line, large type)

Expand icon (rotates on open)

On expand: 2–3 line description + row of text links ("Read more", "View project", "See website") each with small arrow icon

"Read more news" link at bottom, arrow icon

3.7 Contact/Collaboration CTA banner

Full-width or contained block, dark background image (grayscale), overlay text: short line inviting collaboration + "Contact us" arrow link

3.8 Social teaser

Secondary CTA block: "Follow us" line + large grayscale image tile + "Go to Instagram" arrow link

3.9 Footer

Social icons row (Instagram, Facebook, LinkedIn)

Language switcher (e.g. EN / SV — adapt to your locales)

Copyright line + studio name

Contact email + phone, right-aligned or centered depending on breakpoint

4. CLIENT PORTAL PAGE (/client-portal)

Same navbar/footer. Content sections:

4.1 Hero

H1: short, benefit-driven headline about having "one home" for brand assets/design work

Subtext: 1–2 sentences on what the portal does

CTA: "Sign up" button

Below: a stacked product screenshot mockup — dashboard screen as the main large image, with a sidebar panel image and a topbar image layered/ offset behind or beside it (grayscale, soft drop shadow, slight perspective/skew optional) — this is the classic "SaaS dashboard hero collage" composition

Row of small partner/client logo marks below, grayscale, evenly spaced

4.2 "Our platform" — feature grid

Section intro: header + 2-line description + "Sign up" CTA

6-item feature grid (3x2 or 2x3), each item:

Small square/rounded-square icon-style image (grayscale)

Feature name (e.g. Asset & Brand Library, Guidelines, Module Library, Track Time, Book Meetings, Documents — adapt naming to your product)

One-sentence description

Optional secondary strip repeating the same 6 images smaller, as a decorative divider

4.3 Testimonial block

Large centered quote (1–2 sentences), quotation styled in bigger display type

Attribution: small headshot (grayscale) + name, title, company

Row of additional client logos below, grayscale

4.4 "Explore your brand guidelines" feature spotlight

Header + description + "Sign up" CTA

Large dashboard screenshot image

Below: 2-column feature pair — each with a short video/gif-style demo (grayscale) + 1-line caption (e.g. "Apply your colors with ease", "Complete typography styleguides")

4.5 "No more worries" / subscription feature block

Header + description + "Sign up" CTA

Large laptop/device mockup image (grayscale)

2-column sub-feature pair with short captioned demo videos (e.g. "Request new assets", "Transfer hours")

4.6 Final sign-up CTA

Full-width dark section, background image (grayscale, office/team photo style), centered headline: short line inviting sign-up, "Sign up" button with arrow icon

4.7 Footer

Same as homepage footer

5. COMPONENT CHECKLIST FOR LOVABLE

Build these as reusable components:

Navbar (sticky, transparent→solid on scroll)

FullScreenMenu (overlay, staggered link animation)

HeroVideo (grayscale video bg, headline, CTA)

WorkCard (video-on-hover / image, tag overlay, title overlay)

SpotlightBlock (full-width split media + text)

LogoMarquee (infinite scroll, grayscale logos)

NewsAccordionItem (date stamp, expand/collapse, link row)

CTABanner (dark bg image + centered text + link)

FeatureGridItem (icon image + title + description)

TestimonialBlock (quote + avatar + attribution)

DashboardMockup (layered screenshot collage, grayscale)

Footer (social row, lang switch, copyright, contact)

Global CSS utility to add:

css

.grayscale-media {
  filter: grayscale(100%) contrast(1.05);
}

Apply to every <img> and <video> in the project via this class or a Tailwind arbitrary variant.

6. WHAT TO SEND LOVABLE FIRST

Paste Sections 0–2 (system + navbar) and ask it to scaffold the project, design tokens, and navbar/overlay menu first.

Then paste Section 3 to build the homepage sections one at a time (hero → work grid → marquee → news → footer) rather than all at once — Lovable holds design consistency better in smaller passes.

Then paste Section 4 for the client portal page as a second route.

Reference Section 5's component list explicitly if Lovable starts duplicating markup instead of componentizing.

7. YOUR CONTENT (fill in before/while building)

Replace every bracketed placeholder above with weave+'s actual copy — headline, positioning line, service categories, project names/tags, news items, testimonial, and portal feature names. Keep sentence lengths and line-break patterns similar to what's described (short, confident, 2–4 line headlines) so the grid/typography scale doesn't break.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7bec1bd2-bae4-4529-9e2f-cd1cdc87e9fb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
