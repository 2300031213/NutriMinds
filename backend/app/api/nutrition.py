from datetime import datetime, time, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.security import get_current_user
from backend.app.database import get_db
from backend.app.ml.nutrition_data import lookup_nutrition
from backend.app.ml.nutrition_service import get_food_nutrition_estimate
from backend.app.models.nutrition import NutritionFood
from backend.app.models.nutrition_log import NutritionLog
from backend.app.schemas.nutrition import NutritionLogBatchCreate, NutritionLogCreate

router = APIRouter(
    prefix="/nutrition",
    tags=["Nutrition"]
)


def get_day_bounds(target_date: Optional[datetime.date] = None):
    d = target_date or datetime.now().date()
    start = datetime.combine(d, time.min)
    end = start + timedelta(days=1)
    return start, end


# ============================================================
# GET TODAY'S NUTRITION
# ============================================================

@router.get("/today")
def get_today_nutrition(
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
        db.query(NutritionLog)
        .filter(
            NutritionLog.user_id == user_id,
            NutritionLog.created_at >= start_of_day,
            NutritionLog.created_at < end_of_day,
        )
        .order_by(NutritionLog.created_at.desc())
        .all()
    )

    total_calories = sum(float(log.calories or 0) for log in logs)
    total_protein = sum(float(log.protein or 0) for log in logs)
    total_carbohydrates = sum(float(log.carbohydrates or 0) for log in logs)
    total_fats = sum(float(log.fats or 0) for log in logs)
    total_fibre = sum(float(log.fibre or 0) for log in logs)
    total_sodium = sum(float(log.sodium or 0) for log in logs)
    total_sugar = sum(float(getattr(log, "sugar", 0) or 0) for log in logs)
    total_calcium = sum(float(getattr(log, "calcium", 0) or 0) for log in logs)
    total_iron = sum(float(getattr(log, "iron", 0) or 0) for log in logs)
    total_vitamin_c = sum(float(getattr(log, "vitamin_c", 0) or 0) for log in logs)

    return {
        "total": {
            "calories": round(total_calories, 1),
            "protein": round(total_protein, 1),
            "carbohydrates": round(total_carbohydrates, 1),
            "fats": round(total_fats, 1),
            "fibre": round(total_fibre, 1),
            "sodium": round(total_sodium, 1),
            "sugar": round(total_sugar, 1),
            "calcium": round(total_calcium, 1),
            "iron": round(total_iron, 2),
            "vitamin_c": round(total_vitamin_c, 1),
        },
        "entries": [
            {
                "id": log.id,
                "food_name": log.food_name,
                "calories": float(log.calories or 0),
                "protein": float(log.protein or 0),
                "carbohydrates": float(log.carbohydrates or 0),
                "fats": float(log.fats or 0),
                "fibre": float(log.fibre or 0),
                "sodium": float(log.sodium or 0),
                "sugar": float(getattr(log, "sugar", 0) or 0),
                "calcium": float(getattr(log, "calcium", 0) or 0),
                "iron": float(getattr(log, "iron", 0) or 0),
                "vitamin_c": float(getattr(log, "vitamin_c", 0) or 0),
                "serving_size": getattr(log, "serving_size", None),
                "serving_weight_g": float(getattr(log, "serving_weight_g", 0) or 0) if getattr(log, "serving_weight_g", None) else None,
                "confidence": float(getattr(log, "confidence", 0) or 0) if getattr(log, "confidence", None) else None,
                "data_source": getattr(log, "data_source", None),
                "meal_type": getattr(log, "meal_type", None),
                "created_at": log.created_at,
            }
            for log in logs
        ]
    }


# ============================================================
# GET NUTRITION HISTORY (LAST N DAYS)
# ============================================================

@router.get("/history")
def get_nutrition_history(
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
    earliest_date = today - timedelta(days=days - 1)
    earliest_start = datetime.combine(earliest_date, time.min)

    # Bulk query all logs for the window in one roundtrip
    all_logs = (
        db.query(NutritionLog)
        .filter(
            NutritionLog.user_id == user_id,
            NutritionLog.created_at >= earliest_start,
        )
        .all()
    )

    # Group by date in memory
    logs_by_date = {}
    for log in all_logs:
        if log.created_at:
            d_key = log.created_at.date()
            if d_key not in logs_by_date:
                logs_by_date[d_key] = []
            logs_by_date[d_key].append(log)

    history = []
    for i in range(days - 1, -1, -1):
        target_d = today - timedelta(days=i)
        day_logs = logs_by_date.get(target_d, [])

        history.append({
            "date": target_d.strftime("%Y-%m-%d"),
            "day": target_d.strftime("%a"),
            "calories": round(sum(float(l.calories or 0) for l in day_logs), 1),
            "protein": round(sum(float(l.protein or 0) for l in day_logs), 1),
            "carbohydrates": round(sum(float(l.carbohydrates or 0) for l in day_logs), 1),
            "fats": round(sum(float(l.fats or 0) for l in day_logs), 1),
            "fibre": round(sum(float(l.fibre or 0) for l in day_logs), 1),
            "sugar": round(sum(float(getattr(l, "sugar", 0) or 0) for l in day_logs), 1),
            "sodium": round(sum(float(l.sodium or 0) for l in day_logs), 1),
            "entries_count": len(day_logs),
        })

    return {"days": days, "history": history}


# ============================================================
# ADD SINGLE FOOD TO TODAY'S NUTRITION
# ============================================================

@router.post("/log")
def add_nutrition_log(
    nutrition: NutritionLogCreate,
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

    new_log = NutritionLog(
        user_id=user_id,
        food_name=nutrition.food_name,
        calories=nutrition.calories,
        protein=nutrition.protein,
        carbohydrates=nutrition.carbohydrates,
        fats=nutrition.fats,
        fibre=nutrition.fibre,
        sodium=nutrition.sodium,
        sugar=nutrition.sugar,
        calcium=nutrition.calcium,
        iron=nutrition.iron,
        vitamin_c=nutrition.vitamin_c,
        serving_size=nutrition.serving_size,
        serving_weight_g=nutrition.serving_weight_g,
        confidence=nutrition.confidence,
        data_source=nutrition.data_source,
        meal_type=nutrition.meal_type or "Meal",
    )

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return {
        "message": "Nutrition added successfully",
        "log": {
            "id": new_log.id,
            "user_id": new_log.user_id,
            "food_name": new_log.food_name,
            "calories": float(new_log.calories) if new_log.calories is not None else None,
            "protein": float(new_log.protein) if new_log.protein is not None else None,
            "carbohydrates": float(new_log.carbohydrates) if new_log.carbohydrates is not None else None,
            "fats": float(new_log.fats) if new_log.fats is not None else None,
            "fibre": float(new_log.fibre) if new_log.fibre is not None else None,
            "sodium": float(new_log.sodium) if new_log.sodium is not None else None,
            "sugar": float(new_log.sugar) if new_log.sugar is not None else None,
            "serving_size": new_log.serving_size,
            "data_source": new_log.data_source,
            "meal_type": new_log.meal_type,
            "created_at": new_log.created_at,
        }
    }


# ============================================================
# ADD MULTIPLE FOODS TO TODAY'S NUTRITION (BATCH)
# ============================================================

@router.post("/log-batch")
def add_nutrition_batch(
    payload: NutritionLogBatchCreate,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Saves multiple confirmed food items in one atomic transaction.
    Ideal for multi-dish meals, thalis, or composite plates.
    """
    try:
        user_id = int(current_user)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid user authentication"
        )

    if not payload.items:
        raise HTTPException(status_code=400, detail="No food items provided in batch.")

    created_logs = []
    for item in payload.items:
        new_log = NutritionLog(
            user_id=user_id,
            food_name=item.food_name,
            calories=item.calories,
            protein=item.protein,
            carbohydrates=item.carbohydrates,
            fats=item.fats,
            fibre=item.fibre,
            sodium=item.sodium,
            sugar=item.sugar,
            calcium=item.calcium,
            iron=item.iron,
            vitamin_c=item.vitamin_c,
            serving_size=item.serving_size,
            serving_weight_g=item.serving_weight_g,
            confidence=item.confidence,
            data_source=item.data_source,
            meal_type=payload.meal_type or item.meal_type or "Meal",
        )
        db.add(new_log)
        created_logs.append(new_log)

    db.commit()
    for log in created_logs:
        db.refresh(log)

    # Return refreshed summary immediately
    start_of_day, end_of_day = get_day_bounds()
    today_logs = (
        db.query(NutritionLog)
        .filter(
            NutritionLog.user_id == user_id,
            NutritionLog.created_at >= start_of_day,
            NutritionLog.created_at < end_of_day,
        )
        .order_by(NutritionLog.created_at.desc())
        .all()
    )

    tot_cals = sum(float(l.calories or 0) for l in today_logs)
    tot_protein = sum(float(l.protein or 0) for l in today_logs)
    tot_carbs = sum(float(l.carbohydrates or 0) for l in today_logs)
    tot_fats = sum(float(l.fats or 0) for l in today_logs)

    return {
        "message": f"Successfully logged {len(created_logs)} food items",
        "logged_count": len(created_logs),
        "items": [
            {
                "id": l.id,
                "food_name": l.food_name,
                "calories": float(l.calories or 0),
                "protein": float(l.protein or 0),
                "carbohydrates": float(l.carbohydrates or 0),
                "fats": float(l.fats or 0),
                "serving_size": l.serving_size,
                "data_source": l.data_source,
            }
            for l in created_logs
        ],
        "today_totals": {
            "calories": round(tot_cals, 1),
            "protein": round(tot_protein, 1),
            "carbohydrates": round(tot_carbs, 1),
            "fats": round(tot_fats, 1),
        }
    }


# ============================================================
# GET NUTRITION INFORMATION FOR A FOOD
# ============================================================

@router.get("/{food_name}")
def get_nutrition(
    food_name: str,
    db: Session = Depends(get_db)
):
    search_name = food_name.replace("_", " ").strip().lower()

    # 1. Use Tri-Source Nutrition Resolution Engine (IFCT, USDA, OFF)
    tri_estimate = get_food_nutrition_estimate(search_name)
    if not tri_estimate.get("error"):
        return {
            "food": food_name,
            "matched_records": 1,
            "nutrition": {
                "calories": tri_estimate["calories"],
                "protein": tri_estimate["protein"],
                "carbohydrates": tri_estimate["carbohydrates"],
                "fats": tri_estimate["fats"],
                "fibre": tri_estimate["fibre"],
                "sodium": tri_estimate["sodium"],
                "sugar": tri_estimate.get("sugar", 0.0),
                "calcium": tri_estimate.get("micronutrients", {}).get("calcium_mg", 0.0),
                "iron": tri_estimate.get("micronutrients", {}).get("iron_mg", 0.0),
                "vitamin_c": tri_estimate.get("micronutrients", {}).get("vitamin_c_mg", 0.0),
            },
            "matched_dishes": [tri_estimate["display_name"]],
            "category": tri_estimate.get("category", "Food"),
            "data_source": tri_estimate.get("data_source"),
            "source_badge": tri_estimate.get("source_badge"),
            "serving_size": tri_estimate.get("serving_size"),
            "serving_weight_g": tri_estimate.get("serving_weight_g"),
            "estimation_limitation": tri_estimate.get("estimation_limitation"),
        }

    # 2. Database query fallback
    foods = []
    try:
        foods = (
            db.query(NutritionFood)
            .filter(NutritionFood.dish_name.ilike(f"%{search_name}%"))
            .limit(10)
            .all()
        )
        if not foods and search_name == "biryani":
            foods = (
                db.query(NutritionFood)
                .filter(NutritionFood.dish_name.ilike("%biriyani%"))
                .limit(10)
                .all()
            )
    except Exception:
        foods = []

    if foods:
        calories = sum(float(f.calories or 0) for f in foods) / len(foods)
        protein = sum(float(f.protein or 0) for f in foods) / len(foods)
        carbs = sum(float(f.carbohydrates or 0) for f in foods) / len(foods)
        fats = sum(float(f.fats or 0) for f in foods) / len(foods)
        fibre = sum(float(f.fibre or 0) for f in foods) / len(foods)
        sodium = sum(float(f.sodium or 0) for f in foods) / len(foods)

        return {
            "food": food_name,
            "matched_records": len(foods),
            "nutrition": {
                "calories": round(calories, 2),
                "protein": round(protein, 2),
                "carbohydrates": round(carbs, 2),
                "fats": round(fats, 2),
                "fibre": round(fibre, 2),
                "sodium": round(sodium, 2),
            },
            "matched_dishes": [f.dish_name for f in foods]
        }

    # Fallback to curated dictionary
    fallback = lookup_nutrition(food_name)
    if fallback:
        return {
            "food": food_name,
            "matched_records": 1,
            "nutrition": {
                "calories": fallback["calories"],
                "protein": fallback["protein"],
                "carbohydrates": fallback["carbohydrates"],
                "fats": fallback["fats"],
                "fibre": fallback["fibre"],
                "sodium": fallback["sodium"],
            },
            "matched_dishes": [fallback["name"]],
            "category": fallback.get("category", "Food"),
        }

    raise HTTPException(
        status_code=404,
        detail=f"Nutrition data for '{food_name}' not found."
    )
