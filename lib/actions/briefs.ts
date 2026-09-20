"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateBrief, regenerateCaption } from "@/lib/ai/generators";
import { getCurrentBusiness } from "@/lib/data/business";
import type { CaptionLanguage, PostFormat } from "@/lib/ai/schemas";
import type { ContentPillar, PostBriefRow } from "@/types/domain";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export async function createBrief(input: {
  pillarId: string;
  format?: PostFormat;
  language?: CaptionLanguage;
  hint?: string;
}): Promise<Result<{ brief: PostBriefRow; best_time_hint?: string }>> {
  const supabase = await createClient();
  const business = await getCurrentBusiness(supabase);
  if (!business) return { ok: false, error: "No business found." };

  const { data: pillar } = await supabase
    .from("content_pillars")
    .select("*")
    .eq("id", input.pillarId)
    .eq("business_id", business.id)
    .single();
  if (!pillar) return { ok: false, error: "Pillar not found." };

  try {
    const result = await generateBrief(supabase, {
      business,
      pillar: pillar as ContentPillar,
      format: input.format,
      language: input.language,
      hint: input.hint?.trim() || undefined,
    });
    await supabase.rpc("award_xp", { p_amount: 10, p_reason: "brief_created", p_ref_id: result.brief.id });
    revalidatePath("/dashboard");
    revalidatePath("/ideas");
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Generation failed." };
  }
}

export async function switchCaptionLanguage(
  briefId: string,
  language: CaptionLanguage,
): Promise<Result<PostBriefRow>> {
  const supabase = await createClient();
  const business = await getCurrentBusiness(supabase);
  if (!business) return { ok: false, error: "No business found." };

  const { data: brief } = await supabase.from("post_briefs").select("*").eq("id", briefId).single();
  if (!brief) return { ok: false, error: "Brief not found." };
  if (brief.caption_language === language) return { ok: true, data: brief as PostBriefRow };

  try {
    const updated = await regenerateCaption(supabase, { business, brief: brief as PostBriefRow, language });
    revalidatePath("/ideas");
    return { ok: true, data: updated };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Rewrite failed." };
  }
}

export async function scheduleBrief(briefId: string, scheduledFor: string | null): Promise<Result<PostBriefRow>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_briefs")
    .update({
      scheduled_for: scheduledFor,
      status: scheduledFor ? "scheduled" : "idea",
    })
    .eq("id", briefId)
    .select()
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/ideas");
  revalidatePath("/calendar");
  return { ok: true, data: data as PostBriefRow };
}

export async function deleteBrief(briefId: string): Promise<Result<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("post_briefs").update({ status: "skipped" }).eq("id", briefId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/ideas");
  return { ok: true, data: null };
}
