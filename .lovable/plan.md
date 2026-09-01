# Secure invitations and client portal libraries

## Goal
Turn the existing saved-invite UI into a real invitation workflow, give clients a separate sign-in and project-scoped portal, and finish the Asset & Brand Library, Guidelines, and Module Library in the established black Brix design system.

## Build

### 1. Real invitations and account provisioning
- Replace direct browser inserts with an authenticated admin-only server function.
- Let an admin choose the role and, for client invitations, one or more projects the client may access.
- Create a single-use, expiring invite, send a branded email, and show sent, accepted, expired, and revoked states in Team settings.
- Add a public invite-accept page that validates the token, requires the invited email, supports email/password and Google sign-in, and completes provisioning after authentication.
- On acceptance, atomically assign exactly the invited role, add the client to only the selected projects, mark the invite accepted, and redirect staff or clients to the correct portal home.
- Keep role changes and deactivation server-authorized. Prevent an admin from accidentally removing their own final admin access.

### 2. Client-only portal
- Add a dedicated dark `/client-login` entry point with invite-aware messaging and no public-site navigation.
- Add a client route guard that requires the `client` role and an active account.
- Build a client dashboard that reads only project memberships allowed by database policies and exposes view-only project details, phases, assets, guidelines, modules, and documents.
- Remove staff-only navigation and write controls from the client shell. Keep staff on the current `/portal` and `/dashboard` flow.
- Redirect authenticated users to the correct home based on their role.

### 3. Asset, guidelines, and module libraries
- Rebuild the three existing routes as complete dark portal views using the current Brix tokens and Hugeicons.
- Asset & Brand Library: project filter, search, type/tag filters, responsive thumbnail grid, file metadata, preview, and download/open actions.
- Guidelines: section navigation and clear editorial layouts for logo, color, typography, imagery, and usage guidance.
- Module Library: searchable reusable module grid with previews, tags, metadata, and view/download actions.
- Preserve grayscale rendering for all media and ensure empty, loading, and permission states are accessible and responsive.

## Security and data
- Extend invitations with project assignments and safe acceptance functions; keep roles in `user_roles` and memberships in `project_members`.
- Tighten client write policies so client accounts remain view-only for project files and versions.
- Use authenticated server functions for invitations and privileged account operations. Validate the caller as an admin before privileged backend access.
- Add explicit grants and row-level policies for every new table or function surface.

## Email prerequisite
A sender domain is not configured yet. The email templates and invite-send integration can be built now, but real delivery starts after a sender domain owned by Brix is configured and verified in the email setup flow.

## Verification
- Verify admin invite creation, invalid/expired/revoked links, email mismatch, Google and password acceptance, exact role assignment, and project membership.
- Verify a client cannot reach staff routes or mutate project data and sees only assigned projects/assets.
- Verify the three library pages at desktop and mobile sizes, then check build/runtime logs before handoff.
