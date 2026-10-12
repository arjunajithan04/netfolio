# Supabase Storage policy design

Buckets are intentionally not created by the SQL migration. Create them in Supabase Storage, then add policies equivalent to the following design after replacing bucket names only if you deliberately change the plan.

## `portfolio-public`
- Public read is allowed for published artwork referenced by public content.
- Only `public.is_cms_admin()` users may insert, update, or delete objects.
- Restrict writes to reasonable image formats (WebP, PNG, JPEG, SVG only if sanitized and truly needed) and a defined size limit.
- Do not store secrets, private drafts, or sensitive documents here.

## `portfolio-private`
- No anonymous reads.
- Only administrators may upload, read, update, or delete.
- Use short-lived signed URLs for certificate preview/download when access should be restricted.
- If a certificate is intended to be public, make that decision explicit and use the public bucket or a separately published public URL.

## Additional safeguards
- Keep `storage_path` opaque and avoid personal data in file names.
- Validate MIME type and size in the UI and enforce Storage policies/limits as the security boundary.
- On replacement, avoid deleting an old file while a published revision still references it. Use orphan cleanup only after checking references and revision history.
- Never place a service-role key in frontend code or `VITE_*` variables.
