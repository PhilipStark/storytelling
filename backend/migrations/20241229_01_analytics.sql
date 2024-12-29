-- Create analytics tables
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    agent_type TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    prompt_hash TEXT,
    additional_data JSONB
);

CREATE TABLE IF NOT EXISTS agent_metrics (
    id BIGSERIAL PRIMARY KEY,
    agent_type TEXT NOT NULL UNIQUE,
    quality JSONB NOT NULL,
    cache JSONB NOT NULL,
    generation JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp 
ON analytics_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_analytics_events_agent_type 
ON analytics_events(agent_type);

CREATE INDEX IF NOT EXISTS idx_analytics_events_metric_type 
ON analytics_events(metric_type);

CREATE INDEX IF NOT EXISTS idx_analytics_events_prompt_hash 
ON analytics_events(prompt_hash);

-- Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_agent_metrics_updated_at
    BEFORE UPDATE ON agent_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to clean up old analytics events
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events()
RETURNS void AS $$
BEGIN
    DELETE FROM analytics_events
    WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up old events daily
SELECT cron.schedule(
    'cleanup-analytics-events',
    '0 0 * * *',  -- Run at midnight every day
    'SELECT cleanup_old_analytics_events();'
);
