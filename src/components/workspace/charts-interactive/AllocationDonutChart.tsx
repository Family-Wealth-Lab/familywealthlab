"use client";
/**
 * AllocationDonutChart — interactive donut with hover slice highlight,
 * tooltip ($ + %), click-to-select active slice (center swaps to selected),
 * and animated draw-in on mount. Drop-in compatible with the legacy `Donut`.
 */

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CHART_PALETTE, fmtCompact, EASE_OUT_EXPO } from "./chart-utils";

export interface DonutSlice {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  /** Default centre label (shown when no slice selected). */
  centerLabel?: string;
  /** Default centre sub (shown when no slice selected). */
  centerSub?: string;
  /** Show $ in the legend rows (default true). */
  showLegendDollars?: boolean;
}

export function AllocationDonutChart({
  slices,
  size = 220,
  thickness = 28,
  centerLabel,
  centerSub,
  showLegendDollars = true,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null);

  const total = slices.reduce((s, x) => s + Math.max(0, x.value), 0);
  if (total <= 0) {
    return (
      <div
        className="flex items-center justify-center text-caption text-ink-quaternary"
        style={{ height: size }}
      >
        No data yet
      </div>
    );
  }

  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const activeIdx = hoverIdx ?? selectedIdx;
  const activeSlice = activeIdx != null ? slices[activeIdx] : null;
  const activePct = activeSlice ? (activeSlice.value / total) * 100 : null;

  let acc = 0;
  const sliceGeoms = slices.map((s) => {
    const len = Math.max(0, s.value / total) * circ;
    const offset = -acc;
    acc += len;
    return { len, offset };
  });

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label="Allocation donut chart"
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(0,0,0,0.04)"
            strokeWidth={thickness}
          />
          {slices.map((s, i) => {
            if (s.value <= 0) return null;
            const color = s.color ?? CHART_PALETTE[i % CHART_PALETTE.length];
            const isActive = activeIdx === i;
            const sliceThickness = isActive ? thickness + 4 : thickness;
            return (
              <motion.circle
                key={s.label + i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={sliceThickness}
                strokeDasharray={`${sliceGeoms[i].len} ${circ - sliceGeoms[i].len}`}
                strokeDashoffset={sliceGeoms[i].offset}
                transform={`rotate(-90 ${cx} ${cy})`}
                strokeLinecap="butt"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                onClick={() =>
                  setSelectedIdx((prev) => (prev === i ? null : i))
                }
                style={{ cursor: "pointer" }}
                initial={
                  reduceMotion
                    ? false
                    : { strokeDasharray: `0 ${circ}` }
                }
                animate={{
                  strokeDasharray: `${sliceGeoms[i].len} ${circ - sliceGeoms[i].len}`,
                  strokeWidth: sliceThickness,
                }}
                transition={{
                  strokeDasharray: { duration: 0.9, delay: i * 0.06, ease: EASE_OUT_EXPO },
                  strokeWidth: { duration: 0.2 },
                }}
              />
            );
          })}
          {/* centre */}
          <g pointerEvents="none">
            {activeSlice ? (
              <>
                <text
                  x={cx}
                  y={cy - 6}
                  textAnchor="middle"
                  className="fill-ink-tertiary mono"
                  style={{ fontSize: 10, letterSpacing: 0.5 }}
                >
                  {activeSlice.label.toUpperCase()}
                </text>
                <text
                  x={cx}
                  y={cy + 10}
                  textAnchor="middle"
                  className="fill-ink-primary"
                  style={{ fontSize: 18, fontWeight: 600 }}
                >
                  {fmtCompact(activeSlice.value)}
                </text>
                <text
                  x={cx}
                  y={cy + 26}
                  textAnchor="middle"
                  className="fill-ink-tertiary"
                  style={{ fontSize: 11 }}
                >
                  {activePct?.toFixed(1)}%
                </text>
              </>
            ) : (
              <>
                {centerLabel && (
                  <text
                    x={cx}
                    y={cy - 2}
                    textAnchor="middle"
                    className="fill-ink-primary"
                    style={{ fontSize: 18, fontWeight: 600 }}
                  >
                    {centerLabel}
                  </text>
                )}
                {centerSub && (
                  <text
                    x={cx}
                    y={cy + 16}
                    textAnchor="middle"
                    className="fill-ink-tertiary"
                    style={{ fontSize: 11 }}
                  >
                    {centerSub}
                  </text>
                )}
              </>
            )}
          </g>
        </svg>
      </div>

      <ul className="space-y-1.5 min-w-[10rem]">
        {slices.map((s, i) => {
          const pct = total > 0 ? (s.value / total) * 100 : 0;
          const color = s.color ?? CHART_PALETTE[i % CHART_PALETTE.length];
          const isActive = activeIdx === i;
          return (
            <li key={s.label + i}>
              <button
                type="button"
                onClick={() =>
                  setSelectedIdx((prev) => (prev === i ? null : i))
                }
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                className={`group w-full flex items-center gap-2 text-body-sm rounded-md px-1 py-0.5 transition-colors ${
                  isActive ? "bg-bg-inset/70" : "hover:bg-bg-inset/40"
                }`}
                aria-pressed={selectedIdx === i}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm shrink-0"
                  style={{ background: color }}
                  aria-hidden
                />
                <span className="text-ink-secondary flex-1 truncate text-left">
                  {s.label}
                </span>
                {showLegendDollars && (
                  <span className="text-ink-quaternary tabular-nums text-caption hidden sm:inline">
                    {fmtCompact(s.value)}
                  </span>
                )}
                <span className="text-ink-primary font-medium tabular-nums w-12 text-right">
                  {pct.toFixed(1)}%
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
