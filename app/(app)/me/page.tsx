import { LogOut, MapPin, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/data/business";
import { signOut } from "@/lib/actions/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { Sticker } from "@/components/ui/chip";
import { Gyan } from "@/components/mascot/gyan";
import { levelFor } from "@/components/shell/top-bar";
import { getCategory } from "@/lib/onboarding/categories";

export default async function MePage() {
  const supabase = await createClient();
  const business = (await getCurrentBusiness(supabase))!;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: badgeRows }] = await Promise.all([
    supabase.from("profiles").select("xp, streak_days, display_name").eq("id", user!.id).single(),
    supabase.from("user_badges").select("earned_at, badges(name, emoji, description)").eq("user_id", user!.id),
  ]);

  type BadgeRow = { earned_at: string; badges: { name: string; emoji: string; description: string } | null };
  const badges = (badgeRows ?? []) as unknown as BadgeRow[];

  const xp: number = profile?.xp ?? 0;
  const { current, next, progress } = levelFor(xp);
  const category = getCategory(business.category);

  return (
    <main className="flex flex-col gap-5 p-4 pt-2">
      <h1 className="text-3xl">You</h1>

      <Card color="lemon" shadow="lg" className="flex items-center gap-4">
        <Gyan expression="happy" size={80} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl font-bold">{profile?.display_name ?? user?.email}</p>
          <p className="text-sm font-bold text-ink-soft">
            Level: {current.title} · {xp} XP
          </p>
          <ProgressBar value={progress} color="primary" height="sm" className="mt-2" />
          {next && (
            <p className="mt-1 text-xs font-semibold text-ink-soft">
              {next.minXp - xp} XP to {next.title}
            </p>
          )}
        </div>
      </Card>

      <Card className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">{business.name}</h2>
          <Sticker color="sky" rotate={3}>
            {category.emoji} {category.label}
          </Sticker>
        </div>
        {business.sub_niche && <p className="font-semibold">{business.sub_niche}</p>}
        <p className="flex items-center gap-1.5 text-sm text-ink-soft">
          <MapPin className="size-4" /> {business.area ? `${business.area}, ` : ""}
          {business.city}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-ink-soft">
          <Clock className="size-4" /> {business.weekly_hours} hr/week · ₹{business.monthly_budget_inr?.toLocaleString("en-IN")}/month
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {business.audience.age_groups.map((a) => (
            <Sticker key={a} color="paper" rotate={0}>
              {a}
            </Sticker>
          ))}
          {business.audience.interests.map((i) => (
            <Sticker key={i} color="mint" rotate={0}>
              {i}
            </Sticker>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-xl">Badges</h2>
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {badges.map((b) => (
              <div key={b.earned_at} className="outline-brutal shadow-brutal-sm flex flex-col items-center gap-1 rounded-card bg-cream p-3 text-center">
                <span className="text-3xl">{b.badges?.emoji}</span>
                <span className="text-xs font-bold">{b.badges?.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-soft">No badges yet. Complete a School lesson to earn your first.</p>
        )}
      </Card>

      <form action={signOut}>
        <Button type="submit" variant="secondary" fullWidth>
          <LogOut className="size-4" /> Sign out
        </Button>
      </form>
    </main>
  );
}
