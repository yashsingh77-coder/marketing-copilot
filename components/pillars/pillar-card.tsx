"use client";

import { Lightbulb } from "lucide-react";
import { Card, type CardColor } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ContentPillar } from "@/types/domain";

const colorMap: Record<string, CardColor> = {
  mint: "mint",
  sky: "sky",
  lemon: "lemon",
  lilac: "lilac",
  blush: "blush",
};

export function PillarCard({
  pillar,
  showIdeaButton = false,
  compact = false,
}: {
  pillar: ContentPillar;
  showIdeaButton?: boolean;
  compact?: boolean;
}) {
  const color = colorMap[pillar.color] ?? "lemon";

  return (
    <Card color={color} tilt className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="outline-brutal flex size-11 shrink-0 items-center justify-center rounded-full bg-paper text-2xl">
            {pillar.emoji ?? "✨"}
          </span>
          <div>
            <h3 className="text-xl leading-tight">{pillar.name}</h3>
            <p className="text-sm font-semibold text-ink-soft">{pillar.weight}% of your feed</p>
          </div>
        </div>
      </div>

      <p className="font-semibold leading-snug">{pillar.description}</p>

      <div className="outline-brutal h-2.5 w-full overflow-hidden rounded-full bg-paper">
        <div className="h-full bg-ink" style={{ width: `${pillar.weight}%` }} />
      </div>

      {!compact && pillar.example_ideas?.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm">
          {pillar.example_ideas.slice(0, 3).map((idea) => (
            <li key={idea} className="flex gap-2">
              <span aria-hidden>→</span>
              <span>{idea}</span>
            </li>
          ))}
        </ul>
      )}

      {showIdeaButton && (
        <Button href={`/ideas?pillar=${pillar.id}`} variant="secondary" size="sm" className="self-start">
          <Lightbulb className="size-4" /> Get an idea
        </Button>
      )}
    </Card>
  );
}
