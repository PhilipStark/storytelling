import { BaseAgent } from './base';
import { AI_CONFIG } from '../config';

export class GPT4Agent extends BaseAgent {
  protected async executeGeneration(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.models.dialogue,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }
}