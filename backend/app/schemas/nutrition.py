from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class NutritionLogCreate(BaseModel):
    food_name: str
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbohydrates: Optional[float] = None
    fats: Optional[float] = None
    fibre: Optional[float] = None
    sodium: Optional[float] = None
    sugar: Optional[float] = None
    calcium: Optional[float] = None
    iron: Optional[float] = None
    vitamin_c: Optional[float] = None
    serving_size: Optional[str] = None
    serving_weight_g: Optional[float] = None
    confidence: Optional[float] = None
    data_source: Optional[str] = None
    meal_type: Optional[str] = None


class NutritionLogBatchCreate(BaseModel):
    items: List[NutritionLogCreate]
    meal_type: Optional[str] = None


class PortionScaleRequest(BaseModel):
    food_name: str
    serving_multiplier: Optional[float] = 1.0
    custom_grams: Optional[float] = None
    preferred_source: Optional[str] = None


class FoodCorrectionRequest(BaseModel):
    food_name: str
    serving_multiplier: Optional[float] = 1.0
    custom_grams: Optional[float] = None


class NutritionLogResponse(BaseModel):
    id: int
    user_id: int
    food_name: str
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbohydrates: Optional[float] = None
    fats: Optional[float] = None
    fibre: Optional[float] = None
    sodium: Optional[float] = None
    sugar: Optional[float] = None
    calcium: Optional[float] = None
    iron: Optional[float] = None
    vitamin_c: Optional[float] = None
    serving_size: Optional[str] = None
    serving_weight_g: Optional[float] = None
    confidence: Optional[float] = None
    data_source: Optional[str] = None
    meal_type: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NutritionTotals(BaseModel):
    calories: float = 0
    protein: float = 0
    carbohydrates: float = 0
    fats: float = 0
    fibre: float = 0
    sodium: float = 0
    sugar: float = 0
    calcium: float = 0
    iron: float = 0
    vitamin_c: float = 0


class DailyNutritionSummary(BaseModel):
    total: NutritionTotals
    entries: List[NutritionLogResponse] = []
