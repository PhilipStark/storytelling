from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from ..services.event_service import event_service
import asyncio

router = APIRouter(
    prefix="/events",
    tags=["events"]
)

async def event_generator(request: Request, book_id: int):
    queue = await event_service.subscribe(book_id)
    try:
        while True:
            if await request.is_disconnected():
                break
            try:
                data = await asyncio.wait_for(queue.get(), timeout=60)
                yield f"data: {data}\n\n"
            except asyncio.TimeoutError:
                yield f"data: {{}}\n\n"  # Keep-alive
    finally:
        await event_service.unsubscribe(book_id, queue)

@router.get("/{book_id}")
async def subscribe_to_events(request: Request, book_id: int):
    return StreamingResponse(
        event_generator(request, book_id),
        media_type="text/event-stream"
    )