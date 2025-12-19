"use client";

import React from "react";

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background/50">
      {/* Dashboard Container */}
      <div className="container mx-auto max-w-7xl px-4 py-10">
        
        {/* Dashboard Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">
            Doctoral Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your Research Control Center • Updated: {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Dashboard Grid Area */}
        <div className="space-y-8">
          {children}
        </div>

        {/* Dashboard Footer */}
        <div className="mt-16 border-t pt-6 text-center text-xs text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            DCCF Essential • Built for Clarity and Focus • {new Date().getFullYear()}
          </p>
        </div>

      </div>
    </div>
  );
}
