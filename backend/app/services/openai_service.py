from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from app.core.config import settings

class OpenAIService:
    def __init__(self):
        self.openai = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.anthropic = AsyncAnthropic(api_key=settings.CLAUDE_API_KEY)

    async def generate_outline(self, prompt: str) -> str:
        response = await self.openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert book outliner. Create a detailed chapter-by-chapter outline with character arcs and plot points."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        return response.choices[0].message.content

    async def generate_draft(self, outline: str) -> str:
        response = await self.anthropic.messages.create(
            model="claude-3-opus-20240229",
            messages=[
                {"role": "system", "content": "You are a master writer. Transform this outline into engaging prose with rich descriptions and natural dialogue."},
                {"role": "user", "content": outline}
            ],
            temperature=0.8,
            max_tokens=100000
        )
        return response.content

    async def edit_draft(self, draft: str) -> str:
        response = await self.openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a meticulous editor. Refine this text for perfect pacing, consistency, and style."},
                {"role": "user", "content": draft}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content

    async def evaluate_structure(self, outline: str) -> float:
        response = await self.openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a literary critic. Evaluate this outline's structure on a scale of 0-10."},
                {"role": "user", "content": outline}
            ],
            temperature=0.3
        )
        return float(response.choices[0].message.content)

    async def evaluate_writing(self, content: str) -> float:
        response = await self.anthropic.messages.create(
            model="claude-3-opus-20240229",
            messages=[
                {"role": "system", "content": "You are a writing quality assessor. Rate this text's writing quality on a scale of 0-10."},
                {"role": "user", "content": content}
            ],
            temperature=0.3,
            max_tokens=100
        )
        return float(response.content)

    async def evaluate_technical(self, content: str) -> float:
        response = await self.openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a technical editor. Rate the technical aspects of this text on a scale of 0-10."},
                {"role": "user", "content": content}
            ],
            temperature=0.3
        )
        return float(response.choices[0].message.content)

    async def evaluate_overall(self, content: str) -> float:
        response = await self.anthropic.messages.create(
            model="claude-3-opus-20240229",
            messages=[
                {"role": "system", "content": "You are a comprehensive literary critic. Provide an overall quality score for this text on a scale of 0-10."},
                {"role": "user", "content": content}
            ],
            temperature=0.3,
            max_tokens=100
        )
        return float(response.content)
