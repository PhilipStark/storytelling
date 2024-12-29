```python
from typing import Dict, Any, List
from ..models.base import AIModel
from ..models.claude import ClaudeModel
from ..models.gpt4 import GPT4Model
from ..quality.evaluator import QualityEvaluator
from ..research.market_analyzer import MarketAnalyzer
from ..character.development import CharacterDevelopment
from ..refinement.editor import ContentEditor
from ..market.preparation import MarketPreparation
from ...events.service import event_service
from ....models import BookStatus

class BookGenerationPipeline:
    def __init__(self):
        # Initialize AI models
        self.models = {
            'planning': GPT4Model(),
            'writing': ClaudeModel(),
            'dialogue': GPT4Model(),
            'review': ClaudeModel()
        }
        
        # Initialize specialized components
        self.market_analyzer = MarketAnalyzer()
        self.character_developer = CharacterDevelopment()
        self.content_editor = ContentEditor()
        self.market_prep = MarketPreparation()
        self.quality_evaluator = QualityEvaluator([
            ClaudeModel(),
            GPT4Model()
        ])

        # Quality threshold
        self.quality_threshold = 9.8

    async def generate_book(self, book_data: Dict[str, Any]) -> Dict[str, Any]:
        book_id = book_data["id"]
        try:
            # 1. Market Research
            await self._emit_progress(book_id, "Analyzing market and trends...")
            market_analysis = await self.market_analyzer.analyze_market(book_data)

            # 2. Story Planning
            await self._emit_progress(book_id, "Creating story structure...")
            outline = await self.models['planning'].generate(
                self._build_planning_prompt(book_data, market_analysis)
            )

            # 3. Character Development
            await self._emit_progress(book_id, "Developing characters...")
            characters = await self.character_developer.develop_characters(
                outline, book_data["genre"]
            )

            # 4. Initial Content Generation
            await self._emit_progress(book_id, "Generating initial content...")
            content = await self.models['writing'].generate(
                self._build_writing_prompt(outline, characters, book_data)
            )

            # 5. Quality Improvement Loop
            quality_score = 0
            iteration = 0
            max_iterations = 5

            while quality_score < self.quality_threshold and iteration < max_iterations:
                # Evaluate current quality
                quality_metrics = await self.quality_evaluator.evaluate(content)
                quality_score = quality_metrics["overall"]

                if quality_score < self.quality_threshold:
                    await self._emit_progress(
                        book_id, 
                        f"Improving quality (iteration {iteration + 1}, current score: {quality_score:.2f})..."
                    )
                    content = await self.content_editor.refine_content(
                        content,
                        {**book_data, "quality_feedback": quality_metrics}
                    )
                iteration += 1

            # 6. Market Preparation
            await self._emit_progress(book_id, "Preparing market materials...")
            market_materials = await self.market_prep.prepare_for_market(
                book_data, content
            )

            return {
                "content": content,
                "structure": outline,
                "characters": characters,
                "market_analysis": market_analysis,
                "market_materials": market_materials,
                "quality_metrics": quality_metrics
            }

        except Exception as e:
            await self._emit_error(book_id, str(e))
            raise

    async def _emit_progress(self, book_id: int, message: str) -> None:
        await event_service.publish(book_id, {
            "status": BookStatus.GENERATING,
            "progress": message
        })

    async def _emit_error(self, book_id: int, error: str) -> None:
        await event_service.publish(book_id, {
            "status": BookStatus.FAILED,
            "progress": f"Generation failed: {error}"
        })

    def _build_planning_prompt(
        self, 
        book_data: Dict[str, Any], 
        market_analysis: Dict[str, Any]
    ) -> str:
        return f"""As a master storyteller, create a detailed outline for a {book_data['genre']} book:
        Title: {book_data['title']}
        Description: {book_data['description']}
        Target Audience: {book_data['target_audience']}
        Style: {book_data['style']}
        Tone: {book_data['tone']}
        Length: {book_data['length']}

        Market Insights:
        {market_analysis.get('trend_analysis', '')}

        Include:
        1. Three-act structure
        2. Character arcs
        3. Key plot points
        4. Thematic elements
        5. World-building details
        6. Market-driven elements"""

    def _build_writing_prompt(
        self, 
        outline: str, 
        characters: Dict[str, Any], 
        book_data: Dict[str, Any]
    ) -> str:
        return f"""Using this outline: {outline}
        And these character profiles: {characters}

        Write a compelling narrative that:
        - Matches the {book_data['style']} writing style
        - Maintains a {book_data['tone']} tone
        - Engages {book_data['target_audience']} readers
        - Follows {book_data['genre']} conventions
        - Creates deep character development
        - Builds emotional resonance"""
```