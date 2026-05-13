"use client";
import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Ambient mesh — slow-drifting cinematic gradient mesh.
 * Used behind hero / dark contrast section.
 * Designed to feel like atmosphere, not animation. Drift cycle = 18s.
 */
export function AmbientMesh({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "pointer-events-none absolute inset-0 -z-10",
        tone === "dark" ? "bg-mesh-ondark" : "bg-mesh",
        !reduce && "animate-mesh-drift",
        className,
      )}
      style={{ willChange: "transform, opacity" }}
    />
  );
}

/** Faint scan line overlay — for the dark contrast strip. */
export function ScanLines({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 opacity-60", className)}
      style={{
        backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 3px, rgba(255,255,255,0.015) 3px 4px)",
      }}
    />
  );
}

/** Soft top spotlight (hero). */
export function Spotlight({ className }: { className?: string }) {
  return <div aria-hidden className={cn("pointer-events-none absolute inset-0 spotlight -z-10", className)} />;
}

/** Bottom-right ember glow — sparingly used for warmth. */
export function EmberGlow({ className }: { className?: string }) {
  return <div aria-hidden className={cn("pointer-events-none absolute inset-0 ember-glow -z-10", className)} />;
}
