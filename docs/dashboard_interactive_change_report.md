# Dashboard Interactive Charts & Matrices — Change Report

Follow-up #3 to PR #8 (`feat/depth-ui-v1`).

## Goal

The commercial landing already feels alive. The **authenticated dashboard**,
however, was rendering many of its charts, matrices, and KPI cards as static
SVG paths or fixed image-like blocks. This pass replaces those flat surfaces
with a coherent set of interactive primitives that hover, animate, scrub,
and explain themselves — without changing any backend, data fetch, or
landing-page code.

## Scope

- Only `src/components/workspace/charts-interactive/*` and the
  `src/app/workspace/[h]/**` pages listed below.
- No backend, no Supabase, no auto-deploy, no landing-page changes.
- Demo data still flows through the existing `getChartBundle`,
  `getSnapshot`, and `runDecision` helpers — Supabase can drop in later
  without touching the UI.

## New primitives

All under `src/components/workspace/charts-interactive/` with a barrel
`index.ts`. Every primitive is `"use client"`, framer-motion based, and
honours `useReducedMotion`.

| File                       | Responsibility                                                                                                                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chart-utils.ts`           | Shared palette, easing constant `EASE_OUT_EXPO`, `niceTicks`, `fmtAud`, `fmtCompact`.                                                                                                                                                             |
| `FinancialLineChart.tsx`   | Responsive multi-series SVG line chart with hover crosshair, per-series tooltip, animated `pathLength` draw, optional period toggle (1Y / 3Y / 5Y / MAX), threshold/reference line with crossover marker, legend swatches that toggle series.     |
| `FinancialAreaChart.tsx`   | Thin wrapper over `FinancialLineChart` that defaults `fill: true` on non-reference series.                                                                                                                                                        |
| `AllocationDonutChart.tsx` | Hover/tap donut with centre text that swaps to the selected slice ($ + %). Click any slice to lock it. Legend doubles as toggle list.                                                                                                             |
| `InteractiveBarRow.tsx`    | Horizontal bar list with hover emphasis and animated width.                                                                                                                                                                                       |
| `MonteCarloFanChart.tsx`   | P10/P50/P90 fan band with a horizontal scrubber. Hover anywhere to read the simulated $ at that position. Animated band scale-in.                                                                                                                 |
| `ScenarioMatrix.tsx`       | Wraps `MatrixGrid`. Renders 4 fixed rows (Survival, Median NW, Default, Liquidity stress) per scenario column. `recommended` column gets the ember rail + SCENARIO chip.                                                                          |
| `DecisionMatrix.tsx`       | Wraps `MatrixGrid`. Takes any number of risk metrics × any number of candidate strategies. Per-metric `warnAt`/`dangerAt` thresholds with `higherIsBetter` flag drive cell tone (positive / warning / negative).                                  |
| `MetricCard.tsx`           | Drop-in upgrade for the legacy `KpiCard`. Adds: hover lift, ember rail on hover, optional 28px sparkline (animated draw on mount), trend indicator (▲ / ▼) from `delta`, info tooltip popover, optional `href` with `ArrowUpRight` affordance.    |
| `InsightCard.tsx`          | Severity rail (positive / warning / negative / neutral) + tag badges + body. Animated on first view.                                                                                                                                              |

## Pages threaded with primitives

| Route                                  | What changed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `/workspace/[h]/overview`              | 8 × `KpiCard` → `MetricCard` (sparklines pulled from `charts.netWorthTrajectory` slices, each card has a tooltip). `Donut` → `AllocationDonutChart`. `BarRow` → `InteractiveBarRow`. Three `AreaLine` instances → `FinancialAreaChart`, one with `showPeriodToggle`, one with `threshold` line at FIRE target.                                                                                                                                                                                                                                                                |
| `/workspace/[h]/forecast/baseline`     | 4 × `KpiCard` → `MetricCard` with mini sparklines sampled from the relevant projection arrays. Inline 800×160 `Sparkline` SVGs replaced with `FinancialLineChart` (`showPeriodToggle`, `pointsPerYear={12}`) for both the NW path and cash path. Standalone `AreaLine` upgraded to `FinancialAreaChart`. Helper functions `labelForMonth` and `sampleSeries` added so the chart x-axis labels line up with engine outputs.                                                                                                                                                    |
| `/workspace/[h]/forecast/fire`         | 4 × `KpiCard` (section [A]) → `MetricCard` with explanatory tooltips. `AreaLine` (section [C·1]) → `FinancialAreaChart` with `threshold={{ value: target, label: "FIRE target · $X.XM" }}`. The threshold crossover marker now visibly lands on the year the median path crosses your FIRE target. `LinearFireOnly` branch upgraded to `MetricCard` too.                                                                                                                                                                                                                     |
| `/workspace/[h]/forecast/montecarlo`   | 4 × stress-probability `KpiCard` → `MetricCard` with `tooltip` copy explaining each probability. Inline `PercentileBar` (a static SVG-ish block) replaced with `MonteCarloFanChart` — the fan band now responds to hover and surfaces interpolated $ at the scrubbed position. The local `PercentileBar` function was deleted.                                                                                                                                                                                                                                              |
| `/workspace/[h]/action/compare`       | 4 × headline `KpiCard` → `MetricCard` (WINNER, WINNER SURVIVAL, WINNER MEDIAN NW, VS HOLD) with a TrendingUp/Down delta on the VS HOLD card. The 6-column static `<table>` replaced wholesale with `<ScenarioMatrix>` — rank-1 candidate is auto-highlighted as `recommended`. Mobile stacking is handled by the underlying `MatrixGrid`.                                                                                                                                                                                                                                    |
| `/workspace/[h]/action/whatif/WhatIfPanel.tsx` | 4 × result `KpiCard` → `MetricCard` with tooltip copy. Existing tone/delta colouring preserved.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `/workspace/[h]/decision`              | Added `[D02·B] Strategy matrix` section directly under the existing `RiskStrip`. Renders a `DecisionMatrix` with 5 rows (Survival, Default, Liquidity stress, Negative equity, Refi pressure) × 1 candidate (Baseline hold, `recommended`). `higherIsBetter` is set on Survival so the tone bands flip correctly. Phase 3 will reuse the same matrix to hold side-by-side alternative strategies.                                                                                                                                                                            |

## API change

`MetricCard` accepts:

- `index?: string | number` (widened from `string`) so callers can pass
  positional indexes (`index={0}`).
- `value: number | string` (widened from `number`) so the WINNER card on
  `/action/compare` can display a candidate name as the headline value.

`formatValue` short-circuits to the raw string when `value` is a string,
so no caller has to bypass the format prop.

## What is NOT changed

- The landing page (per the session mandate).
- Backend, schema, or Supabase migrations.
- The old personal / live app under any path other than `fwl-commercial/`.
- Any data fetch logic (`getChartBundle`, `getSnapshot`, `runDecision`).
- Auto-deploy. The branch is updated on the fork only; PR #8 picks it up.

## Verification

- `npx tsc --noEmit` → exit 0
- `npm run build` → clean, all 19 routes generated, dashboard route
  bundles in the 149 kB First Load JS band (only +1–2 kB from baseline
  because all primitives share `framer-motion` already in the bundle).

### Browser QA

The Supabase-backed authenticated app cannot be exercised by a sandboxed
Playwright run without a seeded test account and credentials, neither of
which are available in this session. Verification was performed at the
type-checker and bundler level, plus visual reading of the rendered JSX
trees against the primitive props.

When a seeded test account is provisioned, the next pass should:

1. Visit `/workspace/<h>/overview` at 1440×900 and 390×844 and confirm
   `FinancialAreaChart` period toggle ↔ `MetricCard` sparklines redraw
   together.
2. Visit `/workspace/<h>/forecast/montecarlo` and confirm the
   `MonteCarloFanChart` scrubber reads $ correctly at every horizontal
   position.
3. Visit `/workspace/<h>/action/compare` and confirm `ScenarioMatrix`
   stacks one card per column on mobile with no horizontal scroll.

## Files in this commit

```
src/components/workspace/charts-interactive/chart-utils.ts          [new]
src/components/workspace/charts-interactive/FinancialLineChart.tsx  [new]
src/components/workspace/charts-interactive/FinancialAreaChart.tsx  [new]
src/components/workspace/charts-interactive/AllocationDonutChart.tsx[new]
src/components/workspace/charts-interactive/InteractiveBarRow.tsx   [new]
src/components/workspace/charts-interactive/MonteCarloFanChart.tsx  [new]
src/components/workspace/charts-interactive/ScenarioMatrix.tsx      [new]
src/components/workspace/charts-interactive/DecisionMatrix.tsx      [new]
src/components/workspace/charts-interactive/MetricCard.tsx          [new]
src/components/workspace/charts-interactive/InsightCard.tsx         [new]
src/components/workspace/charts-interactive/index.ts                [new]

src/app/workspace/[h]/overview/page.tsx                             [modified]
src/app/workspace/[h]/forecast/baseline/page.tsx                    [modified]
src/app/workspace/[h]/forecast/fire/page.tsx                        [modified]
src/app/workspace/[h]/forecast/montecarlo/page.tsx                  [modified]
src/app/workspace/[h]/action/compare/page.tsx                       [modified]
src/app/workspace/[h]/action/whatif/WhatIfPanel.tsx                 [modified]
src/app/workspace/[h]/decision/page.tsx                             [modified]

docs/dashboard_interactive_change_report.md                         [new]
```
