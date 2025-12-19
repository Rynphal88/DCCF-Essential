// src/app/api/ai/chat/route.ts

import { NextResponse } from "next/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";

export type AIMode = "online" | "offline" | "hybrid";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    // Basic validation
    if (!body || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "message is required." },
        { status: 400 }
      );
    }

    const message = body.message.trim();
    if (!message) {
      return NextResponse.json(
        { error: "message cannot be empty." },
        { status: 400 }
      );
    }

    // Optional user + conversation ids
    const userId =
      typeof body.userId === "string" && body.userId.length > 0
        ? body.userId
        : undefined;

    const conversationId =
      typeof body.conversationId === "string" &&
      body.conversationId.length > 0
        ? body.conversationId
        : undefined;

    // Mode: online | offline | hybrid (anything else → undefined = auto)
    const rawMode: unknown = body.mode;
    const mode: AIMode | undefined =
      rawMode === "online" || rawMode === "offline" || rawMode === "hybrid"
        ? rawMode
        : undefined;

    // Arbitrary extra context from the client (page, artifact, etc.)
    const ctx =
      body.context && typeof body.context === "object"
        ? (body.context as Record<string, any>)
        : undefined;

    // Delegate to orchestrator (server-side brain)
    const result = await aiOrchestrator.handleChat({
      message,
      userId,
      conversationId,
      clientMode: mode, // passed through to providers via context
      context: ctx,
    });

    const isoTimestamp =
      result.timestamp instanceof Date
        ? result.timestamp.toISOString()
        : result.timestamp ?? new Date().toISOString();

    // Streaming mode (SSE) when the client requests it
    if (body?.stream === true) {
      const encoder = new TextEncoder();
      const chunks = chunkText(result.response);
      const provider = mode ?? "auto";

      const stream = new ReadableStream({
        start(controller) {
          const send = (payload: unknown) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
            );
          };

          send({ type: "start" });

          for (const delta of chunks) {
            send({ type: "token", delta });
          }

          send({
            type: "done",
            fullText: result.response,
            provider,
            timestamp: isoTimestamp,
            recommendations: Array.isArray(result.recommendations)
              ? result.recommendations
              : [],
            context: result.context ?? null,
          });

          controller.close();
        },
        cancel(reason) {
          console.warn("[/api/ai/chat] stream cancelled:", reason);
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    return NextResponse.json(
      {
        // ✅ Legacy field (for any older callers)
        reply: result.response,

        // ✅ New normalized field (for new UI)
        response: result.response,

        provider: mode ?? "auto",
        timestamp: isoTimestamp,

        // ✅ Expose extra richness without breaking anything
        recommendations: Array.isArray(result.recommendations)
          ? result.recommendations
          : [],
        context: result.context ?? null,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[API /ai/chat] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}

function chunkText(text: string, maxChunk = 400): string[] {
  if (!text) return [""];
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const word of words) {
    const tentative = current ? `${current} ${word}` : word;
    if (tentative.length > maxChunk && current) {
      chunks.push(current);
      current = word;
    } else {
      current = tentative;
    }
  }

  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
}
