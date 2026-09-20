# Marketing Co-Pilot

A marketing companion for small business owners with zero marketing experience. Generates content pillars, post briefs, and a calendar; turns voice notes into posts; tracks Instagram performance; and teaches marketing through short gamified lessons led by **Gyan the Guru**.

- 📐 [Architecture](docs/ARCHITECTURE.md)
- 🎨 [Design plan](docs/DESIGN.md)
- 🗺️ [Roadmap](docs/ROADMAP.md)

## Stack

Next.js 15 (App Router) · Tailwind CSS v4 · Framer Motion · Supabase (Postgres, Auth, Storage) · Vercel AI SDK + Anthropic · Deepgram Nova-3 · Meta Graph API · Vercel

## First-time setup (macOS)

This machine currently has no Node.js or Git. Install them once:

```bash
# 1. Xcode command-line tools (gives you git)
xcode-select --install

# 2. Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 3. Node 22 LTS + Supabase CLI + Docker (for local Supabase)
brew install node@22 supabase/tap/supabase
brew install --cask docker
```

Then, in this folder:

```bash
npm install
cp .env.example .env.local        # fill in keys

supabase init                     # creates supabase/config.toml (keep our migrations/ + seed.sql)
supabase start                    # local Postgres + Auth + Storage on Docker
supabase db reset                 # applies migrations + seed.sql
npm run db:types                  # generates types/database.ts

npm run dev                       # http://localhost:3000
```

`supabase start` prints the local `anon` and `service_role` keys — paste them into `.env.local`.

## Deploy

1. Create a Supabase project → `supabase link --project-ref <ref>` → `npm run db:push`.
2. Import the repo in Vercel; add every variable from `.env.example`.
3. In Supabase Auth → URL config, add `https://<your-app>.vercel.app/auth/callback`.
4. `vercel.json` registers the daily metrics cron; set `CRON_SECRET` in Vercel.

## Project layout

```
app/            routes (App Router). (app)/ is the authenticated shell.
components/     ui kit, mascot, loaders, motion helpers   ← Phase 1
lib/            supabase clients, ai schemas + prompts, transcribe, meta
supabase/       migrations + seed (lessons, badges)
types/          database.ts (generated), domain.ts
docs/           architecture, design, roadmap
```
