"use client";
import * as React from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onAnimationStart" | "onDragStart" | "onDrag" | "onDragEnd"> {
  /** Pull strength multiplier — 0.3 is subtle, 0.5 is strong. */
  strength?: number;
  /** Disable the effect (used on mobile or when reducing motion). */
  disabled?: boolean;
}

/**
 * Magnetic wrapper — children are pulled gently toward the pointer.
 * Used around primary CTAs to add weight without being flashy.
 */
export function Magnetic({
  children,
  className,
  strength = 0.35,
  disabled = false,
  ...props
}: MagneticProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.6 });
  const reduce = useReducedMotion();
  const inactive = disabled || reduce;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (inactive || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={cn("inline-flex", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
