# Netfolio CMS — implementation status

## Included in this iteration

- A separate `/admin` route and sign-in screen; the public portfolio remains the default route.
- Dark, cinematic black/crimson CMS styling isolated from the public-page styles.
- Supabase Auth sign-in/sign-out and a database-backed administrator membership check against `cms_admins`.
- Content library for `profile`, `project`, `milestone`, `credential`, and `site_settings` items.
- JSON payload editor, draft saving, private JSON preview, and explicit publishing through `publish_cms_item`.
- Baseline importer that creates missing current-site entries as drafts only; it does not overwrite existing CMS entries and never publishes automatically.
- Public content adapter that queries only `cms_published_content` and maps supported published payloads into the existing portfolio data model.
- Bundled `src/data/portfolio.ts` content remains the fallback if Supabase is unconfigured, unavailable, or returns an invalid outer payload shape.
- Public data is refreshed at startup and when the page regains focus.
- Project payloads can provide a custom image path; existing local project art remains the default for matching bundled projects.
- Image upload to the existing private `portfolio-media` bucket with client-side file-type and size checks.

## Local setup

1. Run `npm install` (or `npm ci` when the lockfile matches your environment).
2. Copy `.env.example` to `.env.local`.
3. Set `VITE_SUPABASE_URL` to the `netfolio` project URL.
4. Set `VITE_SUPABASE_ANON_KEY` to the project's publishable/anon key.
5. Run `npm run dev` and open `/admin`.
6. Sign in using the Auth user whose UUID is registered in `public.cms_admins`.
7. Choose **IMPORT CURRENT SITE AS DRAFTS** to import the existing bundled portfolio into the CMS. Review and publish each item explicitly. Until an entry is published, the bundled content remains visible.

Only the browser-safe project URL and publishable/anon key belong in Vite variables. Never use a service-role key in frontend code or Vercel `VITE_*` settings.

## Adapter mapping

- `profile`: display name, role/headline, intro/anecdote, location, email, interests/tagline, education, experience, and social links.
- `project`: title, year, genre, summary, problem/approach, features, technologies, GitHub URL, and optional image path.
- `milestone`: chapter/season and episode data, dates, descriptions, image paths, tags, and ordering.
- `credential`: issuer, title, completion label, and verification URL.
- `site_settings`: document title and meta description.

The adapter merges published rows with the bundled baseline so a partially migrated content type does not disappear while the remaining entries are still drafts. Matching published items override their local counterparts; new projects and timeline entries are appended. Draft rows and revisions are never queried by the public adapter.

## Current boundaries — read before publishing

- **Adapter validation is intentionally lightweight.** It checks the outer row and JSON-object shape, but per-content-type schemas should be strengthened before production release.
- **Preview remains a private JSON preview**, not a rendered preview of the public portfolio components.
- Skill categories, Top Picks, achievements cards, resume objective, and section visibility remain on bundled data in this phase. The adapter connects the core profile, project, timeline, credential, and SEO data paths.
- Uploaded assets are stored in the private `portfolio-media` bucket and the UI displays the storage path. They are not yet registered in `cms_media` because the foundation schema permits only `portfolio-public` and `portfolio-private` as metadata bucket names. Resolve this mismatch in a reviewed migration before referencing private uploads from public content.
- A private Storage path is not a public image URL. Use existing local assets or approved public URLs for published content until public/private media delivery is designed.
- The upload limit and MIME checks are client-side convenience checks. Also set bucket-level size/MIME restrictions in Supabase Storage.
- This implementation uses a small browser REST/Auth adapter rather than adding a runtime dependency. Test sign-in, token refresh, RLS denials, upload, draft save, and publish against the live Supabase project before release.
- Database RLS and Storage policies remain the security boundary; hiding UI is not authorization.
- TypeScript project checking passed in the build environment. A full Vite production build could not be completed because the supplied `node_modules` lacked Rollup's `@rollup/rollup-linux-x64-gnu` optional package. Run a clean dependency install and `npm run build` before deployment.

## Next phases

1. Add typed validation per content type and a rendered preview using the same public components.
2. Align `cms_media` metadata with Storage bucket naming and add a safe public/private media delivery strategy.
3. Connect remaining sections (skills, Top Picks, achievements, section visibility) to explicit content models.
4. Test anon / signed-in non-admin / admin access, draft isolation, publish behavior, backend-failure fallback, and the existing intro/timeline/project interactions.
