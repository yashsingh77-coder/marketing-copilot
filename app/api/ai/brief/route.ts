import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBrief } from "@/lib/ai/generators";

export const maxDuration = 60;

/** POST /api/ai/brief  { businessId, pillarId, format?, language?, hint? } */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { businessId, pillarId, format, language, hint } = await request.json();

  const [{ data: business }, { data: pillar }] = await Promise.all([
    supabase.from("businesses").select("*").eq("id", businessId).single(),
    supabase.from("content_pillars").select("*").eq("id", pillarId).single(),
  ]);
  if (!business || !pillar) return NextResponse.json({ error: "not found" }, { status: 404 });

  try {
    const result = await generateBrief(supabase, { business, pillar, format, language, hint });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "failed" }, { status: 500 });
  }
}
