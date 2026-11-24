from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class TwinSimulationRequest(BaseModel):
    water_liters: float = Field(2.0, ge=0.0, le=10.0)
    sleep_hours: float = Field(7.0, ge=0.0, le=24.0)
    steps: int = Field(6000, ge=0, le=50000)
    stress_level: int = Field(4, ge=1, le=10)
    calories: Optional[float] = Field(2000.0, ge=500.0, le=10000.0)
    protein: Optional[float] = Field(50.0, ge=0.0, le=400.0)
    carbohydrates: Optional[float] = Field(230.0, ge=0.0, le=1000.0)
    fats: Optional[float] = Field(65.0, ge=0.0, le=500.0)
    mood: Optional[str] = "Okay"
