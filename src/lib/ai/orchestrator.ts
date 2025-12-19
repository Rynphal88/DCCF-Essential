// src/lib/ai/orchestrator.ts

import type { KnowledgeContext } from "@/lib/ai/knowledge-graph";
import {
  generateResponse,
  type GenerateResponseHistoryItem,
  type ProviderMode,
} from "@/lib/ai/providers";

/**
 * Internal message representation for the orchestrator.
 * Also doubles as history for the providers (after mapping).
 */
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  userId?: string;
  conversationId?: string;
  context?: Record<string, any>;
  clientMode?: ProviderMode | "auto";
  rapid?: boolean;
}

export interface ChatResponse {
  response: string;
  context: KnowledgeContext;
  recommendations: string[];
  timestamp: Date;
}

/**
 * Request type for artifact-focused research questions.
 * Used by /api/ai/research.
 */
export interface ResearchQuestionRequest {
  artifactId: string;
  message: string;
  userId?: string;
  clientMode?: ProviderMode | "auto";
  rapid?: boolean;
}

export interface ResearchQuestionResponse {
  content: string;
  provider: string;
  timestamp: Date;
}

/**
 * Orchestrator:
 * - keeps short per-conversation history in memory
 * - builds a KnowledgeContext (for now: minimal, safe stub)
 * - calls the provider layer with correct history + mode
 */
export class AIOrchestrator {
  // Strictly typed map so history stays ChatMessage[]
  private conversationHistory: Map<string, ChatMessage[]> = new Map();

  constructor() {
    // In a future phase, this can accept config (user, tenants, etc.)
  }

  /* ---------------------------------------------------------------------- */
  /*  General conversational endpoint (used by /api/ai/chat)                */
  /* ---------------------------------------------------------------------- */

  async handleChat(request: ChatRequest): Promise<ChatResponse> {
    const {
      message,
      userId = "anonymous",
      conversationId,
      context = {},
      clientMode,
      rapid,
    } = request;

    const trimmed = (message ?? "").trim();

    // If nothing sensible was sent, return a gentle nudge + empty context
    if (!trimmed) {
      const emptyContext: KnowledgeContext = {
        contextSummary: "",
        nodes: [],
        artifacts: [],
        insights: [],
        recommendations: [],
      };

      return {
        response:
          "I didn’t receive a clear question. Try saying what feels stuck right now in one short sentence.",
        context: emptyContext,
        recommendations: [],
        timestamp: new Date(),
      };
    }

    // Conversation key: prefer explicit conversationId, then userId
    const conversationKey = conversationId || userId || "anonymous";

    const existing = this.conversationHistory.get(conversationKey);
    const history: ChatMessage[] = existing ? [...existing] : [];

    // Build a minimal KnowledgeContext for now.
    // If you later have a real knowledge-graph, you can inject that here.
    const knowledgeContext: KnowledgeContext =
      (context.knowledgeContext as KnowledgeContext | undefined) ?? {
        contextSummary:
          typeof context.contextSummary === "string"
            ? context.contextSummary
            : "",
        nodes: [],
        artifacts: [],
        insights: Array.isArray(context.insights)
          ? (context.insights as string[])
          : [],
        recommendations: Array.isArray(context.recommendations)
          ? (context.recommendations as KnowledgeContext["recommendations"])
          : [],
      };

    // Map local ChatMessage[] → provider history type
    const providerHistory: GenerateResponseHistoryItem[] = history.map(
      (m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })
    );

    // Mode: if "auto" comes in, let the provider decide; cast is safe here
    const providerMode: ProviderMode | undefined =
      clientMode && clientMode !== "auto" ? clientMode : undefined;

    const aiText = await generateResponse({
      message: trimmed,
      history: providerHistory,
      context: knowledgeContext,
      userId,
      clientMode: providerMode,
      rapid,
    });

    // 3. Update in-memory history (last 20 turns)
    const now = new Date();

    const updatedHistory: ChatMessage[] = [
      ...history,
      {
        role: "user",
        content: trimmed,
        timestamp: now,
      },
      {
        role: "assistant",
        content: aiText,
        timestamp: now,
      },
    ];

    this.conversationHistory.set(
      conversationKey,
      updatedHistory.slice(-20) // keep last 20 messages
    );

    // 4. Flatten recommendation actions for the caller
    const recs =
      knowledgeContext.recommendations?.map((r) => r.action ?? "").filter(Boolean) ??
      [];

    return {
      response: aiText,
      context: knowledgeContext,
      recommendations: recs,
      timestamp: now,
    };
  }

  /* ---------------------------------------------------------------------- */
  /*  Artifact-focused research endpoint (/api/ai/research)                 */
  /* ---------------------------------------------------------------------- */

  async handleResearchQuestion(
    params: ResearchQuestionRequest
  ): Promise<ResearchQuestionResponse> {
    const {
      artifactId,
      message,
      userId = "anonymous",
      clientMode,
      rapid,
    } = params;

    const trimmed = (message ?? "").trim();
    const now = new Date();

    if (!trimmed) {
      return {
        content:
          "I didn’t receive a clear research question. Try asking what confuses you most about this artifact.",
        provider: clientMode ?? "auto",
        timestamp: now,
      };
    }

    // For now, we build a lightweight context that mentions the artifact.
    // Later, this can pull from Supabase / knowledge graph by artifactId.
    const researchContext: KnowledgeContext = {
      contextSummary: `User asked about artifact #${artifactId}: ${trimmed.slice(
        0,
        200
      )}`,
      nodes: [],
      artifacts: [],
      insights: [],
      recommendations: [],
    };

    const providerMode: ProviderMode | undefined =
      clientMode && clientMode !== "auto" ? clientMode : undefined;

    const reply = await generateResponse({
      message: trimmed,
      history: [],
      context: researchContext,
      userId,
      clientMode: providerMode,
      rapid,
    });

    return {
      content: reply,
      provider: clientMode ?? "auto",
      timestamp: now,
    };
  }
}

/**
 * Shared singleton, used by /api/ai/chat and /api/ai/research
 * via:
 *   import { aiOrchestrator } from "@/lib/ai/orchestrator";
 */
export const aiOrchestrator = new AIOrchestrator();
