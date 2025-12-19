export type Role = "user" | "assistant" | "system";

export type AIMode = "auto" | "online" | "offline" | "hybrid";

export type AgentRole =
  | "advisor"
  | "editor"
  | "planner"
  | "explainer"
  | "reviewer"
  | "supervisor"
  | "logicAuditor"
  | "methodologist"
  | "irb";

export interface ChatMessage {
  role: Role;
  content: string;
  timestamp?: string | Date;
  metadata?: Record<string, unknown>;
}

export interface DocumentDescriptor {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  kind?: "pdf" | "word" | "other";
  summary?: string;
  pageCount?: number;
}

export interface ChatRequest {
  message: string;
  userId?: string;
  conversationId?: string;
  mode?: AIMode;
  agentRole?: AgentRole;
  context?: Record<string, unknown>;
  documents?: DocumentDescriptor[];
}

export interface ChatResponse {
  response: string;
  provider?: string;
  timestamp?: string | Date;
  recommendations?: string[];
  context?: Record<string, unknown> | null;
}




