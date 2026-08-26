# Brix Design Studio — marketing site plus working client portal

A multi-page studio site in the Sana visual language (editorial white, ink black, lime accent, 24px cards, pill buttons, weight-400 serif display), plus a real client portal with Google sign-in, roles, file uploads with thumbnails, and connected workspace tools.

## Visual system

Tokens come straight from the uploaded files, mapped into the project's theme:

- Ink Black `#0a1217`, Paper White `#ffffff`, Frost Wash `#e4eff7`, Stone Gray `#85898b`, Obsidian `#000000`, Electric Lime `#cdfe00`
- Lime stays punctuation only: decorative details, badges, small emphasis. Primary buttons are ink black pills. Dark ink panels for full-bleed cards and sign-up blocks.
- Serif display for hero headlines at weight 400 (Source Serif 4 as the Sana Serif stand-in), sans for all UI and body with tabular numerals
- Type scale 13 / 14 / 16 / 20 / 72px, radii 24px cards and inputs, full pills for buttons, 1200px page max width, 64px section gap
- Flat surfaces, no shadow-based depth; contrast comes from white to frost to ink to lime
- Media renders in grayscale with a light contrast boost via a `grayscale-media` utility, so the lime accent stays the only color note
- Icons: Hugeicons throughout
- Favicon replaced with the uploaded Brix mark; no Lovable edit badge

Every breakpoint gets checked: 375, 640, 768, 1024, 1280, 1536. Header rows use the grid plus min-w-0 plus shrink-0 pattern so nothing clips on small screens.

## Marketing site

Routes, each with its own page metadata:

- `/` home: full-bleed grayscale hero video with eyebrow, multi-line serif headline, support line, "Book a meeting" pill; Work intro row; asymmetric work grid with video-on-hover cards and tag plus title overlays; full-width spotlight blocks interrupting the grid; client logo marquee with opposite-direction rows and pause on hover; "View all projects"; News accordion with stamped DD . MM . YY dates and link rows; collaboration CTA banner; Instagram teaser; footer
- `/work` full project grid, `/work/$slug` case study
- `/news`, `/archive`, `/about`
- `/contact`: Brian Jess Ragaza, ragazabrian@gmail.com, Facebook, Instagram, LinkedIn, plus a message form that saves to the database and emails the studio
- `/client-portal` marketing page: hero with layered dashboard mockup collage, partner logo row, six-item platform feature grid, testimonial block, brand-guidelines spotlight, subscription block, dark final sign-up CTA

Global chrome: sticky navbar that is transparent over the hero and solid on scroll, with a full-screen overlay menu using staggered link reveals, socials bottom-left, contact and copyright bottom-right. Scroll reveals are a restrained 16px fade-and-rise.

Copy is written plain: no AI jargon, no em dashes, no filler adjectives. Buttons say what happens. Every image has real alt text, the overlay menu traps focus and closes on Escape, motion respects reduced-motion preferences, and all interactive targets are keyboard reachable with visible focus rings.

## Client portal app

Backend runs on Lovable Cloud (database, auth, storage, server functions).

Sign-in and onboarding:

- Google sign-in plus email and password fallback
- Google profile name, email, and avatar sync into the user profile on every sign-in
- Onboarding wizard for new users: confirm profile, pick or join a workspace, choose notification preferences

Roles and access:

- Roles live in a dedicated `user_roles` table: `admin`, `designer`, `client`. Never on the profile row.
- Admin manages members, invites, and roles. Designer uploads and manages project files and tasks. Client views their own projects, downloads assets, comments, and approves.
- Row level security on every table, checked through a security-definer role function.

Dashboard and files:

- Dashboard: active projects, recent files, open tasks, upcoming meetings, activity feed
- File upload with drag and drop, progress, and a thumbnail on every file: images and PDFs get generated preview thumbnails, other types get a typed icon tile
- Grid and list views, folders per project, versioning, download, and share links
- Docs, task board, and time tracking inside the portal

Connected tools (real connections, one card each in Settings):

- Google Drive and Google Calendar via the built-in connectors, for importing assets and booking meetings
- Notion via the built-in connector, for syncing pages and databases into portal docs
- Monday.com and Atlassian (Jira and Confluence) have no built-in connector here, so they get real API connections through user-supplied API tokens stored as secrets, with board and issue sync. If you would rather not manage tokens, Linear is available as a built-in connector alternative for the task-sync side.

## Build order

1. Enable Lovable Cloud, apply the design tokens, favicon, fonts, Hugeicons, navbar and overlay menu, footer
2. Homepage section by section, then Work, News, Archive, About, Contact
3. Client portal marketing page
4. Portal backend: schema, roles, RLS, storage buckets, auth with Google, onboarding
5. Portal app screens: dashboard, files with thumbnails, docs, tasks, time, members
6. Integrations: Google Drive and Calendar, Notion, then Monday and Atlassian
7. Responsive and accessibility pass across all breakpoints

## Technical notes

- React 19 plus TanStack Start on Vite, Tailwind v4 with tokens in `src/styles.css` under `@theme inline`. Python is not part of this stack, so all server logic runs as TanStack server functions on the built-in backend.
- Fonts load via a `<link>` in the root route head, never a CSS `@import`
- Motion for React handles the marquee, overlay menu, and scroll reveals
- Portal routes sit under an `_authenticated` layout with a route-level auth gate; protected data loads through server functions with auth middleware
- Thumbnail generation runs in a server function on upload and stores derivatives in a separate storage path
- Third-party API tokens are stored as backend secrets and only ever read inside server function handlers
