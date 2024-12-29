export interface EmotionalState {
  intensity: number;
  valence: number;
  arousal: number;
  dominance: number;
}

export interface EmotionalFlow {
  points: EmotionalState[];
  transitions: Map<number, number>;
  resonance: number;
}

export interface EmotionalBlueprint {
  map: Record<string, EmotionalState>;
  curves: EmotionalFlow[];
  impactPoints: Array<{
    position: number;
    intensity: number;
    type: string;
  }>;
}

export interface EmotionalLandscape {
  intensityMap: Record<string, number>;
  flowPatterns: EmotionalFlow[];
}