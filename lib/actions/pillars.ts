"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generatePillars } from "@/lib/ai/generators";
import { getCurrentBusiness } from "@/lib/data/business";
import type { ContentPillar } from "@/types/domain";

export async function regeneratePillars(): Promise<
  { ok: true; pillars: ContentPillar[]; rationale: string } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const business = await getCurrentBusiness(supabase);
  if (!business) return { ok: false, error: "No business found." };

  try {
    const result = await generatePillars(supabase, business);
    revalidatePath("/pillars");
    revalidatePath("/ideas");
    revalidatePath("/dashboard");
    return { ok: true, ...result };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Generation failed." };
  }
}
