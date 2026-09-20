"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/data/business";

type Result = { ok: true } | { ok: false; error: string };

export async function attachCreativeToBrief(creativeId: string, briefId: string | null): Promise<Result> {
  const supabase = await createClient();
  const business = await getCurrentBusiness(supabase);
  if (!business) return { ok: false, error: "No business." };
  const { error } = await supabase
    .from("creatives")
    .update({ brief_id: briefId })
    .eq("id", creativeId)
    .eq("business_id", business.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/ideas");
  revalidatePath("/studio");
  return { ok: true };
}

export async function toggleFavoriteCreative(creativeId: string, value: boolean): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("creatives").update({ is_favorite: value }).eq("id", creativeId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/studio");
  return { ok: true };
}

export async function deleteCreative(creativeId: string): Promise<Result> {
  const supabase = await createClient();
  const { data } = await supabase.from("creatives").select("storage_path").eq("id", creativeId).maybeSingle();
  if (data?.storage_path) await supabase.storage.from("creatives").remove([data.storage_path]);
  const { error } = await supabase.from("creatives").delete().eq("id", creativeId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/studio");
  return { ok: true };
}
