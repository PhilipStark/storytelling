```python
from abc import ABC, abstractmethod
from typing import Dict, Any

class AIModel(ABC):
    @abstractmethod
    async def generate(self, prompt: str) -> str:
        pass

    @abstractmethod
    async def analyze(self, content: str) -> Dict[str, float]:
        pass
```