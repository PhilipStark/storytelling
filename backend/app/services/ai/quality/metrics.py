```python
from typing import Dict, Any
from enum import Enum

class QualityMetricType(Enum):
    TECHNICAL = "technical"
    LITERARY = "literary"
    EMOTIONAL = "emotional"
    MARKET = "market"

class QualityMetrics:
    def __init__(self):
        self.weights = {
            QualityMetricType.TECHNICAL: 0.3,
            QualityMetricType.LITERARY: 0.4,
            QualityMetricType.EMOTIONAL: 0.2,
            QualityMetricType.MARKET: 0.1
        }

    def calculate_score(self, metrics: Dict[QualityMetricType, float]) -> float:
        weighted_sum = 0
        for metric_type, score in metrics.items():
            weighted_sum += score * self.weights[metric_type]
        return weighted_sum

    def get_improvement_suggestions(self, metrics: Dict[QualityMetricType, float]) -> Dict[str, Any]:
        suggestions = {}
        for metric_type, score in metrics.items():
            if score < 9.0:
                suggestions[metric_type.value] = self._get_specific_suggestions(metric_type, score)
        return suggestions

    def _get_specific_suggestions(self, metric_type: QualityMetricType, score: float) -> list:
        # Implement specific improvement suggestions based on metric type and score
        return []
```