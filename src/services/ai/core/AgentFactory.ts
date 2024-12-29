import { ClaudeAgent } from '../agents/ClaudeAgent';
import { GPT4Agent } from '../agents/GPT4Agent';
import { AIConfig } from '../config/AIConfig';

export class AgentFactory {
  static createAgents() {
    return {
      planning: new ClaudeAgent('planner', 'narrative_structure'),
      writing: new ClaudeAgent('writer', 'content_generation'),
      dialogue: new GPT4Agent('dialogue', 'conversation_enhancement'),
      review: new GPT4Agent('reviewer', 'quality_assurance')
    };
  }
}