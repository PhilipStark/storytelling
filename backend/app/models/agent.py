from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

class AgentType(str, Enum):
    OUTLINER = "outliner"
    WRITER = "writer"
    EDITOR = "editor"
    CRITIC = "critic"

class AgentStatus(str, Enum):
    WAITING = "waiting"
    RUNNING = "running"
    COMPLETED = "completed"
    REFINING = "refining"

class AgentProgress(BaseModel):
    agent: AgentType
    status: AgentStatus
    progress: float = Field(ge=0, le=100)
    score: Optional[float] = None
    output: Optional[str] = None

class AgentMetrics(BaseModel):
    structure: float = Field(ge=0, le=10)
    writing_quality: float = Field(ge=0, le=10)
    technical_aspects: float = Field(ge=0, le=10)
    overall_score: float = Field(ge=0, le=10)

class BookGenerationState(BaseModel):
    current_agent: AgentType
    agents: dict[AgentType, AgentProgress]
    metrics: AgentMetrics
    final_content: Optional[str] = None
