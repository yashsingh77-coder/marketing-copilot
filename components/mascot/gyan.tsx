"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type GyanExpression = "happy" | "thinking" | "celebrating" | "sleepy" | "pointing";

type GyanProps = {
  expression?: GyanExpression;
  size?: number;
  className?: string;
  animate?: boolean;
};

const INK = "#141126";
const ORANGE = "#ff5a1f";
const CREAM = "#fff6e9";
const LEMON = "#ffe45e";

const mouths: Record<GyanExpression, React.ReactNode> = {
  happy: <path d="M78 126 Q100 148 122 126" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />,
  pointing: <path d="M78 126 Q100 148 122 126" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />,
  thinking: <path d="M90 132 Q100 126 110 134" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />,
  celebrating: (
    <>
      <path d="M74 122 Q100 160 126 122 Z" fill={INK} />
      <path d="M88 138 Q100 152 112 138 Z" fill="#ff3d8a" />
    </>
  ),
  sleepy: <path d="M90 134 Q100 140 110 134" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />,
};

export function Gyan({ expression = "happy", size = 160, className, animate = true }: GyanProps) {
  const sleepy = expression === "sleepy";
  const thinking = expression === "thinking";
  const celebrating = expression === "celebrating";
  const pointing = expression === "pointing";

  const pupilOffset = thinking ? { x: 4, y: -5 } : { x: 0, y: 0 };

  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={cn("overflow-visible select-none", className)}
      role="img"
      aria-label={`Gyan the guru, ${expression}`}
      animate={animate ? { y: [0, -5, 0] } : undefined}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Sparkle */}
      <motion.path
        d="M100 8 L105 22 L119 27 L105 32 L100 46 L95 32 L81 27 L95 22 Z"
        fill={LEMON}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
        style={{ originX: "100px", originY: "27px" }}
        animate={
          animate
            ? thinking
              ? { rotate: 360, scale: [1, 1.2, 1] }
              : celebrating
                ? { scale: [1, 1.4, 1], rotate: [0, 20, -20, 0] }
                : { scale: [1, 1.12, 1] }
            : undefined
        }
        transition={{ duration: thinking ? 3 : 1.6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Arms (celebrating / pointing) */}
      {celebrating && (
        <>
          <motion.path
            d="M42 120 Q20 95 30 70"
            stroke={INK} strokeWidth="14" strokeLinecap="round" fill="none"
            animate={{ rotate: [0, -12, 0] }} style={{ originX: "42px", originY: "120px" }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
          <motion.path
            d="M158 120 Q180 95 170 70"
            stroke={INK} strokeWidth="14" strokeLinecap="round" fill="none"
            animate={{ rotate: [0, 12, 0] }} style={{ originX: "158px", originY: "120px" }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
          <path d="M42 120 Q20 95 30 70" stroke={ORANGE} strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M158 120 Q180 95 170 70" stroke={ORANGE} strokeWidth="8" strokeLinecap="round" fill="none" />
        </>
      )}
      {pointing && (
        <motion.g
          animate={animate ? { x: [0, 4, 0] } : undefined}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M156 118 L192 104" stroke={INK} strokeWidth="14" strokeLinecap="round" />
          <path d="M156 118 L192 104" stroke={ORANGE} strokeWidth="8" strokeLinecap="round" />
          <circle cx="192" cy="104" r="7" fill={ORANGE} stroke={INK} strokeWidth="3" />
        </motion.g>
      )}

      {/* Body */}
      <circle cx="100" cy="112" r="72" fill={ORANGE} stroke={INK} strokeWidth="5" />

      {/* Scarf */}
      <path d="M40 152 Q100 178 160 152 L156 168 Q100 190 44 168 Z" fill={CREAM} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M128 166 L140 190 L150 168" fill={CREAM} stroke={INK} strokeWidth="4" strokeLinejoin="round" />

      {/* Eyes */}
      {sleepy ? (
        <>
          <path d="M64 100 Q76 108 88 100" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M112 100 Q124 108 136 100" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
          <motion.text
            x="150" y="60" fontFamily="var(--font-fredoka)" fontWeight="700" fontSize="22" fill={INK}
            animate={animate ? { opacity: [0, 1, 0], y: [64, 50, 40] } : undefined}
            transition={{ duration: 2, repeat: Infinity }}
          >
            z
          </motion.text>
        </>
      ) : (
        <>
          <ellipse cx="76" cy="100" rx="13" ry="16" fill="#fff" stroke={INK} strokeWidth="4" />
          <ellipse cx="124" cy="100" rx="13" ry="16" fill="#fff" stroke={INK} strokeWidth="4" />
          <motion.g
            animate={animate ? { scaleY: [1, 1, 0.1, 1, 1] } : undefined}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
            style={{ originY: "100px" }}
          >
            <circle cx={78 + pupilOffset.x} cy={102 + pupilOffset.y} r="6" fill={INK} />
            <circle cx={126 + pupilOffset.x} cy={102 + pupilOffset.y} r="6" fill={INK} />
            <circle cx={80 + pupilOffset.x} cy={99 + pupilOffset.y} r="2" fill="#fff" />
            <circle cx={128 + pupilOffset.x} cy={99 + pupilOffset.y} r="2" fill="#fff" />
          </motion.g>
        </>
      )}

      {/* Spectacles */}
      <circle cx="76" cy="100" r="20" fill="none" stroke={INK} strokeWidth="4" />
      <circle cx="124" cy="100" r="20" fill="none" stroke={INK} strokeWidth="4" />
      <path d="M96 100 L104 100" stroke={INK} strokeWidth="4" />
      <path d="M56 96 L40 90" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M144 96 L160 90" stroke={INK} strokeWidth="4" strokeLinecap="round" />

      {/* Brows */}
      {thinking ? (
        <>
          <path d="M62 76 L88 72" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <path d="M112 70 L138 78" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        </>
      ) : sleepy ? null : (
        <>
          <path d="M62 76 Q76 68 90 76" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M110 76 Q124 68 138 76" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* Cheeks */}
      <circle cx="58" cy="124" r="7" fill="#ff3d8a" opacity="0.55" />
      <circle cx="142" cy="124" r="7" fill="#ff3d8a" opacity="0.55" />

      {mouths[expression]}
    </motion.svg>
  );
}

/** Speech bubble that sits next to Gyan. */
export function GyanSays({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.15 }}
      className={cn(
        "outline-brutal shadow-brutal relative rounded-card bg-paper px-4 py-3 font-semibold leading-snug",
        "before:absolute before:-left-3 before:top-6 before:size-5 before:rotate-45 before:border-b-[2.5px] before:border-l-[2.5px] before:border-ink before:bg-paper",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
