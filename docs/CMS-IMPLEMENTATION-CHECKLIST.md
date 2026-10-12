# CMS implementation checklist

## Owner setup
- [ ] Create a new Supabase project.
- [ ] Apply `supabase/migrations/001_cms_foundation.sql` after reviewing it.
- [ ] Create `portfolio-public` and `portfolio-private` Storage buckets.
- [ ] Configure bucket RLS policies and file type/size restrictions.
- [ ] Create the owner's Auth account; add its UUID to `public.cms_admins` using the SQL editor.
- [ ] Configure local `.env.local` from `.env.example` (do not commit it).
- [ ] Configure Vercel environment variables and SPA route fallback.
- [ ] Create a separate staging Supabase project for Vercel preview deployments if possible.

## Engineering
- [ ] Add `@supabase/supabase-js` and a typed client that refuses unsafe/missing configuration gracefully.
- [ ] Add schema validation for each CMS content type.
- [ ] Add a content repository that reads published content only for the public app.
- [ ] Preserve bundled content as fallback until remote content has been validated.
- [ ] Add protected `/admin` route, authentication, sign-out, and admin membership check.
- [ ] Build editors for projects, milestones, credentials, profile and site settings.
- [ ] Add image/PDF upload, alt text, media references and replacement safeguards.
- [ ] Add draft save, preview, explicit publish confirmation and revision note.
- [ ] Add guarded restore-to-draft and rollback publication flow.
- [ ] Add noindex and access control for draft previews.
- [ ] Add accessible loading, empty, validation, permission and error states.

## Release tests
- [ ] Anonymous user can read published content only.
- [ ] Anonymous user cannot read drafts, admin metadata, revisions or private media.
- [ ] Authenticated non-admin cannot manage CMS content.
- [ ] Admin can save draft without changing the public view.
- [ ] Preview matches the proposed content while public view remains unchanged.
- [ ] Publish updates public view and records a revision atomically.
- [ ] Restoring a revision requires preview and explicit republishing.
- [ ] Existing seven-slide intro, Barça Easter egg, certificate UI, timeline, projects and mobile navigation still work.
- [ ] Production build and Vercel deployment pass.
- [ ] Backend/network failure uses a known-good fallback.
