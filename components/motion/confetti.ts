"use client";

const COLORS = ["#ff5a1f", "#ff3d8a", "#ffe45e", "#b8f2d6", "#bfe3ff", "#141126"];

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Burst from a point (defaults to bottom-center). Pass an element to burst from it. */
export async function fireConfetti(from?: HTMLElement | { x: number; y: number }) {
  if (reducedMotion()) return;
  const confetti = (await import("canvas-confetti")).default;

  let origin = { x: 0.5, y: 0.8 };
  if (from instanceof HTMLElement) {
    const r = from.getBoundingClientRect();
    origin = { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight };
  } else if (from) {
    origin = from;
  }

  confetti({ particleCount: 90, spread: 70, startVelocity: 40, colors: COLORS, origin, scalar: 1.1 });
}

/** Bigger celebration for milestones / level-ups. */
export async function fireCelebration() {
  if (reducedMotion()) return;
  const confetti = (await import("canvas-confetti")).default;
  const end = Date.now() + 1200;
  const frame = () => {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLORS });
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
