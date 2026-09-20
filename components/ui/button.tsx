"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

const variants = {
  primary: "bg-primary text-paper",
  secondary: "bg-paper text-ink",
  accent: "bg-secondary text-paper",
  lemon: "bg-lemon text-ink",
  mint: "bg-mint text-ink",
  ghost: "bg-transparent text-ink border-transparent shadow-none",
} as const;

const sizes = {
  sm: "h-10 px-4 text-sm gap-1.5",
  md: "h-12 px-5 text-base gap-2",
  lg: "h-14 px-6 text-lg gap-2",
  icon: "h-12 w-12 p-0",
} as const;

const SHADOW = "4px 4px 0 #141126";
const SHADOW_PRESSED = "1px 1px 0 #141126";
const spring = { type: "spring", stiffness: 500, damping: 30 } as const;

export type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  fullWidth?: boolean;
  href?: string;
  children?: React.ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    href,
    className,
    children,
    disabled,
    ...props
  },
  ref,
) {
  const isGhost = variant === "ghost";
  const classes = cn(
    "outline-brutal rounded-button inline-flex items-center justify-center font-body font-extrabold select-none",
    "disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );

  const motionProps = {
    initial: false,
    style: isGhost ? undefined : { boxShadow: SHADOW },
    whileTap:
      disabled || loading
        ? undefined
        : { scale: 0.97, x: isGhost ? 0 : 3, y: isGhost ? 0 : 3, ...(isGhost ? {} : { boxShadow: SHADOW_PRESSED }) },
    transition: spring,
  };

  const content = loading ? (
    <>
      <Loader2 className="size-5 animate-spin" aria-hidden />
      <span className="sr-only">Loading</span>
    </>
  ) : (
    children
  );

  if (href) {
    return (
      <MotionLink href={href} className={classes} {...motionProps} aria-disabled={disabled}>
        {content}
      </MotionLink>
    );
  }

  return (
    <motion.button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...motionProps}
      {...props}
    >
      {content}
    </motion.button>
  );
});
