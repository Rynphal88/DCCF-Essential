// src/lib/ai/alien-patterns.ts

import type { KnowledgeContext } from "@/lib/ai/knowledge-graph";

/**
 * High-level “pattern labels” used for flavour text or internal reasoning.
 */
export const ALIEN_PATTERNS = [
  "echo-resonance",
  "lateral-connection",
  "paradox-matrix",
  "pattern-recognition",
  "quiet-signal",
] as const;

export type AlienPattern = (typeof ALIEN_PATTERNS)[number];

/**
 * Very light keyword extraction for offline mode.
 * Focused, small, and deterministic.
 */
export function extractKeywords(text: string): string[] {
  const cleaned = (text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return [];

  const stopWords = new Set([
    "the",
    "and",
    "but",
    "for",
    "with",
    "this",
    "that",
    "what",
    "when",
    "from",
    "into",
    "your",
    "about",
    "then",
  ]);

  const words = cleaned
    .split(" ")
    .filter((w) => w.length > 3 && !stopWords.has(w));

  // Manual de-duplication to avoid Set iteration issues on older targets
  const unique: string[] = [];
  for (const w of words) {
    if (!unique.includes(w)) unique.push(w);
  }

  return unique.slice(0, 5);
}

/**
 * Quick intent classification so the offline brain can respond differently
 * to “gap”, “method”, “overwhelm”, etc.
 */
export function classifyIntent(message: string) {
  const lower = (message || "").toLowerCase();

  const isGreeting =
    lower.startsWith("hi ") ||
    lower.startsWith("hi,") ||
    lower.startsWith("hello") ||
    lower.includes("how are you");

  const isGap =
    lower.includes("gap") ||
    lower.includes("research gap") ||
    lower.includes("missing") ||
    lower.includes("not sure what my gap");

  const isMethod =
    lower.includes("methodology") ||
    lower.includes("method") ||
    lower.includes("design") ||
    lower.includes("sample") ||
    lower.includes("data collection");

  const isOverwhelm =
    lower.includes("overwhelmed") ||
    lower.includes("stressed") ||
    lower.includes("stuck") ||
    lower.includes("confused") ||
    lower.includes("lost");

  const isQuestion =
    lower.includes("?") ||
    /^(how|what|why|when|where|who|should|can)\b/i.test(message || "");

  return {
    isGreeting,
    isGap,
    isMethod,
    isOverwhelm,
    isQuestion,
  };
}

/**
 * Simple context stats so offline replies can nod at the system
 * without sounding like logs.
 */
export function summariseContextNumbers(context: KnowledgeContext): {
  artifacts: number;
  insights: number;
  nodes: number;
} {
  return {
    artifacts: Array.isArray(context.artifacts)
      ? context.artifacts.length
      : 0,
    insights: Array.isArray(context.insights) ? context.insights.length : 0,
    nodes: Array.isArray((context as any).nodes) ? (context as any).nodes.length : 0,
  };
}

/**
 * One concise line the offline brain can optionally use:
 * e.g. “You already have 5 artifacts and 2 insights in play.”
 */
export function buildShortContextLine(
  context: KnowledgeContext
): string | null {
  const { artifacts, insights } = summariseContextNumbers(context);

  if (artifacts === 0 && insights === 0) return null;

  if (artifacts > 0 && insights > 0) {
    return `You already have ${artifacts} artifacts and ${insights} insights in play — your system isn’t starting from zero.`;
  }

  if (artifacts > 0) {
    return `You already have ${artifacts} artifacts in the system — there’s more groundwork here than it feels.`;
  }

  return `You already have ${insights} stored insights — we can mine those instead of starting from scratch.`;
}

/**
 * Lateral thematic connection: used for alien-flavoured nudges.
 */
export function findLateralConnections(
  message: string,
  context: KnowledgeContext
): string {
  const themes = [
    "emergent system design",
    "cognitive architecture of research habits",
    "pattern language evolution",
    "ontological engineering",
    "post-disciplinary methodology",
    "practice-anchored theory building",
  ];

  const base =
    (message && message.length) +
    (Array.isArray(context.artifacts) ? context.artifacts.length * 7 : 0) +
    (Array.isArray(context.insights) ? context.insights.length * 13 : 0);

  const index = Math.abs(base) % themes.length;
  return themes[index];
}

/**
 * Recognise simple conversational / thinking patterns across last few messages.
 */
export function recognisePatterns(
  current: string,
  previous: string[]
): string[] {
  const patterns: string[] = [];
  const last = previous[previous.length - 1] || "";

  // Repetition / circling the same theme
  if (
    last &&
    current.length > 0 &&
    last.toLowerCase().includes(current.toLowerCase().slice(0, 18))
  ) {
    patterns.push("recursive inquiry");
  }

  // Expanding length
  if (current.length > last.length * 1.5 && last.length > 0) {
    patterns.push("conceptual expansion");
  }

  // Tension / contradiction
  const negatives = ["not", "never", "without", "no "];
  const positives = ["is", "has", "does", "will", "can"];
  const hasNeg = negatives.some((w) => current.includes(w));
  const hasPos = positives.some((w) => current.includes(w));
  if (hasNeg && hasPos) {
    patterns.push("dialectical tension");
  }

  return patterns.length > 0 ? patterns : ["emergent coherence"];
}
