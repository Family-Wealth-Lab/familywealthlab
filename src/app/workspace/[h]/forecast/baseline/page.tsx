import { getSessionUser } from "@/lib/auth";
import { getSnapshot } from "@/lib/snapshot";
import { runDecision } from "@/lib/engine/runDecision";
import {
  SurfaceCard, CardHeader, MetricRow, EmptyState,
} from "@/components/workspace/cards";
import { PageHeader } from "@/components/workspace/PageHeader";
import {
  FinancialAreaChart,
  FinancialLineChart,
  MetricCard,
} from "@/components/workspace/charts-interactive";
import { getChartBundle } from "@/lib/dashboard/charts";
import { fmtMoney, fmtMoneyCompact, fmtNumber } from "@/components/workspace/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Baseline forecast — Family Wealth Lab" };

interface Props { params: { h: string } }

/**
 * Baseline forecast — reads the engine's median deterministic-baseline path
 * (no deltas applied). Surfaces the median net-worth and median cash paths
 * across the planning horizon. No fabricated numbers — every value comes
 * from a `runScenarioV2` call against the ledger.
 */
export default async function BaselineForecastPage({ params }: Props) {
  await getSessionUser();

  const snap = await getSnapshot(params.h);
  if (!snap.engineReadiness.canRunBaseline) {
    return (
      <div className="space-y-8">
        <PageHeader
          index="[04·01]" eyebrow="Forecast" title="Baseline forecast"
          body="The engine needs a minimum ledger before it can run a baseline."
        />
        <EmptyState
          index="·" eyebrow="Engine not ready"
          title="The baseline forecast can't run yet"
          body={`Still missing: ${snap.engineReadiness.blockers.join(", ")}. Add the remaining inputs and the engine activates automatically.`}
          ctaLabel="Open Snapshot" ctaHref={`/workspace/${params.h}/overview`}
        />
      </div>
    );
  }

  const [{ result }, charts] = await Promise.all([
    runDecision(params.h),
    getChartBundle(params.h),
  ]);
  const horizonYears = Math.round(result.horizonMonths / 12);
  const finalNwIdx = result.medianNwPath.length - 1;
  const finalCashIdx = result.medianCashPath.length - 1;
  const finalNw = finalNwIdx >= 0 ? result.medianNwPath[finalNwIdx] : null;
  const finalCash = finalCashIdx >= 0 ? result.medianCashPath[finalCashIdx] : null;
  const cagr = finalNw != null && result.initialNetWorth > 0
    ? Math.pow(finalNw / result.initialNetWorth, 1 / horizonYears) - 1
    : null;
  const nwDelta = finalNw != null ? finalNw - result.initialNetWorth : null;

  return (
    <div className="space-y-10">
      <PageHeader
        index="[04·01]" eyebrow="Forecast" title="Baseline forecast"
        body={`Median ${horizonYears}-year projection from ${result.simulationCount.toLocaleString()} simulated futures. No deltas applied — this is your trajectory if nothing changes.`}
      />

      {/* ── [A] Headline KPIs ─────────────────────────────────── */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard index="·" label="NET WORTH TODAY" value={result.initialNetWorth} format="moneyCompact"
          tooltip="Today's ledger-derived net worth — the starting point for every projected path." />
        <MetricCard index="·" label={`MEDIAN NW · ${horizonYears}y`} value={finalNw ?? 0} format="moneyCompact"
          sub={nwDelta != null ? `${nwDelta >= 0 ? "+" : ""}${fmtMoney(nwDelta)} vs today` : undefined}
          tone={nwDelta == null ? "neutral" : nwDelta >= 0 ? "positive" : "negative"}
          sparkline={sampleSeries(result.medianNwPath, 12)}
          tooltip="Median net worth at the final horizon month across every simulated path. Dispersion lives on the Monte Carlo page." />
        <MetricCard index="·" label="MEDIAN CAGR" value={cagr ?? 0} format="percent"
          tone={cagr == null ? "neutral" : cagr >= 0 ? "positive" : "negative"}
          tooltip="Compound annual growth rate of the median net-worth path — a single-number summary of trajectory." />
        <MetricCard index="·" label={`MEDIAN CASH · ${horizonYears}y`} value={finalCash ?? 0} format="moneyCompact"
          sparkline={sampleSeries(result.medianCashPath, 12)}
          tooltip="Liquid cash at the end of the horizon in the median path — read the liquidity story." />
      </section>

      {/* ── [B] Net worth trajectory ──────────────────────────── */}
      <SurfaceCard>
        <CardHeader index="[B·1]" eyebrow="Trajectory" title="Median net-worth path" />
        <p className="text-caption text-ink-tertiary -mt-2 mb-4">
          Across {result.simulationCount.toLocaleString()} simulated paths, the median net worth at each month. No fan band here — see Monte Carlo for the dispersion.
        </p>
        <FinancialLineChart
          xLabels={Array.from({ length: result.medianNwPath.length }, (_, i) => labelForMonth(i, horizonYears, result.medianNwPath.length))}
          series={[
            { label: "Median net worth", values: result.medianNwPath, color: "#C97030", fill: true },
          ]}
          height={200}
          showPeriodToggle
          pointsPerYear={12}
          ariaLabel="Median net worth path"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 mt-6">
          <MetricRow label="Today" value={fmtMoney(result.initialNetWorth)} />
          <MetricRow label={`Year ${Math.min(5, horizonYears)}`} value={fmtMoney(pathAt(result.medianNwPath, Math.min(60, result.medianNwPath.length - 1)))} />
          <MetricRow label={`Year ${horizonYears}`} value={finalNw != null ? fmtMoney(finalNw) : "—"} />
          <MetricRow label="CAGR" value={cagr != null ? `${fmtNumber(cagr * 100, 2)}%` : "—"} />
        </div>
      </SurfaceCard>

      {/* ── [C] Cash trajectory ────────────────────────────────── */}
      <SurfaceCard>
        <CardHeader index="[B·2]" eyebrow="Liquidity" title="Median cash path" />
        <p className="text-caption text-ink-tertiary -mt-2 mb-4">
          Cash on hand at each month in the median path. A flat or rising curve means your surplus is funding both investment and buffer; a falling curve means cash is being drawn down.
        </p>
        <FinancialLineChart
          xLabels={Array.from({ length: result.medianCashPath.length }, (_, i) => labelForMonth(i, horizonYears, result.medianCashPath.length))}
          series={[
            { label: "Median cash", values: result.medianCashPath, color: "#3FA88F", fill: true },
          ]}
          height={200}
          showPeriodToggle
          pointsPerYear={12}
          ariaLabel="Median cash path"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 mt-6">
          <MetricRow label="Today" value={fmtMoneyCompact(snap.wealth.cashToday)} />
          <MetricRow label={`Year ${Math.min(5, horizonYears)}`} value={fmtMoneyCompact(pathAt(result.medianCashPath, Math.min(60, result.medianCashPath.length - 1)))} />
          <MetricRow label={`Year ${horizonYears}`} value={finalCash != null ? fmtMoneyCompact(finalCash) : "—"} />
          <MetricRow label="Surplus (mo)" value={fmtMoney(snap.cashflow.monthlySurplus)} />
        </div>
      </SurfaceCard>

      {/* ── [C] Composition trajectory ─────────────────────── */}
      <SurfaceCard>
        <CardHeader index="[C·1]" eyebrow="Composition" title="Asset trajectory by class" />
        <p className="text-caption text-ink-tertiary -mt-2 mb-4">
          Deterministic projection of property, investments, super and cash over the next 20 years.
        </p>
        {charts.netWorthTrajectory.length === 0 ? (
          <EmptyState index="·" eyebrow="Empty" title="Awaiting data" body="Composition trajectory activates once your ledger has assets." />
        ) : (
          <FinancialAreaChart
            xLabels={charts.netWorthTrajectory.map((p) => String(p.year))}
            series={[
              { label: "Property",    values: charts.netWorthTrajectory.map((p) => p.property),       color: "#3FA88F", fill: true },
              { label: "Investments", values: charts.netWorthTrajectory.map((p) => p.investments),    color: "#7B6CF6" },
              { label: "Super",       values: charts.netWorthTrajectory.map((p) => p.superannuation), color: "#E0A040" },
              { label: "Cash",        values: charts.netWorthTrajectory.map((p) => p.cash),           color: "#5085D9" },
            ]}
            height={260}
            showPeriodToggle
            pointsPerYear={1}
            ariaLabel="Asset class trajectory chart"
          />
        )}
      </SurfaceCard>

      {result.warnings.length > 0 && (
        <SurfaceCard tone="inset">
          <CardHeader index="[D·1]" eyebrow="Diagnostic" title="Engine notes" />
          <ul className="mt-2 space-y-1 text-body-sm text-ink-secondary list-disc list-inside">
            {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </SurfaceCard>
      )}
    </div>
  );
}

function pathAt(arr: number[], idx: number): number {
  if (!arr.length) return 0;
  const safe = Math.min(Math.max(0, idx), arr.length - 1);
  return arr[safe];
}

function labelForMonth(i: number, horizonYears: number, total: number): string {
  if (total <= 1) return "";
  const year = (i / Math.max(1, total - 1)) * horizonYears;
  return `Yr ${year.toFixed(0)}`;
}

function sampleSeries(arr: number[], maxPoints: number): number[] {
  if (arr.length <= maxPoints) return arr;
  const stride = Math.max(1, Math.floor(arr.length / maxPoints));
  const out: number[] = [];
  for (let i = 0; i < arr.length; i += stride) out.push(arr[i]);
  if (out[out.length - 1] !== arr[arr.length - 1]) out.push(arr[arr.length - 1]);
  return out;
}
