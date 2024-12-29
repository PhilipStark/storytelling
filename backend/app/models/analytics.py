from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from .agent import AgentType

class MetricType(str, Enum):
    CACHE_HIT = "cache_hit"
    CACHE_MISS = "cache_miss"
    GENERATION_TIME = "generation_time"
    RETRY_COUNT = "retry_count"
    QUALITY_SCORE = "quality_score"
    CACHE_INVALIDATION = "cache_invalidation"
    CACHE_SIZE = "cache_size"

class AnalyticsEvent(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    agent_type: AgentType
    metric_type: MetricType
    value: float
    prompt_hash: Optional[str] = None
    additional_data: Optional[dict] = None

class QualityMetrics(BaseModel):
    initial_score: float
    final_score: float
    retry_count: int
    total_time: float
    improvement_rate: float
    failure_reason: Optional[str] = None

class CacheMetrics(BaseModel):
    hits: int = 0
    misses: int = 0
    avg_validity_hours: float = 0
    storage_bytes: int = 0
    invalidation_reason: Optional[str] = None

class GenerationMetrics(BaseModel):
    success_count: int = 0
    failure_count: int = 0
    avg_time_seconds: float = 0
    avg_retries: float = 0
    error_types: dict[str, int] = Field(default_factory=dict)

class AgentMetrics(BaseModel):
    agent_type: AgentType
    quality: QualityMetrics
    cache: CacheMetrics
    generation: GenerationMetrics
    updated_at: datetime = Field(default_factory=datetime.utcnow)
