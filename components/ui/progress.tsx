"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          className="outline-brutal block h-3 rounded-full"
          animate={{
            width: i === current ? 28 : 12,
            backgroundColor: i <= current ? "#ff5a1f" : "#ffffff",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      ))}
    </div>
  );
}

type ProgressBarProps = {
  value: number; // 0-100
  color?: "primary" | "lemon" | "mint" | "secondary";
  className?: string;
  height?: "sm" | "md";
};

const barColors = {
  primary: "bg-primary",
  lemon: "bg-lemon",
  mint: "bg-mint",
  secondary: "bg-secondary",
};

export function ProgressBar({ value, color = "primary", className, height = "md" }: ProgressBarProps) {
  return (
    <div
      className={cn(
        "outline-brutal w-full overflow-hidden rounded-full bg-paper",
        height === "sm" ? "h-3" : "h-5",
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn("h-full rounded-full", barColors[color])}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}
