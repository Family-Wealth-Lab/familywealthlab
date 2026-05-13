"use client";
import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { fadeUp, blurUp, stagger as makeStagger, t, viewport } from "@/lib/motion";

type Mode = "fadeUp" | "blurUp" | "fadeIn";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  amount?: number;
  variants?: Variants;
  mode?: Mode;
}

const modeMap: Record<Mode, Variants> = {
  fadeUp,
  blurUp,
  fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: t.short } },
};

export function Reveal({
  children,
  delay = 0,
  className,
  amount = 0.2,
  variants,
  mode = "fadeUp",
  ...props
}: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: viewport.once, amount }}
      variants={variants ?? modeMap[mode]}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}

export function Stagger({ children, className, delay = 0.06, amount = 0.2 }: StaggerProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={makeStagger(delay)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, mode = "fadeUp" }: { children: React.ReactNode; className?: string; mode?: Mode }) {
  return (
    <motion.div variants={modeMap[mode]} className={className}>
      {children}
    </motion.div>
  );
}
