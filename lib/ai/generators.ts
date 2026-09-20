import type { SupabaseClient } from "@supabase/supabase-js";
import { generateStructured, PROMPT_VERSION } from "@/lib/ai/client";
import {
  BusinessContextSchema,
  CaptionSchema,
  PillarSetSchema,
  PostBriefSchema,
  type BusinessContext,
  type CaptionLanguage,
  type PostFormat,
} from "@/lib/ai/schemas";
import { systemPrompt } from "@/lib/ai/prompts/system";
import { pillarsPrompt } from "@/lib/ai/prompts/pillars";
import { briefPrompt } from "@/lib/ai/prompts/brief";
import { captionPrompt } from "@/lib/ai/prompts/caption";
import type { Business, ContentPillar, PostBriefRow } from "@/types/domain";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = SupabaseClient<any>;

export async function buildContext(supabase: Db, business: Business): Promise<BusinessContext> {
  const { data: insights } = await supabase
    .from("insights")
    .select("directive")
    .eq("business_id", business.id)
    .eq("is_active", true);

  return BusinessContextSchema.parse({
    ...business,
    active_insights: (insights ?? []).map((i: { directive: unknown }) => i.directive),
  });
}

/** Generates 4-6 pillars and replaces the business's active set. */
export async function generatePillars(supabase: Db, business: Business) {
  const ctx = await buildContext(supabase, business);

  const result = await generateStructured({
    schema: PillarSetSchema,
    instructions: systemPrompt(ctx),
    prompt: pillarsPrompt,
  });

  await supabase.from("content_pillars").update({ is_active: false }).eq("business_id", business.id);

  const { data, error } = await supabase
    .from("content_pillars")
    .insert(result.pillars.map((p, i) => ({ business_id: business.id, ...p, sort_order: i })))
    .select();

  if (error) throw new Error(error.message);

  return { pillars: data as ContentPillar[], rationale: result.rationale };
}

export async function generateBrief(
  supabase: Db,
  input: {
    business: Business;
    pillar: ContentPillar;
    format?: PostFormat;
    language?: CaptionLanguage;
    hint?: string;
    source?: PostBriefRow["source"];
  },
) {
  const [ctx, { data: recent }] = await Promise.all([
    buildContext(supabase, input.business),
    supabase
      .from("post_briefs")
      .select("title")
      .eq("business_id", input.business.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const result = await generateStructured({
    schema: PostBriefSchema,
    instructions: systemPrompt(ctx),
    prompt: briefPrompt({
      pillar: input.pillar,
      format: input.format,
      language: input.language,
      hint: input.hint,
      recentTitles: (recent ?? []).map((r: { title: string }) => r.title),
    }),
  });

  const { best_time_hint, ...fields } = result;

  const { data, error } = await supabase
    .from("post_briefs")
    .insert({
      business_id: input.business.id,
      pillar_id: input.pillar.id,
      ...fields,
      source: input.source ?? "generator",
      generation_meta: {
        version: PROMPT_VERSION,
        best_time_hint,
        insights_used: ctx.active_insights.length,
      },
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return { brief: data as PostBriefRow, best_time_hint };
}

/** Rewrites only the caption + CTA in another language. */
export async function regenerateCaption(
  supabase: Db,
  input: { business: Business; brief: PostBriefRow; language: CaptionLanguage },
) {
  const ctx = await buildContext(supabase, input.business);

  const result = await generateStructured({
    schema: CaptionSchema,
    instructions: systemPrompt(ctx),
    prompt: captionPrompt({
      title: input.brief.title,
      visualConcept: input.brief.visual_concept,
      currentCaption: input.brief.caption,
      language: input.language,
    }),
  });

  const { data, error } = await supabase
    .from("post_briefs")
    .update({ caption: result.caption, cta: result.cta, caption_language: input.language })
    .eq("id", input.brief.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PostBriefRow;
}
