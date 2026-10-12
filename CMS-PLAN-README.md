# Portfolio CMS planning pack

This archive contains the existing portfolio source plus the first CMS planning artifacts. The public site has not been wired to Supabase and no visual styling has been changed.

Start here:
1. `docs/CMS-ARCHITECTURE.md` — architecture, lifecycle, security model, deployment and phases.
2. `supabase/migrations/001_cms_foundation.sql` — initial Postgres schema and RLS policies for review.
3. `.env.example` — browser-safe Supabase configuration placeholders only.
4. `docs/STORAGE-POLICIES.md` — bucket and file-access policy design.
5. `docs/CMS-IMPLEMENTATION-CHECKLIST.md` — provisioning and implementation checklist.

The newly generated timeline artwork has been included under `public/assets/journey-episodes/cms-generated/` but is not wired to new references in the UI. This keeps the accepted art available without altering the current design during the planning phase.

No Supabase project was created, no credentials were added, and no deployment was performed.
