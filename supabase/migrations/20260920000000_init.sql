-- Marketing Co-Pilot — initial schema
-- Conventions: uuid PKs, timestamptz, RLS on every table, business-scoped access via owns_business().

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.post_format as enum ('static', 'carousel', 'reel', 'story');
create type public.brief_status as enum ('idea', 'drafted', 'scheduled', 'posted', 'skipped');
create type public.brief_source as enum ('generator', 'voice', 'lesson', 'competitor_gap', 'manual');
create type public.social_platform as enum ('instagram', 'facebook');
create type public.media_kind as enum ('audio', 'video');
create type public.asset_status as enum ('uploaded', 'transcribing', 'transcribed', 'briefed', 'failed');
create type public.lesson_module as enum ('marketing_101', 'captions_101', 'hashtags_101', 'analytics_101');
create type public.lesson_status as enum ('in_progress', 'completed');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  xp integer not null default 0 check (xp >= 0),
  streak_days integer not null default 0,
  last_active_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------------
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text not null,            -- e.g. 'cafe'
  sub_niche text,                    -- e.g. 'Specialty coffee & brunch'
  city text not null,
  area text,
  country text not null default 'IN',
  -- { age_groups: string[], interests: string[], notes?: string }
  audience jsonb not null default '{}'::jsonb,
  -- { voice: 'warm'|'witty'|'premium'|'no-nonsense', languages: ['en','hi'], hinglish: boolean, emoji: 'some'|'lots'|'none' }
  tone jsonb not null default '{}'::jsonb,
  weekly_hours numeric(4,1),
  monthly_budget_inr integer,
  -- [{ day: 0-6, time: '19:30', reason: '...' }] — heuristic until Meta data replaces it
  suggested_times jsonb not null default '[]'::jsonb,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index businesses_owner_idx on public.businesses(owner_id);
create trigger businesses_updated_at before update on public.businesses
  for each row execute function public.set_updated_at();

create or replace function public.owns_business(bid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.businesses b
    where b.id = bid and b.owner_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- content_pillars
-- ---------------------------------------------------------------------------
create table public.content_pillars (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text not null,         -- one-line "why this works for you"
  emoji text,
  color text not null default 'lemon',   -- design token: mint | sky | lemon | lilac | blush
  weight smallint not null default 20 check (weight between 0 and 100),  -- % of feed
  example_ideas jsonb not null default '[]'::jsonb,
  sort_order smallint not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index content_pillars_business_idx on public.content_pillars(business_id);
create trigger content_pillars_updated_at before update on public.content_pillars
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- post_briefs (the central object: idea → scheduled → posted)
-- ---------------------------------------------------------------------------
create table public.post_briefs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  pillar_id uuid references public.content_pillars(id) on delete set null,
  title text not null,
  format public.post_format not null,
  visual_concept text not null,
  caption text not null,
  caption_language text not null default 'en',   -- 'en' | 'hinglish' | 'hi'
  -- { local: string[], niche: string[], broad: string[] }
  hashtags jsonb not null default '{"local":[],"niche":[],"broad":[]}'::jsonb,
  cta text,
  status public.brief_status not null default 'idea',
  source public.brief_source not null default 'generator',
  source_asset_id uuid,               -- media_assets.id when source = 'voice'
  source_lesson_id uuid,              -- lessons.id when source = 'lesson'
  scheduled_for timestamptz,
  posted_at timestamptz,
  social_post_id uuid,                -- linked after publishing (set by metrics sync)
  generation_meta jsonb not null default '{}'::jsonb,  -- model, prompt version, insights used
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index post_briefs_business_idx on public.post_briefs(business_id);
create index post_briefs_calendar_idx on public.post_briefs(business_id, scheduled_for)
  where scheduled_for is not null;
create trigger post_briefs_updated_at before update on public.post_briefs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- competitors + reports
-- ---------------------------------------------------------------------------
create table public.competitors (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  place_id text,                      -- Google Places id
  address text,
  distance_m integer,
  website text,
  instagram_handle text,
  facebook_url text,
  rating numeric(2,1),
  review_count integer,
  -- { pillars: [{name, share}], formats: [{format, share}], posting_cadence, tone, notes }
  analysis jsonb not null default '{}'::jsonb,
  analyzed_at timestamptz,
  created_at timestamptz not null default now()
);
create index competitors_business_idx on public.competitors(business_id);

create table public.competitor_reports (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  summary text not null,
  -- [{ gap: string, why: string, suggested_pillar: string }]
  gaps jsonb not null default '[]'::jsonb,
  competitor_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);
create index competitor_reports_business_idx on public.competitor_reports(business_id);

-- ---------------------------------------------------------------------------
-- social accounts + metrics (Meta Graph API)
-- ---------------------------------------------------------------------------
create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  platform public.social_platform not null,
  external_account_id text not null,  -- IG user id / FB page id
  username text,
  display_name text,
  profile_picture_url text,
  access_token_encrypted text not null,   -- AES-256-GCM; only decrypted server-side
  token_expires_at timestamptz,
  scopes text[] not null default '{}',
  last_synced_at timestamptz,
  sync_error text,
  connected_at timestamptz not null default now(),
  unique (platform, external_account_id)
);
create index social_accounts_business_idx on public.social_accounts(business_id);

create table public.social_posts (
  id uuid primary key default gen_random_uuid(),
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  external_post_id text not null,
  brief_id uuid references public.post_briefs(id) on delete set null,
  media_type text,                    -- IMAGE | VIDEO | CAROUSEL_ALBUM | REELS | STORY
  format public.post_format,          -- normalized
  caption text,
  permalink text,
  thumbnail_url text,
  posted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (social_account_id, external_post_id)
);
create index social_posts_business_idx on public.social_posts(business_id, posted_at desc);

create table public.post_metrics (
  id uuid primary key default gen_random_uuid(),
  social_post_id uuid not null references public.social_posts(id) on delete cascade,
  captured_at timestamptz not null default now(),
  reach integer,
  impressions integer,
  likes integer,
  comments integer,
  saves integer,
  shares integer,
  plays integer,                      -- reels
  engagement_rate numeric(6,4),       -- (likes+comments+saves+shares)/reach
  raw jsonb not null default '{}'::jsonb
);
create index post_metrics_post_idx on public.post_metrics(social_post_id, captured_at desc);

create table public.account_metrics (
  id uuid primary key default gen_random_uuid(),
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  captured_on date not null,
  followers integer,
  follows integer,
  reach integer,
  profile_views integer,
  website_clicks integer,
  raw jsonb not null default '{}'::jsonb,
  unique (social_account_id, captured_on)
);

create table public.insights (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  kind text not null,                 -- 'format_performance' | 'best_time' | 'pillar_performance' | 'growth'
  headline text not null,             -- "Carousels outperform static posts 2:1 this month"
  body text,
  -- machine-readable so the brief generator can consume it: { prefer_format: 'carousel', confidence: 0.8 }
  directive jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  period_start date,
  period_end date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index insights_business_idx on public.insights(business_id, is_active);

-- ---------------------------------------------------------------------------
-- media_assets (voice notes / video clips)
-- ---------------------------------------------------------------------------
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  kind public.media_kind not null,
  storage_path text not null,         -- bucket 'voice-notes'
  mime_type text,
  duration_seconds numeric(7,2),
  size_bytes integer,
  status public.asset_status not null default 'uploaded',
  transcript text,
  detected_language text,
  transcript_meta jsonb not null default '{}'::jsonb,
  brief_id uuid references public.post_briefs(id) on delete set null,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index media_assets_business_idx on public.media_assets(business_id, created_at desc);
create trigger media_assets_updated_at before update on public.media_assets
  for each row execute function public.set_updated_at();

alter table public.post_briefs
  add constraint post_briefs_source_asset_fk
  foreign key (source_asset_id) references public.media_assets(id) on delete set null;

-- ---------------------------------------------------------------------------
-- Marketing School
-- ---------------------------------------------------------------------------
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  module public.lesson_module not null,
  title text not null,
  summary text not null,
  duration_min smallint not null default 2,
  xp_reward integer not null default 50,
  sort_order smallint not null default 0,
  -- ordered cards: [{ type: 'concept'|'example'|'quiz'|'task'|'done', ... }]
  content jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index lessons_module_idx on public.lessons(module, sort_order);

alter table public.post_briefs
  add constraint post_briefs_source_lesson_fk
  foreign key (source_lesson_id) references public.lessons(id) on delete set null;

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status public.lesson_status not null default 'in_progress',
  current_card smallint not null default 0,
  quiz_score smallint,
  task_brief_id uuid references public.post_briefs(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, lesson_id)
);
create index lesson_progress_user_idx on public.lesson_progress(user_id);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  emoji text not null,
  -- { type: 'lessons_completed'|'briefs_created'|'streak'|'module_completed'|'posts_published', value: number, module?: string }
  criteria jsonb not null default '{}'::jsonb,
  sort_order smallint not null default 0
);

create table public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  reason text not null,               -- 'lesson_completed' | 'quiz_correct' | 'brief_created' | 'post_published' | 'streak'
  ref_id uuid,
  created_at timestamptz not null default now()
);
create index xp_events_user_idx on public.xp_events(user_id, created_at desc);

-- Award XP atomically. Called from server code; clients cannot write xp directly.
create or replace function public.award_xp(p_amount integer, p_reason text, p_ref_id uuid default null)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_total integer;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  insert into public.xp_events (user_id, amount, reason, ref_id)
  values (v_uid, p_amount, p_reason, p_ref_id);
  update public.profiles
  set xp = xp + p_amount
  where id = v_uid
  returning xp into v_total;
  return v_total;
end $$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.content_pillars enable row level security;
alter table public.post_briefs enable row level security;
alter table public.competitors enable row level security;
alter table public.competitor_reports enable row level security;
alter table public.social_accounts enable row level security;
alter table public.social_posts enable row level security;
alter table public.post_metrics enable row level security;
alter table public.account_metrics enable row level security;
alter table public.insights enable row level security;
alter table public.media_assets enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.xp_events enable row level security;

-- profiles: read/update own row only (xp is guarded by column-level grants below)
create policy "profiles: own read" on public.profiles for select using (id = auth.uid());
create policy "profiles: own update" on public.profiles for update using (id = auth.uid());
revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url, last_active_on) on public.profiles to authenticated;

-- businesses
create policy "businesses: owner all" on public.businesses
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- business-scoped tables
create policy "content_pillars: owner all" on public.content_pillars
  for all using (owns_business(business_id)) with check (owns_business(business_id));
create policy "post_briefs: owner all" on public.post_briefs
  for all using (owns_business(business_id)) with check (owns_business(business_id));
create policy "competitors: owner all" on public.competitors
  for all using (owns_business(business_id)) with check (owns_business(business_id));
create policy "competitor_reports: owner all" on public.competitor_reports
  for all using (owns_business(business_id)) with check (owns_business(business_id));
create policy "media_assets: owner all" on public.media_assets
  for all using (owns_business(business_id)) with check (owns_business(business_id));
create policy "insights: owner read" on public.insights
  for select using (owns_business(business_id));
create policy "insights: owner update" on public.insights
  for update using (owns_business(business_id));

-- social: owner can read + delete (disconnect); writes come from server (service role)
create policy "social_accounts: owner read" on public.social_accounts
  for select using (owns_business(business_id));
create policy "social_accounts: owner delete" on public.social_accounts
  for delete using (owns_business(business_id));
revoke select (access_token_encrypted) on public.social_accounts from authenticated;

create policy "social_posts: owner read" on public.social_posts
  for select using (owns_business(business_id));
create policy "post_metrics: owner read" on public.post_metrics
  for select using (
    exists (select 1 from public.social_posts sp
            where sp.id = social_post_id and owns_business(sp.business_id))
  );
create policy "account_metrics: owner read" on public.account_metrics
  for select using (
    exists (select 1 from public.social_accounts sa
            where sa.id = social_account_id and owns_business(sa.business_id))
  );

-- school: lessons/badges public-read; progress/badges/xp per user
create policy "lessons: public read" on public.lessons
  for select using (is_published = true);
create policy "badges: public read" on public.badges
  for select using (true);
create policy "lesson_progress: own all" on public.lesson_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "user_badges: own read" on public.user_badges
  for select using (user_id = auth.uid());
create policy "xp_events: own read" on public.xp_events
  for select using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage: voice notes bucket (private, business-scoped paths)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'voice-notes', 'voice-notes', false, 26214400,
  array['audio/webm','audio/mp4','audio/mpeg','audio/ogg','audio/wav','video/webm','video/mp4','video/quicktime']
)
on conflict (id) do nothing;

-- Path convention: voice-notes/{business_id}/{asset_id}.{ext}
create policy "voice-notes: owner read" on storage.objects
  for select using (
    bucket_id = 'voice-notes'
    and owns_business((storage.foldername(name))[1]::uuid)
  );
create policy "voice-notes: owner write" on storage.objects
  for insert with check (
    bucket_id = 'voice-notes'
    and owns_business((storage.foldername(name))[1]::uuid)
  );
create policy "voice-notes: owner delete" on storage.objects
  for delete using (
    bucket_id = 'voice-notes'
    and owns_business((storage.foldername(name))[1]::uuid)
  );
