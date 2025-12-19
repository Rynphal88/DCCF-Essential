// src/components/contribution/ContributionCompass.tsx
"use client";

import { useState } from "react";
import type {
  CompassState,
  WeeklyVectorData,
  QuadrantId,
} from "./types";
import { QuadrantCard } from "./QuadrantCard";
import { AlignmentMeter } from "./AlignmentMeter";
import { MomentumIndicator } from "./MomentumIndicator";
import { DriftWarning } from "./DriftWarning";
import { WeeklyVector } from "./WeeklyVector";

const quadrantOrder: QuadrantId[] = [
  "problem",
  "gap",
  "contribution",
  "alignment",
];

export function ContributionCompass() {
  const [state] = useState<CompassState>({
    quadrants: {
      problem: {
        id: "problem",
        title: "Problem Space",
        description: "What problem are you really solving?",
        color: "#3b82f6", // blue
        icon: "🎯",
        progress: 85,
        clarity: 90,
        momentum: 20,
        lastUpdated: new Date("2025-12-04"),
        insights: ["Problem definition is sharp and well-bounded."],
        risks: ["Scope may expand if not guarded."],
      },
      gap: {
        id: "gap",
        title: "Knowledge Gap",
        description: "What is missing in the existing literature?",
        color: "#10b981", // emerald
        icon: "🧩",
        progress: 65,
        clarity: 75,
        momentum: 10,
        lastUpdated: new Date("2025-12-03"),
        insights: ["Literature review is ~80% complete."],
        risks: ["Recent sources (last 2 years) may still be thin."],
      },
      contribution: {
        id: "contribution",
        title: "Your Contribution",
        description: "What novel value are you adding?",
        color: "#8b5cf6", // violet
        icon: "✨",
        progress: 45,
        clarity: 60,
        momentum: -8,
        lastUpdated: new Date("2025-12-02"),
        insights: ["Methodology is promising and distinct."],
        risks: ["Contribution statement needs tightening and testing."],
      },
      alignment: {
        id: "alignment",
        title: "Research Alignment",
        description: "How well do your actions match your goals?",
        color: "#f59e0b", // amber
        icon: "🧭",
        progress: 70,
        clarity: 80,
        momentum: 25,
        lastUpdated: new Date(),
        insights: ["Weekly rituals are improving focus quality."],
        risks: ["Writing time could still increase."],
      },
    },
    overallAlignment: 72,
    researchDrift: 18,
    weeklyMomentum: 15,
    nextBestAction:
      "Refine your contribution statement in a 45-minute deep work session.",
    aiInsights: [
      "Your problem definition is very strong (90% clarity).",
      "Contribution clarity is lagging behind problem clarity.",
      "Consider one focused block tomorrow just for rewriting the contribution section.",
    ],
  });

  const [weeklyVectors] = useState<WeeklyVectorData[]>([
    { direction: "problem", magnitude: 20, confidence: 85, impact: "medium" },
    { direction: "gap", magnitude: 15, confidence: 75, impact: "low" },
    {
      direction: "contribution",
      magnitude: -10,
      confidence: 70,
      impact: "high",
    },
    { direction: "alignment", magnitude: 25, confidence: 90, impact: "high" },
  ]);

  const allRisks = quadrantOrder.flatMap(
    (id) => state.quadrants[id].risks || []
  );

  return (
    <section className="rounded-2xl border bg-card/80 p-6 shadow-xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xl">
              <span aria-hidden="true">🧭</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Contribution Compass
              </h2>
              <p className="text-sm text-muted-foreground">
                Your doctoral North Star — how today&apos;s work serves your
                true contribution.
              </p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 text-center text-xs md:text-sm">
          <div>
            <div className="text-lg font-bold md:text-xl">
              {state.overallAlignment}%
            </div>
            <div className="text-muted-foreground">Alignment</div>
          </div>
          <div>
            <div className="text-lg font-bold md:text-xl">
              {state.researchDrift}%
            </div>
            <div className="text-muted-foreground">Drift</div>
          </div>
          <div>
            <div className="text-lg font-bold md:text-xl">
              {state.weeklyMomentum > 0 ? "+" : ""}
              {state.weeklyMomentum}%
            </div>
            <div className="text-muted-foreground">Momentum</div>
          </div>
        </div>
      </div>

      {/* Quadrant grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quadrantOrder.map((id) => (
          <QuadrantCard key={id} data={state.quadrants[id]} />
        ))}
      </div>

      {/* Alignment + drift */}
      <div className="mt-8">
        <AlignmentMeter
          alignment={state.overallAlignment}
          drift={state.researchDrift}
        />
      </div>

      {/* Momentum + drift warning */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <MomentumIndicator momentum={state.weeklyMomentum} vectors={weeklyVectors} />
        <DriftWarning drift={state.researchDrift} risks={allRisks} />
      </div>

      {/* Weekly vectors */}
      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold">
          This Week&apos;s Direction of Effort
        </h3>
        <div className="grid gap-3 md:grid-cols-4">
          {weeklyVectors.map((v, idx) => (
            <WeeklyVector
              key={idx}
              vector={v}
              quadrant={state.quadrants[v.direction]}
            />
          ))}
        </div>
      </div>

      {/* AI-style insights */}
      {state.aiInsights.length > 0 && (
        <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
          <div className="mb-3 flex items-center gap-2">
            <span aria-hidden="true">⚡</span>
            <span className="font-semibold">Compass Insights</span>
          </div>
          <ul className="space-y-1 text-xs md:text-sm">
            {state.aiInsights.map((line, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          {state.nextBestAction && (
            <div className="mt-4 rounded-lg bg-background/70 p-3 text-xs md:text-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Next best action
              </div>
              <div className="mt-1">{state.nextBestAction}</div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
