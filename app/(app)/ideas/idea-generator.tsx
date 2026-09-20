"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { CupFill } from "@/components/loaders/cup-fill";
import { BriefCard } from "@/components/briefs/brief-card";
import { Gyan, GyanSays } from "@/components/mascot/gyan";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { fireConfetti } from "@/components/motion/confetti";
import { createBrief } from "@/lib/actions/briefs";
import type { CaptionLanguage, PostFormat } from "@/lib/ai/schemas";
import type { ContentPillar, PostBriefRow } from "@/types/domain";

const FORMATS: { id: PostFormat | "auto"; label: string; emoji: string }[] = [
  { id: "auto", label: "Surprise me", emoji: "🎲" },
  { id: "static", label: "Static", emoji: "🖼️" },
  { id: "carousel", label: "Carousel", emoji: "📚" },
  { id: "reel", label: "Reel", emoji: "🎬" },
  { id: "story", label: "Story", emoji: "⏱️" },
];

const LANGS: { id: CaptionLanguage | "auto"; label: string }[] = [
  { id: "auto", label: "My voice" },
  { id: "en", label: "English" },
  { id: "hinglish", label: "Hinglish" },
  { id: "hi", label: "हिंदी" },
];

export function IdeaGenerator({
  pillars,
  recent,
  initialPillarId,
  focusBriefId,
}: {
  pillars: ContentPillar[];
  recent: PostBriefRow[];
  initialPillarId?: string;
  focusBriefId?: string;
}) {
  const [pillarId, setPillarId] = useState(initialPillarId ?? pillars[0]?.id ?? "");
  const [format, setFormat] = useState<PostFormat | "auto">("auto");
  const [lang, setLang] = useState<CaptionLanguage | "auto">("auto");
  const [hint, setHint] = useState("");
  const [pending, start] = useTransition();
  const [fresh, setFresh] = useState<{ brief: PostBriefRow; best_time_hint?: string } | null>(null);
  const [list, setList] = useState(recent);
  const [error, setError] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);

  const pillarById = new Map(pillars.map((p) => [p.id, p]));

  useEffect(() => {
    if (focusBriefId && focusRef.current) {
      focusRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [focusBriefId]);

  function generate() {
    if (!pillarId) return;
    setError(null);
    start(async () => {
      const res = await createBrief({
        pillarId,
        format: format === "auto" ? undefined : format,
        language: lang === "auto" ? undefined : lang,
        hint,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setFresh(res.data);
      setList((l) => [res.data.brief, ...l.filter((b) => b.id !== res.data.brief.id)]);
      setHint("");
      fireConfetti(btnRef.current ?? undefined);
    });
  }

  const removed = (id: string) => {
    setList((l) => l.filter((b) => b.id !== id));
    if (fresh?.brief.id === id) setFresh(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="font-bold">Pillar</p>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {pillars.map((p) => (
              <Chip key={p.id} selected={pillarId === p.id} onClick={() => setPillarId(p.id)}>
                {p.emoji} {p.name}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bold">Format</p>
          <div className="flex flex-wrap gap-2">
            {FORMATS.map((f) => (
              <Chip key={f.id} size="sm" color="sky" selected={format === f.id} onClick={() => setFormat(f.id)}>
                {f.emoji} {f.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bold">Caption language</p>
          <div className="flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <Chip key={l.id} size="sm" color="lemon" selected={lang === l.id} onClick={() => setLang(l.id)}>
                {l.label}
              </Chip>
            ))}
          </div>
        </div>

        <Input
          label="Anything specific? (optional)"
          placeholder="e.g. new mango cheesecake launching Friday"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !pending && generate()}
        />

        <Button ref={btnRef} size="lg" fullWidth onClick={generate} loading={pending} disabled={!pillarId}>
          <Sparkles className="size-5" /> Generate post brief
        </Button>
        {error && <p className="text-sm font-bold text-secondary">{error}</p>}
      </section>

      {/* Result */}
      <AnimatePresence mode="wait">
        {pending ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6">
            <CupFill />
          </motion.div>
        ) : fresh ? (
          <motion.div
            key={fresh.brief.id}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-start gap-3">
              <Gyan expression="celebrating" size={64} className="shrink-0" />
              <GyanSays className="mt-1 text-sm">Fresh out of the oven. Tap any hashtag to copy it.</GyanSays>
            </div>
            <BriefCard
              brief={fresh.brief}
              bestTimeHint={fresh.best_time_hint}
              pillarName={pillarById.get(fresh.brief.pillar_id ?? "")?.name}
              onRemoved={removed}
            />
            <Button variant="secondary" onClick={generate} className="self-center">
              <Shuffle className="size-4" /> Another one
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Recent */}
      {list.filter((b) => b.id !== fresh?.brief.id).length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl">Your ideas</h2>
          <Stagger className="flex flex-col gap-4">
            {list
              .filter((b) => b.id !== fresh?.brief.id)
              .map((b) => (
                <StaggerItem key={b.id}>
                  <div ref={b.id === focusBriefId ? focusRef : undefined} className="scroll-mt-20">
                    <BriefCard brief={b} pillarName={pillarById.get(b.pillar_id ?? "")?.name} onRemoved={removed} />
                  </div>
                </StaggerItem>
              ))}
          </Stagger>
        </section>
      )}

      {list.length === 0 && !fresh && !pending && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <Gyan expression="pointing" size={100} />
          <p className="text-ink-soft">Pick a pillar and hit generate. Your first brief takes about 15 seconds.</p>
        </div>
      )}
    </div>
  );
}
