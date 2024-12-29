```python
from typing import Dict, List
from ..models.base import AIModel

class QualityEvaluator:
    def __init__(self, models: List[AIModel]):
        self.models = models
        self.weights = {
            "technical": 0.3,
            "literary": 0.4,
            "emotional": 0.3
        }

    async def evaluate(self, content: str) -> Dict[str, float]:
        scores = []
        for model in self.models:
            model_scores = await model.analyze(content)
            scores.append(model_scores)

        return self._calculate_final_score(scores)

    def _calculate_final_score(self, scores: List[Dict[str, float]]) -> Dict[str, float]:
        final_scores = {}
        for category, weight in self.weights.items():
            category_scores = [s.get(category, 0) for s in scores]
            final_scores[category] = sum(category_scores) / len(category_scores) * weight

        final_scores["overall"] = sum(final_scores.values())
        return final_scores
```