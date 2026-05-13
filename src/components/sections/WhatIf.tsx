"use client";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Section, SystemLabel } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Home, Flame, TrendingDown, Scale, ChevronRight, ArrowRight } from "lucide-react";

interface Scenario {
  idx: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  outcomes: { label: string; value: string; delta: string; tone: "positive" | "warning" | "negative" }[];
  summary: { label: string; value: string };
}

const SCENARIOS: Scenario[] = [
  {
    idx: "S1",
    icon: Home,
    title: "Buy an investment property",
    desc: "Add a $980K Brisbane IP at 80% LVR, IO 5 years, 6.24% fixed.",
    outcomes: [
      { label: "P50 NW · 2045", value: "$5.24M", delta: "+$418K", tone: "positive" },
      { label: "FIRE year",     value: "2037",    delta: "−2.4y",  tone: "positive" },
      { label: "Liquidity P10", value: "$58K",    delta: "−$32K",  tone: "warning"  },
      { label: "Max drawdown",  value: "−27%",    delta: "+4pp",   tone: "negative" },
    ],
    summary: { label: "MEDIAN UPLIFT", value: "+$418K terminal NW" },
  },
  {
    idx: "S2",
    icon: Flame,
    title: "Retire at 45",
    desc: "Stop earning at 45, live off invested capital and super at 60.",
    outcomes: [
      { label: "Survival rate",    value: "82%",   delta: "−12pp",       tone: "warning"  },
      { label: "Required capital", value: "$3.1M", delta: "by age 45",   tone: "positive" },
      { label: "Bridge years",     value: "15y",   delta: "Cash + ETF",  tone: "positive" },
      { label: "Super at 60",      value: "$1.4M", delta: "preservation",tone: "positive" },
    ],
    summary: { label: "SURVIVAL", value: "82% across 5,000 paths" },
  },
  {
    idx: "S3",
    icon: TrendingDown,
    title: "Rates hit 8%",
    desc: "Cash rate +200bps for 18 months · IO refinance blocked under APRA 3% buffer.",
    outcomes: [
      { label: "Repayments Δ",    value: "+$2,140/mo", delta: "vs baseline",  tone: "negative" },
      { label: "Buffer drawdown", value: "−$38K",      delta: "13mo to OK",   tone: "warning"  },
      { label: "Forecast NW",     value: "$4.41M",     delta: "−$410K",       tone: "negative" },
      { label: "Recovery",        value: "2031",       delta: "to baseline",  tone: "positive" },
    ],
    summary: { label: "STRESS TEST", value: "Survives 18mo · tight" },
  },
  {
    idx: "S4",
    icon: Scale,
    title: "Invest vs pay down debt",
    desc: "Compare $48K/yr surplus into VGS DCA vs PPOR mortgage offset over 15 years.",
    outcomes: [
      { label: "Invest path NW",   value: "$5.61M",     delta: "+$280K",       tone: "positive" },
      { label: "Offset path NW",   value: "$5.33M",     delta: "baseline",     tone: "positive" },
      { label: "Tax efficiency",   value: "Invest +$24K", delta: "CGT 50%",    tone: "positive" },
      { label: "Risk-adjusted",    value: "Offset −2σ", delta: "less volatile",tone: "warning"  },
    ],
    summary: { label: "TILT", value: "Invest +$280K, w/ volatility" },
  },
];

export function WhatIf() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <Section spacing="lg" id="whatif">
      <Reveal className="max-w-3xl">
        <SystemLabel index="07" label="WHAT-IF ENGINE" />
        <h2 className="mt-4 text-display text-ink-primary text-balance tracking-tighter">
          Model any household decision <span className="text-ember-500">in seconds.</span>
        </h2>
        <p className="mt-5 text-lead text-ink-tertiary text-pretty max-w-2xl">
          Every &quot;what if&quot; your household has ever asked — simulated against your
          own real numbers, with full tax, cashflow, and liquidity awareness.
        </p>
      </Reveal>

      <div className="mt-12 grid md:grid-cols-2 gap-3">
        {SCENARIOS.map((s, i) => {
          const isOpen = open === i;
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className={`group w-full text-left card-cinematic p-6 transition-all duration-300 ease-calm focus-ring ${
                  isOpen ? "border-ember-500/40 ring-1 ring-ember-500/10" : "hover:border-line-strong"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-bg-inset shrink-0 transition-colors ${isOpen ? "border-ember-500/40 text-ember-500" : "border-line text-ink-tertiary"}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <span className="syslabel text-[0.65rem]">
                        <span className="mono text-ember-500">[{s.idx}]</span>
                        <span>SCENARIO</span>
                      </span>
                      <h3 className="mt-1 text-h3 text-ink-primary tracking-tight">{s.title}</h3>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 text-ink-quaternary shrink-0 mt-1 transition-transform duration-300 ${
                      isOpen ? "rotate-90 text-ember-500" : "group-hover:translate-x-0.5"
                    }`}
                  />
                </div>

                <p className="mt-4 text-body-sm text-ink-tertiary">{s.desc}</p>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="open"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 pt-5 hairline">
                        <div className="flex items-baseline justify-between gap-3 mb-4">
                          <p className="syslabel text-[0.6rem]">
                            <span className="mono text-ember-500">·</span>
                            <span>{s.summary.label}</span>
                          </p>
                          <p className="text-body-sm text-ink-primary mono">{s.summary.value}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {s.outcomes.map((o, oi) => (
                            <motion.div
                              key={o.label}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: oi * 0.06 + 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                              className="rounded-md border border-line bg-bg-inset/60 px-3 py-2.5"
                            >
                              <p className="text-[0.6rem] uppercase text-ink-quaternary mono tracking-wider">{o.label}</p>
                              <p className="mt-1 text-h4 text-ink-primary mono">{o.value}</p>
                              <p
                                className={`text-[0.7rem] mono ${
                                  o.tone === "positive"
                                    ? "text-positive"
                                    : o.tone === "warning"
                                    ? "text-warning"
                                    : "text-negative"
                                }`}
                              >
                                {o.delta}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                        <div className="mt-5 inline-flex items-center gap-1.5 text-body-sm text-ink-primary group">
                          <span className="mono text-[0.7rem] text-ember-500">[{s.idx}.RUN]</span>
                          <span>Run this scenario</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
