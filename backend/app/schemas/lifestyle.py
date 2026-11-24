from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class LifestyleLogCreate(BaseModel):
    water_liters: float = Field(0.0, ge=0.0, le=20.0)
    sleep_hours: float = Field(0.0, ge=0.0, le=24.0)
    steps: int = Field(0, ge=0, le=100000)
    stress_level: int = Field(0, ge=0, le=10)
    mood: Optional[str] = "Good"


class LifestyleLogResponse(BaseModel):
    id: int
    user_id: int
    water_liters: float = 0.0
    sleep_hours: float = 0.0
    steps: int = 0
    stress_level: int = 0
    mood: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
