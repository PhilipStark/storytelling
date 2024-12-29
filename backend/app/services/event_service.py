from typing import Dict, Set
from fastapi import Request
from asyncio import Queue
import json

class EventService:
    def __init__(self):
        self._queues: Dict[int, Set[Queue]] = {}

    async def subscribe(self, book_id: int) -> Queue:
        if book_id not in self._queues:
            self._queues[book_id] = set()
        queue = Queue()
        self._queues[book_id].add(queue)
        return queue

    async def unsubscribe(self, book_id: int, queue: Queue):
        if book_id in self._queues:
            self._queues[book_id].remove(queue)
            if not self._queues[book_id]:
                del self._queues[book_id]

    async def publish(self, book_id: int, data: dict):
        if book_id in self._queues:
            for queue in self._queues[book_id]:
                await queue.put(json.dumps(data))

event_service = EventService()