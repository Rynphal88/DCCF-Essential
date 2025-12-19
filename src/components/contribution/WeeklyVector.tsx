// src/components/contribution/WeeklyVector.tsx
"use client";

import type { WeeklyVectorData, QuadrantData } from "./types";

interface WeeklyVectorProps {
  vector: WeeklyVectorData;
  quadrant: QuadrantData;
}

export function WeeklyVector({ vector, quadrant }: WeeklyVectorProps) {
  const impactLabel =
    vector.impact === "high"
      ? "High impact"
      : vector.impact === "medium"
      ? "Medium impact"
      : "Low impact";

  const impactColor =
    vector.impact === "high"
      ? "text-emerald-600 dark:text-emerald-400"
      : vector.impact === "medium"
      ? "text-amber-600 dark:text-amber-400"
      : "text-muted-foreground";

  const magnitude = Math.min(100, Math.abs(vector.magnitude));

  return (
    <div className="rounded-xl border bg-card p-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{quadrant.title}</span>
        <span className={impactColor}>{impactLabel}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Direction: {vector.magnitude > 0 ? "toward" : "away from"}{" "}
        {quadrant.title.toLowerCase()}
      </p>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground/70"
          style={{ width: `${magnitude}%` }}
        />
      </div>

      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          Magnitude: {vector.magnitude > 0 ? "+" : ""}
          {vector.magnitude}%
        </span>
        <span>Confidence: {vector.confidence}%</span>
      </div>
    </div>
  );
}
