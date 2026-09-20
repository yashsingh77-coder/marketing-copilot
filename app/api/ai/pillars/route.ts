import { NextResponse } from "next/server";
import { generateStructured, PROMPT_VERSION } from "@/lib/ai/client";
import { PillarSetSchema, BusinessContextSchema } from "@/lib/ai/schemas";
import { systemPrompt } from "@/lib/ai/prompts/system";
import { pillarsPrompt } from "@/lib/ai/prompts/pillars";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

/**
 * POST /api/ai/pillars  { businessId }
 * Generates 4-6 content pillars and replaces the business's active set.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { businessId } = await request.json();

  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();
  if (error || !business) return NextResponse.json({ error: "not found" }, { status: 404 });

  const ctx = BusinessContextSchema.parse({ ...business, active_insights: [] });

  const object = await generateStructured({
    schema: PillarSetSchema,
    instructions: systemPrompt(ctx),
    prompt: pillarsPrompt,
  });

  await supabase
    .from("content_pillars")
    .update({ is_active: false })
    .eq("business_id", businessId);

  const { data: pillars, error: insertError } = await supabase
    .from("content_pillars")
    .insert(
      object.pillars.map((p, i) => ({
        business_id: businessId,
        ...p,
        sort_order: i,
      })),
    )
    .select();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ pillars, rationale: object.rationale, version: PROMPT_VERSION });
}
