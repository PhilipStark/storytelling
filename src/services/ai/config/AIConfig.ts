export const AIConfig = {
  qualityThreshold: 9.5,
  maxRetries: 3,
  models: {
    claude: 'claude-3-opus-20240229',
    gpt4: 'gpt-4-turbo-preview'
  },
  weights: {
    technical: 0.3,
    literary: 0.4,
    emotional: 0.2,
    market: 0.1
  }
} as const;