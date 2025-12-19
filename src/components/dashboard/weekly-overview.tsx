"use client";

export function WeeklyOverview() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Weekly Overview</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Your productivity metrics will appear here.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div className="rounded-lg border p-4">
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs text-muted-foreground">Focus Sessions</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-2xl font-bold">28.5</p>
          <p className="text-xs text-muted-foreground">Deep Work Hours</p>
        </div>
      </div>
    </div>
  );
}
