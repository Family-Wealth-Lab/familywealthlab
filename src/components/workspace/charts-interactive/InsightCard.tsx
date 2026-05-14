"use client";
/**
 * InsightCard — narrative-style card for AI/engine-derived insights.
 *
 * One headline, one supporting sentence, optional tags (severity-coloured),
 * optional reasoning line, optional CTA href. Hover lifts. Severity drives a
 * left rail colour (positive / warning / negative / neutral).
 */

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { EASE_OUT_EXPO } from "./chart-utils";

export type InsightSeverity = "positive" | "warning" | "negative" | "neutral";

interface Props {
  title: string;
  body: string;
  reason?: string;
  severity?: InsightSeverity;
  tags?: string[];
  href?: string;
  index?: string;
}

const RAIL: Record<InsightSeverity, string> = {
  positive: "bg-emerald-500",
  warning: "bg-ember-500",
  negative: "bg-rose-500",
  neutral: "bg-ink-quaternary",
};

const BADGE: Record<InsightSeverity, string> = {
  positive: "bg-emerald-50 text-emerald-700",
  warning: "bg-ember-50 text-ember-700",
  negative: "bg-rose-50 text-rose-700",
  neutral: "bg-bg-inset text-ink-tertiary",
};

export function InsightCard({
  title,
  body,
  reason,
  severity = "neutral",
  tags = [],
  href,
  index = "·",
}: Props) {
  const reduceMotion = useReducedMotion();

  const content = (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
      className="group relative pl-4 pr-4 sm:pr-5 py-4 sm:py-5 rounded-2xl border border-line bg-bg-base overflow-hidden hover:shadow-[0_10px_28px_-14px_rgba(11,15,26,0.20)] transition-shadow"
    >
      <span
        aria-hidden
        className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${RAIL[severity]}`}
      />
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="syslabel text-[0.62rem]">
          <span className="syslabel-bracket">[{index}]</span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-ember-500" />
            Insight
          </span>
        </div>
        {href && (
          <ArrowUpRight className="h-3.5 w-3.5 text-ink-quaternary group-hover:text-ember-600 transition-colors" />
        )}
      </div>
      <h3 className="text-body font-medium text-ink-primary text-pretty">{title}</h3>
      <p className="mt-1.5 text-body-sm text-ink-secondary text-pretty">{body}</p>
      {reason && (
        <p className="mt-2 text-caption text-ink-quaternary border-l-2 border-line/70 pl-2">
          {reason}
        </p>
      )}
      {tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <li
              key={t}
              className={`text-[0.65rem] mono uppercase tracking-wider px-1.5 py-0.5 rounded ${BADGE[severity]}`}
            >
              {t}
            </li>
          ))}
        </ul>
      )}
    </motion.article>
  );

  if (!href) return content;
  return (
    <Link href={href} className="block focus-ring rounded-2xl">
      {content}
    </Link>
  );
}
