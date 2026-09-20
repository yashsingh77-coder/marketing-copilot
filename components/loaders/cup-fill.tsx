"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const DEFAULT_MESSAGES = [
  "Brewing ideas…",
  "Adding a pinch of hashtags…",
  "Checking what your neighbours love…",
  "Steeping the perfect caption…",
  "Almost ready to pour…",
];

const INK = "#141126";

export function CupFill({
  messages = DEFAULT_MESSAGES,
  size = 140,
  className,
}: {
  messages?: string[];
  size?: number;
  className?: string;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 1800);
    return () => clearInterval(t);
  }, [messages.length]);

  return (
    <div className={cn("flex flex-col items-center gap-5", className)} role="status" aria-live="polite">
      <svg viewBox="0 0 160 160" width={size} height={size} className="overflow-visible">
        <defs>
          <clipPath id="cup-clip">
            <path d="M36 52 H116 V118 Q116 136 98 136 H54 Q36 136 36 118 Z" />
          </clipPath>
        </defs>

        {/* Steam */}
        {[58, 76, 94].map((x, k) => (
          <motion.path
            key={x}
            d={`M${x} 40 Q${x - 6} 30 ${x} 20 Q${x + 6} 10 ${x} 0`}
            stroke={INK}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            animate={{ opacity: [0, 1, 0], y: [6, -6] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: k * 0.3, ease: "easeInOut" }}
          />
        ))}

        {/* Liquid */}
        <g clipPath="url(#cup-clip)">
          <motion.rect
            x="30"
            width="100"
            height="100"
            fill="#ff5a1f"
            animate={{ y: [136, 52, 52, 136] }}
            transition={{ duration: 3, repeat: Infinity, times: [0, 0.6, 0.85, 1], ease: "easeInOut" }}
          />
          <motion.path
            d="M30 0 Q42 -6 54 0 T78 0 T102 0 T126 0 T150 0 V20 H30 Z"
            fill="#ff3d8a"
            opacity="0.5"
            animate={{ y: [136, 52, 52, 136], x: [-12, 0, -12] }}
            transition={{ duration: 3, repeat: Infinity, times: [0, 0.6, 0.85, 1], ease: "easeInOut" }}
          />
        </g>

        {/* Cup outline */}
        <path
          d="M36 52 H116 V118 Q116 136 98 136 H54 Q36 136 36 118 Z"
          fill="none"
          stroke={INK}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* Handle */}
        <path d="M116 70 Q142 70 142 92 Q142 114 116 114" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        {/* Saucer */}
        <path d="M24 144 H128" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      </svg>

      <div className="h-7 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="font-display text-lg font-bold"
          >
            {messages[i]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
