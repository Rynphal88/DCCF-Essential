// app/compass/page.tsx
import Link from "next/link";

type CoherenceMetric = {
  id: string;
  label: string;
  score: number; // 0–100
  description: string;
};

const coherenceMetrics: CoherenceMetric[] = [
  {
    id: "concept_clarity",
    label: "Concept clarity",
    score: 82,
    description: "How clearly the core problem is articulated.",
  },
  {
    id: "gap_fit",
    label: "Gap fit",
    score: 76,
    description: "How well the identified gap aligns with the problem.",
  },
  {
    id: "contribution_distinctiveness",
    label: "Contribution distinctiveness",
    score: 69,
    description: "How uniquely the contribution responds to the gap.",
  },
];

export default function CompassPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 lg:px-8 lg:py-10">
        {/* Top Bar: Title + Research Bridge */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              Compass Control Room
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300 lg:text-base">
              Your North Star for aligning{" "}
              <span className="font-medium text-sky-300">
                Problem → Gap → Contribution
              </span>{" "}
              and steering the entire doctoral journey.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-sky-500/50 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-sky-200">
              Live Compass • v1 Control Room
            </span>

            <Link
              href="/research"
              className="inline-flex items-center rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 shadow-sm transition hover:border-sky-500 hover:bg-slate-900/80 hover:text-sky-100"
            >
              Open Research Workspace
              <span className="ml-2 text-xs text-slate-400">/research</span>
            </Link>
          </div>
        </header>

        {/* Coherence Strip */}
        <section
          aria-label="Compass coherence overview"
          className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40 backdrop-blur"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
                Coherence & Alignment Snapshot
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Early prototype • scores are static placeholders until Supabase + AI are wired in.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {coherenceMetrics.map((metric) => (
              <CoherencePill key={metric.id} metric={metric} />
            ))}
          </div>
        </section>

        {/* Main Grid: Core Scaffold + AI Insight Console */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          {/* Left: Core Scaffold */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                Core Compass Scaffold
              </h2>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                Problem • Gap • Contribution
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <CompassCard
                title="Problem"
                badge="P"
                accentClass="border-red-500/60 bg-red-500/5"
                dotClass="bg-red-400"
                body="Placeholder summary of your central problem statement. This will be loaded from Supabase so the Compass always reflects your latest articulation."
              />
              <CompassCard
                title="Gap"
                badge="G"
                accentClass="border-amber-500/60 bg-amber-500/5"
                dotClass="bg-amber-400"
                body="Placeholder description of the gap in the literature or practice that makes this problem academically meaningful."
              />
              <CompassCard
                title="Contribution"
                badge="C"
                accentClass="border-emerald-500/60 bg-emerald-500/5"
                dotClass="bg-emerald-400"
                body="Placeholder outline of your intended theoretical or practical contribution that directly responds to the gap."
              />
            </div>

            {/* Alignment Notes */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-200">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-10 rounded-full bg-sky-400" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Alignment notes (static draft)
                </p>
              </div>
              <p className="text-sm text-slate-300">
                This block will evolve into a live alignment summary that compares your Problem, Gap,
                and Contribution, highlighting tensions, missing links, or opportunities to sharpen
                coherence. For now, treat it as a conceptual placeholder while we wire in Supabase +
                AI.
              </p>
            </div>
          </div>

          {/* Right: AI Insight Console */}
          <aside className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
                AI Insight Console
              </h2>
              <span className="rounded-full border border-slate-700 px-2.5 py-1 text-[10px] uppercase tracking-wide text-slate-400">
                Compass-aware • Stub
              </span>
            </div>

            {/* Primary AI Message (static placeholder) */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                Prototype Insight
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                Once connected to your stored Compass object, this console will read your actual
                Problem, Gap, and Contribution, compute coherence metrics, and offer{" "}
                <span className="font-semibold text-sky-200">
                  Next Best Actions
                </span>{" "}
                to tighten alignment and suggest focused writing or reading tasks.
              </p>
            </div>

            {/* Next Best Actions (static bullets) */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Next best action (mock)
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-200">
                <li className="flex gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-sky-400" />
                  Draft a one-sentence version of your Problem that explicitly names the population,
                  context, and outcome.
                </li>
                <li className="flex gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-sky-400" />
                  List 3–5 articles that most clearly define the Gap and mark whether they are
                  theoretical, empirical, or methodological.
                </li>
                <li className="flex gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-sky-400" />
                  Rewrite your Contribution statement so it mirrors the structure of the Gap
                  sentence while clearly adding something new.
                </li>
              </ul>
            </div>

            {/* Technical Note */}
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Technical note: in the next phase, this panel will call a Compass-specific AI route
              (e.g. <code className="rounded bg-slate-800 px-1.5 py-0.5">
                /api/compass/insight
              </code>
              ) that reads your live Supabase Compass record and returns structured insights and
              action suggestions.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}

function CoherencePill({ metric }: { metric: CoherenceMetric }) {
  const intensity =
    metric.score >= 80 ? "bg-emerald-500/10 border-emerald-500/70" :
    metric.score >= 60 ? "bg-amber-500/10 border-amber-500/70" :
    "bg-rose-500/10 border-rose-500/70";

  const barWidth = `${Math.min(Math.max(metric.score, 0), 100)}%`;

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border ${intensity} px-3 py-2.5 text-xs text-slate-100`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold tracking-wide">{metric.label}</span>
        <span className="rounded-full bg-slate-950/70 px-2 py-0.5 text-[11px] font-semibold">
          {metric.score}
          <span className="ml-0.5 text-[10px] text-slate-400">/100</span>
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-900">
        <div className="h-1.5 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400" style={{ width: barWidth }} />
      </div>
      <p className="mt-2 text-[11px] text-slate-300">{metric.description}</p>
    </div>
  );
}

type CompassCardProps = {
  title: string;
  badge: string;
  body: string;
  accentClass: string;
  dotClass: string;
};

function CompassCard({
  title,
  badge,
  body,
  accentClass,
  dotClass,
}: CompassCardProps) {
  return (
    <article
      className={`flex flex-col justify-between rounded-2xl border bg-slate-950/60 p-4 text-sm text-slate-100 ${accentClass}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-slate-50 ${accentClass}`}
          >
            {badge}
          </span>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-200">
            {title}
          </h3>
        </div>
        <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      </div>
      <p className="text-xs leading-relaxed text-slate-200">{body}</p>
    </article>
  );
}
