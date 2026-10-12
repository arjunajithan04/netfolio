# Arjun Ajithan Portfolio CMS — Architecture Plan

**Status:** planning foundation only. No public React components, styles, routes, or content have been migrated to the CMS yet.

## Goals

- Add a private custom `/admin` dashboard to the existing React 18 + TypeScript + Vite application.
- Preserve the existing public portfolio architecture and cinematic black/crimson styling.
- Keep the seven-slide intro, Barça/football Easter egg, Proof of Progress, Netflix-inspired Milestones & Highlights timeline, project catalogue, and generated timeline artwork intact.
- Use draft → preview → explicit manual publish. Saving a draft must never change public content.
- Keep the public portfolio readable if Supabase is temporarily unavailable.
- Avoid secrets in source control and browser bundles.

## Recommended architecture

- **Frontend/hosting:** existing Vite app deployed on Vercel. Add `/admin` as a separate route/layout, not a replacement for the public experience.
- **Backend:** a new Supabase project for Postgres, Auth, and Storage.
- **Public content reads:** read only `cms_published_content`; draft payloads live in a separate `cms_drafts` table with admin-only RLS.
- **Draft preview:** authenticated admin loads a draft into the same public components through a private preview mode. Preview mode must never write draft data to the public table or expose drafts through an anonymous query.
- **Publishing:** call `publish_cms_item(item_id, revision_note)` after client-side validation. The database function checks admin membership, updates the published row and records a revision in one transaction.
- **Rollback:** select a prior revision and restore it into the draft, preview it, then publish it through the same workflow. A later migration should implement a guarded restore RPC; do not directly mutate production data from the browser.
- **Media:** use `portfolio-public` for public portfolio art and `portfolio-private` for restricted documents. Public certificates may be placed in the public bucket only if the owner explicitly intends them to be publicly accessible. Otherwise use private storage and short-lived signed URLs.

## Content model

`cms_items` contains private editorial metadata (type, slug, title, order). Payloads are JSON objects to let the CMS represent the existing portfolio without forcing the current component structure to change immediately.

Suggested payload conventions (validate these in the application with a schema library or typed validators before saving/publishing):

- `profile`: `{ name, headline, anecdote, education[], experience[], socialLinks[] }`
- `project`: `{ title, summary, problem, approach, features[], technologies[], image, githubUrl?, demoUrl?, featured }`
- `milestone`: `{ chapter, label, title, dateLabel, description, image, tags[], order }`
- `credential`: `{ issuer, title, completedLabel, certificateMediaId?, verificationUrl? }`
- `site_settings`: `{ seoTitle, seoDescription, socialImage, sectionVisibility }`

Use a content type discriminator and per-type validation. Do not accept arbitrary component names, HTML, CSS, JavaScript, or executable markup from CMS content.

## Draft and publish lifecycle

1. Create or edit `cms_items` + `cms_drafts` as an authenticated administrator.
2. Validate required fields, URLs, media type/size, and payload shape.
3. Preview by loading the draft payload into existing components in an authenticated preview route/state. Mark previews `noindex`; never expose draft API responses to anonymous users.
4. On explicit confirmation, invoke `publish_cms_item`.
5. The function checks admin membership, copies the draft payload into `cms_published_content`, and stores an immutable `cms_revisions` snapshot atomically.
6. The public site reads only published rows. If fetching fails, use bundled baseline content or a validated last-known-good snapshot; never substitute draft content.

## Security / RLS design

- `cms_admins`: no public read/write; administrator membership is inserted manually through the Supabase SQL editor or a trusted server-side process after the owner's Auth account exists. There is intentionally no self-enrollment policy.
- `cms_items`, `cms_drafts`, `cms_revisions`, `cms_media`: administrator-only policies.
- `cms_published_content`: public `SELECT` only; authenticated admins can manage it. The normal UI should publish through the transactional RPC, not direct writes.
- `publish_cms_item`: `SECURITY DEFINER` function with a fixed empty `search_path`; checks `is_cms_admin()` before acting. Review any future RPCs with the same standard.
- Storage: configure explicit policies for both buckets. Public bucket: public read, admin-only insert/update/delete. Private bucket: admin-only reads/writes; use signed URLs for any permitted viewing. Limit allowed MIME types and file sizes.
- Admin route guards improve UX only; RLS and Storage policies are the actual security boundary.
- Enable MFA for the admin account where feasible. Use a single admin account initially; add roles only if collaboration becomes necessary.
- Never ship a service-role/secret key to Vite or the browser. Only the Supabase URL and publishable/anon key belong in `VITE_*` variables, and only after RLS is applied.

## Vercel and environment setup

1. Create a new Supabase project and save its project URL and publishable/anon key.
2. Apply `supabase/migrations/001_cms_foundation.sql` to the new project's SQL editor or via Supabase CLI after review.
3. Create Storage buckets `portfolio-public` and `portfolio-private`; set public/private visibility as described above and add admin-only write policies.
4. Create an Auth user for the portfolio owner, then insert that user's UUID into `public.cms_admins` through the SQL editor. Do not add a public sign-up flow.
5. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` locally.
6. Add the same two variables to Vercel Project Settings → Environment Variables for Preview/Production as appropriate. Do not add privileged service-role credentials to frontend environment variables.
7. Configure Vercel SPA fallback if direct navigation to `/admin` returns a 404. Vite build output remains `dist` unless the current deployment uses a different existing configuration.
8. Keep preview deployments from using production credentials by default. Prefer a separate Supabase staging project for preview deployments.

## Phased implementation

### Phase 0 — Current deliverable: design and security foundation
- Architecture document, environment template, initial schema/RLS migration.
- No visual changes or frontend integration.

### Phase 1 — Backend provisioning
- Create Supabase project, buckets, admin Auth user, admin membership.
- Apply migration and test anonymous/authenticated access boundaries.
- Add Storage policies and upload constraints.

### Phase 2 — Content adapter and baseline migration
- Add Supabase client and typed content repository/validators.
- Convert current hardcoded profile/projects/milestones/credentials into baseline published content while preserving existing public output.
- Keep local fallback data until remote published content has passed validation.

### Phase 3 — Private admin dashboard
- Add protected `/admin` shell and sign-in/out.
- CRUD editors for projects, milestones, credentials, profile/settings, and media.
- Draft save and validation; no auto-publish.

### Phase 4 — Preview, publish, rollback
- Preview using the same components and existing design tokens.
- Add publish confirmation and revision notes.
- Add restore-to-draft workflow and transactional publication/rollback safeguards.

### Phase 5 — Verification and release
- TypeScript and production build.
- RLS tests for anon, signed-in non-admin, and admin users.
- Storage tests for public/private files.
- Browser tests for draft isolation, preview, publish, rollback, mobile layout, and the existing intro/Easter egg/certificate/timeline interactions.
- Verify offline/backend-failure fallback and Vercel direct-route behaviour.

## Acceptance criteria

- Public visitors can never query drafts or revision payloads.
- Non-admin authenticated users cannot create, edit, publish, or upload CMS content.
- Saving a draft has zero effect on public content.
- Publish operation updates public content and creates a revision atomically.
- Existing public design and interactions remain visually/functionally intact before and after migration.
- Missing Supabase configuration falls back to current bundled content rather than breaking the portfolio.
- No secret or service-role key appears in Git history or a client bundle.

## Known limits of this planning stage

The SQL is a reviewed starting point, not a deployed backend. Storage bucket policies, admin account provisioning, content payload validators, rollback RPC, frontend route guards, tests, and Vercel environment variables still need implementation and verification. Do not treat this package as a live CMS yet.
