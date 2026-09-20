"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip, Sticker } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ProgressDots } from "@/components/ui/progress";
import { Gyan, GyanSays, type GyanExpression } from "@/components/mascot/gyan";
import { CupFill } from "@/components/loaders/cup-fill";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { fireCelebration } from "@/components/motion/confetti";
import { AGE_GROUPS, CATEGORIES, INDIAN_CITIES, VOICES, getCategory } from "@/lib/onboarding/categories";
import { postsPerWeekLabel } from "@/lib/scheduling/suggested-times";
import { completeOnboarding } from "@/lib/actions/onboarding";
import type { OnboardingInput } from "@/lib/onboarding/schema";
import type { ContentPillar } from "@/types/domain";
import { PillarCard } from "@/components/pillars/pillar-card";

const STEPS = 5;

type Draft = {
  name: string;
  category: string;
  sub_niche: string | null;
  age_groups: string[];
  interests: string[];
  customInterest: string;
  city: string;
  area: string;
  weekly_hours: number;
  monthly_budget_inr: number;
  voice: OnboardingInput["voice"];
  hinglish: boolean;
};

const initial: Draft = {
  name: "",
  category: "",
  sub_niche: null,
  age_groups: [],
  interests: [],
  customInterest: "",
  city: "",
  area: "",
  weekly_hours: 3,
  monthly_budget_inr: 2000,
  voice: "warm",
  hinglish: true,
};

const slide = {
  enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
};

export function OnboardingWizard({ displayName }: { displayName: string | null }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [d, setD] = useState<Draft>(initial);
  const [phase, setPhase] = useState<"form" | "generating" | "reveal" | "error">("form");
  const [result, setResult] = useState<{ pillars: ContentPillar[]; rationale: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  const category = useMemo(() => (d.category ? getCategory(d.category) : null), [d.category]);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const toggle = (k: "age_groups" | "interests", v: string) =>
    setD((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));

  const canNext = [
    d.name.trim().length >= 2,
    !!d.category && (category?.subNiches.length === 0 || !!d.sub_niche),
    d.age_groups.length > 0 && d.interests.length > 0,
    d.city.trim().length >= 2,
    true,
  ][step];

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  async function submit() {
    if (submitting.current) return;
    submitting.current = true;
    setPhase("generating");
    const res = await completeOnboarding({
      name: d.name,
      category: d.category,
      sub_niche: d.sub_niche,
      age_groups: d.age_groups,
      interests: d.interests,
      city: d.city,
      area: d.area.trim() || null,
      weekly_hours: d.weekly_hours,
      monthly_budget_inr: d.monthly_budget_inr,
      voice: d.voice,
      hinglish: d.hinglish,
    });
    submitting.current = false;
    if (!res.ok) {
      setError(res.error);
      setPhase("error");
      return;
    }
    setResult({ pillars: res.pillars, rationale: res.rationale });
    setPhase("reveal");
    setTimeout(fireCelebration, 400);
  }

  if (phase === "generating") {
    return (
      <Screen>
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <Gyan expression="thinking" size={140} />
          <CupFill
            messages={[
              `Reading up on ${d.sub_niche ?? category?.label ?? "your business"}…`,
              `Thinking about ${d.city} locals…`,
              "Picking your content pillars…",
              "Adding a pinch of hashtags…",
              "Almost ready to pour…",
            ]}
          />
        </div>
      </Screen>
    );
  }

  if (phase === "error") {
    return (
      <Screen>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Gyan expression="sleepy" size={120} />
          <h2 className="text-2xl">Hmm, that didn&apos;t brew right</h2>
          <p className="text-ink-soft">{error}</p>
          <Button onClick={() => setPhase("form")}>Try again</Button>
        </div>
      </Screen>
    );
  }

  if (phase === "reveal" && result) {
    return (
      <Screen>
        <div className="flex flex-col gap-5 pb-28">
          <div className="flex items-start gap-3">
            <Gyan expression="celebrating" size={96} className="shrink-0" />
            <GyanSays className="mt-3">{result.rationale}</GyanSays>
          </div>
          <h1 className="text-3xl">
            Your {result.pillars.length} content pillars <Sticker color="lemon" rotate={4}>+50 XP</Sticker>
          </h1>
          <Stagger className="flex flex-col gap-4">
            {result.pillars.map((p) => (
              <StaggerItem key={p.id}>
                <PillarCard pillar={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md bg-cream/90 p-4 backdrop-blur">
          <Button size="lg" fullWidth onClick={() => router.push("/dashboard")}>
            Take me to my dashboard <ArrowRight className="size-5" />
          </Button>
        </div>
      </Screen>
    );
  }

  const gyanFor: GyanExpression[] = ["pointing", "happy", "thinking", "happy", "pointing"];
  const firstName = displayName?.split(" ")[0];

  return (
    <Screen>
      <div className="flex items-center justify-between">
        <ProgressDots total={STEPS} current={step} />
        {step > 0 && (
          <Button variant="ghost" size="sm" onClick={() => go(step - 1)}>
            <ArrowLeft className="size-4" /> Back
          </Button>
        )}
      </div>

      <div className="mt-6 flex items-start gap-3">
        <Gyan expression={gyanFor[step]} size={88} className="shrink-0" />
        <GyanSays className="mt-3">
          {
            [
              firstName ? `Nice to meet you, ${firstName}! What's your business called?` : "What's your business called?",
              "What kind of business is it? Pick the closest match.",
              "Who are you trying to reach? Pick all that fit.",
              "Where are you? Local tags bring local customers.",
              "Last one — how much time can you give this, and how do you like to sound?",
            ][step]
          }
        </GyanSays>
      </div>

      <div className="relative mt-6 flex-1">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-col gap-5"
          >
            {step === 0 && (
              <Input
                label="Business name"
                placeholder="e.g. Café Bandra"
                value={d.name}
                onChange={(e) => set("name", e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && canNext && go(1)}
              />
            )}

            {step === 1 && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIES.map((c) => (
                    <motion.button
                      key={c.id}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        set("category", c.id);
                        set("sub_niche", null);
                        set("interests", []);
                      }}
                      className={`outline-brutal shadow-brutal-sm flex aspect-square flex-col items-center justify-center gap-1 rounded-card p-2 text-center text-xs font-bold ${
                        d.category === c.id ? "bg-ink text-cream" : "bg-paper"
                      }`}
                    >
                      <span className="text-2xl">{c.emoji}</span>
                      {c.label}
                    </motion.button>
                  ))}
                </div>
                <AnimatePresence>
                  {category && category.subNiches.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-2"
                    >
                      <p className="font-bold">More specifically…</p>
                      <div className="flex flex-wrap gap-2">
                        {category.subNiches.map((s) => (
                          <Chip key={s} selected={d.sub_niche === s} onClick={() => set("sub_niche", s)}>
                            {s}
                          </Chip>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {category?.id === "other" && (
                  <Input
                    label="Describe it in a few words"
                    placeholder="e.g. Bicycle repair & rentals"
                    value={d.sub_niche ?? ""}
                    onChange={(e) => set("sub_niche", e.target.value || null)}
                  />
                )}
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex flex-col gap-2">
                  <p className="font-bold">Age group</p>
                  <div className="flex flex-wrap gap-2">
                    {AGE_GROUPS.map((a) => (
                      <Chip key={a} selected={d.age_groups.includes(a)} onClick={() => toggle("age_groups", a)}>
                        {a}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-bold">What are they into?</p>
                  <div className="flex flex-wrap gap-2">
                    {(category?.interests ?? []).map((i) => (
                      <Chip key={i} color="sky" selected={d.interests.includes(i)} onClick={() => toggle("interests", i)}>
                        {i}
                      </Chip>
                    ))}
                    {d.interests
                      .filter((i) => !category?.interests.includes(i))
                      .map((i) => (
                        <Chip key={i} color="lemon" selected onClick={() => toggle("interests", i)}>
                          {i} ×
                        </Chip>
                      ))}
                  </div>
                  <form
                    className="mt-1 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const v = d.customInterest.trim();
                      if (v && !d.interests.includes(v) && d.interests.length < 8) {
                        set("interests", [...d.interests, v]);
                        set("customInterest", "");
                      }
                    }}
                  >
                    <Input
                      placeholder="Add your own…"
                      value={d.customInterest}
                      onChange={(e) => set("customInterest", e.target.value)}
                      className="h-10"
                    />
                    <Button type="submit" variant="secondary" size="sm" className="h-10 shrink-0 self-start">
                      Add
                    </Button>
                  </form>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <Input
                  label="City"
                  placeholder="e.g. Mumbai"
                  list="cities"
                  value={d.city}
                  onChange={(e) => set("city", e.target.value)}
                  autoFocus
                />
                <datalist id="cities">
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <Input
                  label="Area / neighbourhood"
                  placeholder="e.g. Bandra West"
                  hint="Optional, but hyper-local hashtags work wonders."
                  value={d.area}
                  onChange={(e) => set("area", e.target.value)}
                />
                <Card color="sky" shadow="sm" className="flex items-center gap-3">
                  <MapPin className="size-6 shrink-0" />
                  <p className="text-sm font-semibold">
                    We&apos;ll use this to find local tags, festivals, and later — your competitors nearby.
                  </p>
                </Card>
              </>
            )}

            {step === 4 && (
              <>
                <Slider
                  label="Time per week"
                  min={1}
                  max={10}
                  value={d.weekly_hours}
                  onChange={(v) => set("weekly_hours", v)}
                  format={(v) => `${v}${v === 10 ? "+" : ""} hr`}
                  caption={postsPerWeekLabel(d.weekly_hours)}
                />
                <Slider
                  label="Budget per month"
                  min={0}
                  max={20000}
                  step={500}
                  value={d.monthly_budget_inr}
                  onChange={(v) => set("monthly_budget_inr", v)}
                  format={(v) => (v === 0 ? "₹0" : `₹${v.toLocaleString("en-IN")}${v === 20000 ? "+" : ""}`)}
                  caption={d.monthly_budget_inr === 0 ? "Totally fine — organic content works." : "For boosts, props, or a photographer day."}
                />
                <div className="flex flex-col gap-2">
                  <p className="font-bold">How do you talk to customers?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {VOICES.map((v) => (
                      <Chip key={v.id} selected={d.voice === v.id} onClick={() => set("voice", v.id)} className="justify-start">
                        {v.emoji} {v.label}
                      </Chip>
                    ))}
                  </div>
                </div>
                <Card
                  color={d.hinglish ? "lemon" : "paper"}
                  shadow="sm"
                  className="flex cursor-pointer items-center justify-between gap-3"
                  onClick={() => set("hinglish", !d.hinglish)}
                  role="switch"
                  aria-checked={d.hinglish}
                >
                  <div>
                    <p className="font-bold">Hinglish captions</p>
                    <p className="text-sm text-ink-soft">&ldquo;Aaj ka special: garam samosa ☕&rdquo;</p>
                  </div>
                  <span className={`outline-brutal relative h-8 w-14 rounded-full ${d.hinglish ? "bg-primary" : "bg-paper"}`}>
                    <motion.span
                      layout
                      className="outline-brutal absolute top-0.5 size-6 rounded-full bg-paper"
                      animate={{ left: d.hinglish ? 26 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </span>
                </Card>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="sticky bottom-0 -mx-6 mt-6 bg-cream/90 p-6 pt-3 backdrop-blur">
        {step < STEPS - 1 ? (
          <Button size="lg" fullWidth disabled={!canNext} onClick={() => go(step + 1)}>
            Next <ArrowRight className="size-5" />
          </Button>
        ) : (
          <Button size="lg" fullWidth variant="accent" onClick={submit}>
            <Sparkles className="size-5" /> Build my content pillars
          </Button>
        )}
      </div>
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto flex min-h-dvh max-w-md flex-col p-6">{children}</main>;
}
