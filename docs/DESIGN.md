# Marketing Co-Pilot — Design Plan

> Neo-brutalist meets playful. Think "a sticker sheet came to life", not "a SaaS dashboard".

## 1. Visual direction

### Palette (tokens live in `app/globals.css`)

| Token | Hex | Role |
|---|---|---|
| `--color-primary` | `#FF5A1F` **Electric Orange** | CTAs, active states, mascot body |
| `--color-primary-dark` | `#D9430E` | pressed state |
| `--color-secondary` | `#FF3D8A` **Hot Pink** | accents, badges, streak flame |
| `--color-ink` | `#141126` **Ink Navy** | all outlines, shadows, headings |
| `--color-cream` | `#FFF6E9` | page background |
| `--color-paper` | `#FFFFFF` | card surfaces |
| `--color-mint` | `#B8F2D6` | success, "posted" |
| `--color-sky` | `#BFE3FF` | info, "scheduled" |
| `--color-lemon` | `#FFE45E` | XP, highlights, "idea" |
| `--color-lilac` | `#D9C8FF` | School module |

Every pillar gets one of the 5 pastel blocks (mint/sky/lemon/lilac/pink-tint) so the calendar reads as a colour-coded grid at a glance.

> Orange is primary by default. To switch to hot-pink-primary, swap two tokens — nothing else changes.

### Typography
- **Display:** `Fredoka` (700) — chunky, rounded, friendly. Used for h1–h3, XP numbers, big stats.
- **Body:** `Nunito` (400/600/800) — rounded but highly readable at 14–16px on phones.
- Scale (mobile): h1 32/36, h2 24/28, h3 20/24, body 16/24, small 13/18. Headings are tight (`tracking-tight`), body is generous.

### The neo-brutalist kit
- **Outline:** `2.5px solid var(--color-ink)` on every interactive surface.
- **Offset shadow:** `4px 4px 0 var(--color-ink)` (cards), `6px 6px 0` (hero cards), `2px 2px 0` (chips).
- **Radius:** 16px cards, 12px buttons, 999px chips. Rounded + hard shadow = the "playful brutalist" tension.
- **Press:** button translates `+3px, +3px` and shadow collapses to `1px 1px 0` — feels like pushing a physical key. Spring `stiffness 500, damping 30`.
- **Hover (desktop):** cards tilt `rotateX/Y ±4°` toward the cursor, shadow grows to `6px 6px 0`.
- **Stickers:** rotated (−3° to +3°) chips with thick outline used for labels like "NEW", "+50 XP", "REEL".

### Motion vocabulary (Framer Motion)
| Pattern | Spec |
|---|---|
| Page enter | fade + `y: 12 → 0`, 250ms, `easeOut` |
| Card stagger | `staggerChildren: 0.06`, each card `y: 20, opacity 0 → 1, scale 0.97 → 1` |
| Button tap | `whileTap={{ scale: 0.96, x: 3, y: 3 }}` + shadow collapse |
| Card hover | `whileHover={{ rotate: -1, y: -4 }}` (mobile: none) |
| Success | canvas-confetti burst in orange/pink/lemon from the button position |
| Level-up | full-screen mascot pop + bigger confetti, 1.2s |
| Loading | custom loaders (below); never a plain spinner |

### Custom loaders
1. **CupFill** — outlined mug fills with orange liquid, steam wiggles; label cycles: "Brewing ideas…", "Adding a pinch of hashtags…". Default for AI generation.
2. **HashtagTicker** — chips slide in one-by-one: `#localcafe #brunch #…`. Used on hashtag regeneration.
3. **PostShuffle** — 3 mini post cards shuffle like a deck. Used on calendar auto-fill.
4. **Waveform** — bars bounce while transcribing voice notes.

### Mascot: **Gyan** (ज्ञान) the Guru
- A round, bright-orange blob with big oval eyes, round spectacles, a small floating sparkle above the head (the "aha" spark), and a tiny cream scarf.
- Built as an inline SVG React component so eyes/brows/mouth animate via Framer Motion.
- **Expressions:** `happy` (default), `thinking` (eyes up, sparkle spins), `celebrating` (arms up, confetti), `sleepy` (empty states: "Nothing scheduled yet — let's fix that"), `pointing` (tooltips in lessons).
- Appears: onboarding narrator, School lesson host, empty states, loading overlays, level-up toast. Never on the calendar grid itself (keeps data screens clean).

## 2. Screens

### A. Onboarding (5 steps, one question per screen, mobile-first)

```
┌──────────────────────────────┐
│ ●●○○○                        │  step dots (ink outline, orange fill)
│                              │
│   [Gyan: pointing]           │
│   "What's your business      │  Fredoka 28px
│    called?"                  │
│                              │
│  ┌─────────────────────────┐ │
│  │ Café Bandra             │ │  input: 2.5px outline, cream fill
│  └─────────────────────────┘ │
│                              │
│                              │
│  ┌─────────────────────────┐ │
│  │      Next  →            │ │  orange button, offset shadow
│  └─────────────────────────┘ │
└──────────────────────────────┘
```

1. **Name** — single text input. Gyan waves.
2. **Category → Sub-niche** — grid of big sticker-chips (☕ Cafe, 🍛 Restaurant, 💇 Salon, 🏋️ Gym, 👗 Boutique, 🛍️ Kirana/Retail, 🎂 Bakery, 📚 Tuition, ✨ Other). Picking one slides in sub-niche chips ("Specialty coffee & brunch", "Chai & snacks", …) as a second row.
3. **Audience** — two chip groups: age (18–24 / 25–34 / 35–44 / 45+ / Families) and interests (pre-suggested from category, multi-select, plus "add your own"). Gyan: thinking.
4. **Location** — city + area autocomplete (Google Places). Map pin sticker.
5. **Time & budget** — two chunky sliders: hours/week (1–10+) and ₹/month (0 – 20k+). Live label: "≈ 3 posts/week is realistic. Let's plan for that."
6. **Generating…** — CupFill loader; behind it pillar cards slide in one at a time as they stream. Ends with confetti + "Your 5 pillars are ready 🎉" → dashboard.

### B. Dashboard ("Today")

```
┌──────────────────────────────┐
│ Hi Arnav 👋          🔥 4  ⚡ 320│  streak + XP stickers
│ Café Bandra                  │
│                              │
│ ┌──────────────────────────┐ │
│ │ TODAY'S POST         REEL│ │  hero card, 6px shadow, pillar colour
│ │ Behind-the-scenes        │ │
│ │ "Cold brew day ☀️"        │ │
│ │ [Open brief →]           │ │
│ └──────────────────────────┘ │
│                              │
│ ┌─────────┐ ┌─────────────┐  │
│ │🎙 Voice  │ │📅 This week │  │  quick actions, 2-col
│ │ to post  │ │ 3/4 planned │  │
│ └─────────┘ └─────────────┘  │
│                              │
│ School · 2 min lesson        │
│ ┌──────────────────────────┐ │  lilac card, Gyan peeking
│ │ Hashtags 101 · +50 XP    │ │
│ └──────────────────────────┘ │
│                              │
│ Insight                      │
│ ┌──────────────────────────┐ │  mint card (only after Meta connect)
│ │ Carousels 2× static 📈    │ │
│ └──────────────────────────┘ │
│                              │
│ ┃ Today ┃ Ideas ┃ Calendar ┃ School ┃ Me ┃   bottom nav, ink outline top
└──────────────────────────────┘
```

Empty state (no posts scheduled): Gyan `sleepy` + "Your week is empty. Want me to fill it?" → one-tap auto-plan.

### C. Pillars + Idea Generator

- **Pillars** screen: 4–6 stacked cards, each with emoji, name, one-line "why this works for you", and a mini bar for "how much of your feed" (weight). Long-press/drag to reorder; swipe to swap out a pillar (regenerates one).
- **Idea generator** (bottom sheet from any pillar): format toggle (Static / Carousel / Reel / Story as sticker chips) → CupFill → **Brief card**:
  - Format sticker (rotated) top-right
  - **Visual concept** block (sky) — "Shoot: overhead of 3 cold brews on the wooden counter, morning light"
  - **Caption** block with tone toggle: `English` / `Hinglish` / `हिंदी` — regenerates caption only
  - **Hashtags** in 3 labelled rows: `📍 Local` / `🎯 Niche` / `🌍 Reach`, each tap-to-copy
  - Actions: `Add to calendar`, `Regenerate`, `Copy all`

### D. Content Calendar

- **Week view (default on mobile):** 7 vertical day columns collapse into a scrollable list of day cards; each has a suggested time chip ("7:30 PM · your audience is online") and a pillar-coloured post chip. Empty slots show a dashed outline "+ idea".
- **Month view (desktop/tablet):** classic 7×5 grid with colour dots per pillar; tap a day → side sheet with briefs.
- **Auto-fill week** button (PostShuffle loader) — respects weekly_hours (e.g. 3h → 3 posts).
- Drag-and-drop between days (Framer `Reorder` / `drag`), springy drop.
- Status via sticker: `IDEA` lemon → `SCHEDULED` sky → `POSTED` mint.

### E. Marketing School

- **Map screen:** a vertical winding path (like a board game) with lesson nodes per module: Marketing 101 → Captions 101 → Hashtags 101 → Analytics 101. Completed nodes are filled orange with a ✓; current node pulses; locked nodes are cream with an ink outline. Gyan stands on the current node.
- **Lesson screen:** full-screen swipeable cards (3–6 per lesson):
  1. Concept card (Gyan speaking, 2–3 sentences, one illustration)
  2. Example card ("Here's a caption that works / doesn't work — why?")
  3. Quick check (tap the right answer, instant feedback, +10 XP)
  4. **Real task** card — "Now generate 3 hashtag sets for your Menu Spotlight pillar" — runs the actual generator, result saved to calendar as `source: lesson`
  5. Completion — confetti, XP counter spins up, badge sticker if earned
- **Progress:** XP bar in header (Fredoka numbers), level titles: Rookie → Poster → Storyteller → Strategist → Guru.

### F. Competitor Snapshot
- 3–5 competitor cards (name, distance, platform handle) → each expands to "What they post" (pillar chips with % bars) and "Formats they lean on".
- Bottom **"Gaps you can own"** card (pink) with 2–3 bullets → each bullet has a `Make a pillar` button.

### G. Performance
- Top: follower count + 30-day sparkline in a hero card.
- **Insights feed** — plain-English cards ("Reels posted at 7 PM got 3× the reach"), each with a `Use this` button that biases the generator.
- Post list with format sticker, reach, engagement %, and its pillar colour — sortable.
- Not connected yet → Gyan `pointing` at a big "Connect Instagram" button, with a 3-line explainer of what we read (never post on their behalf).

### H. Voice-to-Post
- Big round orange record button (pulses while recording, Waveform loader while transcribing).
- Transcript appears in a speech bubble from the user; Gyan replies with the brief card (same component as Idea generator).
- Option to upload a video clip instead (`<input capture>` on mobile).

## 3. Component inventory (build order)
1. `Button` (primary / secondary / ghost, sizes, press physics)
2. `Card` (shadow sizes, tilt on hover, pillar-colour variant)
3. `Chip` / `Sticker` (rotation prop)
4. `Input`, `Slider`, `ChipGroup`
5. `BottomNav`, `TopBar` (XP + streak)
6. `Mascot` (Gyan, expression prop)
7. Loaders: `CupFill`, `Waveform`, `PostShuffle`
8. `Stagger`, `PageTransition`, `useConfetti`
9. `BriefCard`, `PillarCard`, `LessonCard`, `DayCard`

## 4. Accessibility & mobile
- Minimum tap target 44×44. Bottom nav, thumb-zone CTAs.
- All colour blocks pass 4.5:1 with ink text. Orange on cream is decorative only; orange buttons use ink or white text depending on size.
- `prefers-reduced-motion` disables tilt/confetti, keeps fades.
- Fonts loaded via `next/font` with `display: swap`.
