// src/app/dashboard/page.tsx

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ContributionCompass } from "@/components/contribution/ContributionCompass";
import { ChatPanel } from "@/components/ai/ChatPanel";
import { Activity, Target, Calendar, Trophy } from "lucide-react";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="space-y-12">
        {/* 🛰️ Subtle Telemetry Strip (top of dashboard) */}
        <section
          id="telemetry"
          className="grid gap-4 rounded-2xl border bg-card p-4 text-sm shadow-sm md:grid-cols-4"
        >
          <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Deep Work Today</p>
              <p className="text-sm font-semibold">2.5 hours</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10">
              <Target className="h-4 w-4 text-sky-500" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">
                Contribution Alignment
              </p>
              <p className="text-sm font-semibold">72% · Drift 18%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Calendar className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Weekly Rituals</p>
              <p className="text-sm font-semibold">2 / 3 completed</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
              <Trophy className="h-4 w-4 text-violet-500" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Wins Logged</p>
              <p className="text-sm font-semibold">4 today · 12 this week</p>
            </div>
          </div>
        </section>

        {/* HERO: Doctoral Control Center */}
        <section className="py-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Your Doctoral{" "}
            <span className="text-primary">Control &amp; Clarity Center</span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground md:text-xl">
            This dashboard turns the DCCF pillars into a live control room:
            compass, rituals, and wins all in one place, so you always know
            where your research is truly moving.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button className="rounded-lg bg-primary px-8 py-2.5 font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90">
              Open Today&apos;s Session
            </button>
            <button className="rounded-lg border border-border bg-background px-8 py-2.5 font-medium text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground">
              View Weekly Overview
            </button>
          </div>
        </section>

        {/* CORE FRAMEWORK OVERVIEW */}
        <section aria-label="Core DCCF Framework">
          <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
            Core DCCF Framework
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Compass card (matches header link) */}
            <a
              href="#compass"
              className="group rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-2xl">
                <span role="img" aria-label="Contribution Compass">
                  🎯
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Contribution Compass
              </h3>
              <p className="text-sm text-muted-foreground">
                Keep your Problem → Gap → Contribution crystal clear so every
                week actually pushes the dissertation, not just your to-do list.
              </p>
              <p className="mt-3 text-xs font-medium text-primary/90 group-hover:underline">
                Jump to Compass section
              </p>
            </a>

            {/* Rituals card */}
            <a
              href="#rituals"
              className="group rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-2xl">
                <span role="img" aria-label="Weekly Rituals">
                  📅
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Weekly Rituals</h3>
              <p className="text-sm text-muted-foreground">
                Monday / Thursday / Saturday check-ins that prevent drift,
                emotional panic, and end-of-semester surprises.
              </p>
              <p className="mt-3 text-xs font-medium text-primary/90 group-hover:underline">
                Jump to Rituals section
              </p>
            </a>

            {/* Wins card */}
            <a
              href="#wins"
              className="group rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-2xl">
                <span role="img" aria-label="Small Wins Ledger">
                  🏆
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Small Wins Ledger</h3>
              <p className="text-sm text-muted-foreground">
                Track tiny, honest pieces of progress so the system reflects
                reality, not just big, rare milestones like submission day.
              </p>
              <p className="mt-3 text-xs font-medium text-primary/90 group-hover:underline">
                Jump to Wins section
              </p>
            </a>
          </div>
        </section>

        {/* 🧭 COMPASS SECTION (anchor target: #compass) */}
        <section
          id="compass"
          aria-label="Contribution Compass"
          className="space-y-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Contribution Compass</h2>
              <p className="text-sm text-muted-foreground">
                Your doctoral North Star — keeping daily tasks aligned with your
                real Problem → Gap → Contribution chain.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Anchor: <code>#compass</code> · Linked from header &amp; home page
            </p>
          </div>

          {/* The live, alien-grade visualization */}
          <ContributionCompass />
        </section>

        {/* 🧠 AI CONTROL CONSOLE – Hybrid online/offline chat */}
        <section
          id="ai-console"
          aria-label="AI Control Console"
          className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">AI Control Console</h2>
              <p className="text-sm text-muted-foreground">
                Talk to your doctoral AI about your research gap, methodology,
                emotional load, or next best step. Switch between offline,
                online, and hybrid modes as your context changes.
              </p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
              Anchor: <code>#ai-console</code>
            </span>
          </div>

          <div className="mt-2 h-[480px]">
            <ChatPanel />
          </div>
        </section>

        {/* 📅 RITUALS SECTION (anchor target: #rituals) */}
        <section
          id="rituals"
          aria-label="Weekly Rituals"
          className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Weekly Rituals</h2>
              <p className="text-sm text-muted-foreground">
                The three anchor check-ins that keep your PhD from drifting:
                quick, honest scans instead of long, overwhelming reviews.
              </p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
              Anchor: <code>#rituals</code>
            </span>
          </div>

          {/* Simple schedule preview (future: live data from Supabase) */}
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs font-semibold text-emerald-600">
                Monday Ritual
              </p>
              <p className="mt-1 font-medium">Orientation &amp; Scope Check</p>
              <p className="mt-2 text-xs text-muted-foreground">
                What matters this week? Where is the compass pointing? What is
                the one thing that must move?
              </p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs font-semibold text-sky-600">
                Thursday Ritual
              </p>
              <p className="mt-1 font-medium">Reality Check &amp; Drift Scan</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Compare what you actually did vs. what you planned and adjust
                without guilt — just data and correction.
              </p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs font-semibold text-violet-600">
                Saturday Ritual
              </p>
              <p className="mt-1 font-medium">Consolidation &amp; Wins Review</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Close the loop: log wins, clean your notes, and decide how this
                week&apos;s work moves the thesis forward.
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Future phase: this block will be powered by real ritual completion
            data, streaks, and AI suggestions for when you miss a ritual.
          </p>
        </section>

        {/* 🏆 WINS SECTION (anchor target: #wins) */}
        <section
          id="wins"
          aria-label="Small Wins Ledger"
          className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Small Wins Ledger</h2>
              <p className="text-sm text-muted-foreground">
                The emotional black box of your research aircraft: a log of
                every meaningful move so you never feel like &quot;nothing is
                happening&quot; again.
              </p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
              Anchor: <code>#wins</code>
            </span>
          </div>

          {/* Summary row */}
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="mt-1 text-lg font-semibold">4 wins logged</p>
              <p className="mt-1 text-xs text-muted-foreground">
                e.g. 500 words written, one article fully digested.
              </p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs text-muted-foreground">This Week</p>
              <p className="mt-1 text-lg font-semibold">12 total</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Most wins happen in early-morning sessions — keep that pattern
                alive.
              </p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-xs text-muted-foreground">Emotional Trend</p>
              <p className="mt-1 text-lg font-semibold">Upward</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Future: this will sync with mood logs and session notes.
              </p>
            </div>
          </div>

          {/* CTA to full Wins page (no router hook needed) */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-xs text-muted-foreground">
              The dedicated Wins page will give you a full timeline, filters,
              and export — this dashboard section is the quick summary.
            </p>
            <a
              href="/wins"
              className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              Open full Wins ledger →
            </a>
          </div>
        </section>

        {/* DEPLOYMENT STATUS (kept for dev clarity) */}
        <section className="mx-auto max-w-2xl rounded-xl border bg-card p-6 shadow-sm">
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
            Next step: wire this telemetry to real Supabase data, Wins ledger,
            and ritual completion logs — the layout is already future-proof.
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
