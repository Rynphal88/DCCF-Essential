"use client";

export function QuickActions() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Quick Actions</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tap to begin your next step.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button className="rounded-lg border px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
          Start Session
        </button>
        <button className="rounded-lg border px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
          Log a Win
        </button>
        <button className="rounded-lg border px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
          Update Compass
        </button>
      </div>
    </div>
  );
}
