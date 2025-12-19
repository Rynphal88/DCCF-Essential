// src/lib/ai/offline-engine.ts

/**
 * DCCF Intelligence Core – Offline + Multi-Provider Engine (v1.1)
 *
 * Public API used by the orchestrator / API routes:
 *   - SimpleArtifact / Artifact types
 *   - generateResearchAssistantReply(input)
 *
 * New in this version:
 *   ✅ Calls the Knowledge Graph engine when no artifacts/context are provided
 *   ✅ Enriches prompts with a context summary built from your research data
 *   ✅ Still 100% safe: if anything fails, it falls back to local reasoning
 */

import { buildKnowledgeContextForPrompt } from "@/lib/ai/knowledge-graph";

export type SimpleArtifact = {
  id: string | number;
  title: string;
  type?: string | null;
  description?: string | null;
};

export type Artifact = SimpleArtifact & {
  content?: string | null;
};

export type ResearchEngineMode =
  | "local-only"
  | "cloud-preferred"
  | "cloud-only";

export type ProviderId = "local-stub" | "openai" | "deepseek" | "gemini";

export interface ResearchEngineInput {
  prompt: string;
  artifacts?: SimpleArtifact[];
  mode?: ResearchEngineMode; // default: 'cloud-preferred'
  systemPrompt?: string;
  // High-level summary of compass / research context
  contextSummary?: string;
}

export interface ResearchEngineResult {
  reply: string;
  provider: ProviderId;
  usedArtifacts: SimpleArtifact[];
}

/* -------------------------------------------------------------------------- */
/*  Helpers: env + availability                                               */
/* -------------------------------------------------------------------------- */

function getEnv(name: string): string | null {
  if (typeof process === "undefined" || !process.env) return null;
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : null;
}

function hasOpenAI(): boolean {
  return !!getEnv("OPENAI_API_KEY") || !!getEnv("NEXT_PUBLIC_OPENAI_API_KEY");
}

function hasDeepseek(): boolean {
  return !!getEnv("DEEPSEEK_API_KEY") || !!getEnv("NEXT_PUBLIC_DEEPSEEK_API_KEY");
}

function hasGemini(): boolean {
  return !!getEnv("GEMINI_API_KEY") || !!getEnv("GOOGLE_API_KEY");
}

/* -------------------------------------------------------------------------- */
/*  Public API – main entry point                                             */
/* -------------------------------------------------------------------------- */

export async function generateResearchAssistantReply(
  input: ResearchEngineInput
): Promise<ResearchEngineResult> {
  const mode: ResearchEngineMode = input.mode ?? "cloud-preferred";

  // Copy so we can safely mutate
  let artifacts: SimpleArtifact[] = [...(input.artifacts ?? [])];
  let contextSummary: string | undefined = input.contextSummary;

  /* ---------------------------------------------------------------------- */
  /*  1. Enrich with Knowledge Graph if we have no context yet              */
  /* ---------------------------------------------------------------------- */
  if ((artifacts.length === 0 || !contextSummary) && canUseKnowledgeGraph()) {
    try {
      const knowledge = await buildKnowledgeContextForPrompt(input.prompt);

      if (artifacts.length === 0 && knowledge.artifacts.length > 0) {
        artifacts = knowledge.artifacts;
      }
      if (!contextSummary && knowledge.contextSummary) {
        contextSummary = knowledge.contextSummary;
      }
    } catch (err) {
      console.error("[DCCF AI] Knowledge graph enrichment failed:", err);
      // carry on without it – safety first
    }
  }

  /* ---------------------------------------------------------------------- */
  /*  2. Build prompts with enriched context                                */
  /* ---------------------------------------------------------------------- */
  const { systemPrompt, userPrompt } = buildPrompts(
    { ...input, contextSummary },
    artifacts
  );

  /* ---------------------------------------------------------------------- */
  /*  3. Decide provider order & call models                                */
  /* ---------------------------------------------------------------------- */
  const providerOrder = decideProviderOrder(mode);

  for (const provider of providerOrder) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const reply = await callProvider(provider, systemPrompt, userPrompt);
      if (reply) {
        return {
          reply,
          provider,
          usedArtifacts: artifacts.slice(0, 3),
        };
      }
    } catch (err) {
      console.error(`[DCCF AI] Provider ${provider} failed:`, err);
    }
  }

  /* ---------------------------------------------------------------------- */
  /*  4. Absolute safety net                                                */
  /* ---------------------------------------------------------------------- */
  const fallbackReply = buildLocalFallbackReply(userPrompt, artifacts);
  return {
    reply: fallbackReply,
    provider: "local-stub",
    usedArtifacts: artifacts.slice(0, 3),
  };
}

function canUseKnowledgeGraph(): boolean {
  // This module is only used on the server, so it’s always safe.
  return true;
}

/* -------------------------------------------------------------------------- */
/*  Prompt construction                                                        */
/* -------------------------------------------------------------------------- */

function buildPrompts(
  input: ResearchEngineInput,
  artifacts: SimpleArtifact[]
): { systemPrompt: string; userPrompt: string } {
  const compassContext = input.contextSummary ?? "";

  const artifactContext =
    artifacts.length > 0
      ? artifacts
          .slice(0, 5)
          .map(
            (a, idx) =>
              `${idx + 1}. [${a.type ?? "Artifact"}] ${a.title}${
                a.description ? ` — ${a.description}` : ""
              }`
          )
          .join("\n")
      : "No explicit research artifacts were provided for this question.";

  const systemPrompt =
    input.systemPrompt ??
    [
      "You are DCCF AI, a doctoral research assistant.",
      "You understand the user's Contribution Compass, rituals, wins, and research artifacts.",
      "Always respond in clear, structured, natural language.",
      "Prioritise:",
      "1) Clarity for a stressed doctoral student",
      "2) Concrete next steps",
      "3) Alignment with contribution, not random advice.",
      "",
      compassContext &&
        `Current Compass / Research Context (if available):\n${compassContext}\n`,
      "Relevant Research Artifacts (summarised):",
      artifactContext,
      "",
      "When helpful, offer 2–3 concrete next actions.",
    ]
      .filter(Boolean)
      .join("\n");

  return {
    systemPrompt,
    userPrompt: input.prompt,
  };
}

function decideProviderOrder(mode: ResearchEngineMode): ProviderId[] {
  const cloudAvailable: ProviderId[] = [];
  if (hasOpenAI()) cloudAvailable.push("openai");
  if (hasDeepseek()) cloudAvailable.push("deepseek");
  if (hasGemini()) cloudAvailable.push("gemini");

  switch (mode) {
    case "cloud-only":
      return cloudAvailable.length > 0 ? cloudAvailable : ["local-stub"];

    case "local-only":
      return ["local-stub"];

    case "cloud-preferred":
    default:
      return cloudAvailable.length > 0
        ? [...cloudAvailable, "local-stub"]
        : ["local-stub"];
  }
}

/* -------------------------------------------------------------------------- */
/*  Provider calls (OpenAI / DeepSeek / Gemini / Local)                       */
/* -------------------------------------------------------------------------- */

async function callProvider(
  provider: ProviderId,
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  switch (provider) {
    case "openai":
      if (!hasOpenAI()) return null;
      return callOpenAI(systemPrompt, userPrompt);

    case "deepseek":
      if (!hasDeepseek()) return null;
      return callDeepseek(systemPrompt, userPrompt);

    case "gemini":
      if (!hasGemini()) return null;
      return callGemini(systemPrompt, userPrompt);

    case "local-stub":
    default:
      return buildLocalFallbackReply(userPrompt);
  }
}

/* --- OpenAI --------------------------------------------------------------- */

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey =
    getEnv("OPENAI_API_KEY") ?? getEnv("NEXT_PUBLIC_OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI error: ${response.status} – ${text}`);
  }

  const json: any = await response.json();
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

/* --- DeepSeek ------------------------------------------------------------- */

async function callDeepseek(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey =
    getEnv("DEEPSEEK_API_KEY") ?? getEnv("NEXT_PUBLIC_DEEPSEEK_API_KEY");
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY missing");

  const response = await fetch(
    "https://api.deepseek.com/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek error: ${response.status} – ${text}`);
  }

  const json: any = await response.json();
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

/* --- Gemini --------------------------------------------------------------- */

async function callGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = getEnv("GEMINI_API_KEY") ?? getEnv("GOOGLE_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY / GOOGLE_API_KEY missing");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt },
              { text: "\n\nUser question:\n" + userPrompt },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini error: ${response.status} – ${text}`);
  }

  const json: any = await response.json();
  const text =
    json.candidates?.[0]?.content?.parts?.[0]?.text ??
    json.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text)
      .join("\n") ??
    "";
  return text.trim();
}

/* -------------------------------------------------------------------------- */
/*  Local fallback (always available)                                         */
/* -------------------------------------------------------------------------- */

function buildLocalFallbackReply(
  userPrompt: string,
  artifacts: SimpleArtifact[] = []
): string {
  const artifactSummary =
    artifacts.length > 0
      ? artifacts
          .slice(0, 3)
          .map(
            (a, idx) =>
              `${idx + 1}. [${a.type ?? "Artifact"}] ${a.title}${
                a.description ? ` — ${a.description}` : ""
              }`
          )
          .join("\n")
      : "• No research artifacts were supplied with this question.";

  return [
    "I’m answering using the local DCCF reasoning engine (no external AI models were available or they failed).",
    "",
    "You asked:",
    `> ${userPrompt}`,
    "",
    "Snapshot of the research context I can see:",
    artifactSummary,
    "",
    "Suggested next steps:",
    "1. Clarify the exact output you want (summary, structure, critique, next steps, methods, etc.).",
    "2. If your question relates to a specific artifact, mention its title explicitly so I can hook into it more clearly.",
    "3. Once API keys for OpenAI / DeepSeek / Gemini are configured, this answer will automatically upgrade to a much richer, model-powered response without any UI changes.",
  ].join("\n");
}
