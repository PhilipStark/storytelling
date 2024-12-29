```python
from typing import Dict, Any
from ..models.claude import ClaudeModel
from ..models.gpt4 import GPT4Model
from ..quality.evaluator import QualityEvaluator

class ContentEditor:
    def __init__(self):
        self.main_editor = ClaudeModel()
        self.style_editor = GPT4Model()
        self.evaluator = QualityEvaluator([ClaudeModel(), GPT4Model()])
        self.quality_threshold = 9.0

    async def refine_content(self, content: str, metadata: Dict[str, Any]) -> str:
        refined_content = content
        quality_score = 0

        while quality_score < self.quality_threshold:
            # Main editing pass
            refined_content = await self.main_editor.generate(
                self._build_editing_prompt(refined_content, metadata)
            )

            # Style enhancement
            refined_content = await self.style_editor.generate(
                self._build_style_prompt(refined_content, metadata)
            )

            # Evaluate quality
            quality_metrics = await self.evaluator.evaluate(refined_content)
            quality_score = quality_metrics["overall"]

        return refined_content

    def _build_editing_prompt(self, content: str, metadata: Dict[str, Any]) -> str:
        return f"""Refine this content for maximum impact:
        Genre: {metadata['genre']}
        Style: {metadata['style']}
        
        Focus on:
        1. Narrative consistency
        2. Character authenticity
        3. Pacing optimization
        4. Thematic resonance

        Content: {content}"""

    def _build_style_prompt(self, content: str, metadata: Dict[str, Any]) -> str:
        return f"""Enhance the writing style of this content:
        Target Style: {metadata['style']}
        Tone: {metadata['tone']}
        
        Improve:
        1. Prose quality
        2. Voice consistency
        3. Emotional impact
        4. Sensory details

        Content: {content}"""
```