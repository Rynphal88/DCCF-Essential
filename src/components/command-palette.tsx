"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  // Keyboard shortcut handler: ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Example commands — later we can load from DB or AI
  const actions = [
    { label: "Open Dashboard", command: "/dashboard" },
    { label: "Start Deep Work Session", command: "start-session" },
    { label: "Log a Win", command: "log-win" },
    { label: "Open Compass", command: "/compass" },
    { label: "Weekly Review", command: "weekly-review" },
    { label: "Settings", command: "/settings" },
  ];

  const runCommand = (value: string) => {
    setOpen(false);
    if (value.startsWith("/")) {
      window.location.href = value;
    } else {
      console.log("Run internal command:", value);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* Invisible trigger — we open by keyboard */}
      <Dialog.Trigger asChild></Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

        <Dialog.Content className="
          fixed left-1/2 top-1/4 w-full max-w-xl 
          -translate-x-1/2 rounded-xl 
          border border-border 
          bg-card shadow-2xl
          p-4
        ">
          {/* Input */}
          <input
            autoFocus
            placeholder="Search commands…"
            className="
              w-full rounded-lg bg-muted/30 px-4 py-3 
              text-sm outline-none 
              border border-border focus:ring-2 focus:ring-primary
            "
            onChange={(e) => {
              const q = e.target.value.toLowerCase();
            }}
          />

          {/* Command List */}
          <div className="mt-4 max-h-[300px] overflow-y-auto space-y-1">
            {actions.map((item) => (
              <button
                key={item.label}
                onClick={() => runCommand(item.command)}
                className="
                  flex w-full items-center justify-between 
                  rounded-lg px-4 py-2 text-left text-sm 
                  hover:bg-accent hover:text-accent-foreground
                "
              >
                <span>{item.label}</span>
                <kbd className="text-[10px] text-muted-foreground">
                  ↵
                </kbd>
              </button>
            ))}
          </div>

          {/* Hint footer */}
          <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Press Esc to close</span>
            <span>⌘K</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Floating hint button */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed bottom-5 right-5 
          hidden md:flex items-center gap-2
          rounded-full border bg-card px-3 py-2 
          shadow-lg hover:shadow-xl transition
          text-sm text-muted-foreground
        "
      >
        <span>⌘K</span>
        <span className="hidden sm:inline">Command Center</span>
      </button>
    </Dialog.Root>
  );
}
