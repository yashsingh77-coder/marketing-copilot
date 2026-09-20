-- Studio: AI-generated creatives (images) linked to briefs.

create type public.creative_aspect as enum ('1:1', '4:5', '9:16', '16:9');

create table public.creatives (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  brief_id uuid references public.post_briefs(id) on delete set null,
  parent_id uuid references public.creatives(id) on delete set null,   -- set when this is an edit of another creative
  storage_path text not null,           -- bucket 'creatives'
  public_url text not null,
  prompt text not null,                 -- the final prompt sent to the image model
  user_instruction text,                -- what the owner asked for, verbatim
  aspect public.creative_aspect not null default '1:1',
  model text not null,
  width integer,
  height integer,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);
create index creatives_business_idx on public.creatives(business_id, created_at desc);
create index creatives_brief_idx on public.creatives(brief_id) where brief_id is not null;

alter table public.creatives enable row level security;
create policy "creatives: owner all" on public.creatives
  for all using (owns_business(business_id)) with check (owns_business(business_id));

-- Studio conversations (so the owner can come back to a thread)
create table public.studio_threads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  brief_id uuid references public.post_briefs(id) on delete set null,
  title text,
  messages jsonb not null default '[]'::jsonb,   -- UIMessage[] from the AI SDK
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index studio_threads_business_idx on public.studio_threads(business_id, updated_at desc);
create trigger studio_threads_updated_at before update on public.studio_threads
  for each row execute function public.set_updated_at();

alter table public.studio_threads enable row level security;
create policy "studio_threads: owner all" on public.studio_threads
  for all using (owns_business(business_id)) with check (owns_business(business_id));

-- Public bucket: creatives are meant to be downloaded and posted.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('creatives', 'creatives', true, 15728640, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

-- Path convention: creatives/{business_id}/{creative_id}.png
create policy "creatives: public read" on storage.objects
  for select using (bucket_id = 'creatives');
create policy "creatives: owner write" on storage.objects
  for insert with check (
    bucket_id = 'creatives'
    and owns_business((storage.foldername(name))[1]::uuid)
  );
create policy "creatives: owner delete" on storage.objects
  for delete using (
    bucket_id = 'creatives'
    and owns_business((storage.foldername(name))[1]::uuid)
  );
