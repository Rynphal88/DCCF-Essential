// src/components/dccf/ai/DccfAiChatWindow.tsx
"use client";

import { useState } from "react";
import { useDraggableResizableWindow } from "@/hooks/useDraggableResizableWindow";

type Mode = "auto" | "online" | "offline" | "hybrid";

interface Props {
  onClose: () => void;
}

export function DccfAiChatWindow({ onClose }: Props) {
  const {
    position,
    size,
    onMouseDownDrag,
    onMouseDownResize,
    resetWindow,
  } = useDraggableResizableWindow({
    storageKey: "dccf-ai-chat-window",
  });

  const [mode, setMode] = useState<Mode>("hybrid");
  const [input, setInput] = useState("");
  const [messages] = useState<
    { role: "user" | "assistant"; content: string; timestamp: string }[]
  >([
    {
      role: "assistant",
      content:
        "I’m your DCCF AI. Tell me what feels stuck: the gap, the methods, or just the whole doctoral load — and we’ll move one concrete step together.",
      timestamp: "9:44 PM",
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    // TODO: wire to orchestrator
    setInput("");
  };

  const handleSmartAction = (type: "next" | "refine" | "big-picture") => {
    // TODO: wire these to dedicated prompt templates
    console.log("Smart action:", type);
  };

  return (
    <div
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: 50,
      }}
      className="flex flex-col overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/95 text-slate-50 shadow-2xl shadow-sky-500/30 backdrop-blur-xl dark:bg-slate-900/95"
    >
      {/* Header – draggable */}
      <div
        className="flex cursor-move items-center justify-between px-4 py-3 text-sm"
        onMouseDown={onMouseDownDrag}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500/90 text-xs shadow-inner shadow-pink-300/60">
            🧠
          </div>
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight">DCCF INTELLIGENCE</span>
            <span className="text-[11px] text-slate-300/80">
              Global Assistant · Hybrid / Offline aware
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-4">
          <button
            type="button"
            onClick={resetWindow}
            className="h-6 w-6 rounded-full bg-slate-700/70 text-[10px] text-slate-100 hover:bg-slate-600"
            title="Reset position & size"
          >
            ⦿
          </button>
          <button
            type="button"
            className="h-6 w-6 rounded-full bg-yellow-500/90 text-[10px] text-slate-900 hover:bg-yellow-400"
            title="Minimize"
            onClick={onClose}
          >
            ─
          </button>
          <button
            type="button"
            className="h-6 w-6 rounded-full bg-red-500/90 text-[10px] text-slate-50 hover:bg-red-400"
            title="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-sky-500/40 via-slate-600/60 to-pink-500/40" />

      {/* Body – messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${
              m.role === "assistant" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                m.role === "assistant"
                  ? "bg-slate-800/90 text-slate-50"
                  : "bg-sky-600 text-slate-50"
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
              <span className="mt-1 block text-[10px] text-slate-300/70">
                {m.timestamp} · {m.role === "assistant" ? "offline-hybrid" : "you"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input + smart actions + mode */}
      <div className="border-t border-slate-700/70 bg-slate-900/90 px-4 pb-3 pt-2 text-xs">
        <div className="flex items-end gap-2">
          <div className="flex-1 rounded-2xl border border-slate-700/80 bg-slate-900 px-3 py-2 shadow-inner shadow-slate-950/80 focus-within:border-sky-500/80">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me what feels stuck in your methods…"
              rows={2}
              className="max-h-32 w-full resize-none bg-transparent text-xs leading-relaxed text-slate-50 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            className="mb-0.5 inline-flex h-9 items-center justify-center rounded-full bg-sky-600 px-4 text-xs font-semibold text-white shadow-lg shadow-sky-500/40 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!input.trim()}
          >
            Send
          </button>
        </div>

        {/* Smart actions + mode selector */}
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleSmartAction("next")}
              className="rounded-full bg-slate-800/90 px-2.5 py-1 font-medium text-slate-100 hover:bg-slate-700"
            >
              → Next step
            </button>
            <button
              type="button"
              onClick={() => handleSmartAction("refine")}
              className="rounded-full bg-slate-800/90 px-2.5 py-1 font-medium text-slate-100 hover:bg-slate-700"
            >
              ✨ Refine contribution
            </button>
            <button
              type="button"
              onClick={() => handleSmartAction("big-picture")}
              className="rounded-full bg-slate-800/90 px-2.5 py-1 font-medium text-slate-100 hover:bg-slate-700"
            >
              🌍 Big picture
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400">Mode</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="rounded-full border border-slate-600 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 shadow-sm shadow-slate-900/80 focus:border-sky-500 focus:outline-none"
            >
              <option value="auto">Auto</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resize handle (bottom-right) */}
      <div
        className="pointer-events-auto absolute bottom-1 right-2 h-4 w-4 cursor-se-resize rounded-sm text-slate-500"
        onMouseDown={onMouseDownResize}
        title="Resize"
      >
        <svg
          viewBox="0 0 16 16"
          className="h-4 w-4"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M2 14L14 2M6 14L14 6M10 14L14 10"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
