```python
from typing import Dict, Any
from ..research.market_analyzer import MarketAnalyzer
from ..character.development import CharacterDevelopment
from ..generation.pipeline import GenerationPipeline
from ..refinement.editor import ContentEditor
from ..market.preparation import MarketPreparation
from ..quality.evaluator import QualityEvaluator
from ...events.service import event_service
from ....models import BookStatus

class MasterPipeline:
    def __init__(self):
        self.market_analyzer = MarketAnalyzer()
        self.character_developer = CharacterDevelopment()
        self.generation_pipeline = GenerationPipeline()
        self.content_editor = ContentEditor()
        self.market_prep = MarketPreparation()
        self.quality_evaluator = QualityEvaluator([])
        self.quality_threshold = 9.0

    async def generate_book(self, book_data: Dict[str, Any]) -> Dict[str, Any]:
        book_id = book_data["id"]
        try:
            # 1. Market Research Phase
            await event_service.publish(book_id, {
                "status": BookStatus.GENERATING,
                "progress": "Analyzing market and trends..."
            })
            market_analysis = await self.market_analyzer.analyze_market(book_data)
            
            # 2. Initial Generation
            generation_result = await self.generation_pipeline.generate(book_data)
            outline = generation_result["structure"]
            initial_content = generation_result["content"]

            # 3. Character Development
            await event_service.publish(book_id, {
                "status": BookStatus.GENERATING,
                "progress": "Developing characters..."
            })
            character_data = await self.character_developer.develop_characters(
                outline, book_data["genre"]
            )

            # 4. Content Refinement
            await event_service.publish(book_id, {
                "status": BookStatus.GENERATING,
                "progress": "Refining content..."
            })
            refined_content = await self.content_editor.refine_content(
                initial_content, 
                {**book_data, "character_data": character_data}
            )

            # 5. Quality Evaluation Loop
            quality_score = 0
            iteration = 0
            max_iterations = 3

            while quality_score < self.quality_threshold and iteration < max_iterations:
                quality_metrics = await self.quality_evaluator.evaluate(refined_content)
                quality_score = quality_metrics["overall"]

                if quality_score < self.quality_threshold:
                    await event_service.publish(book_id, {
                        "status": BookStatus.GENERATING,
                        "progress": f"Improving quality (iteration {iteration + 1})..."
                    })
                    refined_content = await self.content_editor.refine_content(
                        refined_content, 
                        {**book_data, "quality_feedback": quality_metrics}
                    )
                iteration += 1

            # 6. Market Preparation
            await event_service.publish(book_id, {
                "status": BookStatus.GENERATING,
                "progress": "Preparing market materials..."
            })
            market_materials = await self.market_prep.prepare_for_market(
                book_data, refined_content
            )

            return {
                "content": refined_content,
                "structure": outline,
                "character_data": character_data,
                "market_analysis": market_analysis,
                "market_materials": market_materials,
                "quality_metrics": quality_metrics
            }

        except Exception as e:
            await event_service.publish(book_id, {
                "status": BookStatus.FAILED,
                "progress": f"Generation failed: {str(e)}"
            })
            raise
```