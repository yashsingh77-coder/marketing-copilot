"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { CalendarPlus, Check, Copy, Trash2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip, Sticker } from "@/components/ui/chip";
import { deleteBrief, scheduleBrief, switchCaptionLanguage } from "@/lib/actions/briefs";
import type { CaptionLanguage } from "@/lib/ai/schemas";
import type { PostBriefRow } from "@/types/domain";
import { cn } from "@/lib/utils";

export const FORMAT_LABEL: Record<PostBriefRow["format"], string> = {
  static: "Static",
  carousel: "Carousel",
  reel: "Reel",
  story: "Story",
};

const FORMAT_COLOR: Record<PostBriefRow["format"], "lemon" | "sky" | "blush" | "lilac"> = {
  static: "lemon",
  carousel: "sky",
  reel: "blush",
  story: "lilac",
};

const LANGS: { id: CaptionLanguage; label: string }[] = [
  { id: "en", label: "English" },
  { id: "hinglish", label: "Hinglish" },
  { id: "hi", label: "हिंदी" },
];

const STATUS_COLOR = { idea: "lemon", drafted: "lemon", scheduled: "sky", posted: "mint", skipped: "paper" } as const;

export function BriefCard({
  brief: initial,
  bestTimeHint,
  pillarName,
  onRemoved,
}: {
  brief: PostBriefRow;
  bestTimeHint?: string;
  pillarName?: string;
  onRemoved?: (id: string) => void;
}) {
  const [brief, setBrief] = useState(initial);
  const [pending, start] = useTransition();
  const [langPending, setLangPending] = useState<CaptionLanguage | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allTags = [...brief.hashtags.local, ...brief.hashtags.niche, ...brief.hashtags.broad];

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  function changeLang(lang: CaptionLanguage) {
    if (lang === brief.caption_language) return;
    setLangPending(lang);
    setError(null);
    start(async () => {
      const res = await switchCaptionLanguage(brief.id, lang);
      if (res.ok) setBrief(res.data);
      else setError(res.error);
      setLangPending(null);
    });
  }

  function schedule(value: string) {
    start(async () => {
      const res = await scheduleBrief(brief.id, value ? new Date(value).toISOString() : null);
      if (res.ok) {
        setBrief(res.data);
        setScheduling(false);
      } else setError(res.error);
    });
  }

  function remove() {
    start(async () => {
      const res = await deleteBrief(brief.id);
      if (res.ok) onRemoved?.(brief.id);
    });
  }

  return (
    <Card shadow="lg" padding="none" className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div>
          {pillarName && <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{pillarName}</p>}
          <h3 className="text-xl leading-tight">{brief.title}</h3>
          {brief.scheduled_for && (
            <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-ink-soft">
              <Clock className="size-3.5" />
              {new Date(brief.scheduled_for).toLocaleString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Sticker color={FORMAT_COLOR[brief.format]} rotate={4}>
            {FORMAT_LABEL[brief.format]}
          </Sticker>
          <Sticker color={STATUS_COLOR[brief.status]} rotate={-3}>
            {brief.status}
          </Sticker>
        </div>
      </div>

      {/* Visual concept */}
      <section className="mx-4 mb-3 rounded-card bg-sky p-3 outline-brutal">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide">📸 What to shoot</p>
        <p className="whitespace-pre-line text-sm font-semibold leading-snug">{brief.visual_concept}</p>
      </section>

      {/* Caption */}
      <section className="mx-4 mb-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wide">✍️ Caption</p>
          <div className="flex gap-1">
            {LANGS.map((l) => (
              <Chip
                key={l.id}
                size="sm"
                selected={brief.caption_language === l.id}
                onClick={() => changeLang(l.id)}
                disabled={pending}
                className={cn(langPending === l.id && "animate-pulse")}
              >
                {l.label}
              </Chip>
            ))}
          </div>
        </div>
        <motion.div
          key={brief.caption}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          className="outline-brutal relative rounded-card bg-cream p-3"
        >
          <p className="whitespace-pre-line text-sm leading-relaxed">{brief.caption}</p>
          {brief.cta && !brief.caption.includes(brief.cta) && (
            <p className="mt-2 text-sm font-bold">{brief.cta}</p>
          )}
          <button
            type="button"
            onClick={() => copy(`${brief.caption}\n\n${allTags.join(" ")}`, "caption")}
            className="outline-brutal shadow-brutal-sm absolute -right-1 -top-1 flex size-8 items-center justify-center rounded-full bg-paper"
            aria-label="Copy caption with hashtags"
          >
            {copied === "caption" ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </motion.div>
      </section>

      {/* Hashtags */}
      <section className="mx-4 mb-4 flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wide"># Hashtags</p>
        {(
          [
            ["local", "📍 Local", "mint"],
            ["niche", "🎯 Niche", "lemon"],
            ["broad", "🌍 Reach", "lilac"],
          ] as const
        ).map(([key, label, color]) => (
          <div key={key} className="flex items-start gap-2">
            <span className="w-16 shrink-0 pt-1.5 text-xs font-bold">{label}</span>
            <div className="flex flex-wrap gap-1.5">
              {brief.hashtags[key].map((tag) => (
                <Chip key={tag} size="sm" color={color} onClick={() => copy(tag, tag)}>
                  {copied === tag ? "Copied!" : tag}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </section>

      {bestTimeHint && (
        <p className="mx-4 mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
          <Clock className="size-4" /> {bestTimeHint}
        </p>
      )}

      {error && <p className="mx-4 mb-3 text-sm font-bold text-secondary">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-2 border-t-[2.5px] border-ink bg-cream p-3">
        {scheduling ? (
          <form
            className="flex flex-1 items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const v = (new FormData(e.currentTarget).get("when") as string) ?? "";
              schedule(v);
            }}
          >
            <input
              name="when"
              type="datetime-local"
              required
              defaultValue={brief.scheduled_for ? toLocalInput(new Date(brief.scheduled_for)) : nextEveningLocal()}
              className="outline-brutal h-10 flex-1 rounded-button bg-paper px-2 text-sm font-semibold"
            />
            <Button type="submit" size="sm" loading={pending}>
              Save
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setScheduling(false)}>
              Cancel
            </Button>
          </form>
        ) : (
          <>
            <Button size="sm" variant={brief.scheduled_for ? "secondary" : "primary"} onClick={() => setScheduling(true)}>
              <CalendarPlus className="size-4" />
              {brief.scheduled_for ? "Reschedule" : "Add to calendar"}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => copy(`${brief.title}\n\nSHOOT:\n${brief.visual_concept}\n\nCAPTION:\n${brief.caption}\n\n${allTags.join(" ")}`, "all")}>
              {copied === "all" ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copy all
            </Button>
            <Button size="icon" variant="ghost" className="ml-auto" onClick={remove} aria-label="Remove idea" loading={pending && !langPending}>
              <Trash2 className="size-5" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nextEveningLocal() {
  const d = new Date();
  if (d.getHours() >= 19) d.setDate(d.getDate() + 1);
  d.setHours(19, 30, 0, 0);
  return toLocalInput(d);
}
