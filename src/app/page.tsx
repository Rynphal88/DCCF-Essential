"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="space-y-16">
      {/* HERO: Your Doctoral Operating System */}
      <section className="mt-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 shadow-xl md:px-10 md:py-14">
        {/* Top badges */}
        <div className="mb-6 flex flex-wrap gap-3 text-[11px] font-medium text-slate-200/90">
          <span className="rounded-full bg-slate-800/80 px-3 py-1">
            v0.1 · Foundation Phase
          </span>
          <span className="rounded-full bg-slate-800/80 px-3 py-1">
            Built for Doctoral Focus — Not for Entertainment
          </span>
        </div>

        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Left: Main copy */}
          <div className="max-w-xl space-y-6">
            <h1 className="text-4xl font-bold leading-tight text-slate-50 md:text-5xl">
              Your Doctoral{" "}
              <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent">
                Operating System
              </span>
            </h1>
            <p className="text-sm text-slate-300 md:text-base">
              DCCF Essential turns scattered notes, anxiety, and drifting weeks
              into a structured, trackable execution system with clear rituals,
              wins, and contribution focus.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition hover:-translate-y-[1px] hover:bg-primary/90"
              >
                Open Today&apos;s Session →
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard?view=weekly")}
                className="rounded-xl border border-slate-500/60 bg-slate-900/40 px-6 py-2.5 text-sm font-semibold text-slate-50 transition hover:bg-slate-800/70"
              >
                View Weekly Overview
              </button>
            </div>

            {/* System status row */}
            <div className="flex flex-wrap gap-3 text-[11px] text-slate-300/80">
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1">
                ● System Status: Stable
              </span>
              <span className="rounded-full border border-slate-600 bg-slate-900/70 px-3 py-1">
                Designed for 5+ year doctoral journeys
              </span>
            </div>
          </div>

          {/* Right: Today’s Telemetry panel */}
          <div className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5 text-slate-100 shadow-inner">
            <div className="mb-4 flex items-center justify-between text-xs text-slate-300/90">
              <span>Today&apos;s Telemetry</span>
              <span>Week 14 · Focus Season</span>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-slate-900/80 p-3">
                <div className="text-slate-400">Deep Work</div>
                <div className="mt-1 text-lg font-semibold">2.5h</div>
                <div className="mt-0.5 text-[11px] text-slate-400">
                  +45 min vs avg
                </div>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-3">
                <div className="text-slate-400">Rituals</div>
                <div className="mt-1 text-lg font-semibold">2 / 3</div>
                <div className="mt-0.5 text-[11px] text-slate-400">
                  Monday / Thu
                </div>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-3">
                <div className="text-slate-400">Wins</div>
                <div className="mt-1 text-lg font-semibold">4</div>
                <div className="mt-0.5 text-[11px] text-slate-400">
                  Logged today
                </div>
              </div>
            </div>

            {/* Alignment bar */}
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-slate-300/90">
                <span>Contribution Alignment</span>
                <span>Drift: 18%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-rose-400" />
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Next best action:</span>
                <span className="text-[11px] text-slate-100">
                  Refine contribution statement
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE DCCF FRAMEWORK – cards now clickable */}
      <section>
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Core DCCF Framework</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Three pillars that keep your research aligned, week after week.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Contribution Compass */}
          <button
            type="button"
            onClick={() => router.push("/dashboard#compass")}
            className="group rounded-2xl border bg-card p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-2xl">
              🎯
            </div>
            <h3 className="mb-1 text-lg font-semibold">Contribution Compass</h3>
            <p className="text-sm text-muted-foreground">
              Keep your Problem → Gap → Contribution crystal clear so every week
              actually moves the dissertation forward.
            </p>
            <p className="mt-3 text-xs text-primary/90 group-hover:underline">
              Open Compass view
            </p>
          </button>

          {/* Weekly Rituals */}
          <button
            type="button"
            onClick={() => router.push("/dashboard#rituals")}
            className="group rounded-2xl border bg-card p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-2xl">
              📅
            </div>
            <h3 className="mb-1 text-lg font-semibold">Weekly Rituals</h3>
            <p className="text-sm text-muted-foreground">
              Monday / Thursday / Saturday check-ins to prevent drift, clarify
              focus, and reset when life and work collide.
            </p>
            <p className="mt-3 text-xs text-primary/90 group-hover:underline">
              View Rituals schedule
            </p>
          </button>

          {/* Small Wins Ledger */}
          <button
            type="button"
            onClick={() => router.push("/dashboard#wins")}
            className="group rounded-2xl border bg-card p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-2xl">
              🏆
            </div>
            <h3 className="mb-1 text-lg font-semibold">Small Wins Ledger</h3>
            <p className="text-sm text-muted-foreground">
              Track tiny progress so the system reflects reality, not just big,
              rare milestones and submission deadlines.
            </p>
            <p className="mt-3 text-xs text-primary/90 group-hover:underline">
              Go to Wins ledger
            </p>
          </button>
        </div>
      </section>

      {/* QUICK START FOR TODAY – actions are wired */}
      <section>
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border bg-gradient-to-r from-slate-950 via-slate-800 to-emerald-900/60 p-[1px] shadow-lg">
          <div className="rounded-[1.05rem] bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-emerald-900/60 px-6 py-6 text-slate-50 md:px-8 md:py-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-semibold">Quick Start for Today</p>
                <p className="text-xs text-slate-300">
                  A low-friction launchpad into your next focused block.
                </p>
              </div>
              <p className="text-[11px] text-slate-300">
                ⏱ Suggested: 25 minutes
              </p>
            </div>

            <p className="mb-5 max-w-2xl text-xs text-slate-200/90 md:text-sm">
              Soon, this rail will auto-load your current phase, next best task,
              and the right AI prompts — all tuned to your research tempo, not
              generic productivity advice.
            </p>

            <div className="flex flex-wrap gap-3 text-sm">
              <button
                type="button"
                onClick={() => router.push("/dashboard?session=focus25")}
                className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                Start 25-minute Deep Work
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard?view=monday-review")}
                className="rounded-lg bg-secondary px-4 py-2 font-medium text-secondary-foreground transition hover:bg-secondary/80"
              >
                Run Monday Review
              </button>
              <button
                type="button"
                onClick={() => router.push("/wins")}
                className="rounded-lg border border-border px-4 py-2 font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
              >
                Log a Small Win
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* RESEARCH HUB PREVIEW – button to huge database */}
      <section>
        <div className="mx-auto max-w-4xl rounded-2xl border bg-card p-6 shadow-sm md:p-7">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Research Hub (Preview)</h3>
              <p className="text-sm text-muted-foreground">
                One place to explore papers, concepts, and AI-summarised
                readings — like a focused Google Scholar, tuned for your PhD.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/research")}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Open Research Hub
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Future phase: live integration with scholarly indexes, semantic
            search, and your own personalised reading queue.
          </p>
        </div>
      </section>

      {/* DEPLOYMENT STATUS – unchanged logic, just cleaned */}
      <section className="mx-auto mb-8 max-w-3xl rounded-2xl border bg-card p-6 shadow-sm md:p-7">
        <h3 className="mb-4 text-xl font-semibold">🚀 Deployment Status</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-foreground">Local Development</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
              ✅ Running (E:\\DCCF\\project)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground">GitHub Repository</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
              ✅ Synced (DCCF-Essential)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground">Vercel Deployment</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
              ✅ Live &amp; CI-enabled
            </span>
          </div>
        </div>
        <div className="mt-4 border-t pt-4 text-xs text-muted-foreground">
          Next step: wire in authentication, Supabase-backed rituals, and live
          Contribution Compass once this visual foundation feels untouchable.
        </div>
      </section>
    </div>
  );
}
