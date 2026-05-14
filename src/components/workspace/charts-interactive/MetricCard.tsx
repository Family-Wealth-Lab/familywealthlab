"use client";
/**
 * MetricCard — an interactive KPI tile.
 *
 * Wraps the look of the legacy `KpiCard` (in `@/components/workspace/cards`)
 * but adds:
 *   - hover lift (subtle elevation + ember rail)
 *   - optional mini sparkline (animated draw on mount)
 *   - optional trend indicator (▲ / ▼ with delta)
 *   - tooltip explanation on hover (via title attr + an icon when provided)
 *   - tap-to-expand on mobile (controlled internally)
 *
 * Designed as a drop-in upgrade — callers can pass the same props the legacy
 * KpiCard uses (`label`, `value`, `format`, `sub`, `tone`, `href`).
 */

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Info, TrendingUp, TrendingDown } from "lucide-react";
import { Sparkline } from "@/components/ui/Sparkline";
import { fmtMoney, fmtMoneyCompact, fmtPercent } from "@/components/workspace/format";
import { EASE_OUT_EXPO } from "./chart-utils";

export type MetricFormat = "money" | "moneyCompact" | "percent" | "raw";
export type MetricTone = "positive" | "negative" | "warning" | "neutral";

interface Props {
  index?: string | number;
  label: string;
  value: number | string;
  format?: MetricFormat;
  sub?: string;
  tone?: MetricTone;
  /** Optional clickable href. */
  href?: string;
  /** Optional mini sparkline series (last N values). */
  sparkline?: number[];
  /** Optional headline delta line, e.g. "+$2,340 vs last month". */
  delta?: { value: number; label?: string };
  /** Optional explanation surfaced via the info tooltip. */
  tooltip?: string;
}

const TONE_VALUE: Record<MetricTone, string> = {
  positive: "text-emerald-700",
  negative: "text-rose-700",
  warning: "text-ember-700",
  neutral: "text-ink-primary",
};

function formatValue(value: number | string, format: MetricFormat): string {
  if (typeof value === "string") return value;
  switch (format) {
    case "money":
      return fmtMoney(value);
    case "moneyCompact":
      return fmtMoneyCompact(value);
    case "percent":
      return fmtPercent(value);
    case "raw":
    default:
      return String(value);
  }
}

export function MetricCard({
  index = "·",
  label,
  value,
  format = "money",
  sub,
  tone = "neutral",
  href,
  sparkline,
  delta,
  tooltip,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = React.useState(false);

  const body = (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
      className="group relative rounded-2xl border border-line bg-bg-base p-4 sm:p-5 h-full flex flex-col gap-2 overflow-hidden transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(11,15,26,0.18)]"
    >
      {/* ember rail on hover */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[2px] bg-ember-500 opacity-0 group-hover:opacity-100 transition-opacity"
      />

      <div className="flex items-start justify-between gap-2">
        <div className="syslabel text-[0.62rem]">
          <span className="syslabel-bracket">[{index}]</span>
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {tooltip && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen((v) => !v);
              }}
              className="text-ink-quaternary hover:text-ink-primary transition-colors focus-ring rounded"
              aria-label={`Explain ${label}`}
              title={tooltip}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          )}
          {href && (
            <ArrowUpRight className="h-3.5 w-3.5 text-ink-quaternary group-hover:text-ember-600 transition-colors" />
          )}
        </div>
      </div>

      <div className={`text-h4 tabular-nums tracking-tight ${TONE_VALUE[tone]}`}>
        {formatValue(value, format)}
      </div>

      {delta && (
        <div
          className={`flex items-center gap-1 text-caption font-medium tabular-nums ${
            delta.value > 0
              ? "text-emerald-700"
              : delta.value < 0
                ? "text-rose-700"
                : "text-ink-quaternary"
          }`}
        >
          {delta.value > 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : delta.value < 0 ? (
            <TrendingDown className="h-3 w-3" />
          ) : null}
          <span>
            {delta.value > 0 ? "+" : ""}
            {fmtMoneyCompact(delta.value)}
            {delta.label ? ` · ${delta.label}` : ""}
          </span>
        </div>
      )}

      {sub && (
        <p className="text-caption text-ink-tertiary text-pretty">{sub}</p>
      )}

      {sparkline && sparkline.length > 1 && (
        <div className="mt-auto pt-2">
          <Sparkline
            data={sparkline}
            stroke={tone === "negative" ? "#C24A6B" : tone === "positive" ? "#3FA88F" : "#C97030"}
            height={28}
          />
        </div>
      )}

      {tooltip && open && (
        <div className="absolute inset-x-3 bottom-3 z-10 rounded-md border border-line bg-bg-base/95 shadow-md p-2.5 text-caption text-ink-secondary">
          {tooltip}
        </div>
      )}
    </motion.div>
  );

  if (!href) return body;
  return (
    <Link href={href} className="block focus-ring rounded-2xl">
      {body}
    </Link>
  );
}
