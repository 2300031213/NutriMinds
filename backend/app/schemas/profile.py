from typing import Optional
from pydantic import BaseModel, Field


class UserProfileCreate(BaseModel):
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[str] = Field("Female", max_length=20)
    height: Optional[float] = Field(None, gt=0, le=300, description="Height in cm")
    weight: Optional[float] = Field(None, gt=0, le=500, description="Weight in kg")
    activity_level: Optional[str] = Field("Moderately Active", max_length=50)
    health_goal: Optional[str] = Field("Improve General Wellness", max_length=100)


class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    activity_level: Optional[str] = None
    health_goal: Optional[str] = None

    class Config:
        from_attributes = True
