"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { cardColors, type CardColor } from "./card";

type ChipProps = {
  selected?: boolean;
  onClick?: () => void;
  color?: CardColor;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
};

const chipSizes = {
  sm: "h-8 px-3 text-xs gap-1",
  md: "h-10 px-4 text-sm gap-1.5",
  lg: "h-12 px-5 text-base gap-2",
};

/** Selectable pill. Selected = ink fill; unselected = paper. */
export function Chip({
  selected = false,
  onClick,
  color = "paper",
  size = "md",
  className,
  children,
  disabled,
}: ChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "outline-brutal inline-flex items-center justify-center rounded-full font-bold whitespace-nowrap",
        "shadow-brutal-sm disabled:opacity-50",
        chipSizes[size],
        selected ? "bg-ink text-cream" : cardColors[color],
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

type StickerProps = {
  color?: CardColor;
  rotate?: number;
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
};

/** Static, slightly rotated label — "NEW", "+50 XP", "REEL". */
export function Sticker({ color = "lemon", rotate = -3, size = "sm", className, children }: StickerProps) {
  return (
    <span
      style={{ transform: `rotate(${rotate}deg)` }}
      className={cn(
        "outline-brutal shadow-brutal-sm inline-flex items-center rounded-full font-display font-bold uppercase tracking-wide",
        size === "sm" ? "h-7 px-2.5 text-[11px]" : "h-9 px-3.5 text-sm",
        cardColors[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
