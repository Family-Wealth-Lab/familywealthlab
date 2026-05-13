"use client";
import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ChartLine } from "@/components/ui/ChartLine";
import { Counter } from "@/components/ui/Counter";

/**
 * HeroDashboard — v4. Cinematic floating glass card with animated chart,
 * parallax tilt on scroll, monospace data, ember live signal.
 */
export function HeroDashboard() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, -28]);
  const rotateX = useTransform(scrollY, [0, 600], [0, -2.2]);

  // Forecast band — P10 / P50 / P90
  const p50 = [2.41, 2.55, 2.72, 2.94, 3.18, 3.45, 3.78, 4.12, 4.48, 4.82];
  const p10 = [2.41, 2.46, 2.52, 2.58, 2.64, 2.70, 2.76, 2.82, 2.88, 2.94];
  const p90 = [2.41, 2.66, 2.95, 3.30, 3.72, 4.18, 4.74, 5.36, 6.12, 7.40];

  return (
    <motion.div
      ref={ref}
      style={{ y, rotateX, perspective: 1200, transformStyle: "preserve-3d" }}
      className="relative will-change-transform"
    >
      {/* Card frame */}
      <div className="card-cinematic overflow-hidden">
        {/* Header bar — system chrome */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-line bg-white/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="syslabel">
              <span className="mono text-ember-500">[01]</span>
              <span>FORECAST · HOUSEHOLD · FY26</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-caption text-ink-tertiary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ember-500 animate-pulse-soft" />
            <span className="mono">LIVE · 12:42</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-baseline justify-between gap-6">
            <div>
              <p className="syslabel">
                <span className="mono text-ember-500">[P50]</span>
                <span>PROJECTED NET WORTH · 20Y</span>
              </p>
              <div className="mt-3 flex items-baseline gap-3">
                <Counter
                  to={4.82}
                  decimals={2}
                  separator={false}
                  prefix="$"
                  suffix="M"
                  duration={1.4}
                  className="text-display text-ink-primary mono tracking-tightest"
                />
                <span className="inline-flex items-center gap-1 text-body-sm text-positive mono">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +18.4%
                </span>
              </div>
              <p className="mt-2 text-caption text-ink-quaternary mono">
                P10 $2.94M · P90 $7.40M · 5,000 PATHS
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="syslabel">
                <span className="mono text-ember-500">[T0]</span>
                <span>FIRE</span>
              </span>
              <Counter
                to={2039}
                separator={false}
                decimals={0}
                duration={1.2}
                delay={0.15}
                className="mt-1 text-h3 text-ink-primary mono"
              />
              <span className="text-caption text-positive mono">−4Y BASELINE</span>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-5 rounded-lg border border-line bg-bg-inset/60 px-3 pt-3 pb-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-eyebrow uppercase text-ink-quaternary mono">P10 — P50 — P90</span>
              <span className="text-eyebrow uppercase text-ink-quaternary mono">2026 → 2045</span>
            </div>
            <ChartLine
              data={p50}
              bandLow={p10}
              bandHigh={p90}
              stroke="#0B0F1A"
              fill="rgba(52, 70, 106, 0.10)"
              height={140}
              width={520}
              className="w-full h-32"
            />
          </div>

          {/* KPI row */}
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <Kpi label="SURVIVAL" value="94%" delta="+6pp" tone="positive" />
            <Kpi label="MAX DD"   value="−21%" delta="−3pp" tone="positive" />
            <Kpi label="LIQ P10"  value="$58K" delta="−$32K" tone="warning"  />
          </div>
        </div>
      </div>

      {/* Floating mini-panel — secondary depth layer */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:block absolute -right-6 -bottom-6 w-48 card-cinematic p-3.5"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="syslabel text-[0.65rem]">
            <span className="mono text-ember-500">[AI]</span>
            <span>SIGNAL</span>
          </span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-ember-500 animate-pulse-soft" />
        </div>
        <p className="text-caption text-ink-secondary leading-snug">
          Refinance window opens in <span className="mono text-ink-primary">47d</span>. Save <span className="mono text-positive">$1,840/mo</span>.
        </p>
      </motion.div>
    </motion.div>
  );
}

function Kpi({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "positive" | "warning" | "negative";
}) {
  const toneClass =
    tone === "positive" ? "text-positive" : tone === "warning" ? "text-warning" : "text-negative";
  return (
    <div className="rounded-md border border-line bg-white/70 p-3">
      <span className="text-eyebrow uppercase text-ink-quaternary mono">{label}</span>
      <div className="mt-1 text-h4 text-ink-primary mono">{value}</div>
      <div className={`text-caption mono ${toneClass}`}>{delta}</div>
    </div>
  );
}
