import Link from "next/link";
import { Flame, Zap, UserRound } from "lucide-react";
import { LEVELS } from "@/types/domain";

type Level = (typeof LEVELS)[number];

export function levelFor(xp: number) {
  let current: Level = LEVELS[0];
  let next: Level | null = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? null;
    }
  }
  const progress = next ? ((xp - current.minXp) / (next.minXp - current.minXp)) * 100 : 100;
  return { current, next, progress };
}

export function TopBar({
  businessName,
  xp,
  streak,
}: {
  businessName: string;
  xp: number;
  streak: number;
}) {
  const { current } = levelFor(xp);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-cream/90 px-4 py-3 backdrop-blur">
      <Link href="/me" className="flex min-w-0 items-center gap-2">
        <span className="outline-brutal flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-paper">
          <UserRound className="size-5" strokeWidth={2.5} />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-display text-lg font-bold leading-tight">{businessName}</span>
          <span className="block text-xs font-bold text-ink-soft">{current.title}</span>
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-2">
        <span className="outline-brutal shadow-brutal-sm flex h-8 items-center gap-1 rounded-full bg-blush px-2.5 text-sm font-extrabold">
          <Flame className="size-4" strokeWidth={2.5} /> {streak}
        </span>
        <span className="outline-brutal shadow-brutal-sm flex h-8 items-center gap-1 rounded-full bg-lemon px-2.5 text-sm font-extrabold">
          <Zap className="size-4" strokeWidth={2.5} /> {xp}
        </span>
      </div>
    </header>
  );
}
