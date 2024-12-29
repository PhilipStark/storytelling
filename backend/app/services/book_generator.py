```python
from typing import Dict, Any
import openai
import anthropic
from .event_service import event_service
from ..models import BookStatus

class BookGenerator:
    def __init__(self):
        self.openai_client = openai.OpenAI()
        self.anthropic_client = anthropic.Anthropic()

    async def generate_outline(self, book_data: Dict[str, Any]) -> str:
        await event_service.publish(book_data["id"], {
            "status": BookStatus.GENERATING,
            "progress": "Creating story outline..."
        })
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[{
                "role": "system",
                "content": "You are a master book architect."
            }, {
                "role": "user",
                "content": f"""Create a detailed outline for a {book_data['genre']} book with:
                Title: {book_data['title']}
                Description: {book_data['description']}
                Target Audience: {book_data['target_audience']}
                Style: {book_data['style']}
                Tone: {book_data['tone']}
                Length: {book_data['length']}"""
            }]
        )
        return response.choices[0].message.content

    async def generate_content(self, outline: str, book_data: Dict[str, Any]) -> str:
        await event_service.publish(book_data["id"], {
            "status": BookStatus.GENERATING,
            "progress": "Writing the book content..."
        })
        
        response = await self.anthropic_client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=100000,
            messages=[{
                "role": "user",
                "content": f"""Based on this outline: {outline}
                Generate a complete book that matches:
                Style: {book_data['style']}
                Tone: {book_data['tone']}
                Target Audience: {book_data['target_audience']}"""
            }]
        )
        return response.content

    async def enhance_dialogues(self, content: str, book_id: int) -> str:
        await event_service.publish(book_id, {
            "status": BookStatus.GENERATING,
            "progress": "Enhancing dialogues..."
        })
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[{
                "role": "system",
                "content": "You are a dialogue enhancement specialist."
            }, {
                "role": "user",
                "content": f"Enhance the dialogues in this content to be more natural and engaging: {content}"
            }]
        )
        return response.choices[0].message.content

    async def final_review(self, content: str, book_id: int) -> str:
        await event_service.publish(book_id, {
            "status": BookStatus.GENERATING,
            "progress": "Performing final review..."
        })
        
        response = await self.anthropic_client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=100000,
            messages=[{
                "role": "user",
                "content": f"Review and polish this book for consistency, flow, and impact: {content}"
            }]
        )
        return response.content
```