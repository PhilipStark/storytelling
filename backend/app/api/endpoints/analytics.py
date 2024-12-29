from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime, timedelta
from app.models.agent import AgentType
from app.models.analytics import AgentMetrics
from app.services.analytics_service import analytics_service

router = APIRouter()

@router.get("/metrics/agents", response_model=list[AgentMetrics])
async def get_agent_metrics(
    agent_type: Optional[AgentType] = None
):
    """Get aggregated metrics for one or all agents"""
    return await analytics_service.get_agent_metrics(agent_type)

@router.get("/metrics/quality/trends")
async def get_quality_trends(
    agent_type: AgentType,
    days: int = Query(default=7, ge=1, le=30)
):
    """Get quality score trends for an agent"""
    return await analytics_service.get_quality_trends(agent_type, days)

@router.get("/metrics/cache/performance")
async def get_cache_performance(
    agent_type: Optional[AgentType] = None,
    days: int = Query(default=7, ge=1, le=30)
):
    """Get cache performance metrics"""
    return await analytics_service.get_cache_performance(agent_type, days)

@router.get("/metrics/export")
async def export_metrics(
    start_date: datetime,
    end_date: Optional[datetime] = None,
    agent_type: Optional[AgentType] = None
):
    """Export metrics as CSV"""
    if not end_date:
        end_date = datetime.utcnow()

    # Query events from Supabase
    query = analytics_service.supabase.table('analytics_events').select('*').gte(
        'timestamp', start_date.isoformat()
    ).lte(
        'timestamp', end_date.isoformat()
    )

    if agent_type:
        query = query.eq('agent_type', agent_type)

    result = query.execute()

    # Convert to CSV format
    import io
    import csv

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        'timestamp', 'agent_type', 'metric_type', 'value',
        'prompt_hash', 'additional_data'
    ])
    writer.writeheader()
    writer.writerows(result.data)

    return {
        'content': output.getvalue(),
        'filename': f'metrics_{start_date.date()}_{end_date.date()}.csv'
    }
