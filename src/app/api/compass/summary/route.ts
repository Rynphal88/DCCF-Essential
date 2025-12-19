// src/app/api/compass/summary/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type {
  CompassState,
  QuadrantData,
  QuadrantId,
} from "@/components/contribution/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "[/api/compass/summary] Supabase env vars missing. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE keys."
  );
}

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

interface CompassRow {
  quadrants: Record<QuadrantId, QuadrantData> | null;
  overall_alignment: number | null;
  research_drift: number | null;
  weekly_momentum: number | null;
  next_best_action: string | null;
  ai_insights: string[] | null;
  updated_at: string | null;
}

/** Default quadrant data for fallback */
function defaultQuadrant(
  id: QuadrantId,
  title: string,
  description: string,
  color: string,
  icon: string,
  progress = 50,
  clarity = 50,
  momentum = 0
): QuadrantData {
  return {
    id,
    title,
    description,
    color,
    icon,
    progress,
    clarity,
    momentum,
    lastUpdated: new Date(),
    insights: [],
    risks: [],
  };
}

/** Fallback CompassState when no data exists */
function getFallbackCompassState(): CompassState {
  return {
    quadrants: {
      problem: defaultQuadrant(
        "problem",
        "Problem Space",
        "What problem are you really solving?",
        "#3b82f6",
        "🎯",
        50,
        50,
        0
      ),
      gap: defaultQuadrant(
        "gap",
        "Knowledge Gap",
        "What is missing in the existing literature?",
        "#10b981",
        "🧩",
        50,
        50,
        0
      ),
      contribution: defaultQuadrant(
        "contribution",
        "Your Contribution",
        "What novel value are you adding?",
        "#8b5cf6",
        "✨",
        50,
        50,
        0
      ),
      alignment: defaultQuadrant(
        "alignment",
        "Research Alignment",
        "How well do your actions match your goals?",
        "#f59e0b",
        "🧭",
        50,
        50,
        0
      ),
    },
    overallAlignment: 50,
    researchDrift: 25,
    weeklyMomentum: 0,
    nextBestAction: "Start by clarifying your problem statement.",
    aiInsights: [
      "Complete a Compass object to track your doctoral progress.",
      "Connect your daily work to your contribution statement.",
    ],
  };
}

/**
 * Compass summary endpoint returning the full CompassState shape.
 *
 * Expected body:
 * {
 *   "path": "/some/page",
 *   "source": "global-assistant",
 *   "userId": "uuid-of-user" // optional but recommended
 * }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      path?: string;
      source?: string;
      userId?: string;
    };

    const path =
      typeof body.path === "string" && body.path.length > 0 ? body.path : "/";
    const source =
      typeof body.source === "string" && body.source.length > 0
        ? body.source
        : "global-assistant";
    const userId =
      typeof body.userId === "string" && body.userId.length > 0
        ? body.userId
        : undefined;

    if (!supabase) {
      return NextResponse.json(
        {
          path,
          source,
          compass: getFallbackCompassState(),
          note: "Supabase not configured; serving fallback Compass state.",
        },
        { status: 200 }
      );
    }

    // 🔎 Build a query for the active Compass object
    let query = supabase
      .from("compass_objects")
      .select(
        "quadrants, overall_alignment, research_drift, weekly_momentum, next_best_action, ai_insights, updated_at"
      )
      .order("updated_at", { ascending: false })
      .limit(1);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (path && path !== "/") {
      query = query.eq("path", path);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("[/api/compass/summary] Supabase error:", error);
    }

    const row = (data as CompassRow | null) ?? null;

    let compass: CompassState;

    if (!row) {
      compass = getFallbackCompassState();
    } else {
      const fallback = getFallbackCompassState();
      compass = {
        quadrants: row.quadrants ?? fallback.quadrants,
        overallAlignment:
          typeof row.overall_alignment === "number" &&
          !Number.isNaN(row.overall_alignment)
            ? row.overall_alignment
            : 50,
        researchDrift:
          typeof row.research_drift === "number" &&
          !Number.isNaN(row.research_drift)
            ? row.research_drift
            : 25,
        weeklyMomentum:
          typeof row.weekly_momentum === "number" &&
          !Number.isNaN(row.weekly_momentum)
            ? row.weekly_momentum
            : 0,
        nextBestAction: row.next_best_action ?? fallback.nextBestAction,
        aiInsights: Array.isArray(row.ai_insights)
          ? row.ai_insights
          : fallback.aiInsights,
      };
    }

    return NextResponse.json(
      {
        path,
        source,
        compass,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[API /compass/summary] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unable to load Compass state." },
      { status: 500 }
    );
  }
}
