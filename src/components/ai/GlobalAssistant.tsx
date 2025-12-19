// src/components/ai/GlobalAssistant.tsx

"use client";

import { useEffect, useState } from "react";
import { ChatPanel } from "@/components/ai/ChatPanel";
import { useDraggableResizableWindow } from "@/hooks/useDraggableResizableWindow";
import { DccfAiLauncher } from "./DccfAiLauncher";

type PageContext = Record<string, unknown>;

export default function GlobalAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [pageContext, setPageContext] = useState<PageContext | undefined>(
    undefined
  );

  // Draggable + resizable shell for the global assistant window
  const {
    position,
    size,
    onMouseDownDrag,
    onMouseDownResize,
    resetWindow,
  } = useDraggableResizableWindow({
    storageKey: "dccf-ai-global-window",
    defaultPosition: { x: 40, y: 80 },
    defaultSize: { width: 420, height: 520 },
    minWidth: 320,
    minHeight: 360,
    maxWidth: 800,
    maxHeight: 900,
  });

  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : 1280;
  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : 720;
  const isSmall = viewportWidth < 768;

  // Clamp panel inside viewport while honoring the saved size
  const desktopMaxWidth = 448; // ~max-w-md
  const panelWidth = Math.min(
    Math.max(size.width, 320),
    Math.max(320, viewportWidth - 24),
    isSmall ? Math.max(320, viewportWidth - 24) : desktopMaxWidth
  );
  const panelHeight = Math.min(
    Math.max(size.height, 360),
    Math.max(360, viewportHeight - 24)
  );

  const safeX = Math.max(8, Math.min(position.x, viewportWidth - panelWidth - 8));
  const safeY = Math.max(8, Math.min(position.y, viewportHeight - panelHeight - 8));

  // Capture basic page context so the orchestrator knows where this chat is coming from
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageContext({
        path: window.location.pathname,
        page: "global-assistant",
        source: "floating-widget",
      });
    }
  }, []);

  return (
    <>
      {/* Floating launcher button (draggable, movable) */}
      {!isOpen && (
        <div
          className="fixed z-30"
          style={{
            right: isSmall ? 12 : 24,
            bottom: isSmall ? 72 : 32,
          }}
        >
          <DccfAiLauncher onOpen={() => setIsOpen(true)} />
        </div>
      )}

      {/* Floating assistant panel (draggable + resizable) */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            left: safeX,
            top: safeY,
            width: isSmall ? Math.max(panelWidth, viewportWidth - 24) : panelWidth,
            height: panelHeight,
            zIndex: 40,
          }}
          role="dialog"
          aria-label="DCCF Global Assistant"
          className="flex max-h-[90vh] max-w-[96vw] flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/95 text-slate-100 shadow-2xl shadow-slate-900/80 backdrop-blur-md"
        >
          {/* Header (drag handle) */}
          <div
            className="flex cursor-move items-center justify-between border-b border-slate-800 px-4 py-3"
            onMouseDown={onMouseDownDrag}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500/90 text-xs shadow-inner shadow-pink-300/60">
                🧠
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wide text-sky-400">
                  DCCF Intelligence
                </span>
                <span className="text-[11px] text-slate-400">
                  Global Assistant · Hybrid / Offline aware
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-3">
              {/* Status pill */}
              <span className="hidden items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300 sm:inline-flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <span>Ready</span>
              </span>

              {/* Reset window layout */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetWindow();
                }}
                className="h-6 w-6 rounded-full bg-slate-800/80 text-[10px] text-slate-100 hover:bg-slate-700"
                title="Reset position & size"
              >
                ⦿
              </button>

              {/* Close / Minimize */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="h-6 w-6 rounded-full bg-slate-800/80 text-xs text-slate-200 hover:bg-slate-700"
                aria-label="Close assistant"
                title="Close assistant"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Chat content – unified ChatPanel */}
          <div className="flex-1 min-h-0">
            <ChatPanel pageContext={pageContext} />
          </div>

          {/* Resize handle – bottom-right */}
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
      )}
    </>
  );
}
