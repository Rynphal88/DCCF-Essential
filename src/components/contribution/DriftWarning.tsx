// src/components/contribution/DriftWarning.tsx
"use client";

interface DriftWarningProps {
  drift: number;
  risks: string[];
}

export function DriftWarning({ drift, risks }: DriftWarningProps) {
  const severity =
    drift <= 15 ? "low" : drift <= 30 ? "medium" : "high";

  const colorClasses =
    severity === "low"
      ? "border-emerald-500/40 bg-emerald-500/5"
      : severity === "medium"
      ? "border-amber-500/40 bg-amber-500/5"
      : "border-rose-500/40 bg-rose-500/5";

  const label =
    severity === "low"
      ? "On track"
      : severity === "medium"
      ? "Watch drift"
      : "High drift risk";

  return (
    <div className={`rounded-xl border p-4 ${colorClasses}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden="true">📉</span>
          <span>Drift Monitor</span>
        </div>
        <span className="rounded-full bg-background/70 px-2 py-0.5 text-[11px] uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Research drift is at <span className="font-semibold">{drift}%</span>.
        The higher this number, the more your daily activities are diverging
        from your intended contribution.
      </p>

      {risks.length > 0 && (
        <div className="mt-3 space-y-1 text-[11px]">
          <div className="font-semibold">Key risks:</div>
          {risks.slice(0, 3).map((risk, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span>{risk}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
