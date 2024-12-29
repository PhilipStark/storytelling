import { EmotionalState, EmotionalFlow } from '../../types/emotional';

export class ResonanceEngine {
  async calculateResonance(states: EmotionalState[]): Promise<EmotionalFlow> {
    const transitions = this.mapTransitions(states);
    const resonance = this.computeResonanceScore(states, transitions);

    return {
      points: states,
      transitions,
      resonance
    };
  }

  private mapTransitions(states: EmotionalState[]): Map<number, number> {
    const transitions = new Map<number, number>();
    
    for (let i = 0; i < states.length - 1; i++) {
      transitions.set(i, this.calculateTransitionStrength(
        states[i],
        states[i + 1]
      ));
    }

    return transitions;
  }

  private calculateTransitionStrength(
    current: EmotionalState,
    next: EmotionalState
  ): number {
    // Calculate emotional transition strength
    const intensityDiff = Math.abs(current.intensity - next.intensity);
    const valenceDiff = Math.abs(current.valence - next.valence);
    
    return Math.exp(-(intensityDiff + valenceDiff));
  }

  private computeResonanceScore(
    states: EmotionalState[],
    transitions: Map<number, number>
  ): number {
    // Compute overall emotional resonance
    const transitionScores = Array.from(transitions.values());
    return transitionScores.reduce((sum, score) => sum + score, 0) / 
           transitionScores.length;
  }
}