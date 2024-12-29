from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from app.models.book import BookCreate, Book
from app.models.agent import BookGenerationState
from app.services.book_service import book_service
from app.services.agent_service import agent_service

router = APIRouter()

@router.post("/books", response_model=Book)
async def create_book(book: BookCreate):
    return await book_service.create_book(book)

@router.post("/books/{book_id}/generate")
async def generate_book(book_id: int, background_tasks: BackgroundTasks):
    book = await book_service.get_book(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    background_tasks.add_task(book_service.update_book_status, book_id, "generating")
    return {"status": "Generation started"}

@router.get("/books/{book_id}/generate-stream")
async def generate_book_stream(book_id: int):
    book = await book_service.get_book(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    return StreamingResponse(
        agent_service.generate_book_stream(book_id),
        media_type="text/event-stream"
    )

@router.get("/books/{book_id}", response_model=Book)
async def get_book(book_id: int):
    book = await book_service.get_book(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@router.get("/books/{book_id}/status", response_model=Book)
async def get_book_status(book_id: int):
    book = await book_service.get_book(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book
