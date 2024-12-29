from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from .models import BookStatus

class BookBase(BaseModel):
    title: str = Field(..., description="The title of the book")
    description: str = Field(..., description="Brief description of the book")
    genre: str = Field(..., description="Book genre (e.g., Fantasy, Mystery)")
    target_audience: str = Field(..., description="Target audience (e.g., Young Adult, Adult)")
    style: str = Field(..., description="Writing style (e.g., Descriptive, Concise)")
    tone: str = Field(..., description="Narrative tone (e.g., Humorous, Serious)")
    length: str = Field(..., description="Book length (e.g., Novel, Novella)")

class BookCreate(BookBase):
    pass

class Book(BookBase):
    id: int
    status: BookStatus
    content: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True