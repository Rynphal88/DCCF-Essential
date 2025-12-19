"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark" | "system";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Alien-grade theme switcher:
 * - Three explicit modes: Light / Dark / System (follow OS)
 * - Clear active state, keyboard & screen-reader friendly
 * - Safe SSR: waits for mount before reading system theme
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering real state on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentMode: ThemeMode = (theme as ThemeMode) || "system";

  const modes: {
    value: ThemeMode;
    label: string;
    description: string;
    Icon: typeof Sun;
  }[] = [
    {
      value: "light",
      label: "Light",
      description: "Always use light theme",
      Icon: Sun,
    },
    {
      value: "dark",
      label: "Dark",
      description: "Always use dark theme",
      Icon: Moon,
    },
    {
      value: "system",
      label: "System",
      description: "Follow your device preference",
      Icon: Monitor,
    },
  ];

  // Skeleton while we don’t yet know the actual theme on the client
  if (!mounted) {
    return (
      <div
        className={cn(
          "h-8 w-28 animate-pulse rounded-full bg-muted/60",
          className
        )}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border bg-card/80 px-1 py-0.5 text-[11px] shadow-soft",
        className
      )}
      role="radiogroup"
      aria-label="Theme mode"
    >
      {modes.map(({ value, label, description, Icon }) => {
        const isActive = currentMode === value;

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={description}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-muted/70"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {/* Label is hidden on very small screens to keep the header tight */}
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
