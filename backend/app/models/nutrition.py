from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.sql import func

from backend.app.database import Base


class NutritionFood(Base):
    __tablename__ = "nutrition_foods"

    id = Column(Integer, primary_key=True, index=True)
    dish_name = Column(String(255), nullable=False)

    calories = Column(Numeric(10, 2))
    carbohydrates = Column(Numeric(10, 2))
    protein = Column(Numeric(10, 2))
    fats = Column(Numeric(10, 2))

    free_sugar = Column(Numeric(10, 2))
    fibre = Column(Numeric(10, 2))
    sodium = Column(Numeric(10, 2))
    calcium = Column(Numeric(10, 2))
    iron = Column(Numeric(10, 2))
    vitamin_c = Column(Numeric(10, 2))
    folate = Column(Numeric(10, 2))

    created_at = Column(
        DateTime,
        server_default=func.current_timestamp()
    )