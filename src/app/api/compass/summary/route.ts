// src/app/api/compass/summary/route.ts

import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CompassState, QuadrantData, QuadrantId } from "@/components/contribution/types";

// Ensure this route is always evaluated dynamically (no static caching surprises)
export const dynamic = "force-dynamic";
// Ensure we run on Node.js (supabase-js is happiest here)
export const runtime = "nodejs";

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
 * Build Supabase client safely at request-time.
 * - Prevents noisy build-time warnings
 * - Avoids creating clients when env is missing
 */
function getSupabaseClient(): {
  client: SupabaseClient | null;
  note?: string;
} {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL || // backwards-compat for local dev
    "";

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY || // backwards-compat for local dev
    "";

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  // Prefer service role only when provided (server-only). Otherwise use anon.
  const key = serviceKey || anonKey;

  if (!url || !key) {
    return {
      client: null,
      note:
        "Supabase not configured. Expected NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (and optionally SUPABASE_SERVICE_ROLE_KEY).",
    };
  }

  return { client: createClient(url, key) };
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
  // Always return fresh data (no caching)
  const noStoreHeaders = {
    "Cache-Control": "no-store, max-age=0",
  };

  try {
    const body = (await req.json().catch(() => ({}))) as {
      path?: string;
      source?: string;
      userId?: string;
    };

    const path =
      typeof body.path === "string" && body.path.trim().length > 0
        ? body.path.trim()
        : "/";

    const source =
      typeof body.source === "string" && body.source.trim().length > 0
        ? body.source.trim()
        : "global-assistant";

    const userId =
      typeof body.userId === "string" && body.userId.trim().length > 0
        ? body.userId.trim()
        : undefined;

    const { client: supabase, note } = getSupabaseClient();

    // If Supabase isn’t configured, return a clean fallback — no scary build-time warnings
    if (!supabase) {
      return NextResponse.json(
        {
          ok: true,
          path,
          source,
          compass: getFallbackCompassState(),
          note: note ?? "Supabase not configured; serving fallback Compass state.",
        },
        { status: 200, headers: noStoreHeaders }
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

    if (userId) query = query.eq("user_id", userId);
    if (path && path !== "/") query = query.eq("path", path);

    const { data, error } = await query.maybeSingle();

    if (error) {
      // Log, but still respond with fallback so UI remains stable
      console.error("[/api/compass/summary] Supabase error:", error);
      return NextResponse.json(
        {
          ok: true,
          path,
          source,
          compass: getFallbackCompassState(),
          note: "Supabase query failed; serving fallback Compass state.",
        },
        { status: 200, headers: noStoreHeaders }
      );
    }

    const row = (data as CompassRow | null) ?? null;

    const fallback = getFallbackCompassState();

    const compass: CompassState = !row
      ? fallback
      : {
          quadrants: row.quadrants ?? fallback.quadrants,
          overallAlignment:
            typeof row.overall_alignment === "number" && !Number.isNaN(row.overall_alignment)
              ? row.overall_alignment
              : fallback.overallAlignment,
          researchDrift:
            typeof row.research_drift === "number" && !Number.isNaN(row.research_drift)
              ? row.research_drift
              : fallback.researchDrift,
          weeklyMomentum:
            typeof row.weekly_momentum === "number" && !Number.isNaN(row.weekly_momentum)
              ? row.weekly_momentum
              : fallback.weeklyMomentum,
          nextBestAction: row.next_best_action ?? fallback.nextBestAction,
          aiInsights: Array.isArray(row.ai_insights) ? row.ai_insights : fallback.aiInsights,
        };

    return NextResponse.json(
      {
        ok: true,
        path,
        source,
        compass,
      },
      { status: 200, headers: noStoreHeaders }
    );
  } catch (err) {
    console.error("[API /compass/summary] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to load Compass state." },
      { status: 500, headers: noStoreHeaders }
    );
  }
}
