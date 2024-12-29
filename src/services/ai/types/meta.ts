export interface SystemMetrics {
  successRate: number;
  averageQuality: number;
  processingTime: number;
  success?: boolean;
  quality?: number;
}

export interface CreativeResult {
  concept: any;
  innovations: any;
  possibilities: any;
  synthesizedIdeas: any;
}

export interface EmotionalMapping {
  [key: string]: {
    intensity: number;
    valence: number;
    arousal: number;
  };
}

export interface EmotionalResult {
  emotionalMap: EmotionalMapping;
  tension: number;
  impact: number;
}