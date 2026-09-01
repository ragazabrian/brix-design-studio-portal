# Brix Client Portal roadmap

## Confirmed decisions
- Time tracking: cut entirely (no hours widget, no time views).
- Chat attachments: one studio Google Drive account.
- "Assistant": not a role. Hide the AI chat from Client-role users.
- Dashboard look: dark reference screenshots, plus a light/dark switch in Settings.
- Landing page and portfolio: hidden for now, kept in the codebase for later.

## Tasks
- [x] Dashboard: add Phases, Design, and Documents views using existing project data
- [x] Sidebar: right-align the collapse control and retain favicon branding in compact mode
- [x] Roadmap recorded
- [x] Database: library assets, guidelines, modules, meetings, asset requests, invite tokens, chat attachments
- [x] Hide landing + portfolio routes (redirect to portal sign in)
- [x] Light/dark theme switch (provider, storage, Settings control)
- [x] Portal sidebar shell matching the dark reference (Dashboard, Projects, Library, Brand guidelines, Modules, Documents, Meetings, Requests, Team, Settings)
- [x] Remove hours logged from dashboard; hide Calendar/Notion/Monday/Atlassian integrations
- [x] Sticky bottom AI assistant widget, hidden for clients
- [x] Library, guidelines, modules, documents, meetings, requests pages with role-aware editing
- [x] Client role is view-only across the portal
- [ ] Chat file attachments with thumbnails, saved to the studio Google Drive (needs the Google Drive connection)
- [ ] Invitations end to end with a real email and a working join link (needs the email domain)
