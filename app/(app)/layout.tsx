import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/data/business";
import { TopBar } from "@/components/shell/top-bar";
import { BottomNav } from "@/components/shell/bottom-nav";

/** Authenticated app shell. Redirects to onboarding if the user has no completed business. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getCurrentBusiness(supabase);
  if (!business?.onboarding_completed_at) redirect("/onboarding");

  // Daily streak touch is idempotent; returns current xp/streak.
  const { data: streakRows } = await supabase.rpc("touch_streak");
  const stats = Array.isArray(streakRows) ? streakRows[0] : streakRows;
  const xp: number = stats?.xp ?? 0;
  const streak: number = stats?.streak_days ?? 0;

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-24 md:max-w-5xl">
      <TopBar businessName={business.name} xp={xp} streak={streak} />
      {children}
      <BottomNav />
    </div>
  );
}
