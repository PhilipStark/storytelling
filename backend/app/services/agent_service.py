from typing import AsyncGenerator
import json
import time
from fastapi import BackgroundTasks
from app.models.agent import (
    AgentType, 
    AgentStatus, 
    AgentProgress, 
    AgentMetrics, 
    BookGenerationState
)
from app.models.analytics import MetricType
from app.core.config import settings
from app.services.openai_service import OpenAIService
from app.services.cache_service import cache_service
from app.services.retry_service import retry_service
from app.services.analytics_service import analytics_service

class AgentService:
    def __init__(self):
        self.openai = OpenAIService()

    async def generate_book_stream(self, book_id: int, background_tasks: BackgroundTasks) -> AsyncGenerator[str, None]:
        state = BookGenerationState(
            current_agent=AgentType.OUTLINER,
            agents={
                AgentType.OUTLINER: AgentProgress(agent=AgentType.OUTLINER, status=AgentStatus.WAITING, progress=0),
                AgentType.WRITER: AgentProgress(agent=AgentType.WRITER, status=AgentStatus.WAITING, progress=0),
                AgentType.EDITOR: AgentProgress(agent=AgentType.EDITOR, status=AgentStatus.WAITING, progress=0),
                AgentType.CRITIC: AgentProgress(agent=AgentType.CRITIC, status=AgentStatus.WAITING, progress=0)
            },
            metrics=AgentMetrics(
                structure=0,
                writing_quality=0,
                technical_aspects=0,
                overall_score=0
            )
        )

        # Track generation start
        start_time = time.time()

        # Outliner Phase
        outline = await self._run_outliner(state, background_tasks)
        if not outline:
            return

        # Writer Phase
        draft = await self._run_writer(state, outline, background_tasks)
        if not draft:
            return

        # Editor Phase
        edited = await self._run_editor(state, draft, background_tasks)
        if not edited:
            return

        # Critic Phase
        final = await self._run_critic(state, edited, background_tasks)
        if not final:
            return

        # Track total generation time
        total_time = time.time() - start_time
        await analytics_service.track_event(
            agent_type=state.current_agent,
            metric_type=MetricType.GENERATION_TIME,
            value=total_time,
            background_tasks=background_tasks
        )

        state.final_content = final
        yield self._format_event(state)

    async def _run_outliner(self, state: BookGenerationState, background_tasks: BackgroundTasks) -> str | None:
        state.current_agent = AgentType.OUTLINER
        state.agents[AgentType.OUTLINER].status = AgentStatus.RUNNING
        
        start_time = time.time()
        
        # Check cache first
        cached_result = await cache_service.get_cached_result(state.prompt, AgentType.OUTLINER)
        if cached_result:
            outline, score = cached_result
            state.agents[AgentType.OUTLINER].score = score
            state.agents[AgentType.OUTLINER].output = outline
            state.agents[AgentType.OUTLINER].status = AgentStatus.COMPLETED
            state.agents[AgentType.OUTLINER].usingCache = True
            state.metrics.structure = score
            
            # Track cache hit
            await analytics_service.track_event(
                agent_type=AgentType.OUTLINER,
                metric_type=MetricType.CACHE_HIT,
                value=1,
                prompt=state.prompt,
                background_tasks=background_tasks
            )
            
            return outline

        # Track cache miss
        await analytics_service.track_event(
            agent_type=AgentType.OUTLINER,
            metric_type=MetricType.CACHE_MISS,
            value=1,
            prompt=state.prompt,
            background_tasks=background_tasks
        )

        async def generate_with_score():
            outline = await self.openai.generate_outline(state.prompt)
            score = await self.openai.evaluate_structure(outline)
            return outline, score

        try:
            outline, score = await retry_service.with_retry(
                generate_with_score,
                on_attempt=lambda attempt, delay: self._update_retry_status(
                    state, AgentType.OUTLINER, attempt, delay
                )
            )
            
            generation_time = time.time() - start_time
            
            # Track metrics
            await analytics_service.track_event(
                agent_type=AgentType.OUTLINER,
                metric_type=MetricType.GENERATION_TIME,
                value=generation_time,
                prompt=state.prompt,
                background_tasks=background_tasks
            )
            
            await analytics_service.track_event(
                agent_type=AgentType.OUTLINER,
                metric_type=MetricType.QUALITY_SCORE,
                value=score,
                prompt=state.prompt,
                background_tasks=background_tasks
            )
            
            state.agents[AgentType.OUTLINER].score = score
            state.metrics.structure = score
            state.agents[AgentType.OUTLINER].status = AgentStatus.COMPLETED
            
            # Cache successful result
            if score >= 9.5:
                await cache_service.cache_result(state.prompt, AgentType.OUTLINER, outline, score)
            
            return outline
            
        except Exception as e:
            print(f"Error in outliner phase: {e}")
            
            # Track error
            await analytics_service.track_event(
                agent_type=AgentType.OUTLINER,
                metric_type=MetricType.GENERATION_TIME,
                value=-1,
                additional_data={'error': str(e)},
                background_tasks=background_tasks
            )
            
            return None

    async def _run_writer(self, state: BookGenerationState, outline: str, background_tasks: BackgroundTasks) -> str | None:
        state.current_agent = AgentType.WRITER
        state.agents[AgentType.WRITER].status = AgentStatus.RUNNING
        
        start_time = time.time()
        
        # Check cache
        cached_result = await cache_service.get_cached_result(outline, AgentType.WRITER)
        if cached_result:
            draft, score = cached_result
            state.agents[AgentType.WRITER].score = score
            state.agents[AgentType.WRITER].output = draft
            state.agents[AgentType.WRITER].status = AgentStatus.COMPLETED
            state.agents[AgentType.WRITER].usingCache = True
            state.metrics.writing_quality = score
            
            # Track cache hit
            await analytics_service.track_event(
                agent_type=AgentType.WRITER,
                metric_type=MetricType.CACHE_HIT,
                value=1,
                prompt=outline,
                background_tasks=background_tasks
            )
            
            return draft

        # Track cache miss
        await analytics_service.track_event(
            agent_type=AgentType.WRITER,
            metric_type=MetricType.CACHE_MISS,
            value=1,
            prompt=outline,
            background_tasks=background_tasks
        )

        async def generate_with_score():
            draft = await self.openai.generate_draft(outline)
            score = await self.openai.evaluate_writing(draft)
            return draft, score

        try:
            draft, score = await retry_service.with_retry(
                generate_with_score,
                on_attempt=lambda attempt, delay: self._update_retry_status(
                    state, AgentType.WRITER, attempt, delay
                )
            )
            
            generation_time = time.time() - start_time
            
            # Track metrics
            await analytics_service.track_event(
                agent_type=AgentType.WRITER,
                metric_type=MetricType.GENERATION_TIME,
                value=generation_time,
                prompt=outline,
                background_tasks=background_tasks
            )
            
            await analytics_service.track_event(
                agent_type=AgentType.WRITER,
                metric_type=MetricType.QUALITY_SCORE,
                value=score,
                prompt=outline,
                background_tasks=background_tasks
            )
            
            state.agents[AgentType.WRITER].score = score
            state.metrics.writing_quality = score
            state.agents[AgentType.WRITER].status = AgentStatus.COMPLETED
            
            await cache_service.cache_result(outline, AgentType.WRITER, draft, score)
            
            if score < 9.5:
                return await self._run_editor(state, draft, background_tasks)
            
            return draft
            
        except Exception as e:
            print(f"Error in writer phase: {e}")
            
            # Track error
            await analytics_service.track_event(
                agent_type=AgentType.WRITER,
                metric_type=MetricType.GENERATION_TIME,
                value=-1,
                additional_data={'error': str(e)},
                background_tasks=background_tasks
            )
            
            return None

    async def _run_editor(self, state: BookGenerationState, draft: str, background_tasks: BackgroundTasks) -> str | None:
        state.current_agent = AgentType.EDITOR
        state.agents[AgentType.EDITOR].status = AgentStatus.RUNNING
        
        start_time = time.time()
        
        # Check cache
        cached_result = await cache_service.get_cached_result(draft, AgentType.EDITOR)
        if cached_result:
            edited, score = cached_result
            state.agents[AgentType.EDITOR].score = score
            state.agents[AgentType.EDITOR].output = edited
            state.agents[AgentType.EDITOR].status = AgentStatus.COMPLETED
            state.agents[AgentType.EDITOR].usingCache = True
            state.metrics.technical_aspects = score
            
            # Track cache hit
            await analytics_service.track_event(
                agent_type=AgentType.EDITOR,
                metric_type=MetricType.CACHE_HIT,
                value=1,
                prompt=draft,
                background_tasks=background_tasks
            )
            
            return edited

        # Track cache miss
        await analytics_service.track_event(
            agent_type=AgentType.EDITOR,
            metric_type=MetricType.CACHE_MISS,
            value=1,
            prompt=draft,
            background_tasks=background_tasks
        )

        async def generate_with_score():
            edited = await self.openai.edit_draft(draft)
            score = await self.openai.evaluate_technical(edited)
            return edited, score

        try:
            edited, score = await retry_service.with_retry(
                generate_with_score,
                on_attempt=lambda attempt, delay: self._update_retry_status(
                    state, AgentType.EDITOR, attempt, delay
                )
            )
            
            generation_time = time.time() - start_time
            
            # Track metrics
            await analytics_service.track_event(
                agent_type=AgentType.EDITOR,
                metric_type=MetricType.GENERATION_TIME,
                value=generation_time,
                prompt=draft,
                background_tasks=background_tasks
            )
            
            await analytics_service.track_event(
                agent_type=AgentType.EDITOR,
                metric_type=MetricType.QUALITY_SCORE,
                value=score,
                prompt=draft,
                background_tasks=background_tasks
            )
            
            state.agents[AgentType.EDITOR].score = score
            state.metrics.technical_aspects = score
            state.agents[AgentType.EDITOR].status = AgentStatus.COMPLETED
            
            await cache_service.cache_result(draft, AgentType.EDITOR, edited, score)
            
            if score < 9.5:
                return await self._run_editor(state, edited, background_tasks)
            
            return edited
            
        except Exception as e:
            print(f"Error in editor phase: {e}")
            
            # Track error
            await analytics_service.track_event(
                agent_type=AgentType.EDITOR,
                metric_type=MetricType.GENERATION_TIME,
                value=-1,
                additional_data={'error': str(e)},
                background_tasks=background_tasks
            )
            
            return None

    async def _run_critic(self, state: BookGenerationState, content: str, background_tasks: BackgroundTasks) -> str | None:
        state.current_agent = AgentType.CRITIC
        state.agents[AgentType.CRITIC].status = AgentStatus.RUNNING
        
        start_time = time.time()
        
        async def evaluate_with_retry():
            score = await self.openai.evaluate_overall(content)
            return content, score

        try:
            final, score = await retry_service.with_retry(
                evaluate_with_retry,
                on_attempt=lambda attempt, delay: self._update_retry_status(
                    state, AgentType.CRITIC, attempt, delay
                )
            )
            
            generation_time = time.time() - start_time
            
            # Track metrics
            await analytics_service.track_event(
                agent_type=AgentType.CRITIC,
                metric_type=MetricType.GENERATION_TIME,
                value=generation_time,
                prompt=content,
                background_tasks=background_tasks
            )
            
            await analytics_service.track_event(
                agent_type=AgentType.CRITIC,
                metric_type=MetricType.QUALITY_SCORE,
                value=score,
                prompt=content,
                background_tasks=background_tasks
            )
            
            state.agents[AgentType.CRITIC].score = score
            state.metrics.overall_score = score
            state.agents[AgentType.CRITIC].status = AgentStatus.COMPLETED
            
            if score < 9.5:
                return await self._run_editor(state, content, background_tasks)
            
            return final
            
        except Exception as e:
            print(f"Error in critic phase: {e}")
            
            # Track error
            await analytics_service.track_event(
                agent_type=AgentType.CRITIC,
                metric_type=MetricType.GENERATION_TIME,
                value=-1,
                additional_data={'error': str(e)},
                background_tasks=background_tasks
            )
            
            return None

    def _update_retry_status(self, state: BookGenerationState, agent_type: AgentType, attempt: int, delay: float):
        """Update agent status during retry"""
        state.agents[agent_type].status = AgentStatus.RETRYING
        state.agents[agent_type].attempt = attempt
        state.agents[agent_type].maxAttempts = retry_service.max_attempts
        state.agents[agent_type].backoffDelay = delay
        state.agents[agent_type].progress = 0

    def _format_event(self, state: BookGenerationState) -> str:
        return f"data: {json.dumps(state.dict())}\n\n"

agent_service = AgentService()
