```python
from typing import Dict, Any
from ..models.claude import ClaudeModel
from ..models.gpt4 import GPT4Model
from ..quality.evaluator import QualityEvaluator
from ...events.service import event_service
from ....models import BookStatus

class GenerationPipeline:
    def __init__(self):
        self.planner = GPT4Model()
        self.writer = ClaudeModel()
        self.dialogue_enhancer = GPT4Model()
        self.reviewer = ClaudeModel()
        self.evaluator = QualityEvaluator([
            ClaudeModel(),
            GPT4Model()
        ])

    async def generate(self, book_data: Dict[str, Any]) -> Dict[str, Any]:
        book_id = book_data["id"]
        
        try:
            # Planning phase
            await event_service.publish(book_id, {
                "status": BookStatus.GENERATING,
                "progress": "Planning the story structure..."
            })
            outline = await self.planner.generate(self._build_planning_prompt(book_data))

            # Writing phase
            await event_service.publish(book_id, {
                "status": BookStatus.GENERATING,
                "progress": "Writing initial content..."
            })
            content = await self.writer.generate(self._build_writing_prompt(outline, book_data))

            # Enhancement phase
            await event_service.publish(book_id, {
                "status": BookStatus.GENERATING,
                "progress": "Enhancing dialogue and characters..."
            })
            enhanced = await self.dialogue_enhancer.generate(self._build_enhancement_prompt(content))

            # Review phase
            await event_service.publish(book_id, {
                "status": BookStatus.GENERATING,
                "progress": "Final review and polish..."
            })
            final_content = await self.reviewer.generate(self._build_review_prompt(enhanced))

            # Quality evaluation
            quality_scores = await self.evaluator.evaluate(final_content)

            return {
                "structure": outline,
                "content": final_content,
                "quality_scores": quality_scores
            }

        except Exception as e:
            await event_service.publish(book_id, {
                "status": BookStatus.FAILED,
                "progress": f"Generation failed: {str(e)}"
            })
            raise

    def _build_planning_prompt(self, book_data: Dict[str, Any]) -> str:
        return f"""As a master storyteller, create a detailed outline for a {book_data['genre']} book:
        Title: {book_data['title']}
        Description: {book_data['description']}
        Target Audience: {book_data['target_audience']}
        Style: {book_data['style']}
        Tone: {book_data['tone']}
        Length: {book_data['length']}

        Include:
        1. Three-act structure
        2. Character arcs
        3. Key plot points
        4. Thematic elements
        5. World-building details"""

    def _build_writing_prompt(self, outline: str, book_data: Dict[str, Any]) -> str:
        return f"""Using this outline: {outline}

        Write a compelling narrative that:
        - Matches the {book_data['style']} writing style
        - Maintains a {book_data['tone']} tone
        - Engages {book_data['target_audience']} readers
        - Follows {book_data['genre']} conventions"""

    def _build_enhancement_prompt(self, content: str) -> str:
        return f"""Enhance this content focusing on:
        1. Natural dialogue
        2. Character depth
        3. Emotional resonance
        4. Scene dynamics

        Content: {content}"""

    def _build_review_prompt(self, content: str) -> str:
        return f"""Review and polish this content for:
        1. Narrative consistency
        2. Pacing and flow
        3. Character arcs
        4. Thematic depth
        5. Overall impact

        Content: {content}"""
```