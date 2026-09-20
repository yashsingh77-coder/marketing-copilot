import { z } from "zod";

/** Structured-output contracts for every generator. Rows in Postgres mirror these. */

export const PostFormat = z.enum(["static", "carousel", "reel", "story"]);
export type PostFormat = z.infer<typeof PostFormat>;

export const CaptionLanguage = z.enum(["en", "hinglish", "hi"]);
export type CaptionLanguage = z.infer<typeof CaptionLanguage>;

export const PillarColor = z.enum(["mint", "sky", "lemon", "lilac", "blush"]);

// ─── Content Pillar Engine ────────────────────────────────────────────────
export const PillarSchema = z.object({
  name: z.string().max(40).describe("Short, memorable pillar name, e.g. 'Behind the Counter'"),
  emoji: z.string().max(4),
  description: z
    .string()
    .max(160)
    .describe("One line explaining why this pillar works for THIS business and audience"),
  weight: z.number().int().min(5).max(60).describe("Suggested % of the feed"),
  color: PillarColor,
  example_ideas: z.array(z.string().max(80)).min(2).max(4),
});

export const PillarSetSchema = z.object({
  pillars: z.array(PillarSchema).min(4).max(6),
  rationale: z.string().max(300).describe("2-sentence explanation to show the owner"),
});
export type PillarSet = z.infer<typeof PillarSetSchema>;

// ─── Content Idea + Format Generator ──────────────────────────────────────
export const HashtagTiersSchema = z.object({
  local: z.array(z.string().regex(/^#\S+$/)).min(2).max(5).describe("City/area/neighbourhood tags"),
  niche: z.array(z.string().regex(/^#\S+$/)).min(2).max(5).describe("Category-specific community tags"),
  broad: z.array(z.string().regex(/^#\S+$/)).min(1).max(3).describe("High-volume reach tags"),
});

export const PostBriefSchema = z.object({
  title: z.string().max(60).describe("Internal title shown on the calendar"),
  format: PostFormat,
  visual_concept: z
    .string()
    .max(400)
    .describe("Exactly what to shoot/design: subject, angle, lighting, props, on-screen text. Slides for carousels, shot list for reels."),
  caption: z.string().max(1200),
  caption_language: CaptionLanguage,
  cta: z.string().max(80).describe("One clear ask at the end of the caption"),
  hashtags: HashtagTiersSchema,
  best_time_hint: z
    .string()
    .max(80)
    .optional()
    .describe("e.g. 'Weekday evening, 7-8 PM — office crowd scrolls after work'"),
});
export type PostBrief = z.infer<typeof PostBriefSchema>;

export const HookAlternativesSchema = z.object({
  hooks: z.array(z.string().max(120)).length(3),
});

// ─── Voice/Video-to-Post ──────────────────────────────────────────────────
export const TranscriptToBriefSchema = PostBriefSchema.extend({
  summary: z.string().max(200).describe("What the owner said, in one sentence"),
  detected_intent: z
    .enum(["announcement", "offer", "behind_the_scenes", "story", "other"])
    .describe("What kind of moment this is"),
});

// ─── Competitor Snapshot ──────────────────────────────────────────────────
export const CompetitorAnalysisSchema = z.object({
  pillars: z.array(z.object({ name: z.string().max(40), share: z.number().min(0).max(100) })).max(6),
  formats: z.array(z.object({ format: PostFormat, share: z.number().min(0).max(100) })).max(4),
  posting_cadence: z.string().max(60),
  tone: z.string().max(60),
  notes: z.string().max(300),
});

export const CompetitorReportSchema = z.object({
  summary: z.string().max(400),
  gaps: z
    .array(
      z.object({
        gap: z.string().max(80),
        why: z.string().max(200),
        suggested_pillar: z.string().max(40),
      }),
    )
    .min(2)
    .max(4),
});

// ─── Performance insights ─────────────────────────────────────────────────
export const InsightSchema = z.object({
  kind: z.enum(["format_performance", "best_time", "pillar_performance", "growth"]),
  headline: z.string().max(90).describe("Plain English, no jargon. e.g. 'Carousels outperform static posts 2:1 this month'"),
  body: z.string().max(240),
  directive: z
    .object({
      prefer_format: PostFormat.optional(),
      prefer_pillar: z.string().optional(),
      prefer_time: z.string().optional(),
      confidence: z.number().min(0).max(1),
    })
    .describe("Machine-readable hint the brief generator will consume"),
});
export const InsightSetSchema = z.object({ insights: z.array(InsightSchema).max(4) });

// ─── Shared business context passed into every prompt ─────────────────────
export const BusinessContextSchema = z.object({
  name: z.string(),
  category: z.string(),
  sub_niche: z.string().nullable(),
  city: z.string(),
  area: z.string().nullable(),
  audience: z.object({
    age_groups: z.array(z.string()).default([]),
    interests: z.array(z.string()).default([]),
    notes: z.string().optional(),
  }),
  tone: z.object({
    voice: z.enum(["warm", "witty", "premium", "no-nonsense"]).default("warm"),
    languages: z.array(z.string()).default(["en"]),
    hinglish: z.boolean().default(false),
    emoji: z.enum(["none", "some", "lots"]).default("some"),
  }),
  weekly_hours: z.number().nullable(),
  active_insights: z.array(InsightSchema.shape.directive).default([]),
});
export type BusinessContext = z.infer<typeof BusinessContextSchema>;
