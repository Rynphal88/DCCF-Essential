// src/components/contribution/types.ts

export type QuadrantId = "problem" | "gap" | "contribution" | "alignment";

export interface QuadrantData {
  id: QuadrantId;
  title: string;
  description: string;
  color: string; // e.g. "#3b82f6"
  icon: string;  // emoji or short label
  progress: number; // 0–100
  clarity: number;  // 0–100
  momentum: number; // -100 to 100
  lastUpdated: Date;
  insights: string[];
  risks: string[];
}

export interface WeeklyVectorData {
  direction: QuadrantId;
  magnitude: number;   // -100 to 100 (direction + strength)
  confidence: number;  // 0–100
  impact: "low" | "medium" | "high";
}

export interface CompassState {
  quadrants: Record<QuadrantId, QuadrantData>;
  overallAlignment: number; // 0–100
  researchDrift: number;    // 0–100 (0 = perfectly aligned)
  weeklyMomentum: number;   // -100 to 100
  nextBestAction?: string;
  aiInsights: string[];
}
