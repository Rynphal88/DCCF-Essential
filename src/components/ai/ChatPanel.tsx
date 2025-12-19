// src/components/ai/ChatPanel.tsx

"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEventHandler,
} from "react";
import type {
  CompassState,
  QuadrantId,
} from "@/components/contribution/types";
import type { AIMode, ChatMessage } from "@/lib/ai/types";

type Mode = AIMode;

interface ChatPanelProps {
  pageContext?: Record<string, unknown>;
}

interface ApiChatResponse {
  reply?: string;
  response?: string;
  provider?: string;
  timestamp?: string | Date;
  recommendations?: string[];
  context?: Record<string, unknown> | null;
  error?: string;
}

const quadrantOrder: QuadrantId[] = ["problem", "gap", "contribution", "alignment"];

/**
 * Compass-aware sidebar:
 * - Mode & context
 * - Quadrant summary (problem, gap, contribution, alignment)
 * - Alignment, drift, momentum metrics
 * - AI insights & next best action
 * - Suggested next moves (clickable)
 */
function CompassSidebar(props: {
  mode: Mode;
  pageContext?: Record<string, unknown>;
  recommendations: string[];
  lastAssistant?: ChatMessage;
  compassState: CompassState | null;
  forceVisible?: boolean;
  onRecommendationClick: (rec: string) => void;
  onCollapse: () => void;
}) {
  const {
    mode,
    pageContext,
    recommendations,
    lastAssistant,
    compassState,
    forceVisible,
    onRecommendationClick,
    onCollapse,
  } = props;

  const path =
    (pageContext?.path as string | undefined) ??
    (pageContext?.pathname as string | undefined) ??
    "/";
  const source = (pageContext?.source as string | undefined) ?? "global-assistant";

  const modeLabel =
    mode === "auto"
      ? "Auto – let DCCF decide"
      : mode === "online"
      ? "Online – full internet"
      : mode === "offline"
      ? "Offline – local & cached"
      : "Hybrid – blend of both";

  const compassFocusPreview =
    lastAssistant?.content?.slice(0, 160) ??
    "Once we start talking, this strip will show a live snapshot of what the Compass thinks your attention is on: gap, methods, writing, or contribution.";

  return (
    <aside
      className={`${
        forceVisible ? "flex" : "hidden md:flex"
      } h-full flex-col overflow-y-auto border-l border-slate-800/80 bg-slate-950/98 px-3 py-3 text-[11px] text-slate-200`}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-sky-400">
            Compass Strip
          </span>
          <span className="text-[10px] text-slate-400">
            Live context · Control room
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-200">
            {mode.toUpperCase()}
          </span>
          <button
            type="button"
            onClick={onCollapse}
            className="hidden rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 md:inline-flex"
            aria-label="Hide Compass strip"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Context card */}
      <div className="mb-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Current surface
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between gap-1">
            <span className="text-slate-400">Path</span>
            <span className="truncate text-right text-slate-100" title={path}>
              {path}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1">
            <span className="text-slate-400">Source</span>
            <span className="truncate text-right text-slate-100">
              {source}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1">
            <span className="text-slate-400">Mode</span>
            <span className="truncate text-right text-slate-100">
              {modeLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Compass metrics (alignment, drift, momentum) */}
      <div className="mb-2 rounded-xl border border-emerald-700/50 bg-emerald-950/30 px-3 py-2">
        <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
          <span>Compass metrics</span>
          {compassState && (
            <span className="rounded-full bg-emerald-900/70 px-2 py-0.5 text-[9px] text-emerald-100">
              {compassState.overallAlignment}% aligned
            </span>
          )}
        </div>
        {compassState ? (
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div>
              <div className="text-sm font-bold text-emerald-100">
                {compassState.overallAlignment}%
              </div>
              <div className="text-emerald-300/70">Alignment</div>
            </div>
            <div>
              <div className="text-sm font-bold text-amber-200">
                {compassState.researchDrift}%
              </div>
              <div className="text-amber-300/70">Drift</div>
            </div>
            <div>
              <div className="text-sm font-bold text-sky-200">
                {compassState.weeklyMomentum > 0 ? "+" : ""}
                {compassState.weeklyMomentum}%
              </div>
              <div className="text-sky-300/70">Momentum</div>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-emerald-200/80">
            Connecting to your Compass…
          </p>
        )}
      </div>

      {/* Quadrant summary */}
      <div className="mb-2 rounded-xl border border-violet-700/50 bg-violet-950/30 px-3 py-2">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-violet-300">
          Quadrants
        </div>
        {compassState ? (
          <div className="space-y-1.5">
            {quadrantOrder.map((id) => {
              const q = compassState.quadrants[id];
              return (
                <div key={id} className="flex items-center gap-2">
                  <span className="text-sm">{q.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-[10px] font-medium text-violet-100">
                        {q.title}
                      </span>
                      <span className="text-[9px] text-violet-300/80">
                        {q.progress}%
                      </span>
                    </div>
                    <div className="mt-0.5 h-1 w-full rounded-full bg-violet-900/50">
                      <div
                        className="h-1 rounded-full bg-violet-400"
                        style={{ width: `${q.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-violet-200/80">
            Quadrant data loading…
          </p>
        )}
      </div>

      {/* AI Insights */}
      {compassState && compassState.aiInsights.length > 0 && (
        <div className="mb-2 rounded-xl border border-sky-700/50 bg-sky-950/30 px-3 py-2">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
            Compass Insights
          </div>
          <ul className="space-y-1 text-[10px] text-sky-100">
            {compassState.aiInsights.slice(0, 3).map((insight, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-sky-400" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
          {compassState.nextBestAction && (
            <div className="mt-2 rounded-lg bg-sky-900/40 px-2 py-1.5 text-[10px]">
              <div className="text-[9px] font-semibold uppercase text-sky-300/80">
                Next best action
              </div>
              <div className="mt-0.5 text-sky-100">
                {compassState.nextBestAction}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compass focus from last assistant */}
      <div className="mb-2 rounded-xl border border-slate-700/60 bg-slate-900/40 px-3 py-2">
        <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-300">
          <span>Last reply focus</span>
          {lastAssistant && (
            <span className="rounded-full bg-slate-800/70 px-2 py-0.5 text-[9px] text-slate-200">
              live
            </span>
          )}
        </div>
        <p className="text-[11px] leading-relaxed text-slate-100">
          {compassFocusPreview}
          {lastAssistant && lastAssistant.content.length > 160 && "…"}
        </p>
      </div>

      {/* Recommendations – clickable to prefill input */}
      <div className="mt-auto rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2">
        <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-300">
          <span>Suggested next moves</span>
          {recommendations.length > 0 && (
            <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[9px] text-slate-100">
              {recommendations.length}
            </span>
          )}
        </div>
        {recommendations.length === 0 ? (
          <p className="text-[11px] text-slate-400">
            When DCCF suggests next steps, they will appear here as
            click-to-apply actions that prefill the chat box.
          </p>
        ) : (
          <div className="space-y-1">
            {recommendations.map((rec, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onRecommendationClick(rec)}
                className="w-full rounded-lg bg-slate-800/80 px-2 py-1 text-left text-[11px] text-slate-100 hover:bg-slate-700/90"
              >
                {rec}
              </button>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
          <a
            href="/compass"
            className="text-sky-300 hover:text-sky-200 hover:underline"
          >
            Open full Compass →
          </a>
          <span className="text-slate-500">Control room view</span>
        </div>
      </div>
    </aside>
  );
}

/**
 * Main ChatPanel – split view:
 * - Left: conversation + input + smart actions + mode
 * - Right: Compass-aware sidebar (control room strip)
 * - Draggable divider + collapse
 * - Attachments + voice input
 */
export function ChatPanel({ pageContext }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "I’m your DCCF AI. Tell me what feels stuck: the gap, the methods, or just the whole doctoral load — and we’ll move one concrete step together.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("hybrid");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [compassState, setCompassState] = useState<CompassState | null>(null);

  // 📎 Attachments
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 🎙 Voice input
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // 🔄 Streaming assistant message slot
  const pendingAssistantIndexRef = useRef<number | null>(null);

  // 🧭 Sidebar layout
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [sidebarWidth, setSidebarWidth] = useState(320); // px
  const [isResizing, setIsResizing] = useState(false);
  const [isSmall, setIsSmall] = useState(false);
  const appliedInitialSidebar = useRef(false);

  const [conversationId] = useState<string>(() =>
    `dccf-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`
  );

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const decorateTimestamp = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const displayTimestamp = (value?: string | Date) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    try {
      return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatServerTimestamp = (value?: string | Date) => {
    if (!value) return undefined;
    try {
      const d = typeof value === "string" ? new Date(value) : value;
      if (Number.isNaN(d.getTime())) return undefined;
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return undefined;
    }
  };

  const addMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const getLastUserMessage = () =>
    [...messages].reverse().find((m) => m.role === "user");

  const getLastAssistantMessage = () =>
    [...messages].reverse().find((m) => m.role === "assistant");

  const lastAssistant = getLastAssistantMessage();

  // Auto-scroll when messages change
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Track viewport size for responsive layout; collapse sidebar initially on small
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      const small = window.innerWidth < 768;
      setIsSmall(small);
      if (small && !appliedInitialSidebar.current) {
        setSidebarVisible(false);
      }
      if (!appliedInitialSidebar.current) {
        appliedInitialSidebar.current = true;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🧭 Sidebar drag-resize
  useEffect(() => {
    if (!isResizing) return;

    const handleMove = (event: MouseEvent) => {
      const min = 260;
      const max = 520;
      const newWidth = Math.min(
        max,
        Math.max(min, window.innerWidth - event.clientX)
      );
      setSidebarWidth(newWidth);
    };

    const handleUp = () => setIsResizing(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isResizing]);

  // 🧭 Load Compass state (with optional userId)
  useEffect(() => {
    const loadCompassState = async () => {
      try {
        const path =
          (pageContext?.path as string | undefined) ??
          (pageContext?.pathname as string | undefined) ??
          "/";
        const source =
          (pageContext?.source as string | undefined) ?? "global-assistant";
        const userId = pageContext?.userId as string | undefined;

        const res = await fetch("/api/compass/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, source, userId }),
        });

        if (!res.ok) return;
        const data = await res.json();
        if (data?.compass) {
          setCompassState(data.compass as CompassState);
        }
      } catch (err) {
        console.error("Failed to load Compass state:", err);
      }
    };

    loadCompassState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageContext]);

  // 🎙 Voice recognition (Web Speech API where available)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const clearAssistantPlaceholderRef = () => {
    pendingAssistantIndexRef.current = null;
  };

  const addAssistantPlaceholder = () => {
    const ts = decorateTimestamp();
    setMessages((prev) => {
      const idx = prev.length;
      pendingAssistantIndexRef.current = idx;
      return [...prev, { role: "assistant", content: "", timestamp: ts }];
    });
  };

  const updateAssistantMessage = (content: string, timestamp?: string) => {
    const idx = pendingAssistantIndexRef.current;
    if (idx === null) return;
    setMessages((prev) => {
      if (idx >= prev.length) return prev;
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        content,
        timestamp: timestamp ?? updated[idx].timestamp,
      };
      return updated;
    });
  };

  const handleStreamResponse = async (body: ReadableStream<Uint8Array>) => {
    addAssistantPlaceholder();
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assembled = "";
    let finalTimestamp: string | undefined;
    let sawDone = false;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const evt of events) {
          const line = evt.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          let parsed: any;
          try {
            parsed = JSON.parse(payload);
          } catch {
            continue;
          }

          if (parsed?.type === "token" && typeof parsed.delta === "string") {
            assembled += parsed.delta;
            updateAssistantMessage(assembled);
          } else if (parsed?.type === "done") {
            sawDone = true;
            finalTimestamp =
              formatServerTimestamp(parsed.timestamp) ?? decorateTimestamp();
            if (Array.isArray(parsed.recommendations)) {
              setRecommendations(parsed.recommendations);
            }
            updateAssistantMessage(
              assembled || parsed.fullText || "",
              finalTimestamp
            );
          } else if (parsed?.type === "error") {
            setError(
              parsed.error || "Stream error from the AI service. Please retry."
            );
          }
        }
      }

      if (!sawDone && assembled) {
        updateAssistantMessage(assembled, finalTimestamp);
      }
    } finally {
      clearAssistantPlaceholderRef();
    }
  };

  const sendToBackend = async (
    userContent: string,
    meta?: Record<string, any>
  ) => {
    setIsSending(true);
    setError(null);

    try {
      const userId = pageContext?.userId as string | undefined;

      const attachmentMeta =
        attachedFiles.length > 0
          ? attachedFiles.map((f) => ({
              name: f.name,
              size: f.size,
              type: f.type,
            }))
          : undefined;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message: userContent,
          mode,
          conversationId,
          userId,
          stream: true,
          context: {
            ...(pageContext ?? {}),
            widget: "global-assistant",
            attachments: attachmentMeta,
            ...meta,
          },
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (res.ok && res.body && contentType.includes("text/event-stream")) {
        await handleStreamResponse(res.body);
        // Clear attachments after a successful turn
        setAttachedFiles([]);
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      // Fallback to JSON mode (legacy/non-streaming)
      const data: ApiChatResponse = await res.json();

      const assistantText =
        data.response ??
        data.reply ??
        (typeof data === "string" ? data : JSON.stringify(data));

      const ts =
        formatServerTimestamp(data.timestamp) ?? decorateTimestamp();

      setRecommendations(
        Array.isArray(data.recommendations) ? data.recommendations : []
      );

      addMessage({
        role: "assistant",
        content: assistantText,
        timestamp: ts,
      });

      // Clear attachments after a successful turn
      setAttachedFiles([]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(
        "I hit a glitch talking to the AI service. You can retry, or inspect logs for /api/ai/chat."
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    let messageContent = trimmed;

    if (attachedFiles.length > 0) {
      const names = attachedFiles.map((f) => f.name).join(", ");
      messageContent += `\n\n[Attached documents: ${names}]`;
    }

    addMessage({
      role: "user",
      content: messageContent,
      timestamp: decorateTimestamp(),
    });
    setInput("");

    await sendToBackend(messageContent);
  };

  const handleSmartAction = async (
    type: "next-step" | "refine" | "big-picture"
  ) => {
    if (isSending) return;

    let base =
      type === "refine" ? getLastUserMessage() : getLastAssistantMessage();
    if (!base) base = getLastUserMessage();

    const core = base?.content ?? "Continue from where we left off.";

    let prompt = core;
    if (type === "next-step") {
      prompt =
        core +
        "\n\nYou are the DCCF Doctoral OS. Give me the single most important next concrete step I should take, with clear, executable instructions.";
    } else if (type === "refine") {
      prompt =
        "Please refine and upgrade this contribution so it is clearer, tighter, and aligned with doctoral expectations:\n\n" +
        core;
    } else if (type === "big-picture") {
      prompt =
        "From a big-picture doctoral and contribution lens, explain how this fits into the overall research arc. Then give 2–3 strategic recommendations:\n\n" +
        core;
    }

    addMessage({
      role: "user",
      content:
        type === "next-step"
          ? "→ Next step: move this forward."
          : type === "refine"
          ? "✨ Refine this contribution."
          : "🌍 Show me the big picture.",
      timestamp: decorateTimestamp(),
    });

    await sendToBackend(prompt, { smartAction: type });
  };

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // 📎 Attachments
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: any) => {
    const files: FileList | null = e.target?.files ?? null;
    if (!files) return;
    const list = Array.from(files);
    setAttachedFiles((prev) => [...prev, ...list]);
    e.target.value = "";
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 🎙 Voice toggle
  const handleToggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError(
        "Voice input is not supported in this browser. Try a recent Chrome desktop build for speech capture."
      );
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setError(null);
      setIsListening(true);
      recognition.start();
    }
  };

  // When you click a suggested move in the sidebar, prefill the input
  const handleRecommendationClick = (rec: string) => {
    setInput(rec);
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950/95 md:flex-row">
      {/* LEFT: Chat + input */}
      <div className="flex min-w-0 flex-1 flex-col min-h-0">
        {/* Mobile top bar / compass toggle */}
        {isSmall && !sidebarVisible && (
          <div className="flex items-center justify-between px-4 pt-3 pb-2 md:hidden">
            <span className="text-[11px] uppercase tracking-wide text-slate-400">
              Assistant
            </span>
            <button
              type="button"
              onClick={() => setSidebarVisible(true)}
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-sky-200 hover:border-sky-500 hover:text-sky-100"
            >
              Compass ▸
            </button>
          </div>
        )}

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 space-y-3 overflow-y-auto px-4 py-3 text-sm"
        >
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
                <p className="whitespace-pre-line leading-relaxed">
                  {m.content}
                </p>
                <span className="mt-1 block text-[10px] text-slate-300/70">
                  {displayTimestamp(m.timestamp)} ·{" "}
                  {m.role === "assistant" ? "dccf-intelligence" : "you"}
                </span>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-800/80 px-3 py-2 text-xs text-slate-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
                <span>Thinking with your Compass and DCCF context…</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Input + Smart actions + Mode */}
        <div className="shrink-0 border-t border-slate-800 bg-slate-950/95 px-4 pb-3 pt-2 text-xs">
          {/* Input row */}
          <div className="flex items-end gap-2">
            <div className="flex-1 rounded-2xl border border-slate-700/80 bg-slate-900 px-3 py-2 shadow-inner shadow-slate-950/80 focus-within:border-sky-500/80">
              {attachedFiles.length > 0 && (
                <div className="mb-1 flex flex-wrap gap-1">
                  {attachedFiles.map((file, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-100"
                    >
                      <span className="max-w-[140px] truncate">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="text-slate-400 hover:text-slate-100"
                        aria-label="Remove attachment"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tell me what feels stuck in your methods… (Enter = send, Shift+Enter = newline)"
                rows={2}
                className="max-h-32 w-full resize-none bg-transparent text-xs leading-relaxed text-slate-50 placeholder:text-slate-500 focus:outline-none"
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="flex flex-col items-stretch gap-1">
              <button
                type="button"
                onClick={handleFileButtonClick}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/90 text-sm text-slate-100 hover:bg-slate-700"
                title="Attach document"
              >
                📎
              </button>
              <button
                type="button"
                onClick={handleToggleListening}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                  isListening
                    ? "bg-rose-600 text-white hover:bg-rose-500"
                    : "bg-slate-800/90 text-slate-100 hover:bg-slate-700"
                }`}
                title="Voice input"
              >
                🎙
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="inline-flex h-9 items-center justify-center rounded-full bg-sky-600 px-4 text-xs font-semibold text-white shadow-lg shadow-sky-500/40 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md,.rtf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Smart actions + Mode */}
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            {/* Smart actions */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleSmartAction("next-step")}
                disabled={isSending}
                className="rounded-full bg-slate-800/90 px-2.5 py-1 font-medium text-slate-100 hover:bg-slate-700 disabled:opacity-40"
              >
                → Next step
              </button>
              <button
                type="button"
                onClick={() => handleSmartAction("refine")}
                disabled={isSending}
                className="rounded-full bg-slate-800/90 px-2.5 py-1 font-medium text-slate-100 hover:bg-slate-700 disabled:opacity-40"
              >
                ✨ Refine contribution
              </button>
              <button
                type="button"
                onClick={() => handleSmartAction("big-picture")}
                disabled={isSending}
                className="rounded-full bg-slate-800/90 px-2.5 py-1 font-medium text-slate-100 hover:bg-slate-700 disabled:opacity-40"
              >
                🌍 Big picture
              </button>
            </div>

            {/* Mode selector, bottom-right */}
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
      </div>

      {/* MIDDLE: draggable divider (desktop only) */}
      {!isSmall && sidebarVisible && (
        <div
          onMouseDown={() => setIsResizing(true)}
          className="hidden h-full w-[3px] cursor-col-resize bg-slate-800/40 hover:bg-sky-700 md:block"
        />
      )}

      {/* RIGHT: Compass-aware control strip (desktop) */}
      {!isSmall && (
        <div
          className="hidden h-full md:flex"
          style={{
            width: sidebarVisible ? sidebarWidth : 0,
            display: sidebarVisible ? "flex" : "none",
          }}
        >
          <CompassSidebar
            mode={mode}
            pageContext={pageContext}
            recommendations={recommendations}
            lastAssistant={lastAssistant}
            compassState={compassState}
            onRecommendationClick={handleRecommendationClick}
            onCollapse={() => setSidebarVisible(false)}
          />
        </div>
      )}

      {/* Collapsed handle (desktop) */}
      {!isSmall && !sidebarVisible && (
        <button
          type="button"
          onClick={() => setSidebarVisible(true)}
          className="hidden h-full items-center bg-slate-900/80 px-1 text-[10px] text-sky-300 hover:bg-slate-800 md:flex"
        >
          Compass ▸
        </button>
      )}

      {/* Mobile / narrow overlay for Compass */}
      {isSmall && sidebarVisible && (
        <div className="fixed inset-0 z-40 flex bg-slate-950/95 md:hidden">
          <div className="ml-auto flex h-full w-full max-w-md flex-col border-l border-slate-800/80 bg-slate-950/98 shadow-2xl shadow-slate-900/80">
            <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
              <span className="text-[11px] uppercase tracking-wide text-slate-300">
                Compass
              </span>
              <button
                type="button"
                onClick={() => setSidebarVisible(false)}
                className="rounded-full bg-slate-800/80 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CompassSidebar
                mode={mode}
                pageContext={pageContext}
                recommendations={recommendations}
                lastAssistant={lastAssistant}
                compassState={compassState}
                forceVisible
                onRecommendationClick={handleRecommendationClick}
                onCollapse={() => setSidebarVisible(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
