"use client";
/**
 * ScenarioMatrix — interactive side-by-side comparison of scenario candidates.
 *
 * Built on top of `MatrixGrid` so it inherits the responsive desktop-grid +
 * mobile-stack pattern. Adds a thin façade that takes a typed list of
 * candidates and renders the rows we want for the Scenario Compare page.
 */

import * as React from "react";
import { MatrixGrid, type MatrixCell, type MatrixColumn, type MatrixRow } from "@/components/ui/MatrixGrid";
import { fmtCompact } from "./chart-utils";

export interface ScenarioCandidate {
  id: string;
  name: string;
  caption?: string;
  survivalPct: number;
  medianTerminalNw: number;
  defaultProb: number;
  liquidityProb: number;
  /** Mark as recommended (typically the top-ranked). */
  recommended?: boolean;
}

interface Props {
  candidates: ScenarioCandidate[];
  cornerLabel?: string;
  className?: string;
}

const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

function survivalTone(p: number): "positive" | "warning" | "negative" | "neutral" {
  if (p >= 0.9) return "positive";
  if (p >= 0.75) return "warning";
  return "negative";
}
function defaultTone(p: number): "positive" | "warning" | "negative" | "neutral" {
  if (p <= 0.05) return "positive";
  if (p <= 0.2) return "warning";
  return "negative";
}
function liquidityTone(p: number): "positive" | "warning" | "negative" | "neutral" {
  if (p <= 0.1) return "positive";
  if (p <= 0.3) return "warning";
  return "negative";
}

export function ScenarioMatrix({ candidates, cornerLabel = "SCENARIOS", className }: Props) {
  const columns: MatrixColumn[] = candidates.map((c) => ({
    label: c.name.toUpperCase(),
    caption: c.caption,
    recommended: !!c.recommended,
  }));

  const survivalRow: MatrixRow = {
    label: "Survival probability",
    caption: "ACROSS HORIZON",
    cells: candidates.map<MatrixCell>((c) => ({
      value: fmtPct(c.survivalPct),
      tone: survivalTone(c.survivalPct),
    })),
  };
  const medianRow: MatrixRow = {
    label: "Median terminal NW",
    caption: "P50",
    cells: candidates.map<MatrixCell>((c) => ({
      value: fmtCompact(c.medianTerminalNw),
      tone: c.recommended ? "positive" : "neutral",
    })),
  };
  const defaultRow: MatrixRow = {
    label: "Default probability",
    caption: "LOWER IS BETTER",
    cells: candidates.map<MatrixCell>((c) => ({
      value: fmtPct(c.defaultProb),
      tone: defaultTone(c.defaultProb),
    })),
  };
  const liquidityRow: MatrixRow = {
    label: "Liquidity stress",
    caption: "BUFFER BREACH",
    cells: candidates.map<MatrixCell>((c) => ({
      value: fmtPct(c.liquidityProb),
      tone: liquidityTone(c.liquidityProb),
    })),
  };

  return (
    <MatrixGrid
      columns={columns}
      rows={[survivalRow, medianRow, defaultRow, liquidityRow]}
      cornerLabel={cornerLabel}
      className={className}
    />
  );
}
