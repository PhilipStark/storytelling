from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..services.book_service import BookService
from ..schemas import Book, BookCreate
from ..models import BookStatus

router = APIRouter(
    prefix="/books",
    tags=["books"],
    responses={404: {"description": "Not found"}}
)

@router.post("/", response_model=Book, status_code=201,
    summary="Create a new book",
    description="Create a new book with the provided details")
async def create_book(book: BookCreate, db: Session = Depends(get_db)):
    """
    Create a new book with the following parameters:
    - **title**: Book title
    - **description**: Brief description
    - **genre**: Book genre
    - **target_audience**: Target reader demographic
    - **style**: Writing style
    - **tone**: Narrative tone
    - **length**: Book length
    """
    service = BookService(db)
    return await service.create_book(book.dict())

@router.post("/{book_id}/generate", status_code=202,
    summary="Start book generation",
    description="Start the AI-powered generation process for a book")
async def generate_book(
    book_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Initiate the book generation process:
    - Generates book structure using GPT-4
    - Creates content using Claude
    - Updates book status throughout the process
    """
    service = BookService(db)
    background_tasks.add_task(service.generate_book, book_id)
    return {"message": "Book generation started"}

@router.get("/{book_id}/status", response_model=dict,
    summary="Get book generation status",
    description="Check the current status of book generation")
async def get_book_status(book_id: int, db: Session = Depends(get_db)):
    """
    Returns the current status of book generation:
    - **status**: Current generation status (draft, generating, completed, failed)
    - **content**: Generated content (if status is completed)
    """
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return {
        "status": book.status,
        "content": book.content if book.status == BookStatus.COMPLETED else None
    }