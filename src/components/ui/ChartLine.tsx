"use client";
import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface ChartLineProps {
  /** Series of values; will be normalized to fit. */
  data: number[];
  /** SVG viewbox aspect — width and height. */
  width?: number;
  height?: number;
  /** Stroke color (CSS) for the main line. */
  stroke?: string;
  /** Fill color (CSS rgba) under the line. */
  fill?: string;
  /** Optional confidence band — values define ±range. */
  bandLow?: number[];
  bandHigh?: number[];
  /** Show baseline ticks. */
  showAxis?: boolean;
  /** Axis labels along the bottom (must match data length or be left empty). */
  axisLabels?: string[];
  className?: string;
}

/**
 * ChartLine — premium animated chart that draws on view-enter.
 * The path uses stroke-dashoffset to "draw" itself in 1.2s with calm easing.
 * The band fades in 200ms after. Tiny ticks at the baseline are static.
 */
export function ChartLine({
  data,
  width = 560,
  height = 200,
  stroke = "#34466A",
  fill = "rgba(52, 70, 106, 0.10)",
  bandLow,
  bandHigh,
  showAxis = false,
  axisLabels,
  className,
}: ChartLineProps) {
  const ref = React.useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();

  const padX = 8;
  const padY = 12;
  const inner = { w: width - padX * 2, h: height - padY * 2 - (showAxis ? 16 : 0) };

  const allValues = [...data, ...(bandLow ?? []), ...(bandHigh ?? [])];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;

  const xAt = (i: number) => padX + (data.length === 1 ? inner.w / 2 : (i / (data.length - 1)) * inner.w);
  const yAt = (v: number) => padY + inner.h - ((v - min) / range) * inner.h;

  const linePath = data.map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(2)} ${yAt(v).toFixed(2)}`).join(" ");

  let bandPath: string | null = null;
  if (bandLow && bandHigh && bandLow.length === data.length && bandHigh.length === data.length) {
    const top = bandHigh.map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(2)} ${yAt(v).toFixed(2)}`).join(" ");
    const bottom = bandLow.map((v, i) => `L ${xAt(i).toFixed(2)} ${yAt(v).toFixed(2)}`).reverse().join(" ");
    bandPath = `${top} ${bottom} Z`;
  }

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      {/* Grid baseline */}
      <line
        x1={padX} x2={width - padX}
        y1={padY + inner.h} y2={padY + inner.h}
        stroke="rgba(20,28,46,0.08)" strokeWidth={1}
      />
      {/* Horizontal grid */}
      <line x1={padX} x2={width - padX} y1={padY + inner.h * 0.66} y2={padY + inner.h * 0.66} stroke="rgba(20,28,46,0.05)" strokeWidth={1} strokeDasharray="2 4" />
      <line x1={padX} x2={width - padX} y1={padY + inner.h * 0.33} y2={padY + inner.h * 0.33} stroke="rgba(20,28,46,0.05)" strokeWidth={1} strokeDasharray="2 4" />

      {/* Confidence band */}
      {bandPath && (
        <motion.path
          d={bandPath}
          fill={fill}
          initial={{ opacity: 0 }}
          animate={inView || reduce ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      {/* Main line — drawn */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
        animate={inView || reduce ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{
          pathLength: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.3 },
        }}
      />

      {/* End dot */}
      <motion.circle
        cx={xAt(data.length - 1)}
        cy={yAt(data[data.length - 1])}
        r={3}
        fill={stroke}
        initial={{ opacity: 0, scale: 0 }}
        animate={inView || reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        transition={{ duration: 0.4, delay: reduce ? 0 : 1.05, ease: [0.34, 1.56, 0.64, 1] }}
      />

      {/* Axis labels */}
      {showAxis && axisLabels && (
        <g>
          {axisLabels.map((l, i) => (
            <text
              key={i}
              x={xAt(Math.floor((data.length - 1) * (i / (axisLabels.length - 1))))}
              y={height - 2}
              textAnchor="middle"
              fontSize={10}
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fill="rgba(20,28,46,0.45)"
            >
              {l}
            </text>
          ))}
        </g>
      )}
    </svg>
  );
}
