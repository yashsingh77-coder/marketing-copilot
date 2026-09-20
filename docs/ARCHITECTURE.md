# Marketing Co-Pilot — Architecture

## 1. The one-paragraph version

A single Next.js (App Router) app on Vercel. Supabase is the only backend: Postgres (with RLS), Auth, and Storage. AI generation runs inside Next.js server code (Route Handlers + Server Actions) using the Vercel AI SDK 7 (`generateText` + `Output.object`, Zod 4 schemas), so every generated pillar/brief/insight lands in Postgres as typed rows — not free text. Speech-to-text goes to Deepgram. Meta metrics are pulled by a daily Vercel Cron job. MCP servers are a **development-time** tool (used from OpenCode to manage Supabase, Vercel, docs, scraping) — the production app calls APIs directly.

```
┌────────────────────────────────────────────────────────────────────────┐
│  Phone / Browser                                                        │
│  Next.js UI (Tailwind v4 + Framer Motion) · MediaRecorder for voice     │
└───────────────┬────────────────────────────────────────────────────────┘
                │ Server Actions / Route Handlers (Vercel)
┌───────────────▼────────────────────────────────────────────────────────┐
│  Next.js server layer                                                   │
│  ├─ lib/ai        Vercel AI SDK → Anthropic (structured output, Zod)    │
│  ├─ lib/transcribe  Deepgram Nova-3 (audio/video → transcript)          │
│  ├─ lib/meta      Graph API client (OAuth, insights)                    │
│  ├─ lib/places    Google Places (competitor discovery)                  │
│  └─ app/api/cron  daily metrics sync (CRON_SECRET-protected)            │
└───────┬────────────────────────┬───────────────────────────────────────┘
        │ @supabase/ssr          │ service role (cron only)
┌───────▼────────────────────────▼───────────────────────────────────────┐
│  Supabase                                                               │
│  Postgres + RLS · Auth (magic link, Google) · Storage (voice-notes)     │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. Request flows

### Onboarding → Pillars → Briefs (MVP core loop)
1. User completes onboarding → `businesses` row (audience/tone as JSONB).
2. `POST /api/ai/pillars` → `generateStructured()` with `PillarSetSchema` → 4–6 `content_pillars` rows.
3. `POST /api/ai/brief` with `{pillarId, format?, hint?}` → `PostBriefSchema` → `post_briefs` row (status `idea`).
4. Calendar is just a view over `post_briefs` where `scheduled_for` is set; `suggested_times` on the business drive default slots.

### Voice/Video-to-Post
1. Browser `MediaRecorder` → blob → Server Action → Supabase Storage `voice-notes/{businessId}/{uuid}.webm` → `media_assets` row.
2. `POST /api/transcribe` streams the file to Deepgram (accepts webm/mp4 directly, no ffmpeg) → `transcript` + detected `language`.
3. Transcript + business context → same `PostBriefSchema` generator → `post_briefs` row with `source = 'voice'`.

### Performance Tracker
1. `GET /api/meta/connect` → Facebook Login for Business OAuth → `/api/meta/callback` exchanges for a long-lived token, encrypted with `META_TOKEN_ENCRYPTION_KEY`, stored in `social_accounts`.
2. `GET /api/cron/sync-metrics` (daily) → per account: fetch media list + `/insights` → upsert `social_posts`, `post_metrics`, `account_metrics`.
3. Insight generation: SQL aggregates (format vs. engagement, best hour, pillar performance) → LLM writes plain-English `insights` rows → those rows are injected into the brief-generator prompt ("carousels are outperforming; bias toward carousels").

### Marketing School
- `lessons` table is seeded (public read). `lesson_progress` per user. Each lesson's final step is a `task` that calls a real generator (e.g. "generate 3 captions for your Menu Spotlight pillar") and creates a `post_briefs` row with `source = 'lesson'`.
- XP/badges via `award_xp()` Postgres function (security definer) so the client can't forge XP.

## 3. Where MCP servers fit

MCP servers are for **you + OpenCode while building**, not for the running app. Recommended set (add to `opencode.json`):

| MCP server | Why |
|---|---|
| **Supabase MCP** (`@supabase/mcp-server-supabase`) | Run migrations, inspect schema, generate TS types, query data, check RLS — from the editor. Biggest productivity win. |
| **Vercel MCP** | Deployments, env vars, logs, cron status. |
| **Context7** | Up-to-date docs for Next.js 15, AI SDK, Supabase SSR, Framer Motion — avoids hallucinated APIs. |
| **Firecrawl** or **Bright Data MCP** | Prototype the competitor snapshot: scrape a competitor's public website/Google listing to seed pillar analysis. |
| **Playwright MCP** | Test the mobile-first flows in a real browser during dev. |

**Runtime tools (in-app, not MCP):** Google Places API for competitor discovery, Meta Graph API for metrics, Deepgram for STT. The Vercel AI SDK's tool-calling (`tools: {...}`) is the right primitive if you later want the LLM to call these at runtime. There is no official Meta or Instagram MCP server; if you want one for dev, write a 50-line custom server wrapping the Graph API.

## 4. Speech-to-text recommendation

**Primary: Deepgram Nova-3**
- Native multilingual code-switching (Hindi ⇄ English in the same sentence — critical for Hinglish owners).
- Accepts webm/mp4/m4a directly — no ffmpeg step, video works as-is.
- ~$0.0077/min, $200 free credits, sub-second latency, simple REST API.

**Alternatives**
- **Sarvam AI (Saarika)** — India-built, strongest on Indic languages/accents. Consider if user base skews heavily to Hindi/Tamil/etc. Swap by implementing `lib/transcribe/provider.ts`.
- **OpenAI `gpt-4o-transcribe`** — very good quality, simplest if you already use OpenAI; weaker on explicit code-switching.

Recording itself needs no third-party: browser `MediaRecorder` API (works on iOS Safari 14.5+ and Android Chrome).

## 5. Security notes
- Every business-scoped table has RLS via `owns_business(business_id)`.
- Meta tokens are AES-256-GCM encrypted at rest; only cron (service role) decrypts.
- Cron routes verify `Authorization: Bearer ${CRON_SECRET}`.
- AI routes are per-user rate-limited (add Upstash Ratelimit when going public).
- `lessons`, `badges` are read-only for users; seeded via migrations.

## 6. Folder map

```
app/
  (marketing)/page.tsx            landing
  (auth)/login/page.tsx           magic link + Google
  auth/callback/route.ts          Supabase code exchange
  onboarding/page.tsx             5-step wizard
  (app)/                          authenticated shell (bottom nav on mobile)
    dashboard/  pillars/  ideas/  calendar/
    competitors/  performance/  voice/  school/[slug]/
  api/
    ai/{pillars,brief,competitors,insights}/route.ts
    transcribe/route.ts
    meta/{connect,callback}/route.ts
    cron/sync-metrics/route.ts
components/
  ui/            Button, Card, Chip, Input, Sheet, ProgressBar (neo-brutalist primitives)
  mascot/        Gyan the Guru (SVG, expression variants)
  loaders/       CupFill, HashtagTicker, PostShuffle
  motion/        Stagger, PageTransition, Confetti
lib/
  supabase/      client.ts, server.ts, middleware.ts
  ai/            client.ts, schemas.ts, prompts/*.ts
  transcribe/    deepgram.ts
  meta/          graph.ts, crypto.ts
  places/        google.ts
  school/        lessons.ts, xp.ts
supabase/
  migrations/    0001_init.sql
  seed.sql       lessons + badges
types/           database.ts (generated), domain.ts
docs/            this folder
```
