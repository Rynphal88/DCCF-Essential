// src/components/ai/DccfAiLauncher.tsx
"use client";

import { useEffect, useState } from "react";
import type { MouseEventHandler } from "react";

interface Props {
  onOpen: () => void;
}

type Position = { x: number; y: number };

const STORAGE_KEY = "dccf-ai-launcher-pill";

export function DccfAiLauncher({ onOpen }: Props) {
  const [position, setPosition] = useState<Position>({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });

  // Load saved position
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Position;
      if (parsed && typeof parsed.x === "number") setPosition(parsed);
    } catch {
      // ignore
    }
  }, []);

  // Persist position
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  }, [position]);

  // Dragging logic
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const nextX = e.clientX - offset.x;
      const nextY = e.clientY - offset.y;

      const maxX = window.innerWidth - 160; // approximate pill width
      const maxY = window.innerHeight - 56;

      setPosition({
        x: Math.min(Math.max(8, nextX), maxX),
        y: Math.min(Math.max(8, nextY), maxY),
      });
    };

    const onUp = () => setIsDragging(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, offset.x, offset.y]);

  const handleMouseDown: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onOpen();
  };

  return (
    <button
      type="button"
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={{
        position: "fixed",
        right: position.x, // keep it bottom-right–ish by default
        bottom: position.y,
        zIndex: 40,
      }}
      className="group inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-xl shadow-sky-500/40 ring-1 ring-white/10 backdrop-blur-md transition hover:scale-105 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/90 text-xs shadow-inner shadow-pink-300/60">
        🧠
      </span>
      <span>DCCF AI</span>
    </button>
  );
}
