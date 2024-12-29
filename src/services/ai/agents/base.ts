import { retry } from '../utils/retry';
import { AIAgent } from '../types';

export abstract class BaseAgent implements AIAgent {
  constructor(
    public role: string,
    public specialization: string
  ) {}

  protected abstract executeGeneration(prompt: string): Promise<string>;

  async generate(prompt: string): Promise<string> {
    return retry(() => this.executeGeneration(prompt));
  }
}