// src/components/ai/AIModeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import type { ProviderMode } from "@/lib/ai/providers";

// UI mode = "auto" plus the provider modes
export type AIMode = ProviderMode | "auto";

interface AIModeToggleProps {
  initialMode?: AIMode;
  initialRapid?: boolean;
  onChange?: (mode: AIMode, rapid: boolean) => void;
}

const MODE_LABEL: Record<AIMode, string> = {
  auto: "Auto",
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
};

const MODE_DESC: Record<AIMode, string> = {
  auto: "Let the system decide when to use cloud vs offline brain.",
  online: "Use cloud model only (if available).",
  offline: "Stay in local scholar / alien-pattern mode.",
  hybrid: "Blend offline patterns with cloud detail.",
};

export function AIModeToggle({
  initialMode = "auto",
  initialRapid = false,
  onChange,
}: AIModeToggleProps) {
  const [mode, setMode] = useState<AIMode>(initialMode);
  const [rapid, setRapid] = useState<boolean>(initialRapid);

  // Notify parent whenever mode or rapid changes
  useEffect(() => {
    onChange?.(mode, rapid);
  }, [mode, rapid, onChange]);

  const modes: AIMode[] = ["auto", "online", "offline", "hybrid"];

  return (
    <div className="pointer-events-auto fixed bottom-4 right-4 z-40 select-none text-xs sm:bottom-6 sm:right-6">
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/90 px-3 py-2 shadow-xl backdrop-blur-sm sm:px-4 sm:py-3">
        {/* Header row: status + rapid toggle */}
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            <span className="font-medium text-slate-100">
              Mode: {MODE_LABEL[mode]}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setRapid((r) => !r)}
            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition ${
              rapid
                ? "border-amber-400/70 bg-amber-500/10 text-amber-200"
                : "border-slate-700 bg-slate-900 text-slate-300"
            }`}
          >
            {rapid ? "Rapid replies" : "Full replies"}
          </button>
        </div>

        {/* Mode buttons */}
        <div className="flex flex-wrap gap-1">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full px-2.5 py-1 text-[11px] transition ${
                m === mode
                  ? "bg-sky-500/90 text-slate-950 shadow-sm"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>

        {/* Description */}
        <p className="mt-2 text-[10px] text-slate-400">
          {MODE_DESC[mode]}
          {rapid ? " · Shorter, punchier messages." : ""}
        </p>
      </div>
    </div>
  );
}
