export const AI_CONFIG = {
  qualityThreshold: 9.5,
  maxRetries: 3,
  models: {
    planning: 'claude-3-opus-20240229',
    writing: 'claude-3-opus-20240229',
    dialogue: 'gpt-4-turbo-preview',
    review: 'gpt-4-turbo-preview'
  },
  prompts: {
    planning: (config: any) => `Create a detailed outline for a ${config.genre} book...`,
    writing: (config: any, outline: string) => `Generate the initial draft...`,
    dialogue: (draft: string) => `Enhance the dialogues...`,
    review: (draft: string) => `Review and polish this draft...`
  }
} as const;