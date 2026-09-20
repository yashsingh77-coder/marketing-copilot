"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export const cardColors = {
  paper: "bg-paper",
  cream: "bg-cream",
  mint: "bg-mint",
  sky: "bg-sky",
  lemon: "bg-lemon",
  lilac: "bg-lilac",
  blush: "bg-blush",
  primary: "bg-primary text-paper",
  ink: "bg-ink text-cream",
} as const;

export type CardColor = keyof typeof cardColors;

const shadows = {
  none: "",
  sm: "shadow-brutal-sm",
  md: "shadow-brutal",
  lg: "shadow-brutal-lg",
} as const;

type CardProps = HTMLMotionProps<"div"> & {
  color?: CardColor;
  shadow?: keyof typeof shadows;
  tilt?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddings = { none: "", sm: "p-3", md: "p-4", lg: "p-6" };

export function Card({
  color = "paper",
  shadow = "md",
  tilt = false,
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <motion.div
      className={cn(
        "outline-brutal rounded-card relative",
        cardColors[color],
        shadows[shadow],
        paddings[padding],
        className,
      )}
      whileHover={
        tilt
          ? { rotate: -1, y: -4, boxShadow: "6px 6px 0 #141126" }
          : undefined
      }
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
