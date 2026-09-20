import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Authenticated app shell. Phase 1 adds TopBar (XP + streak) and BottomNav here.
 * Redirects to onboarding if the user has no business yet.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, onboarding_completed_at")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!business?.onboarding_completed_at) redirect("/onboarding");

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-24 md:max-w-5xl">
      {children}
      {/* <BottomNav /> — Phase 1 */}
    </div>
  );
}
