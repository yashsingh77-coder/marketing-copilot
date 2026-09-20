import type { SupabaseClient } from "@supabase/supabase-js";
import type { Business, ContentPillar, PostBriefRow } from "@/types/domain";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = SupabaseClient<any>;

/** The signed-in user's business (single-business per owner in v1). */
export async function getCurrentBusiness(supabase: Db): Promise<Business | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    // A completed business always wins over an abandoned onboarding attempt.
    .order("onboarding_completed_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (data as Business) ?? null;
}

export async function getActivePillars(supabase: Db, businessId: string): Promise<ContentPillar[]> {
  const { data } = await supabase
    .from("content_pillars")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("sort_order");
  return (data as ContentPillar[]) ?? [];
}

export async function getRecentBriefs(supabase: Db, businessId: string, limit = 12): Promise<PostBriefRow[]> {
  const { data } = await supabase
    .from("post_briefs")
    .select("*")
    .eq("business_id", businessId)
    .neq("status", "skipped")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as PostBriefRow[]) ?? [];
}
