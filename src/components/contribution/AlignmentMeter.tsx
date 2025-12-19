// src/components/contribution/AlignmentMeter.tsx
"use client";

interface AlignmentMeterProps {
  alignment: number; // 0–100
  drift: number;     // 0–100
}

export function AlignmentMeter({ alignment, drift }: AlignmentMeterProps) {
  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

  const safeAlignment = clamp(alignment, 0, 100);
  const safeDrift = clamp(drift, 0, 100);

  const alignmentColor =
    safeAlignment >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : safeAlignment >= 60
      ? "text-amber-600 dark:text-amber-400"
      : "text-rose-600 dark:text-rose-400";

  const driftColor =
    safeDrift <= 15
      ? "text-emerald-600 dark:text-emerald-400"
      : safeDrift <= 30
      ? "text-amber-600 dark:text-amber-400"
      : "text-rose-600 dark:text-rose-400";

  return (
    <div className="space-y-4">
      {/* Alignment bar */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <span aria-hidden="true">🎯</span>
            <span>Research–Contribution Alignment</span>
          </span>
          <span className={`font-semibold ${alignmentColor}`}>
            {safeAlignment}%
          </span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500"
            style={{ width: `${safeAlignment}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>Misaligned</span>
          <span>Partial</span>
          <span>Strong</span>
          <span>Perfect</span>
        </div>
      </div>

      {/* Drift bar */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <span aria-hidden="true">⚠️</span>
            <span>Research Drift</span>
          </span>
          <span className={`font-semibold ${driftColor}`}>{safeDrift}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full"
            style={{
              width: `${safeDrift}%`,
              backgroundColor:
                safeDrift <= 15
                  ? "#22c55e"
                  : safeDrift <= 30
                  ? "#f59e0b"
                  : "#ef4444",
            }}
          />
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          How much your day-to-day work is drifting away from your intended
          contribution.
        </div>
      </div>
    </div>
  );
}
