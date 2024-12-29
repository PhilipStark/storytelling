import { BookGenerationConfig } from '../types';

export const PromptTemplates = {
  planning: (config: BookGenerationConfig) => `
    As a master storyteller, create a detailed outline for a ${config.genre} book with the following parameters:
    - Title: ${config.title}
    - Target Audience: ${config.target_audience}
    - Style: ${config.style}
    - Tone: ${config.tone}
    - Length: ${config.length}

    Include:
    1. Story structure (3 acts)
    2. Major plot points
    3. Character arcs
    4. Key themes
    5. World-building elements
  `,

  writing: (config: BookGenerationConfig, outline: string) => `
    Based on this outline:
    ${outline}

    Generate a compelling narrative that:
    - Matches the ${config.style} writing style
    - Maintains a ${config.tone} tone
    - Engages ${config.target_audience} readers
    - Follows genre conventions for ${config.genre}
  `,

  dialogue: (draft: string) => `
    Enhance the dialogues in this draft to:
    - Sound more natural and authentic
    - Reveal character personalities
    - Drive the plot forward
    - Create emotional resonance

    Draft:
    ${draft}
  `,

  review: (draft: string) => `
    Review and polish this draft for:
    - Narrative consistency
    - Character development
    - Pacing and flow
    - Emotional impact
    - Technical accuracy

    Draft:
    ${draft}
  `
};