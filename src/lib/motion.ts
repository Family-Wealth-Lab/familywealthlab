import type { Variants, Transition } from "framer-motion";

/**
 * Motion philosophy — v4. Cinematic but calm.
 * - Calm easing baseline, with one expressive curve for hero entrances
 * - Adds blur reveal, parallax, draw, and stagger primitives
 * - All motion respects prefers-reduced-motion (handled in globals.css)
 */

export const ease = {
  calm:    [0.22, 1, 0.36, 1] as [number, number, number, number],
  precise: [0.4, 0, 0.2, 1] as [number, number, number, number],
  spring:  [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  bloom:   [0.16, 1, 0.3, 1] as [number, number, number, number],
  expoOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

export const duration = {
  micro: 0.18,
  short: 0.32,
  base:  0.5,
  long:  0.7,
  hero:  1.0,
};

export const t = {
  base:  { duration: duration.base,  ease: ease.calm } as Transition,
  short: { duration: duration.short, ease: ease.calm } as Transition,
  long:  { duration: duration.long,  ease: ease.calm } as Transition,
  hero:  { duration: duration.hero,  ease: ease.bloom } as Transition,
};

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: t.base },
};

export const fadeUpSlow: Variants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: t.long },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: t.short },
};

/** Reveal with subtle blur — cinematic. */
export const blurUp: Variants = {
  hidden:  { opacity: 0, y: 14, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.long, ease: ease.bloom } },
};

/** Hero entrance — bigger travel, expo-out. */
export const heroIn: Variants = {
  hidden:  { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.hero, ease: ease.bloom } },
};

/** Scale-in (cards, dashboards). */
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.97, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: duration.hero, ease: ease.bloom } },
};

/** Stagger container. */
export const stagger = (delay = 0.06, delayChildren = 0.05): Variants => ({
  hidden:  {},
  visible: {
    transition: { staggerChildren: delay, delayChildren },
  },
});

/** Item used inside a staggered list. */
export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: t.base },
};

/** Standard view-trigger config — fires once when 20% visible. */
export const viewport = { once: true, amount: 0.2 } as const;
export const viewportEarly = { once: true, amount: 0.1 } as const;
