"use client";
import * as React from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

interface CounterProps {
  to: number;
  /** Prefix like "$" */
  prefix?: string;
  /** Suffix like "M", "K", "%" */
  suffix?: string;
  /** Decimals to show */
  decimals?: number;
  /** Format with thousands separator */
  separator?: boolean;
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before animation starts */
  delay?: number;
  className?: string;
}

function formatNumber(n: number, decimals: number, separator: boolean) {
  const fixed = n.toFixed(decimals);
  if (!separator) return fixed;
  const [int, dec] = fixed.split(".");
  const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? `${withSep}.${dec}` : withSep;
}

/**
 * Counter — animates from 0 to `to` when scrolled into view.
 * Uses a spring for the easing feel (not linear). Respects prefers-reduced-motion.
 */
export function Counter({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  separator = true,
  duration = 1.4,
  delay = 0,
  className,
}: CounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();

  const mv = useMotionValue(0);
  const spring = useSpring(mv, {
    stiffness: 70,
    damping: 22,
    duration: duration * 1000,
  });
  const display = useTransform(spring, (v) => `${prefix}${formatNumber(v, decimals, separator)}${suffix}`);
  const [text, setText] = React.useState(`${prefix}${formatNumber(0, decimals, separator)}${suffix}`);

  React.useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setText(`${prefix}${formatNumber(to, decimals, separator)}${suffix}`);
      return;
    }
    const id = setTimeout(() => mv.set(to), delay * 1000);
    return () => clearTimeout(id);
  }, [inView, to, mv, prefix, suffix, decimals, separator, delay, reduce]);

  React.useEffect(() => {
    if (reduce) return;
    const unsub = display.on("change", (v) => setText(v));
    return () => unsub();
  }, [display, reduce]);

  return (
    <motion.span ref={ref} className={className}>
      {text}
    </motion.span>
  );
}
