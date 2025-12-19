// src/hooks/useDraggableResizableWindow.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";

type Position = { x: number; y: number };
type Size = { width: number; height: number };

interface Options {
  storageKey?: string;
  defaultPosition?: Position;
  defaultSize?: Size;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function useDraggableResizableWindow(options: Options = {}) {
  const {
    storageKey = "dccf-ai-window",
    defaultPosition = { x: 40, y: 80 },
    defaultSize = { width: 420, height: 560 },
    minWidth = 320,
    minHeight = 360,
    maxWidth = 800,
    maxHeight = 900,
  } = options;

  const [position, setPosition] = useState<Position>(defaultPosition);
  const [size, setSize] = useState<Size>(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const resizeStart = useRef<{ mouseX: number; mouseY: number; size: Size }>({
    mouseX: 0,
    mouseY: 0,
    size: defaultSize,
  });

  // Load saved state on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { position?: Position; size?: Size };
      if (parsed.position) setPosition(parsed.position);
      if (parsed.size) setSize(parsed.size);
    } catch {
      // ignore parse errors
    }
  }, [storageKey]);

  // Persist changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = JSON.stringify({ position, size });
    window.localStorage.setItem(storageKey, payload);
  }, [position, size, storageKey]);

  const onMouseDownDrag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    },
    [position.x, position.y]
  );

  const onMouseDownResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        size: { ...size },
      };
    },
    [size]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const nextX = e.clientX - dragOffset.current.x;
        const nextY = e.clientY - dragOffset.current.y;
        const maxX = window.innerWidth - size.width - 8;
        const maxY = window.innerHeight - 40;

        setPosition({
          x: Math.min(Math.max(8, nextX), maxX),
          y: Math.min(Math.max(8, nextY), maxY),
        });
      } else if (isResizing) {
        const dx = e.clientX - resizeStart.current.mouseX;
        const dy = e.clientY - resizeStart.current.mouseY;

        const rawWidth = resizeStart.current.size.width + dx;
        const rawHeight = resizeStart.current.size.height + dy;

        const clampedWidth = Math.min(
          Math.max(minWidth, rawWidth),
          maxWidth ?? rawWidth
        );
        const clampedHeight = Math.min(
          Math.max(minHeight, rawHeight),
          maxHeight ?? rawHeight
        );

        setSize({ width: clampedWidth, height: clampedHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    minHeight,
    minWidth,
    maxHeight,
    maxWidth,
    size.width,
    size.height,
  ]);

  const resetWindow = useCallback(() => {
    setPosition(defaultPosition);
    setSize(defaultSize);
  }, [defaultPosition, defaultSize]);

  return {
    position,
    size,
    isDragging,
    isResizing,
    onMouseDownDrag,
    onMouseDownResize,
    resetWindow,
  };
}
