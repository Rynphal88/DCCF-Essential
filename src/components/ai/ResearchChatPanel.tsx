// src/components/ai/ResearchChatPanel.tsx
"use client";

import { useState } from "react";
import { AIModeToggle, type AIMode } from "./AIModeToggle";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ResearchChatPanelProps {
  artifactId: number;
}

/**
 * Lightweight AI assistant panel scoped to a single research artifact.
 * - Shares the same AI mode toggle as the main ChatPanel (online / offline / hybrid, rapid).
 * - Talks to /api/ai/research with { artifactId, message, mode, rapid }.
 */
export function ResearchChatPanel({ artifactId }: ResearchChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<AIMode>("hybrid"); // ✅ FIX: "hybrid" instead of "auto"
  const [rapid, setRapid] = useState(false);
  const [isSending, setIsSending] = useState(false);

  function addMessage(role: "user" | "assistant", content: string) {
    const nowIso = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        role,
        content,
        timestamp: nowIso,
      },
    ]);
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setInput("");
    addMessage("user", trimmed);
    setIsSending(true);

    try {
      const res = await fetch("/api/ai/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artifactId,
          message: trimmed,
          mode,   // sent to backend if you choose to use it later
          rapid,  // ditto
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const errorMsg =
          data?.error || "The research assistant ran into an unexpected error.";
        addMessage("assistant", `⚠️ ${errorMsg}`);
        return;
      }

      const data = await res.json();
      const reply: string =
        typeof data.reply === "string" && data.reply.trim().length > 0
          ? data.reply
          : "I couldn’t generate a response this time, but we can try another angle.";

      addMessage("assistant", reply);
    } catch (err) {
      console.error("[ResearchChatPanel] Error sending message:", err);
      addMessage(
        "assistant",
        "⚠️ Network or server issue while talking to the research assistant."
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-inner backdrop-blur">
      {/* Header row: title + mode toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Artifact Research Assistant
          </h3>
          <p className="text-[11px] text-slate-400">
            Ask targeted questions about this artifact, your gap, or methodology.
          </p>
        </div>

        <AIModeToggle
          initialMode={mode}
          initialRapid={rapid}
          onChange={(nextMode, nextRapid) => {
            setMode(nextMode);
            setRapid(nextRapid);
          }}
        />
      </div>

      {/* Messages list */}
      <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl bg-slate-950/80 p-3 text-xs">
        {messages.length === 0 ? (
          <p className="text-[11px] text-slate-500">
            Start by telling me what this artifact is doing in your system:
            summary, method, or findings. I’ll help you connect it back to your
            Compass.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  m.role === "user"
                    ? "bg-sky-600 text-slate-50"
                    : "bg-slate-800 text-slate-100"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input row */}
      <div className="flex flex-col gap-2 text-xs">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Ask something like: “What does this artifact suggest about my gap?” or “How does this method align with my research question?”"
          className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] text-slate-500">
            Press <span className="font-mono">Enter</span> to send,{" "}
            <span className="font-mono">Shift+Enter</span> for a new line.
          </p>
          <button
            type="button"
            onClick={sendMessage}
            disabled={isSending || !input.trim()}
            className="inline-flex items-center rounded-lg bg-sky-600 px-3 py-1.5 text-[11px] font-semibold text-slate-50 shadow-sm transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? "Thinking…" : "Ask AI"}
          </button>
        </div>
      </div>
    </div>
  );
}
