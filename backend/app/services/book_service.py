```python
from typing import Dict, Any
from sqlalchemy.orm import Session
from ..models import Book, BookStatus
from .book_generator import BookGenerator
from .event_service import event_service

class BookService:
    def __init__(self, db: Session):
        self.db = db
        self.generator = BookGenerator()

    async def create_book(self, book_data: Dict[str, Any]) -> Book:
        book = Book(**book_data, status=BookStatus.DRAFT)
        self.db.add(book)
        self.db.commit()
        self.db.refresh(book)
        return book

    async def generate_book(self, book_id: int) -> None:
        book = self.db.query(Book).filter(Book.id == book_id).first()
        if not book:
            raise ValueError("Book not found")

        try:
            # Update status to generating
            book.status = BookStatus.GENERATING
            self.db.commit()

            # Generate outline
            outline = await self.generator.generate_outline(book.__dict__)

            # Generate initial content
            content = await self.generator.generate_content(outline, book.__dict__)

            # Enhance dialogues
            enhanced_content = await self.generator.enhance_dialogues(content, book_id)

            # Final review
            final_content = await self.generator.final_review(enhanced_content, book_id)

            # Update book with final content
            book.content = {
                "structure": outline,
                "content": final_content
            }
            book.status = BookStatus.COMPLETED
            
            await event_service.publish(book_id, {
                "status": BookStatus.COMPLETED,
                "progress": "Book generation completed!"
            })

        except Exception as e:
            book.status = BookStatus.FAILED
            await event_service.publish(book_id, {
                "status": BookStatus.FAILED,
                "progress": f"Generation failed: {str(e)}"
            })
            raise e
        finally:
            self.db.commit()

    def get_book_status(self, book_id: int) -> Dict[str, Any]:
        book = self.db.query(Book).filter(Book.id == book_id).first()
        if not book:
            raise ValueError("Book not found")
        
        return {
            "status": book.status,
            "content": book.content if book.status == BookStatus.COMPLETED else None
        }
```