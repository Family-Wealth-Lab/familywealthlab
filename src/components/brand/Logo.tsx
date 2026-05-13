import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  withWordmark?: boolean;
  size?: number;
  tone?: "light" | "dark";
}

/**
 * Family Wealth Lab mark — v4.
 * A stacked ledger / signal stack. Top accent line is ember (warm signal),
 * descending dark lines = data layers stacking into clarity.
 * Monochromatic frame, single warm accent line.
 */
export function Logo({ className, withWordmark = false, size = 22, tone = "light" }: LogoProps) {
  const onDark = tone === "dark";
  const frameFill = onDark ? "#11162A" : "#FFFFFF";
  const frameStroke = onDark ? "rgba(255,255,255,0.14)" : "rgba(20,28,46,0.18)";
  const inkLine = onDark ? "#F4F5F7" : "#0B0F1A";
  const inkOp = (op: number) => `${op}`;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Family Wealth Lab"
        className="shrink-0"
      >
        <rect x="0.5" y="0.5" width="23" height="23" rx="6" fill={frameFill} stroke={frameStroke} />
        {/* Top ember accent — the warm signal line */}
        <rect x="6" y="6" width="12" height="1.5" rx="0.75" fill="#E26F2D" />
        {/* Data stack */}
        <rect x="6" y="10" width="12" height="1.5" rx="0.75" fill={inkLine} opacity={inkOp(0.85)} />
        <rect x="6" y="14" width="9"  height="1.5" rx="0.75" fill={inkLine} opacity={inkOp(0.55)} />
        <rect x="6" y="18" width="6"  height="1.5" rx="0.75" fill={inkLine} opacity={inkOp(0.30)} />
      </svg>
      {withWordmark && (
        <span className={cn("text-body-sm font-medium tracking-tight", onDark ? "text-ink-ondark" : "text-ink-primary")}>
          Family Wealth Lab
        </span>
      )}
    </span>
  );
}
