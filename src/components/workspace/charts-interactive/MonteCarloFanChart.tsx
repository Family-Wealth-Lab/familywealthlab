"use client";
/**
 * MonteCarloFanChart — p10/p50/p90 band with a hover scrubber that shows
 * the percentile values at the hovered horizontal position, plus a "Today"
 * reference marker. Used on the Monte Carlo page.
 */

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { fmtCompact, niceTicks, EASE_OUT_EXPO } from "./chart-utils";

interface Props {
  /** Headline percentile values at the final horizon (used for the bar+min/max scale). */
  p10: number;
  p50: number;
  p90: number;
  /** Today's net worth — rendered as a fixed reference line. */
  initial: number;
  height?: number;
  className?: string;
}

/**
 * Renders a horizontal P10..P90 range bar with the P50 marker and a separate
 * "Today" marker, plus a hover scrubber that surfaces an exact dollar value
 * for the hovered position along the range. Animated draw-in.
 */
export function MonteCarloFanChart({
  p10,
  p50,
  p90,
  initial,
  height = 140,
  className,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [hoverPct, setHoverPct] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const min = Math.min(p10, initial, 0);
  const max = Math.max(p90, initial);
  const range = max - min || 1;
  const toPct = (n: number) => Math.max(0, Math.min(100, ((n - min) / range) * 100));
  const fromPct = (p: number) => min + (p / 100) * range;

  const onMove = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setHoverPct(Math.max(0, Math.min(100, p)));
  };

  const { ticks } = niceTicks(min, max, 4);

  return (
    <div className={className} style={{ height }}>
      <div
        ref={containerRef}
        className="relative h-16 mt-2 touch-none select-none"
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseLeave={() => setHoverPct(null)}
        onTouchStart={(e) => onMove(e.touches[0]?.clientX ?? 0)}
        onTouchMove={(e) => onMove(e.touches[0]?.clientX ?? 0)}
        onTouchEnd={() => setHoverPct(null)}
      >
        {/* axis ticks */}
        <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none">
          {ticks.map((t, i) => (
            <div
              key={`tk${i}`}
              className="absolute top-0 bottom-0 border-l border-dashed border-line/60"
              style={{ left: `${toPct(t)}%` }}
              aria-hidden
            >
              <span className="absolute -bottom-5 -translate-x-1/2 text-caption text-ink-quaternary mono">
                {fmtCompact(t)}
              </span>
            </div>
          ))}
        </div>

        {/* base rail */}
        <div className="absolute inset-x-0 top-5 h-6 rounded-lg bg-bg-inset overflow-visible" />

        {/* P10..P90 band */}
        <motion.div
          className="absolute top-6 h-4 rounded-md bg-ember-500/30 border border-ember-500/60"
          style={{ left: `${toPct(p10)}%`, width: `calc(${toPct(p90) - toPct(p10)}%)` }}
          initial={reduceMotion ? false : { scaleX: 0, transformOrigin: "left" }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
          aria-label="P10 to P90 band"
        />

        {/* P50 marker */}
        <div
          className="absolute top-4 h-8 w-0.5 bg-ember-700"
          style={{ left: `calc(${toPct(p50)}% - 1px)` }}
          aria-label="P50 marker"
        />
        <span
          className="absolute -top-1 -translate-x-1/2 text-[0.6rem] mono uppercase tracking-wider text-ember-700"
          style={{ left: `${toPct(p50)}%` }}
        >
          P50
        </span>

        {/* Today marker */}
        <div
          className="absolute top-4 h-8 w-0.5 bg-ink-secondary"
          style={{ left: `calc(${toPct(initial)}% - 1px)` }}
          aria-label="Today marker"
        />
        <span
          className="absolute -top-1 -translate-x-1/2 text-[0.6rem] mono uppercase tracking-wider text-ink-tertiary"
          style={{ left: `${toPct(initial)}%` }}
        >
          Today
        </span>

        {/* hover scrubber */}
        {hoverPct != null && (
          <>
            <div
              className="absolute top-3 h-10 w-px bg-ink-primary/40 pointer-events-none"
              style={{ left: `${hoverPct}%` }}
              aria-hidden
            />
            <div
              className="absolute -top-7 pointer-events-none rounded-md bg-bg-base/95 border border-line shadow-sm px-2 py-0.5 text-caption text-ink-primary mono"
              style={{
                left: `${hoverPct}%`,
                transform: `translateX(${hoverPct > 80 ? "-100%" : hoverPct < 20 ? "0%" : "-50%"})`,
              }}
            >
              {fmtCompact(fromPct(hoverPct))}
            </div>
          </>
        )}
      </div>

      {/* Legend row */}
      <div className="grid grid-cols-3 gap-2 text-caption mt-8">
        <Stat label="P10" value={fmtCompact(p10)} tone="muted" />
        <Stat label="P50" value={fmtCompact(p50)} tone="ember" />
        <Stat label="P90" value={fmtCompact(p90)} tone="muted" />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "ember" | "muted" }) {
  return (
    <div className="text-center">
      <div
        className={`text-[0.6rem] mono uppercase tracking-wider ${
          tone === "ember" ? "text-ember-700" : "text-ink-quaternary"
        }`}
      >
        {label}
      </div>
      <div className="text-body-sm text-ink-primary tabular-nums">{value}</div>
    </div>
  );
}
