// src/app/api/ai/research/route.ts

import { NextResponse } from "next/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";

type Mode = "online" | "offline" | "hybrid";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (
      !body ||
      typeof body.message !== "string" ||
      body.artifactId === undefined ||
      body.artifactId === null
    ) {
      return NextResponse.json(
        { error: "artifactId and message are required." },
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

    const artifactRaw = body.artifactId;
    const artifactId =
      typeof artifactRaw === "string" ? artifactRaw : String(artifactRaw);

    const userId =
      typeof body.userId === "string" && body.userId.length > 0
        ? body.userId
        : undefined;

    const rawMode: unknown = body.mode;
    const mode: Mode | undefined =
      rawMode === "online" || rawMode === "offline" || rawMode === "hybrid"
        ? rawMode
        : undefined;

    const result = await aiOrchestrator.handleChat({
      message,
      userId,
      conversationId: `artifact:${artifactId}`,
      clientMode: mode,
      context: { artifactId },
    });

    return NextResponse.json(
      {
        reply: result.response,
        provider: mode ?? "auto",
        timestamp: result.timestamp,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[API /ai/research] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
