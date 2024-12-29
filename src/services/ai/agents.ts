import { Configuration } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

export class BaseAgent {
  constructor(protected role: string) {}
  
  protected async retry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === attempts - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
    throw new Error('All retry attempts failed');
  }
}

export class Claude3Agent extends BaseAgent {
  private client: Anthropic;

  constructor(role: string) {
    super(role);
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY
    });
  }

  async generate(prompt: string) {
    return this.retry(async () => {
      const response = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 100000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });
      return response.content;
    });
  }
}

export class GPT4Agent extends BaseAgent {
  private client: Configuration;

  constructor(role: string) {
    super(role);
    this.client = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generate(prompt: string) {
    return this.retry(async () => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });
      const data = await response.json();
      return data.choices[0].message.content;
    });
  }
}