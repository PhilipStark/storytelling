import hashlib
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from fastapi import BackgroundTasks
from app.models.analytics import (
    MetricType,
    AnalyticsEvent,
    QualityMetrics,
    CacheMetrics,
    GenerationMetrics,
    AgentMetrics
)
from app.models.agent import AgentType
from app.core.config import settings

class AnalyticsService:
    def __init__(self):
        self._init_metrics_cache()
        self.use_supabase = False
        try:
            from supabase import create_client, Client
            if settings.SUPABASE_URL and settings.SUPABASE_KEY:
                self.supabase: Client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_KEY
                )
                self.use_supabase = True
        except:
            print("Supabase not configured, using in-memory analytics only")

    def _init_metrics_cache(self):
        """Initialize in-memory metrics cache"""
        self.metrics_cache: Dict[AgentType, Dict] = {
            agent_type: {
                'events': [],
                'last_flush': datetime.utcnow(),
                'metrics': AgentMetrics(
                    agent_type=agent_type,
                    quality=QualityMetrics(
                        initial_score=0,
                        final_score=0,
                        retry_count=0,
                        total_time=0,
                        improvement_rate=0
                    ),
                    cache=CacheMetrics(),
                    generation=GenerationMetrics()
                )
            }
            for agent_type in AgentType
        }

    async def track_event(
        self,
        agent_type: AgentType,
        metric_type: MetricType,
        value: float,
        prompt: Optional[str] = None,
        additional_data: Optional[dict] = None,
        background_tasks: Optional[BackgroundTasks] = None
    ):
        """Track an analytics event"""
        event = AnalyticsEvent(
            agent_type=agent_type,
            metric_type=metric_type,
            value=value,
            prompt_hash=self._hash_prompt(prompt) if prompt else None,
            additional_data=additional_data
        )

        # Add to in-memory cache
        self.metrics_cache[agent_type]['events'].append(event)
        
        # Update in-memory metrics
        self._update_metrics(agent_type, event)

        # Flush to Supabase if configured
        if self.use_supabase and (
            len(self.metrics_cache[agent_type]['events']) >= 100 or
            datetime.utcnow() - self.metrics_cache[agent_type]['last_flush'] > timedelta(minutes=5)
        ):
            if background_tasks:
                background_tasks.add_task(self._flush_metrics, agent_type)
            else:
                await self._flush_metrics(agent_type)

    def _update_metrics(self, agent_type: AgentType, event: AnalyticsEvent):
        """Update in-memory metrics"""
        metrics = self.metrics_cache[agent_type]['metrics']
        
        if event.metric_type == MetricType.QUALITY_SCORE:
            if not metrics.quality.initial_score:
                metrics.quality.initial_score = event.value
            metrics.quality.final_score = event.value
            if metrics.quality.initial_score:
                metrics.quality.improvement_rate = (
                    (metrics.quality.final_score - metrics.quality.initial_score) /
                    metrics.quality.initial_score
                ) * 100
        
        elif event.metric_type == MetricType.RETRY_COUNT:
            metrics.quality.retry_count += event.value
        
        elif event.metric_type == MetricType.GENERATION_TIME:
            if event.value > 0:  # Ignore error cases
                metrics.generation.avg_time_seconds = (
                    (metrics.generation.avg_time_seconds * metrics.generation.success_count + event.value) /
                    (metrics.generation.success_count + 1)
                )
                metrics.generation.success_count += 1
            else:
                metrics.generation.failure_count += 1
        
        elif event.metric_type == MetricType.CACHE_HIT:
            metrics.cache.hits += 1
        
        elif event.metric_type == MetricType.CACHE_MISS:
            metrics.cache.misses += 1
        
        elif event.metric_type == MetricType.CACHE_SIZE:
            metrics.cache.storage_bytes = int(event.value)

    async def _flush_metrics(self, agent_type: AgentType):
        """Flush cached metrics to Supabase if configured"""
        if not self.use_supabase:
            return

        events = self.metrics_cache[agent_type]['events']
        if not events:
            return

        try:
            # Batch insert events
            self.supabase.table('analytics_events').insert([
                event.dict() for event in events
            ]).execute()

            # Update aggregated metrics
            self.supabase.table('agent_metrics').upsert(
                self.metrics_cache[agent_type]['metrics'].dict(),
                on_conflict='agent_type'
            ).execute()

            # Clear events cache but keep metrics
            self.metrics_cache[agent_type]['events'] = []
            self.metrics_cache[agent_type]['last_flush'] = datetime.utcnow()

        except Exception as e:
            print(f"Error flushing metrics to Supabase: {e}")

    def _hash_prompt(self, prompt: str) -> str:
        """Create a hash of the prompt for analytics"""
        return hashlib.sha256(prompt.encode()).hexdigest()

    async def get_agent_metrics(
        self,
        agent_type: Optional[AgentType] = None
    ) -> List[AgentMetrics]:
        """Get aggregated metrics for one or all agents"""
        if agent_type:
            return [self.metrics_cache[agent_type]['metrics']]
        return [cache['metrics'] for cache in self.metrics_cache.values()]

    async def get_quality_trends(
        self,
        agent_type: AgentType,
        days: int = 7
    ) -> List[dict]:
        """Get quality score trends for an agent"""
        events = [
            event.dict() for event in self.metrics_cache[agent_type]['events']
            if (
                event.metric_type == MetricType.QUALITY_SCORE and
                event.timestamp >= datetime.utcnow() - timedelta(days=days)
            )
        ]
        return sorted(events, key=lambda x: x['timestamp'])

    async def get_cache_performance(
        self,
        agent_type: Optional[AgentType] = None,
        days: int = 7
    ) -> dict:
        """Get cache performance metrics"""
        if agent_type:
            metrics = self.metrics_cache[agent_type]['metrics']
        else:
            metrics = AgentMetrics(
                agent_type=AgentType.OUTLINER,  # Placeholder
                quality=QualityMetrics(
                    initial_score=0,
                    final_score=0,
                    retry_count=0,
                    total_time=0,
                    improvement_rate=0
                ),
                cache=CacheMetrics(
                    hits=sum(m['metrics'].cache.hits for m in self.metrics_cache.values()),
                    misses=sum(m['metrics'].cache.misses for m in self.metrics_cache.values()),
                    storage_bytes=sum(m['metrics'].cache.storage_bytes for m in self.metrics_cache.values())
                ),
                generation=GenerationMetrics()
            )

        total = metrics.cache.hits + metrics.cache.misses
        return {
            'hit_rate': (metrics.cache.hits / total * 100) if total > 0 else 0,
            'miss_rate': (metrics.cache.misses / total * 100) if total > 0 else 0,
            'total_requests': total
        }

analytics_service = AnalyticsService()
