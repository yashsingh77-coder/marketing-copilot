import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePillars } from "@/lib/ai/generators";

export const maxDuration = 60;

/** POST /api/ai/pillars  { businessId } — regenerates the business's active pillar set. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { businessId } = await request.json();
  const { data: business } = await supabase.from("businesses").select("*").eq("id", businessId).single();
  if (!business) return NextResponse.json({ error: "not found" }, { status: 404 });

  try {
    const result = await generatePillars(supabase, business);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "failed" }, { status: 500 });
  }
}
