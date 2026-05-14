"use client";
/**
 * FinancialAreaChart — thin wrapper that forces `fill: true` on every series
 * by default so callers can express intent more clearly. Behaviour and API
 * are otherwise identical to `FinancialLineChart`.
 */

import { FinancialLineChart, type ChartSeries, type PeriodKey } from "./FinancialLineChart";

export type { ChartSeries, PeriodKey };

interface Props {
  xLabels: string[];
  series: ChartSeries[];
  height?: number;
  yFormat?: (n: number) => string;
  showPeriodToggle?: boolean;
  pointsPerYear?: number;
  threshold?: { value: number; label?: string };
  className?: string;
  ariaLabel?: string;
}

export function FinancialAreaChart(props: Props) {
  const filled = props.series.map((s) =>
    s.fill === undefined && !s.reference ? { ...s, fill: true } : s,
  );
  return <FinancialLineChart {...props} series={filled} />;
}
