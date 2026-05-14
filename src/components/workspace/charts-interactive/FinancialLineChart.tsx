"use client";
/**
 * FinancialLineChart — interactive, responsive, animated multi-series line/area chart.
 *
 * Drop-in compatible with the props of the legacy `AreaLine` so pages can swap
 * the import. Adds:
 *   - animated path draw-in on mount (pathLength easing)
 *   - hover crosshair with tooltip showing every series at the hovered x
 *   - touch support (touchmove)
 *   - optional period toggle (1Y / 3Y / 5Y / MAX) that slices the trailing window
 *   - threshold line + crossover marker
 *   - responsive via viewBox + ResizeObserver-free SVG scaling
 */

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CHART_PALETTE, fmtCompact, niceTicks, EASE_OUT_EXPO } from "./chart-utils";

export interface ChartSeries {
  label: string;
  values: number[];
  color?: string;
  /** Render filled area below the line. */
  fill?: boolean;
  /** Treat this series as a horizontal reference (dashed, no fill, hides legend swatch). */
  reference?: boolean;
}

export type PeriodKey = "1Y" | "3Y" | "5Y" | "MAX";

interface Props {
  xLabels: string[];
  series: ChartSeries[];
  height?: number;
  yFormat?: (n: number) => string;
  padding?: { top: number; right: number; bottom: number; left: number };
  /** Show a 1Y / 3Y / 5Y / MAX toggle. xLabels are assumed annual unless stride is given. */
  showPeriodToggle?: boolean;
  /** How many x-points correspond to one year. Defaults to 1 (annual). */
  pointsPerYear?: number;
  /** Render a dashed horizontal threshold and a crossover dot. */
  threshold?: { value: number; label?: string };
  /** Class name on the outer container. */
  className?: string;
  ariaLabel?: string;
}

export function FinancialLineChart({
  xLabels,
  series,
  height = 260,
  yFormat = fmtCompact,
  padding = { top: 16, right: 12, bottom: 30, left: 56 },
  showPeriodToggle = false,
  pointsPerYear = 1,
  threshold,
  className,
  ariaLabel = "Interactive time-series chart",
}: Props) {
  const reduceMotion = useReducedMotion();
  const [period, setPeriod] = React.useState<PeriodKey>("MAX");
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const [hidden, setHidden] = React.useState<Set<string>>(() => new Set());
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  // ── Period slicing ──────────────────────────────────────────────────────
  const totalLen = xLabels.length;
  const sliceLen = React.useMemo(() => {
    if (!showPeriodToggle || period === "MAX") return totalLen;
    const yrs = period === "1Y" ? 1 : period === "3Y" ? 3 : 5;
    return Math.min(totalLen, Math.max(2, Math.round(yrs * pointsPerYear) + 1));
  }, [showPeriodToggle, period, totalLen, pointsPerYear]);

  const startIdx = Math.max(0, totalLen - sliceLen);
  const xs = xLabels.slice(startIdx);
  const slicedSeries = series.map((s) => ({
    ...s,
    values: s.values.slice(startIdx),
  }));

  // ── Geometry ────────────────────────────────────────────────────────────
  const width = 800;
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const n = xs.length;
  const xStep = n > 1 ? innerW / (n - 1) : 0;
  const xScale = (i: number) => padding.left + i * xStep;

  const visibleValues = slicedSeries
    .filter((s) => !hidden.has(s.label) && !s.reference)
    .flatMap((s) => s.values);
  const refValues = slicedSeries.filter((s) => s.reference).flatMap((s) => s.values);
  if (threshold) refValues.push(threshold.value);
  const allForRange = visibleValues.length ? visibleValues : refValues.length ? refValues : [0, 1];

  const minRaw = Math.min(0, ...allForRange);
  const maxRaw = Math.max(...allForRange, 1);
  const { yMin, yMax, ticks } = niceTicks(minRaw, maxRaw, 4);
  const yScale = (v: number) =>
    padding.top + innerH - ((v - yMin) / (yMax - yMin || 1)) * innerH;

  // X-axis label thinning so mobile doesn't smush.
  const labelStride = Math.max(1, Math.floor(n / 7));

  // ── Hover handling ──────────────────────────────────────────────────────
  const onPointerMove = (clientX: number) => {
    const el = svgRef.current;
    if (!el || n === 0) return;
    const rect = el.getBoundingClientRect();
    const scaleX = width / rect.width;
    const xPx = (clientX - rect.left) * scaleX;
    const relative = xPx - padding.left;
    if (relative < -xStep / 2 || relative > innerW + xStep / 2) {
      setHoverIdx(null);
      return;
    }
    const idx = Math.max(0, Math.min(n - 1, Math.round(relative / (xStep || 1))));
    setHoverIdx(idx);
  };

  // ── Threshold crossover (first index >= threshold for the FIRST non-ref, non-hidden series) ──
  const primary = slicedSeries.find((s) => !s.reference && !hidden.has(s.label));
  let crossoverIdx: number | null = null;
  if (threshold && primary) {
    const t = threshold.value;
    const arr = primary.values;
    for (let i = 1; i < arr.length; i++) {
      if ((arr[i - 1] < t && arr[i] >= t) || (arr[i - 1] > t && arr[i] <= t)) {
        crossoverIdx = i;
        break;
      }
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className={className}>
      {showPeriodToggle && (
        <div className="flex items-center justify-end gap-1 mb-2">
          {(["1Y", "3Y", "5Y", "MAX"] as PeriodKey[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-2 h-7 rounded-md text-caption mono tracking-wider transition-colors focus-ring ${
                p === period
                  ? "bg-ink-primary text-white"
                  : "bg-bg-inset text-ink-tertiary hover:text-ink-primary hover:bg-bg-inset/70"
              }`}
              aria-pressed={p === period}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto touch-none select-none"
          role="img"
          aria-label={ariaLabel}
          onMouseMove={(e) => onPointerMove(e.clientX)}
          onMouseLeave={() => setHoverIdx(null)}
          onTouchStart={(e) => onPointerMove(e.touches[0]?.clientX ?? 0)}
          onTouchMove={(e) => onPointerMove(e.touches[0]?.clientX ?? 0)}
          onTouchEnd={() => setHoverIdx(null)}
        >
          {/* gridlines */}
          {ticks.map((t, i) => (
            <g key={`y${i}`}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={yScale(t)}
                y2={yScale(t)}
                stroke="rgba(0,0,0,0.06)"
                strokeWidth={1}
              />
              <text
                x={padding.left - 8}
                y={yScale(t) + 4}
                textAnchor="end"
                className="fill-ink-quaternary"
                style={{ fontSize: 10 }}
              >
                {yFormat(t)}
              </text>
            </g>
          ))}

          {/* zero line */}
          {yMin < 0 && yMax > 0 && (
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={yScale(0)}
              y2={yScale(0)}
              stroke="rgba(0,0,0,0.18)"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
          )}

          {/* threshold line */}
          {threshold && (
            <g>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={yScale(threshold.value)}
                y2={yScale(threshold.value)}
                stroke="#C24A6B"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              <text
                x={width - padding.right}
                y={yScale(threshold.value) - 4}
                textAnchor="end"
                style={{ fontSize: 10 }}
                className="fill-rose-700"
              >
                {threshold.label ?? `Target · ${yFormat(threshold.value)}`}
              </text>
            </g>
          )}

          {/* series */}
          {slicedSeries.map((s, si) => {
            if (hidden.has(s.label)) return null;
            const color = s.color ?? CHART_PALETTE[si % CHART_PALETTE.length];
            if (s.values.length < 2) return null;
            const pts = s.values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
            const linePath = `M ${pts.split(" ").join(" L ")}`;
            const areaPath =
              s.fill === true && !s.reference
                ? `M ${xScale(0)},${yScale(yMin)} L ${pts.split(" ").join(" L ")} L ${xScale(
                    s.values.length - 1,
                  )},${yScale(yMin)} Z`
                : null;
            return (
              <g key={s.label + si}>
                {areaPath && (
                  <motion.path
                    d={areaPath}
                    fill={color}
                    fillOpacity={0.12}
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT_EXPO }}
                  />
                )}
                <motion.path
                  d={linePath}
                  fill="none"
                  stroke={color}
                  strokeWidth={s.reference ? 1.5 : 2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={s.reference ? "5 5" : undefined}
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.1, ease: EASE_OUT_EXPO, delay: si * 0.08 }}
                />
              </g>
            );
          })}

          {/* x-axis labels */}
          {xs.map((l, i) =>
            i % labelStride === 0 || i === n - 1 ? (
              <text
                key={`x${i}`}
                x={xScale(i)}
                y={height - 8}
                textAnchor="middle"
                className="fill-ink-quaternary"
                style={{ fontSize: 10 }}
              >
                {l}
              </text>
            ) : null,
          )}

          {/* crossover marker */}
          {crossoverIdx != null && primary && (
            <g>
              <circle
                cx={xScale(crossoverIdx)}
                cy={yScale(primary.values[crossoverIdx])}
                r={5.5}
                fill="#fff"
                stroke="#C24A6B"
                strokeWidth={2}
              />
              <text
                x={xScale(crossoverIdx)}
                y={yScale(primary.values[crossoverIdx]) - 10}
                textAnchor="middle"
                style={{ fontSize: 10 }}
                className="fill-rose-700"
              >
                Crossover
              </text>
            </g>
          )}

          {/* hover crosshair + dots */}
          {hoverIdx != null && (
            <g pointerEvents="none">
              <line
                x1={xScale(hoverIdx)}
                x2={xScale(hoverIdx)}
                y1={padding.top}
                y2={height - padding.bottom}
                stroke="rgba(0,0,0,0.25)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              {slicedSeries.map((s, si) => {
                if (hidden.has(s.label)) return null;
                const v = s.values[hoverIdx];
                if (v == null || !Number.isFinite(v)) return null;
                const color = s.color ?? CHART_PALETTE[si % CHART_PALETTE.length];
                return (
                  <circle
                    key={`dot-${s.label}-${si}`}
                    cx={xScale(hoverIdx)}
                    cy={yScale(v)}
                    r={3.5}
                    fill="#fff"
                    stroke={color}
                    strokeWidth={2}
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* tooltip */}
        {hoverIdx != null && (
          <Tooltip
            xLabel={xs[hoverIdx]}
            entries={slicedSeries
              .filter((s) => !hidden.has(s.label))
              .map((s, si) => ({
                label: s.label,
                value: s.values[hoverIdx],
                color: s.color ?? CHART_PALETTE[si % CHART_PALETTE.length],
                reference: !!s.reference,
              }))}
            xFrac={(hoverIdx + 0.5) / Math.max(1, n)}
            yFormat={yFormat}
          />
        )}
      </div>

      {/* legend (toggleable series) */}
      {series.filter((s) => !s.reference).length > 1 && (
        <ul className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
          {series.map((s, i) => {
            if (s.reference) return null;
            const color = s.color ?? CHART_PALETTE[i % CHART_PALETTE.length];
            const isHidden = hidden.has(s.label);
            return (
              <li key={s.label + i}>
                <button
                  type="button"
                  onClick={() => {
                    setHidden((prev) => {
                      const next = new Set(prev);
                      if (next.has(s.label)) next.delete(s.label);
                      else next.add(s.label);
                      return next;
                    });
                  }}
                  className={`inline-flex items-center gap-1.5 text-caption transition-opacity hover:opacity-100 ${
                    isHidden ? "opacity-40" : "opacity-100"
                  }`}
                  aria-pressed={!isHidden}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm"
                    style={{ background: color }}
                    aria-hidden
                  />
                  <span className="text-ink-secondary">{s.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ── Internal tooltip component ────────────────────────────────────────────
function Tooltip({
  xLabel,
  entries,
  xFrac,
  yFormat,
}: {
  xLabel: string;
  entries: { label: string; value: number; color: string; reference?: boolean }[];
  xFrac: number;
  yFormat: (n: number) => string;
}) {
  // Position the tooltip relative to chart width so it stays inside.
  const leftPct = Math.max(4, Math.min(96, xFrac * 100));
  const flip = xFrac > 0.6;
  return (
    <div
      className="pointer-events-none absolute top-1 z-10 rounded-lg border border-line bg-bg-base/95 shadow-md backdrop-blur-sm px-3 py-2 min-w-[150px]"
      style={{
        left: `${leftPct}%`,
        transform: `translateX(${flip ? "-100%" : "0%"}) translateY(0)`,
        marginLeft: flip ? -8 : 8,
      }}
    >
      <p className="text-caption text-ink-quaternary mono mb-1">{xLabel}</p>
      <ul className="space-y-1">
        {entries.map((e) => (
          <li
            key={e.label}
            className="flex items-center justify-between gap-3 text-caption"
          >
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <span
                className="inline-block h-2 w-2 rounded-sm shrink-0"
                style={{ background: e.color }}
                aria-hidden
              />
              <span className="text-ink-secondary truncate">{e.label}</span>
            </span>
            <span className="text-ink-primary font-medium tabular-nums">
              {Number.isFinite(e.value) ? yFormat(e.value) : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
