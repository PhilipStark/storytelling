import { BookGenerationConfig } from '../types';
import { PromptTemplates } from './PromptTemplates';

export class PromptBuilder {
  buildPlanningPrompt(config: BookGenerationConfig): string {
    return PromptTemplates.planning(config);
  }

  buildWritingPrompt(config: BookGenerationConfig, outline: string): string {
    return PromptTemplates.writing(config, outline);
  }

  buildDialoguePrompt(draft: string): string {
    return PromptTemplates.dialogue(draft);
  }

  buildReviewPrompt(draft: string): string {
    return PromptTemplates.review(draft);
  }
}