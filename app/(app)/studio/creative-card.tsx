"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Heart, Link2, Wand2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sticker } from "@/components/ui/chip";
import { attachCreativeToBrief, toggleFavoriteCreative } from "@/lib/actions/creatives";
import { cn } from "@/lib/utils";

const ASPECT_CLASS: Record<string, string> = {
  "1:1": "aspect-square",
  "4:5": "aspect-[4/5]",
  "9:16": "aspect-[9/16]",
  "16:9": "aspect-video",
};

export type CreativeCardData = {
  id: string;
  url: string;
  aspect: string;
  brief_id: string | null;
  is_favorite?: boolean;
};

export function CreativeCard({
  creative,
  briefId,
  briefTitle,
  onRefine,
  compact = false,
}: {
  creative: CreativeCardData;
  briefId?: string | null;
  briefTitle?: string;
  onRefine?: (creative: CreativeCardData) => void;
  compact?: boolean;
}) {
  const [fav, setFav] = useState(!!creative.is_favorite);
  const [attached, setAttached] = useState(creative.brief_id);
  const [busy, setBusy] = useState(false);

  async function download() {
    const res = await fetch(creative.url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `creative-${creative.id.slice(0, 8)}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function attach() {
    if (!briefId) return;
    setBusy(true);
    const res = await attachCreativeToBrief(creative.id, briefId);
    if (res.ok) setAttached(briefId);
    setBusy(false);
  }

  async function toggleFav() {
    setFav((v) => !v);
    await toggleFavoriteCreative(creative.id, !fav);
  }

  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={cn("outline-brutal shadow-brutal overflow-hidden rounded-card bg-paper", compact ? "w-40" : "w-full max-w-sm")}
    >
      <div className={cn("relative bg-cream", ASPECT_CLASS[creative.aspect] ?? "aspect-square")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={creative.url} alt="Generated creative" className="size-full object-cover" loading="lazy" />
        <Sticker color="paper" rotate={-4} className="absolute left-2 top-2">
          {creative.aspect}
        </Sticker>
        <button
          type="button"
          onClick={toggleFav}
          aria-pressed={fav}
          aria-label="Favourite"
          className="outline-brutal shadow-brutal-sm absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-paper"
        >
          <Heart className={cn("size-4", fav && "fill-secondary text-secondary")} />
        </button>
      </div>

      {!compact && (
        <figcaption className="flex flex-wrap items-center gap-2 border-t-[2.5px] border-ink p-2.5">
          <Button size="sm" variant="secondary" onClick={download}>
            <Download className="size-4" /> Download
          </Button>
          {onRefine && (
            <Button size="sm" variant="lemon" onClick={() => onRefine(creative)}>
              <Wand2 className="size-4" /> Tweak
            </Button>
          )}
          {briefId && (
            <Button size="sm" variant={attached === briefId ? "mint" : "ghost"} onClick={attach} loading={busy} disabled={attached === briefId}>
              {attached === briefId ? <Check className="size-4" /> : <Link2 className="size-4" />}
              {attached === briefId ? "Saved to brief" : `Save to ${briefTitle ? "brief" : "post"}`}
            </Button>
          )}
        </figcaption>
      )}
    </motion.figure>
  );
}
