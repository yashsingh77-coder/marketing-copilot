import Link from "next/link";
import { ArrowRight, CalendarDays, Lightbulb, Mic, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActivePillars, getCurrentBusiness } from "@/lib/data/business";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sticker } from "@/components/ui/chip";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Gyan, GyanSays } from "@/components/mascot/gyan";
import { FORMAT_LABEL } from "@/components/briefs/brief-card";
import type { Lesson, PostBriefRow } from "@/types/domain";

export default async function DashboardPage() {
  const supabase = await createClient();
  const business = (await getCurrentBusiness(supabase))!;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const [pillars, { data: nextScheduled }, { data: latestIdea }, { count: weekCount }, { data: lessons }, { data: progress }] =
    await Promise.all([
      getActivePillars(supabase, business.id),
      supabase
        .from("post_briefs")
        .select("*, content_pillars(name, color)")
        .eq("business_id", business.id)
        .eq("status", "scheduled")
        .gte("scheduled_for", new Date(now.getTime() - 6 * 3600_000).toISOString())
        .order("scheduled_for", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("post_briefs")
        .select("*, content_pillars(name, color)")
        .eq("business_id", business.id)
        .eq("status", "idea")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("post_briefs")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business.id)
        .in("status", ["scheduled", "posted"])
        .gte("scheduled_for", weekStart.toISOString())
        .lt("scheduled_for", weekEnd.toISOString()),
      supabase.from("lessons").select("id, slug, title, module, duration_min, xp_reward, sort_order").order("module").order("sort_order"),
      supabase.from("lesson_progress").select("lesson_id, status").eq("user_id", user!.id),
    ]);

  const hero = (nextScheduled ?? latestIdea) as (PostBriefRow & { content_pillars: { name: string; color: string } | null }) | null;
  const isScheduled = !!nextScheduled;
  const completed = new Set((progress ?? []).filter((p: { status: string }) => p.status === "completed").map((p: { lesson_id: string }) => p.lesson_id));
  const nextLesson = ((lessons ?? []) as Lesson[]).find((l) => !completed.has(l.id) && l.module !== "analytics_101");
  const targetPerWeek = Math.min(7, Math.max(2, Math.round(business.weekly_hours ?? 3)));
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0];
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <main className="flex flex-col gap-6 p-4 pt-2">
      <h1 className="text-3xl">
        {greeting}
        {firstName ? `, ${firstName}` : ""} 👋
      </h1>

      <Stagger className="flex flex-col gap-6">
        {/* Hero */}
        <StaggerItem>
          {hero ? (
            <Card color={colorFor(hero.content_pillars?.color)} shadow="lg" tilt className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide">
                    {isScheduled ? "Next up" : "Your latest idea"} · {hero.content_pillars?.name}
                  </p>
                  <h2 className="text-2xl leading-tight">{hero.title}</h2>
                </div>
                <Sticker rotate={5} color="paper">
                  {FORMAT_LABEL[hero.format]}
                </Sticker>
              </div>
              {hero.scheduled_for && (
                <p className="font-bold">
                  {new Date(hero.scheduled_for).toLocaleString("en-IN", {
                    weekday: "long",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              )}
              <p className="line-clamp-3 text-sm font-semibold">{hero.visual_concept}</p>
              <Button href={`/ideas?brief=${hero.id}`} variant="secondary" className="self-start">
                Open brief <ArrowRight className="size-4" />
              </Button>
            </Card>
          ) : (
            <Card color="paper" shadow="lg" className="flex flex-col items-center gap-3 text-center">
              <Gyan expression="sleepy" size={110} />
              <h2 className="text-2xl">Nothing planned yet</h2>
              <p className="text-ink-soft">Your pillars are ready. Let&apos;s turn one into your first post.</p>
              <Button href="/ideas" size="lg">
                <Lightbulb className="size-5" /> Generate my first idea
              </Button>
            </Card>
          )}
        </StaggerItem>

        {/* Quick actions */}
        <StaggerItem>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/voice" className="block">
              <Card color="blush" tilt className="flex h-full flex-col gap-1">
                <Mic className="size-6" strokeWidth={2.5} />
                <p className="font-display text-lg font-bold leading-tight">Voice to post</p>
                <p className="text-xs font-semibold text-ink-soft">Coming soon</p>
              </Card>
            </Link>
            <Link href="/calendar" className="block">
              <Card color="sky" tilt className="flex h-full flex-col gap-1">
                <CalendarDays className="size-6" strokeWidth={2.5} />
                <p className="font-display text-lg font-bold leading-tight">This week</p>
                <p className="text-xs font-semibold text-ink-soft">
                  {weekCount ?? 0}/{targetPerWeek} planned
                </p>
              </Card>
            </Link>
          </div>
        </StaggerItem>

        {/* Pillars strip */}
        <StaggerItem>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xl">Your pillars</h2>
            <Link href="/pillars" className="text-sm font-bold text-primary">
              See all
            </Link>
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {pillars.map((p) => (
              <Link key={p.id} href={`/ideas?pillar=${p.id}`} className="shrink-0">
                <Card color={colorFor(p.color)} shadow="sm" padding="sm" className="w-36">
                  <span className="text-2xl">{p.emoji}</span>
                  <p className="mt-1 font-display font-bold leading-tight">{p.name}</p>
                </Card>
              </Link>
            ))}
          </div>
        </StaggerItem>

        {/* School nudge */}
        {nextLesson && (
          <StaggerItem>
            <Link href={`/school/${nextLesson.slug}`} className="block">
              <Card color="lilac" tilt className="flex items-center gap-3">
                <Gyan expression="pointing" size={64} animate={false} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide">
                    <GraduationCap className="mr-1 inline size-3.5" />
                    School · {nextLesson.duration_min} min
                  </p>
                  <p className="font-display text-lg font-bold leading-tight">{nextLesson.title}</p>
                </div>
                <Sticker color="lemon" rotate={6}>
                  +{nextLesson.xp_reward} XP
                </Sticker>
              </Card>
            </Link>
          </StaggerItem>
        )}

        {/* Gyan tip */}
        <StaggerItem>
          <div className="flex items-start gap-3">
            <Gyan expression="happy" size={72} className="shrink-0" />
            <GyanSays className="mt-2 text-sm">
              Aim for {targetPerWeek} posts this week. Consistency beats perfection — every time.
            </GyanSays>
          </div>
        </StaggerItem>
      </Stagger>
    </main>
  );
}

function colorFor(c?: string | null) {
  return (["mint", "sky", "lemon", "lilac", "blush"].includes(c ?? "") ? c : "lemon") as
    | "mint"
    | "sky"
    | "lemon"
    | "lilac"
    | "blush";
}
