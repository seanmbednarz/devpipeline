-- ECR Development Pipeline — Supabase schema
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query → paste → Run).
-- Model: public read-only; authenticated (signed-in) editors can write.

-- ── Photos ────────────────────────────────────────────────────────────────
create table if not exists public.property_photos (
  id            uuid primary key default gen_random_uuid(),
  property_id   text not null,               -- stable app id, e.g. 'industrial-42'
  storage_path  text not null,               -- path within the pipeline-photos bucket
  display_order integer not null default 0,
  created_by    uuid references auth.users (id),
  created_at    timestamptz not null default now()
);
create index if not exists property_photos_property_id_idx
  on public.property_photos (property_id, display_order);

-- ── Editable field overrides (layer over the static per-quarter data) ───────
create table if not exists public.property_overrides (
  property_id text primary key,              -- stable app id
  data        jsonb not null default '{}'::jsonb,
  updated_by  uuid references auth.users (id),
  updated_at  timestamptz not null default now()
);

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.property_photos    enable row level security;
alter table public.property_overrides enable row level security;

-- Public can read everything
create policy "photos public read"     on public.property_photos    for select using (true);
create policy "overrides public read"  on public.property_overrides for select using (true);

-- Signed-in editors can write
create policy "photos editor insert"   on public.property_photos    for insert to authenticated with check (true);
create policy "photos editor delete"   on public.property_photos    for delete to authenticated using (true);
create policy "overrides editor upsert" on public.property_overrides for insert to authenticated with check (true);
create policy "overrides editor update" on public.property_overrides for update to authenticated using (true) with check (true);

-- ── Storage bucket (public read) ────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('pipeline-photos', 'pipeline-photos', true)
on conflict (id) do nothing;

create policy "pipeline photos public read"
  on storage.objects for select
  using (bucket_id = 'pipeline-photos');

create policy "pipeline photos editor upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'pipeline-photos');

create policy "pipeline photos editor delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'pipeline-photos');
