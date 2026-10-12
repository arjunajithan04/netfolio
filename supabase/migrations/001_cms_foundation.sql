-- Arjun Ajithan Portfolio CMS — foundation schema
-- Apply to a NEW Supabase project after reviewing docs/CMS-ARCHITECTURE.md.
-- This migration deliberately does not seed personal content or change the frontend.

create extension if not exists pgcrypto;

create type public.cms_content_type as enum (
  'profile',
  'project',
  'milestone',
  'credential',
  'site_settings'
);

create table public.cms_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table public.cms_items (
  id uuid primary key default gen_random_uuid(),
  content_type public.cms_content_type not null,
  slug text not null,
  admin_title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  unique (content_type, slug)
);

-- Draft payloads are in a separate admin-only table. Public roles cannot query them.
create table public.cms_drafts (
  item_id uuid primary key references public.cms_items(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- This is the ONLY content table exposed for public reading.
create table public.cms_published_content (
  item_id uuid primary key references public.cms_items(id) on delete cascade,
  content_type public.cms_content_type not null,
  slug text not null,
  sort_order integer not null default 0,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  published_at timestamptz not null default now(),
  published_by uuid references auth.users(id) on delete set null,
  unique (content_type, slug)
);

create index cms_published_content_type_order_idx
  on public.cms_published_content (content_type, sort_order, slug);

-- Immutable snapshots support rollback and an audit trail.
create table public.cms_revisions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.cms_items(id) on delete cascade,
  revision_number integer not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  revision_note text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  unique (item_id, revision_number)
);

create table public.cms_media (
  id uuid primary key default gen_random_uuid(),
  storage_bucket text not null check (storage_bucket in ('portfolio-public', 'portfolio-private')),
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size >= 0),
  alt_text text not null default '',
  usage_hint text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  unique (storage_bucket, storage_path)
);

create or replace function public.is_cms_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.cms_admins a where a.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_cms_admin() from public;
grant execute on function public.is_cms_admin() to anon, authenticated;

create or replace function public.touch_cms_item()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;

create trigger cms_items_touch_updated_at
before update on public.cms_items
for each row execute function public.touch_cms_item();

alter table public.cms_admins enable row level security;
alter table public.cms_items enable row level security;
alter table public.cms_drafts enable row level security;
alter table public.cms_published_content enable row level security;
alter table public.cms_revisions enable row level security;
alter table public.cms_media enable row level security;

-- Admin membership is provisioned out-of-band by the project owner; no self-enrollment policy.
create policy "admins can read admin roster"
  on public.cms_admins for select to authenticated
  using (public.is_cms_admin());

create policy "admins manage CMS item metadata"
  on public.cms_items for all to authenticated
  using (public.is_cms_admin()) with check (public.is_cms_admin());

create policy "admins manage drafts"
  on public.cms_drafts for all to authenticated
  using (public.is_cms_admin()) with check (public.is_cms_admin());

create policy "published content is publicly readable"
  on public.cms_published_content for select to anon, authenticated
  using (true);

create policy "admins manage published content"
  on public.cms_published_content for all to authenticated
  using (public.is_cms_admin()) with check (public.is_cms_admin());

create policy "admins read revisions"
  on public.cms_revisions for select to authenticated
  using (public.is_cms_admin());

create policy "admins create revisions"
  on public.cms_revisions for insert to authenticated
  with check (public.is_cms_admin());

create policy "admins manage media metadata"
  on public.cms_media for all to authenticated
  using (public.is_cms_admin()) with check (public.is_cms_admin());

-- Publishing is transactional: a draft becomes public and a snapshot is recorded together.
create or replace function public.publish_cms_item(p_item_id uuid, p_revision_note text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.cms_items%rowtype;
  v_payload jsonb;
  v_revision_number integer;
  v_revision_id uuid;
begin
  if not public.is_cms_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select * into v_item from public.cms_items where id = p_item_id;
  if not found then
    raise exception 'CMS item not found' using errcode = 'P0002';
  end if;

  select payload into v_payload from public.cms_drafts where item_id = p_item_id;
  if v_payload is null then
    raise exception 'No draft exists for this item' using errcode = 'P0002';
  end if;

  select coalesce(max(revision_number), 0) + 1
    into v_revision_number
    from public.cms_revisions
    where item_id = p_item_id;

  insert into public.cms_published_content
    (item_id, content_type, slug, sort_order, payload, published_at, published_by)
  values
    (v_item.id, v_item.content_type, v_item.slug, v_item.sort_order, v_payload, now(), (select auth.uid()))
  on conflict (item_id) do update set
    content_type = excluded.content_type,
    slug = excluded.slug,
    sort_order = excluded.sort_order,
    payload = excluded.payload,
    published_at = excluded.published_at,
    published_by = excluded.published_by;

  insert into public.cms_revisions
    (item_id, revision_number, payload, revision_note, created_by)
  values
    (p_item_id, v_revision_number, v_payload, p_revision_note, (select auth.uid()))
  returning id into v_revision_id;

  return v_revision_id;
end;
$$;

revoke all on function public.publish_cms_item(uuid, text) from public;
grant execute on function public.publish_cms_item(uuid, text) to authenticated;

-- Storage bucket creation is intentionally documented separately: bucket privacy and file
-- limits should be configured in Supabase Storage after review, not assumed by this SQL file.

-- Explicit table privileges: RLS remains the row-level enforcement layer.
grant select on public.cms_published_content to anon, authenticated;
grant select, insert, update, delete on public.cms_items, public.cms_drafts, public.cms_media to authenticated;
grant select on public.cms_admins, public.cms_revisions to authenticated;
grant insert on public.cms_revisions to authenticated;
grant select, insert, update, delete on public.cms_published_content to authenticated;
