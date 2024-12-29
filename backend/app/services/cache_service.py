from datetime import datetime, timedelta
from typing import Optional
from supabase import create_client, Client
from app.core.config import settings
from app.models.agent import AgentType

class CacheService:
    def __init__(self):
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )
        self._ensure_table()

    def _ensure_table(self):
        # Create table if not exists using Supabase's SQL editor
        self.supabase.table('generation_cache').select('*').limit(1).execute()

    async def get_cached_result(self, prompt: str, agent_type: AgentType) -> Optional[tuple[str, float]]:
        """Get cached result if available and valid"""
        try:
            result = self.supabase.table('generation_cache').select('*').eq(
                'prompt', prompt
            ).eq(
                'agent_type', agent_type
            ).gte(
                'expires_at', datetime.utcnow().isoformat()
            ).gte(
                'score', 9.5
            ).order('created_at', desc=True).limit(1).execute()

            if result.data:
                entry = result.data[0]
                return entry['output'], entry['score']
            return None
        except Exception as e:
            print(f"Cache read error: {e}")
            return None

    async def cache_result(self, prompt: str, agent_type: AgentType, output: str, score: float):
        """Cache a generation result"""
        if score < 9.5:
            return

        try:
            now = datetime.utcnow()
            self.supabase.table('generation_cache').insert({
                'prompt': prompt,
                'agent_type': agent_type,
                'output': output,
                'score': score,
                'created_at': now.isoformat(),
                'expires_at': (now + timedelta(hours=24)).isoformat()
            }).execute()
        except Exception as e:
            print(f"Cache write error: {e}")

    async def cleanup_expired(self):
        """Remove expired cache entries"""
        try:
            self.supabase.table('generation_cache').delete().lt(
                'expires_at', datetime.utcnow().isoformat()
            ).execute()
        except Exception as e:
            print(f"Cache cleanup error: {e}")

cache_service = CacheService()
