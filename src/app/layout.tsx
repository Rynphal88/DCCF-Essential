// src/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "./providers";
import { Header } from "@/components/header";
import { CommandPalette } from "@/components/command-palette";
import GlobalAssistant from "@/components/ai/GlobalAssistant"; // ✅ global DCCF AI shell

export const metadata: Metadata = {
  title: "DCCF Essential - Doctoral Operating System",
  description:
    "DCCF Essential helps you turn a messy PhD journey into a structured, trackable system with clear rituals, wins, and contribution focus.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* Wrap global providers */}
        <Providers>
          <div className="flex min-h-screen flex-col">
            {/* Top Header */}
            <Header />

            {/* Global Command Palette */}
            <CommandPalette />

            {/* Main Content */}
            <main className="flex-1">
              <div className="container mx-auto px-4 py-10">
                {children}
              </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-card/80 backdrop-blur-xs">
              <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-4 text-[11px] text-muted-foreground md:flex-row">
                <p>© {year} DCCF Essential. All rights reserved.</p>
                <p className="text-xs">
                  v0.1 • Foundation phase • Built on Next.js 14 + Tailwind CSS
                </p>
              </div>
            </footer>
          </div>

          {/* ✅ Global AI Assistant mounted on every page */}
          <GlobalAssistant />
        </Providers>
      </body>
    </html>
  );
}
