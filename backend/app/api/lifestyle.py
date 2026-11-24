from datetime import datetime, time, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.security import get_current_user
from backend.app.database import get_db
from backend.app.models.lifestyle_log import LifestyleLog
from backend.app.schemas.lifestyle import LifestyleLogCreate

router = APIRouter(prefix="/lifestyle", tags=["Lifestyle"])


def get_day_bounds(target_date: Optional[datetime.date] = None):
    d = target_date or datetime.now().date()
    start = datetime.combine(d, time.min)
    end = start + timedelta(days=1)
    return start, end


@router.post("/log")
def add_lifestyle_log(
    lifestyle: LifestyleLogCreate,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        user_id = int(current_user)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid user authentication"
        )

    start_of_day, end_of_day = get_day_bounds()

    # Check whether today's lifestyle record already exists
    existing_log = (
        db.query(LifestyleLog)
        .filter(
            LifestyleLog.user_id == user_id,
            LifestyleLog.created_at >= start_of_day,
            LifestyleLog.created_at < end_of_day,
        )
        .order_by(LifestyleLog.created_at.desc())
        .first()
    )

    if existing_log:
        existing_log.water_liters = lifestyle.water_liters
        existing_log.sleep_hours = lifestyle.sleep_hours
        existing_log.steps = lifestyle.steps
        existing_log.stress_level = lifestyle.stress_level
        existing_log.mood = lifestyle.mood

        db.commit()
        db.refresh(existing_log)

        return {
            "message": "Lifestyle data updated successfully",
            "log": {
                "id": existing_log.id,
                "user_id": existing_log.user_id,
                "water_liters": float(existing_log.water_liters or 0),
                "sleep_hours": float(existing_log.sleep_hours or 0),
                "steps": existing_log.steps or 0,
                "stress_level": existing_log.stress_level or 0,
                "mood": existing_log.mood,
                "created_at": existing_log.created_at
            }
        }

    # Create today's first lifestyle record
    new_log = LifestyleLog(
        user_id=user_id,
        water_liters=lifestyle.water_liters,
        sleep_hours=lifestyle.sleep_hours,
        steps=lifestyle.steps,
        stress_level=lifestyle.stress_level,
        mood=lifestyle.mood
    )

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return {
        "message": "Lifestyle data saved successfully",
        "log": {
            "id": new_log.id,
            "user_id": new_log.user_id,
            "water_liters": float(new_log.water_liters or 0),
            "sleep_hours": float(new_log.sleep_hours or 0),
            "steps": new_log.steps or 0,
            "stress_level": new_log.stress_level or 0,
            "mood": new_log.mood,
            "created_at": new_log.created_at
        }
    }


@router.get("/today")
def get_today_lifestyle(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        user_id = int(current_user)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid user authentication"
        )

    start_of_day, end_of_day = get_day_bounds()

    logs = (
        db.query(LifestyleLog)
        .filter(
            LifestyleLog.user_id == user_id,
            LifestyleLog.created_at >= start_of_day,
            LifestyleLog.created_at < end_of_day,
        )
        .order_by(LifestyleLog.created_at.desc())
        .all()
    )

    return {
        "entries": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "water_liters": float(log.water_liters or 0),
                "sleep_hours": float(log.sleep_hours or 0),
                "steps": log.steps or 0,
                "stress_level": log.stress_level or 0,
                "mood": log.mood,
                "created_at": log.created_at
            }
            for log in logs
        ]
    }


@router.get("/history")
def get_lifestyle_history(
    days: int = 7,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        user_id = int(current_user)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid user authentication")

    days = max(1, min(days, 30))
    today = datetime.now().date()
    history = []

    for i in range(days - 1, -1, -1):
        target_d = today - timedelta(days=i)
        start, end = get_day_bounds(target_d)

        log = (
            db.query(LifestyleLog)
            .filter(
                LifestyleLog.user_id == user_id,
                LifestyleLog.created_at >= start,
                LifestyleLog.created_at < end,
            )
            .order_by(LifestyleLog.created_at.desc())
            .first()
        )

        history.append({
            "date": target_d.strftime("%Y-%m-%d"),
            "day": target_d.strftime("%a"),
            "water_liters": float(log.water_liters) if log else 0.0,
            "sleep_hours": float(log.sleep_hours) if log else 0.0,
            "steps": int(log.steps) if log else 0,
            "stress_level": int(log.stress_level) if log else 0,
            "mood": log.mood if log else "Okay",
        })

    return {"days": days, "history": history}
