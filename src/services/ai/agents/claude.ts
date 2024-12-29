import { Anthropic } from '@anthropic-ai/sdk';
import { BaseAgent } from './base';
import { AI_CONFIG } from '../config';

export class ClaudeAgent extends BaseAgent {
  private client: Anthropic;

  constructor(role: string, specialization: string) {
    super(role, specialization);
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY
    });
  }

  protected async executeGeneration(prompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: AI_CONFIG.models.planning,
      max_tokens: 100000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    return response.content;
  }
}