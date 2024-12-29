export type AgentType = 'outliner' | 'writer' | 'editor' | 'critic';

export interface AgentProgress {
  agent: AgentType;
  status: 'waiting' | 'running' | 'completed' | 'refining' | 'retrying';
  progress: number;
  score?: number;
  output?: string;
  attempt?: number;
  maxAttempts?: number;
  backoffDelay?: number;
  usingCache?: boolean;
}

export interface AgentMetrics {
  structure: number;
  writingQuality: number;
  technicalAspects: number;
  overallScore: number;
}

export interface BookGenerationState {
  currentAgent: AgentType;
  agents: Record<AgentType, AgentProgress>;
  metrics: AgentMetrics;
  finalContent?: string;
}

export interface CacheEntry {
  prompt: string;
  agentType: AgentType;
  output: string;
  score: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  multiplier: number;
}
