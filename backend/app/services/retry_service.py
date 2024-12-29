import asyncio
from typing import TypeVar, Callable, Awaitable
from app.core.config import settings

T = TypeVar('T')

class RetryService:
    def __init__(self):
        self.max_attempts = 5
        self.initial_delay = 1.0  # seconds
        self.max_delay = 30.0  # seconds
        self.multiplier = 2.0

    async def with_retry(
        self,
        operation: Callable[..., Awaitable[T]],
        *args,
        on_attempt: Callable[[int, float], None] = None,
        **kwargs
    ) -> T:
        """Execute an operation with exponential backoff retry"""
        attempt = 1
        delay = self.initial_delay

        while True:
            try:
                result = await operation(*args, **kwargs)
                
                # For our use case, we consider score < 9.5 as a failure
                if isinstance(result, tuple) and len(result) == 2 and isinstance(result[1], (int, float)):
                    score = result[1]
                    if score >= 9.5:
                        return result
                    if attempt >= self.max_attempts:
                        return result  # Return best result if we're out of attempts
                else:
                    return result  # Return result if it's not a scored operation

            except Exception as e:
                if attempt >= self.max_attempts:
                    raise e
            
            # Calculate next delay
            delay = min(delay * self.multiplier, self.max_delay)
            
            # Notify about retry
            if on_attempt:
                on_attempt(attempt, delay)
            
            # Wait before next attempt
            await asyncio.sleep(delay)
            attempt += 1

    def calculate_backoff_delay(self, attempt: int) -> float:
        """Calculate the delay for a given attempt number"""
        delay = self.initial_delay
        for _ in range(attempt - 1):
            delay = min(delay * self.multiplier, self.max_delay)
        return delay

retry_service = RetryService()
