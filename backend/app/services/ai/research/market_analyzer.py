```python
from typing import Dict, Any
from ..models.claude import ClaudeModel
from ..models.gpt4 import GPT4Model

class MarketAnalyzer:
    def __init__(self):
        self.market_researcher = ClaudeModel()
        self.trend_analyzer = GPT4Model()

    async def analyze_market(self, book_data: Dict[str, Any]) -> Dict[str, Any]:
        market_research = await self.market_researcher.generate(
            self._build_market_research_prompt(book_data)
        )
        trend_analysis = await self.trend_analyzer.generate(
            self._build_trend_analysis_prompt(book_data, market_research)
        )
        
        return {
            "market_research": market_research,
            "trend_analysis": trend_analysis,
            "target_segments": self._extract_segments(market_research, trend_analysis)
        }

    def _build_market_research_prompt(self, book_data: Dict[str, Any]) -> str:
        return f"""Analyze the market potential for this book:
        Genre: {book_data['genre']}
        Target Audience: {book_data['target_audience']}
        Style: {book_data['style']}

        Provide insights on:
        1. Market size and growth
        2. Reader preferences
        3. Competition analysis
        4. Market gaps and opportunities"""

    def _build_trend_analysis_prompt(self, book_data: Dict[str, Any], market_research: str) -> str:
        return f"""Based on this market research: {market_research}

        Analyze current trends for:
        1. Popular themes in {book_data['genre']}
        2. Reader engagement patterns
        3. Marketing channels
        4. Price points and formats"""

    def _extract_segments(self, market_research: str, trend_analysis: str) -> list:
        # Extract target market segments from analysis
        return []
```