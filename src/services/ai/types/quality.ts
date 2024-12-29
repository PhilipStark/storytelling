export enum UltraQualityLevel {
  LEGENDARY = 9.8,
  MASTERPIECE = 9.5,
  EXCELLENT = 9.0,
  GOOD = 8.5
}

export interface QualityMetrics {
  technical: number;
  creative: number;
  emotional: number;
  market: number;
  overall: number;
}

export interface ValidationResult {
  isPerfect: boolean;
  score: number;
  metrics: QualityMetrics;
  improvementVectors: ImprovementVector[];
}

export interface ImprovementVector {
  aspect: string;
  currentScore: number;
  targetScore: number;
  suggestions: string[];
}