"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export type TickerItem = {
  code: string;        // e.g. "ASX200"
  value: string;       // e.g. "8,142.55"
  delta: string;       // e.g. "+0.42%"
  positive?: boolean;  // controls delta color
};

interface TickerProps {
  items: TickerItem[];
  className?: string;
  tone?: "light" | "dark";
}

/**
 * Endless horizontal ticker — markets/macro context strip.
 * Renders items twice so the CSS keyframe can translate -50% seamlessly.
 */
export function Ticker({ items, className, tone = "light" }: TickerProps) {
  const list = [...items, ...items];
  const delim = tone === "dark" ? "text-ink-ondarkQuaternary" : "text-ink-quinary";
  const codeC = tone === "dark" ? "text-ink-ondarkSecondary" : "text-ink-tertiary";
  const valC = tone === "dark" ? "text-ink-ondark" : "text-ink-primary";
  return (
    <div className={cn("relative overflow-hidden mask-fade-x", className)}>
      <div className="ticker gap-10 py-3 text-caption mono">
        {list.map((it, i) => (
          <div key={i} className="flex items-center gap-3 whitespace-nowrap">
            <span className={cn("uppercase tracking-wider", codeC)}>{it.code}</span>
            <span className={cn(valC)}>{it.value}</span>
            <span
              className={cn(
                it.positive === false ? "text-negative" : it.positive === true ? "text-positive" : codeC,
              )}
            >
              {it.delta}
            </span>
            <span className={cn("px-2", delim)}>•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
