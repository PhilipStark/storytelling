from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Enum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class BookStatus(str, enum.Enum):
    DRAFT = "draft"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    genre = Column(String)
    target_audience = Column(String)
    style = Column(String)
    tone = Column(String)
    length = Column(String)
    content = Column(JSON, nullable=True)
    status = Column(Enum(BookStatus), default=BookStatus.DRAFT)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)