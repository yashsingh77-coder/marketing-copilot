import { NextResponse } from "next/server";
import { generateStructured, PROMPT_VERSION } from "@/lib/ai/client";
import { PostBriefSchema, BusinessContextSchema } from "@/lib/ai/schemas";
import { systemPrompt } from "@/lib/ai/prompts/system";
import { briefPrompt } from "@/lib/ai/prompts/brief";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

/**
 * POST /api/ai/brief  { businessId, pillarId, format?, language?, hint? }
 * Generates one post brief and saves it with status 'idea'.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { businessId, pillarId, format, language, hint } = await request.json();

  const [{ data: business }, { data: pillar }, { data: insights }, { data: recent }] =
    await Promise.all([
      supabase.from("businesses").select("*").eq("id", businessId).single(),
      supabase.from("content_pillars").select("*").eq("id", pillarId).single(),
      supabase.from("insights").select("directive").eq("business_id", businessId).eq("is_active", true),
      supabase
        .from("post_briefs")
        .select("title")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  if (!business || !pillar) return NextResponse.json({ error: "not found" }, { status: 404 });

  const ctx = BusinessContextSchema.parse({
    ...business,
    active_insights: (insights ?? []).map((i) => i.directive),
  });

  const object = await generateStructured({
    schema: PostBriefSchema,
    instructions: systemPrompt(ctx),
    prompt: briefPrompt({
      pillar,
      format,
      language,
      hint,
      recentTitles: (recent ?? []).map((r) => r.title),
    }),
  });

  const { best_time_hint, ...briefFields } = object;

  const { data: brief, error } = await supabase
    .from("post_briefs")
    .insert({
      business_id: businessId,
      pillar_id: pillarId,
      ...briefFields,
      source: "generator",
      generation_meta: { version: PROMPT_VERSION, best_time_hint, insights_used: ctx.active_insights.length },
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ brief, best_time_hint });
}
