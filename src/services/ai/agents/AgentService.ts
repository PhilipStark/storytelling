import { AgentType, AgentProgress, AgentMetrics, BookGenerationState } from '../../../types/agents';

class AgentService {
  private eventSource: EventSource | null = null;
  private readonly QUALITY_THRESHOLD = 9.5;

  async startGeneration(bookId: number, onProgress: (state: BookGenerationState) => void): Promise<void> {
    this.eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/books/${bookId}/generate-stream`);
    
    const state: BookGenerationState = {
      currentAgent: 'outliner',
      agents: {
        outliner: { agent: 'outliner', status: 'waiting', progress: 0 },
        writer: { agent: 'writer', status: 'waiting', progress: 0 },
        editor: { agent: 'editor', status: 'waiting', progress: 0 },
        critic: { agent: 'critic', status: 'waiting', progress: 0 }
      },
      metrics: {
        structure: 0,
        writingQuality: 0,
        technicalAspects: 0,
        overallScore: 0
      }
    };

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.updateState(state, data);
      onProgress({ ...state });
    };

    this.eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      this.eventSource?.close();
    };
  }

  private updateState(state: BookGenerationState, data: any) {
    const { agent, status, progress, metrics, output } = data;
    
    // Update agent progress
    if (agent && status) {
      state.currentAgent = agent;
      state.agents[agent] = {
        ...state.agents[agent],
        status,
        progress,
        output,
        score: metrics?.[agent]
      };
    }

    // Update metrics if available
    if (metrics) {
      state.metrics = {
        structure: metrics.structure || state.metrics.structure,
        writingQuality: metrics.writingQuality || state.metrics.writingQuality,
        technicalAspects: metrics.technicalAspects || state.metrics.technicalAspects,
        overallScore: metrics.overallScore || state.metrics.overallScore
      };
    }

    // Check if refinement is needed
    if (status === 'completed' && metrics) {
      const score = metrics[agent];
      if (score < this.QUALITY_THRESHOLD) {
        state.agents[agent].status = 'refining';
        state.agents[agent].progress = 0;
      }
    }
  }

  stopGeneration() {
    this.eventSource?.close();
  }
}

export const agentService = new AgentService();
