// src/components/contribution/QuadrantCard.tsx
"use client";

import type { QuadrantData } from "./types";

interface QuadrantCardProps {
  data: QuadrantData;
  compact?: boolean;
}

export function QuadrantCard({ data, compact = false }: QuadrantCardProps) {
  const momentumColor =
    data.momentum > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : data.momentum < 0
      ? "text-rose-600 dark:text-rose-400"
      : "text-amber-600 dark:text-amber-400";

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card/80 p-4 shadow-sm transition hover:shadow-md">
      {/* Background tint */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{ backgroundColor: data.color }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sm"
            style={{
              backgroundColor: `${data.color}20`,
              color: data.color,
            }}
          >
            <span aria-hidden="true">{data.icon}</span>
          </div>
          <div>
            <h3 className={compact ? "text-sm font-semibold" : "text-base font-semibold"}>
              {data.title}
            </h3>
            {!compact && (
              <p className="mt-1 text-xs text-muted-foreground">
                {data.description}
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className={compact ? "text-lg font-bold" : "text-2xl font-bold"}>
            {data.progress}%
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Clarity: <span className="font-semibold">{data.clarity}%</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full"
            style={{
              width: `${data.progress}%`,
              backgroundColor: data.color,
            }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>Progress</span>
          <span>{data.progress}% complete</span>
        </div>
      </div>

      {/* Momentum + updated */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <span>Momentum:</span>
          <span className={momentumColor}>
            {data.momentum > 0 ? "+" : ""}
            {data.momentum}%
          </span>
        </span>
        {!compact && (
          <span className="text-muted-foreground">
            Updated {data.lastUpdated.toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Insights / Risks */}
      {!compact && (data.insights.length > 0 || data.risks.length > 0) && (
        <div className="mt-3 space-y-1 text-[11px]">
          {data.insights.slice(0, 1).map((insight, i) => (
            <div key={`insight-${i}`} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-700 dark:text-emerald-300">
                {insight}
              </span>
            </div>
          ))}
          {data.risks.slice(0, 1).map((risk, i) => (
            <div key={`risk-${i}`} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="text-amber-700 dark:text-amber-300">
                {risk}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
