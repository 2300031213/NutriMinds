from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.sql import func

from backend.app.database import Base


class NutritionLog(Base):
    __tablename__ = "nutrition_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    food_name = Column(
        String(255),
        nullable=False
    )

    calories = Column(
        Numeric(10, 2),
        nullable=True
    )

    protein = Column(
        Numeric(10, 2),
        nullable=True
    )

    carbohydrates = Column(
        Numeric(10, 2),
        nullable=True
    )

    fats = Column(
        Numeric(10, 2),
        nullable=True
    )

    fibre = Column(
        Numeric(10, 2),
        nullable=True
    )

    sodium = Column(
        Numeric(10, 2),
        nullable=True
    )

    sugar = Column(
        Numeric(10, 2),
        nullable=True
    )

    calcium = Column(
        Numeric(10, 2),
        nullable=True
    )

    iron = Column(
        Numeric(10, 2),
        nullable=True
    )

    vitamin_c = Column(
        Numeric(10, 2),
        nullable=True
    )

    serving_size = Column(
        String(100),
        nullable=True
    )

    serving_weight_g = Column(
        Numeric(10, 2),
        nullable=True
    )

    confidence = Column(
        Numeric(5, 2),
        nullable=True
    )

    data_source = Column(
        String(100),
        nullable=True
    )

    meal_type = Column(
        String(50),
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.current_timestamp()
    )
