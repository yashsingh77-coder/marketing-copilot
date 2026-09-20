import type { PostFormat, CaptionLanguage } from "@/lib/ai/schemas";

export type BriefStatus = "idea" | "drafted" | "scheduled" | "posted" | "skipped";
export type BriefSource = "generator" | "voice" | "lesson" | "competitor_gap" | "manual";
export type PillarColor = "mint" | "sky" | "lemon" | "lilac" | "blush";
export type LessonModule = "marketing_101" | "captions_101" | "hashtags_101" | "analytics_101";

export type Business = {
  id: string;
  owner_id: string;
  name: string;
  category: string;
  sub_niche: string | null;
  city: string;
  area: string | null;
  audience: { age_groups: string[]; interests: string[]; notes?: string };
  tone: {
    voice: "warm" | "witty" | "premium" | "no-nonsense";
    languages: string[];
    hinglish: boolean;
    emoji: "none" | "some" | "lots";
  };
  weekly_hours: number | null;
  monthly_budget_inr: number | null;
  suggested_times: { day: number; time: string; reason: string }[];
  onboarding_completed_at: string | null;
};

export type ContentPillar = {
  id: string;
  business_id: string;
  name: string;
  description: string;
  emoji: string | null;
  color: PillarColor;
  weight: number;
  example_ideas: string[];
  sort_order: number;
  is_active: boolean;
};

export type PostBriefRow = {
  id: string;
  business_id: string;
  pillar_id: string | null;
  title: string;
  format: PostFormat;
  visual_concept: string;
  caption: string;
  caption_language: CaptionLanguage;
  hashtags: { local: string[]; niche: string[]; broad: string[] };
  cta: string | null;
  status: BriefStatus;
  source: BriefSource;
  scheduled_for: string | null;
  posted_at: string | null;
  created_at: string;
};

export type LessonCard =
  | { type: "concept"; title: string; body: string; mascot: "happy" | "thinking" | "pointing" | "celebrating" }
  | { type: "example"; title: string; good: string; bad: string; why: string }
  | { type: "quiz"; question: string; options: string[]; answer: number; explain: string }
  | { type: "task"; title: string; instruction: string; action: string; params: Record<string, unknown> }
  | { type: "done"; title: string; body: string };

export type Lesson = {
  id: string;
  slug: string;
  module: LessonModule;
  title: string;
  summary: string;
  duration_min: number;
  xp_reward: number;
  sort_order: number;
  content: LessonCard[];
};

/** Level thresholds for the School header. */
export const LEVELS = [
  { title: "Rookie", minXp: 0 },
  { title: "Poster", minXp: 200 },
  { title: "Storyteller", minXp: 500 },
  { title: "Strategist", minXp: 1000 },
  { title: "Guru", minXp: 2000 },
] as const;
