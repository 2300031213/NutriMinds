from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.sql import func

from backend.app.database import Base


class LifestyleLog(Base):
    __tablename__ = "lifestyle_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)

    water_liters = Column(Numeric(5, 2), default=0)
    sleep_hours = Column(Numeric(4, 2), default=0)
    steps = Column(Integer, default=0)
    stress_level = Column(Integer, default=0)
    mood = Column(String(50), nullable=True)

    created_at = Column(
        DateTime,
        server_default=func.current_timestamp()
    )
    