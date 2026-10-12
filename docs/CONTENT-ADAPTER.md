# Netfolio content adapter

## Runtime behaviour

- The public site loads `cms_published_content` on startup and when the browser tab regains focus.
- Only published rows are queried. Drafts and revision history are never requested by the public adapter.
- The adapter validates the outer row/payload shape and applies the supported payload fields to the existing portfolio data model.
- Bundled `src/data/portfolio.ts` data remains the fallback if Supabase is not configured, the request fails, or the response fails validation.
- A draft save does not affect the public site. The database `publish_cms_item` RPC remains the explicit publication step.
- Existing visual components and animations remain the render layer; this adapter changes data, not presentation.

## First-time import

After signing in to `/admin`, choose **IMPORT CURRENT SITE AS DRAFTS**. This creates draft entries from the current bundled portfolio and does not publish anything. Existing CMS entries are left untouched. The import can be run again to repair a partially completed import.

Review and publish the imported entries explicitly. Published rows override matching bundled records; new project or milestone slugs are appended. The local baseline remains available for any record that has not yet been published, so the public page does not suddenly become empty during migration.

## Payload conventions

- `profile`: `name`, `fullName`, `firstName`, `headline`, `anecdote`, `location`, `email`, `tagline[]`, `interests[]`, `education[]`, `experience[]`, `socialLinks[]` (`{ label, url }`).
- `project`: `title`, `year`, `genre`, `summary`, `problem`, `approach`, `features[]`, `technologies[]`, `githubUrl`, `demoUrl`, `image`, `featured`.
- `milestone`: `chapter`, `chapterPeriod`, `chapterSynopsis`, `label`, `title`, `dateLabel`, `description`, `image`, `tags[]`, `order`.
- `credential`: `issuer`, `title`, `completedLabel`, `certificateMediaId`, `verificationUrl`.
- `site_settings`: `seoTitle`, `seoDescription`, `socialImage`, `sectionVisibility`.

Payloads are JSON objects. Avoid HTML or executable content. Media paths should be valid public URLs or existing local asset paths; the current private Storage bucket's object paths are not public image URLs. The CMS media metadata/bucket model still needs a separate reviewed alignment before private uploaded media can be displayed publicly.

## Known scope of this phase

- Profile, education, experience, project catalogue, timeline seasons/episodes, credentials, and document title/description are connected.
- Skill categories, Top Picks, achievements cards, and section visibility remain on bundled data until their content model is defined and connected.
- Draft preview in the admin remains a JSON payload preview; a rendered public-component preview is a separate phase.
- Content validation is defensive but intentionally lightweight; add per-content-type schema validation before production release.
