export interface QuantumState {
  superposition: number[];
  entanglement: Map<string, number>;
  coherence: number;
}

export interface CreativeSpace {
  dimensions: string[];
  possibilities: Array<{
    id: string;
    probability: number;
    narrative: any;
  }>;
}

export interface QuantumNarrative {
  states: QuantumState[];
  entanglements: Map<string, string[]>;
  collapseHistory: Array<{
    state: QuantumState;
    timestamp: number;
    outcome: any;
  }>;
}