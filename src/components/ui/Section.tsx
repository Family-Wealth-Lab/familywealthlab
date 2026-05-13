import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Make the section background dark (deep navy) */
  tone?: "light" | "dark";
}

export function Section({
  className,
  spacing = "md",
  tone = "light",
  children,
  ...props
}: SectionProps) {
  const pad =
    spacing === "xs" ? "py-12 sm:py-16"
    : spacing === "sm" ? "py-16 sm:py-20"
    : spacing === "md" ? "py-20 sm:py-24"
    : spacing === "lg" ? "py-24 sm:py-32"
    : "py-28 sm:py-40";
  const toneClass = tone === "dark" ? "bg-bg-deep text-ink-ondark" : "";
  return (
    <section className={cn("relative", pad, toneClass, className)} {...props}>
      <div className="container mx-auto relative">{children}</div>
    </section>
  );
}

/* Classic editorial eyebrow with leading line. */
interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}
export function Eyebrow({ className, children, ...props }: EyebrowProps) {
  return (
    <span className={cn("section-eyebrow", className)} {...props}>
      {children}
    </span>
  );
}

/* System label — "[01] FORECAST". Monospace, bracketed. Linear/Bloomberg DNA. */
interface SystemLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  index: string;        // e.g. "01"
  label: string;        // e.g. "FORECAST"
  accent?: "ember" | "graphite";
}
export function SystemLabel({ index, label, accent = "ember", className, ...props }: SystemLabelProps) {
  const accentColor = accent === "ember" ? "text-ember-500" : "text-graphite-500";
  return (
    <span className={cn("syslabel", className)} {...props}>
      <span className={cn("mono", accentColor)}>[{index}]</span>
      <span>{label}</span>
    </span>
  );
}
