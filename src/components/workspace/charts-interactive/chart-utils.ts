/**
 * Shared utilities for the interactive chart primitives in this directory.
 * Kept in one place so every chart speaks the same scales / palette / formats.
 */

export const CHART_PALETTE = [
  "#C97030", "#7B6CF6", "#3FA88F", "#E0A040", "#5085D9",
  "#C24A6B", "#6B8DAC", "#A85DA8", "#5BA850", "#8C6B40",
  "#4F6E8F", "#B85D38", "#3F8FA8", "#996B7A", "#7AA850",
];

const audFormatter = (digits = 0) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export function fmtAud(n: number, digits = 0): string {
  return audFormatter(digits).format(n);
}

export function fmtCompact(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return `${n < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M`;
  }
  if (abs >= 1_000) {
    return `${n < 0 ? "-" : ""}$${(abs / 1_000).toFixed(1)}k`;
  }
  return audFormatter(0).format(n);
}

export function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const exp = Math.floor(Math.log10(raw));
  const base = raw / Math.pow(10, exp);
  let nice = 1;
  if (base <= 1) nice = 1;
  else if (base <= 2) nice = 2;
  else if (base <= 5) nice = 5;
  else nice = 10;
  return nice * Math.pow(10, exp);
}

/** Compute "nice" gridline ticks for a series. */
export function niceTicks(min: number, max: number, count = 4) {
  const range = Math.max(1e-9, max - min);
  const step = niceStep(range / count);
  const yMin = Math.floor(min / step) * step;
  const yMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let y = yMin; y <= yMax + step / 2; y += step) ticks.push(y);
  return { yMin, yMax, ticks, step };
}

/** Default easing — matches the rest of the app. */
export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;
