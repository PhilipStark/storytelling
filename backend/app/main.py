from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import books, events
from .database import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Book Generator API",
    description="AI-powered book generation service",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(books.router)
app.include_router(events.router)

@app.get("/")
async def root():
    return {"message": "Book Generator API is running"}