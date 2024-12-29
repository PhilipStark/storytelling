from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Book Generator API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    OPENAI_API_KEY: str
    CLAUDE_API_KEY: str
    DATABASE_URL: str
    JWT_SECRET: str
    
    # Supabase settings
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    class Config:
        env_file = ".env"

settings = Settings()
