import { EventEmitter } from 'events';
import { ClaudeAgent } from './agents/claude';
import { GPT4Agent } from './agents/gpt4';
import { QualityEvaluator } from './quality/evaluator';
import { MarketAnalyzer } from './market/analyzer';
import { AI_CONFIG } from './config';
import type { BookGenerationConfig, GenerationResult } from './types';

export class BookGenerationPipeline extends EventEmitter {
  private agents = {
    planning: new ClaudeAgent('planner', 'narrative_structure'),
    writing: new ClaudeAgent('writer', 'content_generation'),
    dialogue: new GPT4Agent('dialogue', 'conversation_enhancement'),
    review: new GPT4Agent('reviewer', 'quality_assurance')
  };

  private qualityEvaluator = new QualityEvaluator();
  private marketAnalyzer = new MarketAnalyzer();

  async generateBook(config: BookGenerationConfig): Promise<GenerationResult> {
    try {
      // Planning phase
      this.emit('progress', { stage: 'planning', message: 'Creating story outline...' });
      const outline = await this.agents.planning.generate(
        AI_CONFIG.prompts.planning(config)
      );

      // Writing phase
      this.emit('progress', { stage: 'writing', message: 'Generating initial draft...' });
      const initialDraft = await this.agents.writing.generate(
        AI_CONFIG.prompts.writing(config, outline)
      );

      // Dialogue enhancement
      this.emit('progress', { stage: 'dialogue', message: 'Enhancing dialogues...' });
      const enhancedDraft = await this.agents.dialogue.generate(
        AI_CONFIG.prompts.dialogue(initialDraft)
      );

      // Review and polish
      this.emit('progress', { stage: 'review', message: 'Final review and polish...' });
      const finalDraft = await this.agents.review.generate(
        AI_CONFIG.prompts.review(enhancedDraft)
      );

      // Evaluate quality
      const quality = this.qualityEvaluator.evaluate(finalDraft);
      
      // Generate metadata
      const metadata = {
        genre: config.genre,
        targetAudience: [config.target_audience],
        marketSegments: [],
        competitionAnalysis: await this.marketAnalyzer.analyzeCompetition(config.genre),
        predictedSuccessRate: await this.marketAnalyzer.predictSuccess({
          genre: config.genre,
          targetAudience: [config.target_audience],
          marketSegments: [],
          competitionAnalysis: {},
          predictedSuccessRate: 0
        })
      };

      const result = { content: finalDraft, metadata, quality };
      this.emit('complete', result);
      return result;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }
}