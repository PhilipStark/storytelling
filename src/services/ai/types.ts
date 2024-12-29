export interface AIAgent {
  role: string;
  specialization: string;
  generate(prompt: string): Promise<string>;
}

export interface BookMetadata {
  genre: string;
  targetAudience: string[];
  marketSegments: string[];
  competitionAnalysis: Record<string, number>;
  predictedSuccessRate: number;
}

export interface Character {
  name: string;
  psychologicalProfile: Record<string, number>;
  arc: string[];
  relationships: Record<string, string>;
  motivationMap: Record<string, number>;
}

export interface WorldBuilding {
  rules: Record<string, string>;
  history: string[];
  culture: Record<string, string[]>;
  environment: Record<string, string>;
}

export interface QualityMetrics {
  technical: number;
  literary: number;
  emotional: number;
  market: number;
  overall: number;
}

export interface GenerationResult {
  content: string;
  metadata: BookMetadata;
  quality: QualityMetrics;
}