// src/components/contribution/MomentumIndicator.tsx
"use client";

import type { WeeklyVectorData, QuadrantId } from "./types";

interface MomentumIndicatorProps {
  momentum: number; // -100 to 100
  vectors: WeeklyVectorData[];
}

const quadrantLabels: Record<QuadrantId, string> = {
  problem: "Problem Space",
  gap: "Knowledge Gap",
  contribution: "Your Contribution",
  alignment: "Alignment",
};

export function MomentumIndicator({ momentum, vectors }: MomentumIndicatorProps) {
  const overallLabel =
    momentum > 15
      ? "Strong positive momentum"
      : momentum > 0
      ? "Positive but fragile"
      : momentum === 0
      ? "Neutral"
      : momentum > -15
      ? "Mild regression"
      : "Strong negative momentum";

  const barColor =
    momentum > 0
      ? "bg-emerald-500"
      : momentum < 0
      ? "bg-rose-500"
      : "bg-amber-500";

  const magnitude = Math.min(100, Math.abs(momentum));

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Weekly Momentum</h3>
        <div className="text-sm font-semibold">
          {momentum > 0 ? "+" : ""}
          {momentum}%
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{overallLabel}</p>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${magnitude}%` }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-1 text-[11px]">
        {vectors.map((v, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-muted-foreground">
              <span aria-hidden="true">➤</span>
              <span>{quadrantLabels[v.direction]}</span>
            </span>
            <span>
              {v.magnitude > 0 ? "+" : ""}
              {v.magnitude}% · {v.confidence}% conf.
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
