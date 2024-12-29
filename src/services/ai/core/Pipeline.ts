import { EventEmitter } from 'events';
import { BookGenerationConfig, GenerationResult } from '../types';
import { AgentFactory } from './AgentFactory';
import { QualityEvaluator } from '../quality/QualityEvaluator';
import { MarketAnalyzer } from '../market/MarketAnalyzer';
import { PromptBuilder } from '../prompts/PromptBuilder';

export class Pipeline extends EventEmitter {
  private agents = AgentFactory.createAgents();
  private qualityEvaluator = new QualityEvaluator();
  private marketAnalyzer = new MarketAnalyzer();
  private promptBuilder = new PromptBuilder();

  async generateBook(config: BookGenerationConfig): Promise<GenerationResult> {
    try {
      const outline = await this.planningPhase(config);
      const draft = await this.writingPhase(config, outline);
      const enhancedDraft = await this.dialoguePhase(draft);
      const finalDraft = await this.reviewPhase(enhancedDraft);
      
      return this.finalizeBook(config, finalDraft);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  private async planningPhase(config: BookGenerationConfig): Promise<string> {
    this.emit('progress', { stage: 'planning', message: 'Creating story outline...' });
    return this.agents.planning.generate(
      this.promptBuilder.buildPlanningPrompt(config)
    );
  }

  private async writingPhase(config: BookGenerationConfig, outline: string): Promise<string> {
    this.emit('progress', { stage: 'writing', message: 'Generating initial draft...' });
    return this.agents.writing.generate(
      this.promptBuilder.buildWritingPrompt(config, outline)
    );
  }

  private async dialoguePhase(draft: string): Promise<string> {
    this.emit('progress', { stage: 'dialogue', message: 'Enhancing dialogues...' });
    return this.agents.dialogue.generate(
      this.promptBuilder.buildDialoguePrompt(draft)
    );
  }

  private async reviewPhase(draft: string): Promise<string> {
    this.emit('progress', { stage: 'review', message: 'Final review and polish...' });
    return this.agents.review.generate(
      this.promptBuilder.buildReviewPrompt(draft)
    );
  }

  private async finalizeBook(config: BookGenerationConfig, content: string): Promise<GenerationResult> {
    const quality = this.qualityEvaluator.evaluate(content);
    const metadata = await this.marketAnalyzer.generateMetadata(config);
    
    const result = { content, metadata, quality };
    this.emit('complete', result);
    return result;
  }
}