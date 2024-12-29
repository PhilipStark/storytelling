import asyncio
import random
from datetime import datetime, timedelta
from app.models.agent import AgentType
from app.models.analytics import MetricType
from app.services.analytics_service import analytics_service
from fastapi import BackgroundTasks

async def generate_test_data():
    """Generate sample analytics data for testing"""
    background_tasks = BackgroundTasks()
    
    # Generate data for the last 7 days
    for days_ago in range(7):
        date = datetime.utcnow() - timedelta(days=days_ago)
        
        for agent_type in AgentType:
            # Simulate cache hits/misses
            for _ in range(10):
                is_hit = random.random() > 0.3
                await analytics_service.track_event(
                    agent_type=agent_type,
                    metric_type=MetricType.CACHE_HIT if is_hit else MetricType.CACHE_MISS,
                    value=1,
                    prompt=f"test_prompt_{days_ago}_{agent_type}",
                    background_tasks=background_tasks
                )
            
            # Simulate generation times
            for _ in range(5):
                gen_time = random.uniform(1.0, 10.0)
                await analytics_service.track_event(
                    agent_type=agent_type,
                    metric_type=MetricType.GENERATION_TIME,
                    value=gen_time,
                    prompt=f"test_prompt_{days_ago}_{agent_type}",
                    background_tasks=background_tasks
                )
            
            # Simulate quality scores
            for _ in range(5):
                score = random.uniform(8.0, 10.0)
                await analytics_service.track_event(
                    agent_type=agent_type,
                    metric_type=MetricType.QUALITY_SCORE,
                    value=score,
                    prompt=f"test_prompt_{days_ago}_{agent_type}",
                    background_tasks=background_tasks
                )

async def test_analytics():
    """Test analytics data collection and retrieval"""
    # Generate test data
    print("Generating test data...")
    await generate_test_data()
    
    # Test metrics retrieval
    print("\nTesting metrics retrieval...")
    
    # Get agent metrics
    metrics = await analytics_service.get_agent_metrics()
    print("\nAgent Metrics:")
    for metric in metrics:
        print(f"\n{metric.agent_type}:")
        print(f"Quality: {metric.quality}")
        print(f"Cache: {metric.cache}")
        print(f"Generation: {metric.generation}")
    
    # Get cache performance
    for agent_type in AgentType:
        perf = await analytics_service.get_cache_performance(agent_type)
        print(f"\nCache Performance for {agent_type}:")
        print(f"Hit Rate: {perf['hit_rate']:.2f}%")
        print(f"Miss Rate: {perf['miss_rate']:.2f}%")
        print(f"Total Requests: {perf['total_requests']}")
    
    # Get quality trends
    for agent_type in AgentType:
        trends = await analytics_service.get_quality_trends(agent_type)
        print(f"\nQuality Trends for {agent_type}:")
        print(f"Total data points: {len(trends)}")
        if trends:
            avg_score = sum(t['value'] for t in trends) / len(trends)
            print(f"Average score: {avg_score:.2f}")

if __name__ == "__main__":
    asyncio.run(test_analytics())
