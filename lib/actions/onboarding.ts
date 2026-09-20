"use server";

import { createClient } from "@/lib/supabase/server";
import { generatePillars } from "@/lib/ai/generators";
import { suggestPostingTimes } from "@/lib/scheduling/suggested-times";
import { OnboardingSchema, type OnboardingInput } from "@/lib/onboarding/schema";
import type { Business, ContentPillar } from "@/types/domain";

export type OnboardingResult =
  | { ok: true; businessId: string; pillars: ContentPillar[]; rationale: string }
  | { ok: false; error: string };

export async function completeOnboarding(raw: OnboardingInput): Promise<OnboardingResult> {
  const parsed = OnboardingSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Please check your answers and try again." };
  const input = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const suggested_times = suggestPostingTimes({
    ageGroups: input.age_groups,
    category: input.category,
    weeklyHours: input.weekly_hours,
  });

  const { data: business, error } = await supabase
    .from("businesses")
    .insert({
      owner_id: user.id,
      name: input.name,
      category: input.category,
      sub_niche: input.sub_niche,
      city: input.city,
      area: input.area,
      audience: { age_groups: input.age_groups, interests: input.interests },
      tone: {
        voice: input.voice,
        languages: input.hinglish ? ["en", "hi"] : ["en"],
        hinglish: input.hinglish,
        emoji: input.voice === "premium" ? "none" : "some",
      },
      weekly_hours: input.weekly_hours,
      monthly_budget_inr: input.monthly_budget_inr,
      suggested_times,
    })
    .select()
    .single();

  if (error || !business) return { ok: false, error: error?.message ?? "Could not save your business." };

  try {
    const { pillars, rationale } = await generatePillars(supabase, business as Business);

    await supabase
      .from("businesses")
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq("id", business.id);

    await supabase.rpc("award_xp", { p_amount: 50, p_reason: "onboarding_completed", p_ref_id: business.id });

    return { ok: true, businessId: business.id, pillars, rationale };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Pillar generation failed." };
  }
}
