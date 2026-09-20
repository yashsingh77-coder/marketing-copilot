# Marketing Co-Pilot — Roadmap

Your instinct (Pillars + Ideas → Calendar → Competitors → Performance → Voice → School) is right on the core. Two suggested tweaks:

1. **Move Voice-to-Post up** (before Competitors). It's cheap (Deepgram + the brief generator you already have), it's the phone-first "wow" moment, and it's what gets a cafe owner to open the app daily.
2. **Seed a thin School shell early** (one lesson on the Pillars screen). The learning layer is the differentiator; wiring the `lesson → real task → calendar` loop early prevents retrofitting later.
3. **Competitor Snapshot after Voice.** Reliable local competitor data is the flakiest piece (scraping/ToS, no official Instagram search API). Ship it as "Google Places + LLM analysis of their public web presence" first, deepen later.

## Phase 0 — Foundation (this scaffold) ✅
- Next.js + Tailwind v4 + Framer Motion, design tokens, fonts
- Supabase schema, RLS, seed (lessons + badges), auth plumbing
- AI schemas (Zod) for pillars/briefs/competitors/insights

## Phase 1 — MVP core loop (build first)
- [ ] UI kit: Button, Card, Chip, Input, Slider, BottomNav, Mascot, CupFill
- [ ] Auth (magic link + Google) → onboarding wizard (5 steps)
- [ ] Content Pillar Engine (`/api/ai/pillars`, streaming into cards)
- [ ] Content Idea Generator (`/api/ai/brief`, tone toggle EN/Hinglish/HI, hashtag tiers)
- [ ] Dashboard "Today" with hero brief
- **Done when:** a new user goes from signup to a saved brief in < 3 minutes on a phone.

## Phase 2 — Calendar
- [ ] Week/month views over `post_briefs.scheduled_for`
- [ ] Suggested posting times (heuristic by category/audience → later replaced by Meta data)
- [ ] Auto-fill week respecting `weekly_hours`
- [ ] Drag-to-reschedule, status stickers

## Phase 3 — Voice/Video-to-Post
- [ ] MediaRecorder capture + upload to Storage
- [ ] Deepgram transcription route
- [ ] Transcript → brief (reuse Phase 1 generator)

## Phase 4 — Marketing School v1
- [ ] Lesson map + swipeable lesson cards
- [ ] Marketing 101 + Captions 101 + Hashtags 101 (Analytics 101 after Phase 6)
- [ ] XP, levels, 4 badges, confetti, streaks

## Phase 5 — Competitor Snapshot
- [ ] Google Places nearby search by category + location
- [ ] LLM analysis of public web presence → pillars/formats/gaps
- [ ] "Make a pillar from this gap" action

## Phase 6 — Performance Tracker
- [ ] Meta app setup (Facebook Login for Business, `instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`)
- [ ] OAuth connect + encrypted token storage
- [ ] Daily cron sync → `post_metrics`, `account_metrics`
- [ ] Insight generator → feeds back into brief prompts
- [ ] Analytics 101 lessons
- **Note:** Advanced Access on Meta requires App Review + Business Verification. Start the review process in Phase 2 so it's approved by Phase 6.

## Later
- WhatsApp reminders ("Your 7 PM post is ready to publish")
- Direct publishing via Instagram Content Publishing API
- Multi-language UI (Hindi, Marathi, Tamil)
- Team seats (owner + staff)
