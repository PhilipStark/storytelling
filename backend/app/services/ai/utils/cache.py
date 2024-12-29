```python
from typing import Dict, Any
import hashlib
import json

class ContentCache:
    def __init__(self):
        self._cache: Dict[str, Any] = {}

    def get_cached_content(self, content: str, context: Dict[str, Any]) -> Dict[str, Any] | None:
        cache_key = self._generate_cache_key(content, context)
        return self._cache.get(cache_key)

    def cache_content(self, content: str, context: Dict[str, Any], result: Dict[str, Any]) -> None:
        cache_key = self._generate_cache_key(content, context)
        self._cache[cache_key] = result

    def _generate_cache_key(self, content: str, context: Dict[str, Any]) -> str:
        combined = json.dumps({
            "content": content,
            "context": context
        }, sort_keys=True)
        return hashlib.sha256(combined.encode()).hexdigest()

    def clear(self) -> None:
        self._cache.clear()
```