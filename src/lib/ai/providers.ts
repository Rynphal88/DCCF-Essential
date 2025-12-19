// src/lib/ai/providers.ts

import "server-only";

import OpenAI from "openai";
import type { KnowledgeContext } from "@/lib/ai/knowledge-graph";
import {
  buildShortContextLine,
  classifyIntent,
  extractKeywords,
  findLateralConnections,
  recognisePatterns,
} from "@/lib/ai/alien-patterns";

export type ProviderMode = "online" | "offline" | "hybrid";

export interface GenerateResponseHistoryItem {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

export interface GenerateResponseOptions {
  message: string;
  history: GenerateResponseHistoryItem[];
  context: KnowledgeContext;
  userId?: string;
  /**
   * Explicit mode requested by the client / route:
   * - "online"  → force cloud model if available
   * - "offline" → skip cloud, use alien-style offline brain only
   * - "hybrid"  → blend online + offline
   * - undefined → default to "hybrid"
   */
  clientMode?: ProviderMode;
  /**
   * If true, favour shorter, punchier replies (esp. in offline mode).
   */
  rapid?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  OpenAI client (server-side)                                               */
/* -------------------------------------------------------------------------- */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

/* -------------------------------------------------------------------------- */
/*  Public entry point                                                        */
/* -------------------------------------------------------------------------- */

export async function generateResponse(
  options: GenerateResponseOptions
): Promise<string> {
  const { message, history, context, userId, clientMode, rapid } = options;
  const trimmed = (message ?? "").trim();

  if (!trimmed) {
    return "I didn’t receive a clear question. Try saying what feels stuck right now in one sentence.";
  }

  const mode: ProviderMode = clientMode ?? "hybrid";

  // 1) Pure offline: never call OpenAI
  if (mode === "offline") {
    return generateOfflineScholarResponse(trimmed, history, context, !!rapid);
  }

  // Helper to safely call OpenAI when allowed
  async function tryOnline(): Promise<string | null> {
    if (!openai) return null;

    const prompt = buildOnlinePrompt(trimmed, context, history, !!rapid);

    try {
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are DCCF AI, a doctoral research assistant for a single researcher. You give practical, concrete, next-step guidance grounded in the user’s Compass and research context. You speak in a warm, calm tone and keep paragraphs reasonably short.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: rapid ? 350 : 700,
        user: userId,
      });

      const content = completion.choices?.[0]?.message?.content?.trim();
      if (content && content.length > 0) return content;
      return null;
    } catch (err) {
      console.error("[AI Provider] Error from OpenAI:", err);
      return null;
    }
  }

  // 2) Online only: try cloud, fall back to offline if needed
  if (mode === "online") {
    const online = await tryOnline();
    if (online) return online;

    // graceful fallback if cloud fails
    return generateOfflineScholarResponse(trimmed, history, context, !!rapid);
  }

  // 3) Hybrid: blend online + offline
  const [online, offline] = await Promise.all([
    tryOnline(),
    Promise.resolve(
      generateOfflineScholarResponse(trimmed, history, context, !!rapid)
    ),
  ]);

  if (!online) {
    // If online is unavailable, just return offline brain
    return offline;
  }

  const metaLine =
    "_Offline scholar_ · pattern + emotional calibration.\n_Online model_ · expanded detail using your stored context and broader knowledge.";

  if (rapid) {
    // Short hybrid: 1–2 lines offline + 1 short online block
    return [offline, "", online, "", metaLine].join("\n");
  }

  // Full hybrid: offline frame + separator + online detail
  return [offline, "", "——", "", online, "", metaLine].join("\n");
}

/* -------------------------------------------------------------------------- */
/*  Prompt builder for online mode                                            */
/* -------------------------------------------------------------------------- */

function buildOnlinePrompt(
  message: string,
  context: KnowledgeContext,
  history: GenerateResponseHistoryItem[],
  rapid: boolean
): string {
  const insightsText =
    context.insights && context.insights.length
      ? context.insights.map((i) => `- ${i}`).join("\n")
      : "None explicitly stored.";

  const recommendationsText =
    context.recommendations && context.recommendations.length
      ? context.recommendations
          .map((r) => `- (${r.priority}) ${r.action} — ${r.reasoning}`)
          .join("\n")
      : "No specific recommendations stored yet.";

  const historyText =
    history && history.length
      ? history
          .slice(-4)
          .map(
            (h) =>
              `${h.role.toUpperCase()}: ${h.content
                .replace(/\s+/g, " ")
                .trim()}`
          )
          .join("\n")
      : "No prior conversation context.";

  const instructions = rapid
    ? [
        "INSTRUCTIONS TO ASSISTANT (RAPID MODE):",
        "1. Respond in a supportive, practical, human tone.",
        "2. Use the KnowledgeContext where it clearly helps.",
        "3. Prefer a compact answer (1–3 short paragraphs).",
        "4. If needed, give at most 3 concrete next steps.",
      ]
    : [
        "INSTRUCTIONS TO ASSISTANT:",
        "1. Respond in a supportive, practical, human tone.",
        "2. Use the KnowledgeContext where it clearly helps.",
        "3. Prefer concrete next steps over generic advice.",
        "4. Keep answers focused and avoid unnecessary repetition.",
        "5. If the question is vague, ask 1–2 clarifying questions before giving a long plan.",
      ];

  return [
    "CONVERSATION HISTORY (most recent turns):",
    historyText,
    "",
    "USER QUERY:",
    message,
    "",
    "KNOWLEDGE CONTEXT (from Compass + Research Hub + artifacts):",
    context.contextSummary || "[no additional context available]",
    "",
    "SYSTEM INSIGHTS:",
    insightsText,
    "",
    "SYSTEM RECOMMENDATIONS:",
    recommendationsText,
    "",
    ...instructions,
  ].join("\n");
}

/* -------------------------------------------------------------------------- */
/*  Offline warm + alien brain                                                */
/* -------------------------------------------------------------------------- */

function generateOfflineScholarResponse(
  message: string,
  history: GenerateResponseHistoryItem[],
  context: KnowledgeContext,
  rapid: boolean
): string {
  const intent = classifyIntent(message);
  const contextLine = buildShortContextLine(context);
  const lastMessages = history
    .filter((h) => h.role === "user")
    .slice(-3)
    .map((h) => h.content);

  const patterns = recognisePatterns(message, lastMessages);
  const keywords = extractKeywords(message);
  const lateral = findLateralConnections(message, context);

  const voiceLabel = (() => {
    if (intent.isGap) return "Compass";
    if (intent.isMethod) return "Methods";
    if (intent.isOverwhelm) return "Stabiliser";
    if (intent.isGreeting) return "Welcome";
    return "Navigator";
  })();

  const signoff = `\n\n— ${voiceLabel} · offline scholar mode`;

  /* --------------------------- 1) Greetings --------------------------- */

  if (intent.isGreeting && !intent.isGap && !intent.isMethod) {
    if (rapid) {
      const pieces = [
        "Hey buddy — I’m here and tuned into your doctoral signal.",
        "In one quick line, tell me what’s pressing most: the gap, the methods, or just the weight of everything?",
      ];
      return pieces.join(" ") + signoff;
    }

    const parts: string[] = [
      "Hey buddy — I’m fully present with you on this journey.",
    ];
    if (contextLine) {
      parts.push(contextLine);
    }
    parts.push(
      "",
      "In one short sentence, what’s actually bothering you most right now:",
      "• the **gap** (what feels unclear in the literature),",
      "• the **methods** (how to study it), or",
      "• the **overall load** (time, energy, life piling up)?"
    );
    return parts.join("\n") + signoff;
  }

  /* -------------------- 2) Gap-focused (Compass voice) -------------------- */

  if (intent.isGap) {
    if (rapid) {
      const pieces = [
        "Let’s make your gap sharp and simple, not mystical.",
        "Send two rough lines:",
        '1) “The real situation that keeps bothering me is…”',
        '2) “Most studies seem to assume that…, but in reality…”',
        "We’ll trim that into a clean, publishable gap.",
      ];
      return pieces.join(" ") + signoff;
    }

    const lines: string[] = [
      "Okay, let’s work directly on the gap — the tiny mismatch between what the literature assumes and what reality keeps doing.",
    ];
    if (contextLine) lines.push(contextLine);
    lines.push(
      "",
      "Reply with two honest lines (don’t worry about wording):",
      "1. **Problem (real world):** “The situation that keeps bothering me is…”",
      "2. **Gap (research):** “Most studies seem to assume that…, but in reality…”",
      "",
      "Once you send those, we’ll tighten the language until it sounds like a clean, journal-ready gap statement."
    );
    return lines.join("\n") + signoff;
  }

  /* --------------- 3) Methodology-focused (Method voice) ---------------- */

  if (intent.isMethod) {
    if (rapid) {
      const pieces = [
        "Your methods feel confusing because your question, worldview, and tools aren’t quite aligned yet — very normal.",
        "Paste your main research question, then tell me which opener feels right: “How do…”, “To what extent does…”, or “What is the relationship between…”. I’ll snap the design into place with you.",
      ];
      return pieces.join(" ") + signoff;
    }

    const lines: string[] = [
      "Method confusion usually means your question, worldview, and tools are slightly out of sync — not that you’re doing it wrong.",
      "",
      "Use this quick map:",
      "- If you’re really asking **“How do people experience…?”**, you’re in qualitative territory.",
      "- If you’re asking **“Does X change Y…?”**, you’re in experimental / quasi-experimental territory.",
      "- If you’re asking **“What is the relationship between A and B…?”**, you’re in correlational / regression territory.",
      "",
      "Send me:",
      "1. Your current main research question (even if messy).",
      '2. Which opener feels closest to your heart: “How do…”, “To what extent does…”, or “What is the relationship between…”.',
      "",
      "From those two pieces, we’ll realign the design so it feels like it actually fits your project."
    ];
    return lines.join("\n") + signoff;
  }

  /* --------------- 4) Overwhelm / emotional load (Stabiliser) --------------- */

  if (intent.isOverwhelm) {
    if (rapid) {
      const pieces = [
        "Feeling overloaded is data, not a personal failure.",
        contextLine || "",
        'Finish two lines for me: “Right now, the hardest part is…” and “If I could fix ONE thing this week, it would be…”. We’ll turn that into one concrete next step.',
      ].filter(Boolean);
      return pieces.join(" ") + signoff;
    }

    const lines: string[] = [
      "Feeling overwhelmed is part of doing serious work — your system is telling you it’s holding too much at once.",
    ];
    if (contextLine) lines.push(contextLine);
    lines.push(
      "",
      "Let’s narrow the field:",
      "• Finish this in your own words: **“Right now, the hardest part of my research is…”**",
      "• Then add: **“If I could fix just ONE thing this week, it would be…”**",
      "",
      "Send those two lines. We’ll turn them into a single, realistic move so the week feels manageable again."
    );
    return lines.join("\n") + signoff;
  }

  /* ------------------- 5) Generic question (Navigator) ------------------- */

  const patternLabel = patterns[0] || "emergent coherence";

  const keywordLine =
    keywords.length > 0
      ? `The core signals I’m picking up are: ${keywords
          .map((k) => `"${k}"`)
          .join(", ")}.`
      : "";

  if (rapid) {
    const pieces = [
      `Your question shows **${patternLabel}** — you’re circling something real, not just wandering.`,
      contextLine || "",
      keywordLine || "",
      `One sideways angle here is **${lateral}** — that’s the deeper structure your mind is already touching.`,
      'Complete this sentence for me: **“What I’m really trying to figure out is…”** and send it. We’ll lock the Compass from there.',
    ].filter(Boolean);
    return pieces.join(" ") + signoff;
  }

  const lines: string[] = [
    `Your question shows **${patternLabel}** — your thinking is orbiting a real structure, even if it still feels foggy.`,
  ];

  if (contextLine) lines.push(contextLine);
  if (keywordLine) lines.push(keywordLine);

  lines.push(
    `A lateral, slightly alien reading of this is **${lateral}** — there’s a pattern underneath that the usual literature doesn’t quite name.`,
    "",
    "Reply with one sentence that starts with:",
    '• **“What I’m really trying to figure out is…”**',
    "",
    "We’ll use that single line to tighten your Compass instead of floating in abstract discussion."
  );

  return lines.join("\n") + signoff;
}
