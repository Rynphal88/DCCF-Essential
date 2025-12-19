// src/lib/ai/knowledge-graph.ts

/**
 * DCCF Knowledge Graph Engine (v1.5)
 *
 * Responsibilities:
 *  - Pull recent artifacts from Supabase
 *  - Mix them with static DCCF OS knowledge
 *  - Keep a lightweight in-memory conversation history per user
 *  - Score nodes for relevance to a query
 *  - Produce a KnowledgeContext for the AI orchestrator
 *
 * No external AI calls here – this file is pure data + scoring.
 */

import { getSupabaseServerClient } from "@/lib/supabase/server";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type KnowledgeSource = "supabase" | "static" | "memory";

export type KnowledgeNodeKind =
  | "artifact"
  | "doc"
  | "compass"
  | "ritual"
  | "system"
  | "conversation";

export interface KnowledgeNode {
  id: string;
  kind: KnowledgeNodeKind;
  title: string;
  summary: string;
  content?: string;
  tags: string[];
  source: KnowledgeSource;
  createdAt?: string;
  score?: number;
  metadata?: {
    userId?: string;
    messageRole?: "user" | "assistant" | "system";
    timestamp?: string;
    [key: string]: any;
  };
}

export interface KnowledgeContext {
  nodes: KnowledgeNode[];
  artifacts: {
    id: string | number;
    title: string;
    type?: string | null;
    description?: string | null;
  }[];
  contextSummary: string;
  insights: string[];
  recommendations: {
    action: string;
    priority: "low" | "medium" | "high";
    reasoning: string;
    estimatedTime?: number;
  }[];
}

export interface QueryOptions {
  limit?: number;
  minRelevance?: number;
}

/* -------------------------------------------------------------------------- */
/*  Static DCCF OS nodes                                                      */
/* -------------------------------------------------------------------------- */

const STATIC_NODES: KnowledgeNode[] = [
  {
    id: "compass-core",
    kind: "compass",
    title: "Contribution Compass Core",
    summary:
      "The Compass tracks Problem, Gap, and Contribution across phases, ensuring all activity moves the doctoral work toward a clear, defensible contribution.",
    tags: ["dccf", "compass", "contribution"],
    source: "static",
  },
  {
    id: "rituals-daily",
    kind: "ritual",
    title: "Daily & Weekly Rituals",
    summary:
      "Short, repeatable check-ins that keep you out of drift: defining today's single move, reviewing wins, and reconnecting with the research North Star.",
    tags: ["dccf", "rituals", "habits"],
    source: "static",
  },
  {
    id: "research-hub",
    kind: "doc",
    title: "Research Hub Overview",
    summary:
      "The Research Hub aggregates artifacts such as notes, literature reviews, drafts, and insights, so the AI can see the whole research landscape at once.",
    tags: ["dccf", "research-hub"],
    source: "static",
  },
  {
    id: "wins-log",
    kind: "system",
    title: "Wins & Progress Log",
    summary:
      "A running record of visible progress that counters impostor syndrome and helps the AI remind you of how far you've already come.",
    tags: ["dccf", "wins"],
    source: "static",
  },
  {
    id: "bottlenecks",
    kind: "doc",
    title: "Common Doctoral Bottlenecks",
    summary:
      "Conceptual ambiguity, scattered notes, structural drift, literature overwhelm, and unclear contribution pathways are the five recurring blockers.",
    tags: ["bottlenecks", "risk"],
    source: "static",
  },
];

/* -------------------------------------------------------------------------- */
/*  Core class                                                                */
/* -------------------------------------------------------------------------- */

export class DCCFKnowledgeGraph {
  private static instance: DCCFKnowledgeGraph | null = null;

  // In-memory conversation nodes per userId
  private conversationNodes = new Map<string, KnowledgeNode[]>();

  private constructor() {
    // singleton
  }

  static getInstance(): DCCFKnowledgeGraph {
    if (!DCCFKnowledgeGraph.instance) {
      DCCFKnowledgeGraph.instance = new DCCFKnowledgeGraph();
    }
    return DCCFKnowledgeGraph.instance;
  }

  /* ---------------------------------------------------------------------- */
  /*  Public API                                                            */
  /* ---------------------------------------------------------------------- */

  /**
   * Build a knowledge context for a given user query.
   * Used directly by AIOrchestrator.
   */
  async buildKnowledgeContextForPrompt(
    query: string,
    userId?: string,
    options?: QueryOptions
  ): Promise<KnowledgeContext> {
    const trimmed = (query ?? "").trim();
    if (!trimmed) {
      return {
        nodes: [],
        artifacts: [],
        contextSummary: "",
        insights: [],
        recommendations: [],
      };
    }

    const [supabaseNodes, staticNodes] = await Promise.all([
      this.fetchSupabaseArtifactNodes(userId),
      Promise.resolve(STATIC_NODES),
    ]);

    const allNodes = [...supabaseNodes, ...staticNodes];

    if (allNodes.length === 0) {
      return {
        nodes: [],
        artifacts: [],
        contextSummary: "",
        insights: [],
        recommendations: [],
      };
    }

    const scored = scoreNodes(allNodes, trimmed);
    const limit = options?.limit ?? 10;
    const minRelevance = options?.minRelevance ?? 0;

    const topNodes = scored
      .filter((n) => (n.score ?? 0) >= minRelevance)
      .slice(0, limit);

    const artifacts = topNodes
      .filter((n) => n.kind === "artifact" || n.kind === "doc")
      .slice(0, 5)
      .map((n) => ({
        id: n.id,
        title: n.title,
        type: n.kind,
        description: n.summary,
      }));

    const contextSummary = buildContextSummary(topNodes);
    const insights = buildInsights(topNodes);
    const recommendations = buildRecommendations(topNodes, trimmed);

    return {
      nodes: topNodes,
      artifacts,
      contextSummary,
      insights,
      recommendations,
    };
  }

  /**
   * Store a conversation message as a KnowledgeNode in memory.
   * This is enough for v1; we can later persist to Supabase if needed.
   */
  async addConversationMessage(
    userId: string,
    message: {
      role: "user" | "assistant" | "system";
      content: string;
      timestamp: Date;
      metadata?: Record<string, any>;
    }
  ): Promise<KnowledgeNode> {
    const id = `conv-${userId}-${message.timestamp.getTime()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const node: KnowledgeNode = {
      id,
      kind: "conversation",
      title: `Conversation (${message.role})`,
      summary: message.content.slice(0, 200),
      content: message.content,
      tags: ["conversation", message.role, userId],
      source: "memory",
      createdAt: message.timestamp.toISOString(),
      metadata: {
        userId,
        messageRole: message.role,
        timestamp: message.timestamp.toISOString(),
        ...(message.metadata ?? {}),
      },
    };

    const list = this.conversationNodes.get(userId) ?? [];
    list.push(node);
    // keep last 50 messages in memory per user
    if (list.length > 50) {
      list.splice(0, list.length - 50);
    }
    this.conversationNodes.set(userId, list);

    return node;
  }

  /**
   * Return recent conversation nodes for a user from in-memory store.
   */
  async getConversationHistory(
    userId: string,
    limit = 10
  ): Promise<KnowledgeNode[]> {
    const list = this.conversationNodes.get(userId) ?? [];
    if (limit <= 0) return [];
    return list.slice(-limit);
  }

  /* ---------------------------------------------------------------------- */
  /*  Supabase → KnowledgeNodes                                             */
  /* ---------------------------------------------------------------------- */

  private async fetchSupabaseArtifactNodes(
    userId?: string
  ): Promise<KnowledgeNode[]> {
    try {
      const supabase = getSupabaseServerClient();

      let query = supabase
        .from("artifacts")
        .select("id, type, title, description, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (userId) {
        // if you have user_id column with RLS
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("[DCCF KG] Supabase artifacts error:", error);
        return [];
      }
      if (!data) return [];

      return data.map((row: any): KnowledgeNode => ({
        id: String(row.id),
        kind: "artifact",
        title: row.title ?? "Untitled artifact",
        summary: row.description ?? "",
        tags: [row.type ?? "artifact"],
        source: "supabase",
        createdAt: row.created_at ?? undefined,
      }));
    } catch (err) {
      console.error("[DCCF KG] Supabase artifacts fetch failed:", err);
      return [];
    }
  }
}

/* -------------------------------------------------------------------------- */
/*  Convenience free function (if anything else wants it)                     */
/* -------------------------------------------------------------------------- */

export async function buildKnowledgeContextForPrompt(
  query: string,
  userId?: string,
  options?: QueryOptions
): Promise<KnowledgeContext> {
  return DCCFKnowledgeGraph.getInstance().buildKnowledgeContextForPrompt(
    query,
    userId,
    options
  );
}

/* -------------------------------------------------------------------------- */
/*  Scoring & helpers                                                         */
/* -------------------------------------------------------------------------- */

function scoreNodes(nodes: KnowledgeNode[], query: string): KnowledgeNode[] {
  const q = query.toLowerCase();
  const terms = tokenize(q);

  const scored = nodes.map((node) => {
    const haystack = (
      node.title +
      " " +
      node.summary +
      " " +
      node.tags.join(" ")
    ).toLowerCase();

    let score = 0;

    for (const term of terms) {
      if (!term) continue;
      if (haystack.includes(term)) {
        score += 3; // keyword hit
      }
    }

    // small recency bonus for Supabase artifacts
    if (node.source === "supabase" && node.createdAt) {
      const daysOld =
        (Date.now() - new Date(node.createdAt).getTime()) /
        (1000 * 60 * 60 * 24);
      const recencyBonus = Math.max(0, 1 - daysOld / 60); // 60-day window
      score += recencyBonus * 2;
    }

    return { ...node, score };
  });

  return scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

function tokenize(text: string): string[] {
  return text
    .split(/[\s,.;:!?/\\]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
}

function buildContextSummary(nodes: KnowledgeNode[]): string {
  if (nodes.length === 0) return "";

  const lines = nodes.slice(0, 6).map((n) => {
    const tag = n.kind.toUpperCase();
    return `- [${tag}] ${n.title} — ${n.summary}`;
  });

  return [
    "Condensed view of the most relevant items from the DCCF OS and your Research Hub:",
    ...lines,
  ].join("\n");
}

function buildInsights(nodes: KnowledgeNode[]): string[] {
  const insights: string[] = [];

  const hasCompass = nodes.some((n) => n.kind === "compass");
  const hasArtifacts = nodes.some((n) => n.kind === "artifact");

  if (hasCompass && !hasArtifacts) {
    insights.push(
      "You have Compass definitions but few recent artifacts. Connecting concrete notes or drafts to your Compass will help prevent research drift."
    );
  }

  if (hasArtifacts && !hasCompass) {
    insights.push(
      "You have artifacts but I don’t see Compass information in this context. It might be useful to clarify Problem, Gap, and Contribution so we can better align your work."
    );
  }

  if (!insights.length && nodes.length > 0) {
    insights.push(
      "There is usable context from your DCCF OS and artifacts. We can turn this into concrete next steps for your research."
    );
  }

  return insights;
}

function buildRecommendations(
  nodes: KnowledgeNode[],
  query: string
): KnowledgeContext["recommendations"] {
  const recs: KnowledgeContext["recommendations"] = [];
  const lower = query.toLowerCase();
  const hasArtifacts = nodes.some((n) => n.kind === "artifact");
  const asksMethodology = lower.includes("methodology") || lower.includes("method");
  const asksNextStep =
    lower.includes("next step") ||
    lower.includes("next steps") ||
    lower.includes("stuck");

  if (asksMethodology || asksNextStep) {
    recs.push({
      action: "Choose one 30–60 minute task to move your methodology forward",
      priority: "high",
      reasoning:
        "Small, well-defined actions reduce overwhelm and make your research pipeline feel tractable.",
      estimatedTime: 45,
    });
  }

  if (hasArtifacts) {
    recs.push({
      action: "Review one recent artifact and link it explicitly to your Compass",
      priority: "medium",
      reasoning:
        "Tightening the connection between concrete work and your Problem–Gap–Contribution clarifies progress.",
      estimatedTime: 20,
    });
  }

  if (!recs.length) {
    recs.push({
      action: "Describe what currently feels most confusing about your research",
      priority: "low",
      reasoning:
        "Once the main source of confusion is named, we can shape a very specific next step.",
    });
  }

  return recs;
}
