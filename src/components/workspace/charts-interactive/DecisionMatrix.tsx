"use client";
/**
 * DecisionMatrix — surfaces the engine's recommendation grid as a 2D matrix:
 * each candidate strategy × the risk dimensions that matter.
 *
 * The "recommended" column is highlighted with the ember rail/SCENARIO chip.
 * On mobile the matrix stacks (one card per candidate) so nothing overflows.
 */

import * as React from "react";
import { MatrixGrid, type MatrixCell, type MatrixColumn, type MatrixRow } from "@/components/ui/MatrixGrid";

export interface DecisionRiskMetric {
  label: string;
  caption?: string;
  values: number[]; // one per candidate, in the same order as `candidates`
  /** thresholds: <= warnAt = positive, <= dangerAt = warning, else negative */
  warnAt: number;
  dangerAt: number;
  /** Format the value for display. */
  format?: (v: number) => string;
  /** True when "higher is better" (e.g. survival). Default false. */
  higherIsBetter?: boolean;
}

export interface DecisionCandidate {
  id: string;
  name: string;
  caption?: string;
  recommended?: boolean;
}

interface Props {
  candidates: DecisionCandidate[];
  metrics: DecisionRiskMetric[];
  cornerLabel?: string;
  className?: string;
}

const defaultFmt = (n: number) => `${(n * 100).toFixed(1)}%`;

function toneFor(
  v: number,
  m: DecisionRiskMetric,
): "positive" | "warning" | "negative" | "neutral" {
  if (m.higherIsBetter) {
    if (v >= m.dangerAt) return "positive";
    if (v >= m.warnAt) return "warning";
    return "negative";
  }
  if (v <= m.warnAt) return "positive";
  if (v <= m.dangerAt) return "warning";
  return "negative";
}

export function DecisionMatrix({
  candidates,
  metrics,
  cornerLabel = "DECISION",
  className,
}: Props) {
  const columns: MatrixColumn[] = candidates.map((c) => ({
    label: c.name.toUpperCase(),
    caption: c.caption,
    recommended: !!c.recommended,
  }));

  const rows: MatrixRow[] = metrics.map<MatrixRow>((m) => ({
    label: m.label,
    caption: m.caption,
    cells: candidates.map<MatrixCell>((_, i) => {
      const v = m.values[i] ?? 0;
      const fmt = m.format ?? defaultFmt;
      return { value: fmt(v), tone: toneFor(v, m) };
    }),
  }));

  return (
    <MatrixGrid
      columns={columns}
      rows={rows}
      cornerLabel={cornerLabel}
      className={className}
    />
  );
}
