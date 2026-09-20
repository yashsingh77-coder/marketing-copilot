"use client";

import { useId } from "react";

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  caption?: string;
};

export function Slider({ label, value, min, max, step = 1, onChange, format, caption }: SliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="font-bold">
          {label}
        </label>
        <span className="font-display text-2xl font-bold text-primary">{format ? format(value) : value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider"
        style={{ "--slider-pct": `${pct}%` } as React.CSSProperties}
      />
      {caption && <p className="text-sm text-ink-soft">{caption}</p>}
    </div>
  );
}
