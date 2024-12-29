export interface NeuralLayer {
  weights: number[][];
  bias: number[];
  activation: string;
}

export interface NeuralArchitecture {
  layers: NeuralLayer[];
  connections: Map<number, number[]>;
  adaptability: number;
}

export interface AdaptivePattern {
  pattern: number[];
  strength: number;
  evolution: number[];
}