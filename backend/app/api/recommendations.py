from datetime import datetime, time, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.security import get_current_user
from backend.app.core.targets import calculate_user_targets
from backend.app.database import get_db
from backend.app.models.lifestyle_log import LifestyleLog
from backend.app.models.nutrition_log import NutritionLog
from backend.app.models.user_profile import UserProfile

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"]
)


def get_day_bounds(target_date: Optional[datetime.date] = None):
    d = target_date or datetime.now().date()
    start = datetime.combine(d, time.min)
    end = start + timedelta(days=1)
    return start, end


@router.get("/today")
def get_today_recommendations(
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

    # Dynamic targets based on personal profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    targets = calculate_user_targets(profile)

    TARGET_CALORIES = targets["calories"]
    TARGET_PROTEIN = targets["protein"]
    TARGET_WATER = targets["water_liters"]
    TARGET_SLEEP = targets["sleep_hours"]
    TARGET_STEPS = targets["steps"]

    start_of_day, end_of_day = get_day_bounds()

    # 1. Today's nutrition
    nutrition_logs = (
        db.query(NutritionLog)
        .filter(
            NutritionLog.user_id == user_id,
            NutritionLog.created_at >= start_of_day,
            NutritionLog.created_at < end_of_day,
        )
        .all()
    )

    total_calories = sum(float(log.calories or 0) for log in nutrition_logs)
    total_protein = sum(float(log.protein or 0) for log in nutrition_logs)
    total_carbohydrates = sum(float(log.carbohydrates or 0) for log in nutrition_logs)
    total_fats = sum(float(log.fats or 0) for log in nutrition_logs)

    # 2. Today's lifestyle
    lifestyle = (
        db.query(LifestyleLog)
        .filter(
            LifestyleLog.user_id == user_id,
            LifestyleLog.created_at >= start_of_day,
            LifestyleLog.created_at < end_of_day,
        )
        .order_by(LifestyleLog.created_at.desc())
        .first()
    )

    if lifestyle:
        water = float(lifestyle.water_liters or 0)
        sleep = float(lifestyle.sleep_hours or 0)
        steps = int(lifestyle.steps or 0)
        stress = int(lifestyle.stress_level or 0)
        mood = lifestyle.mood or "Okay"
    else:
        water = 0.0
        sleep = 0.0
        steps = 0
        stress = 0
        mood = "Okay"

    recommendations = []

    # -----------------------------
    # Caloric Intake Recommendation
    # -----------------------------
    if total_calories < TARGET_CALORIES * 0.4:
        recommendations.append({
            "type": "nutrition",
            "priority": "high",
            "title": "Low Caloric Energy Intake",
            "message": (
                f"You have logged {int(total_calories)} kcal toward your personalized target of {int(TARGET_CALORIES)} kcal. "
                "Ensure you consume balanced meals with complex carbohydrates and healthy fats to fuel your daily energy."
            )
        })
    elif total_calories > TARGET_CALORIES * 1.15:
        recommendations.append({
            "type": "nutrition",
            "priority": "medium",
            "title": "Caloric Target Exceeded",
            "message": (
                f"Your intake ({int(total_calories)} kcal) is slightly above your target ({int(TARGET_CALORIES)} kcal). "
                "Consider lighter, fibre-dense options like salads or steamed veggies for subsequent meals."
            )
        })

    # -----------------------------
    # Protein recommendation
    # -----------------------------
    if total_protein < TARGET_PROTEIN * 0.5:
        recommendations.append({
            "type": "nutrition",
            "priority": "high",
            "title": f"Increase Protein Intake (Target: {int(TARGET_PROTEIN)}g)",
            "message": (
                f"Your protein intake ({int(total_protein)}g) is currently below your personalized target. "
                "Consider adding protein-rich foods such as dal, paneer, eggs, curd, sprouts, or lean meat."
            )
        })
    elif total_protein < TARGET_PROTEIN:
        recommendations.append({
            "type": "nutrition",
            "priority": "medium",
            "title": "Add a Little More Protein",
            "message": (
                f"Your protein intake ({int(total_protein)}g) is progressing well. "
                f"Adding ~{int(TARGET_PROTEIN - total_protein)}g more will hit your optimal daily requirement."
            )
        })
    else:
        recommendations.append({
            "type": "nutrition",
            "priority": "good",
            "title": "Protein Target Reached",
            "message": f"Great job! You have satisfied your personalized protein target ({int(TARGET_PROTEIN)}g)."
        })

    # -----------------------------
    # Hydration recommendation
    # -----------------------------
    if water < TARGET_WATER * 0.5:
        recommendations.append({
            "type": "hydration",
            "priority": "high",
            "title": f"Increase Hydration (Target: {TARGET_WATER:.1f}L)",
            "message": (
                f"Your fluid intake ({water:.1f}L) is below half of your personalized target. "
                "Drink a tall glass of water now and keep a water bottle within reach."
            )
        })
    elif water < TARGET_WATER:
        recommendations.append({
            "type": "hydration",
            "priority": "medium",
            "title": "Keep Hydrating",
            "message": (
                f"You have logged {water:.1f}L. Drinking {TARGET_WATER - water:.1f}L more will help you reach your daily fluid target."
            )
        })
    else:
        recommendations.append({
            "type": "hydration",
            "priority": "good",
            "title": "Hydration Target Reached",
            "message": f"Optimal hydration achieved ({water:.1f}L / {TARGET_WATER:.1f}L). Excellent work!"
        })

    # -----------------------------
    # Sleep recommendation
    # -----------------------------
    if sleep < 6.0:
        recommendations.append({
            "type": "sleep",
            "priority": "high",
            "title": "Critical Sleep Deficit",
            "message": (
                f"Recorded sleep is {sleep:.1f} hours (target: {TARGET_SLEEP:.1f}h). "
                "Chronic sleep deficiency elevates cortisol and disrupts metabolic insulin sensitivity. Prioritize early rest tonight."
            )
        })
    elif sleep < TARGET_SLEEP:
        recommendations.append({
            "type": "sleep",
            "priority": "medium",
            "title": "Improve Sleep Duration",
            "message": (
                f"You slept {sleep:.1f} hours. Reaching {TARGET_SLEEP:.1f} hours optimizes cellular recovery and neuro-cognitive focus."
            )
        })
    else:
        recommendations.append({
            "type": "sleep",
            "priority": "good",
            "title": "Optimal Rest Attained",
            "message": f"Your recorded rest ({sleep:.1f} hours) fully satisfies your restorative recovery target."
        })

    # -----------------------------
    # Activity recommendation
    # -----------------------------
    if steps < TARGET_STEPS * 0.5:
        recommendations.append({
            "type": "activity",
            "priority": "high",
            "title": f"Increase Daily Steps (Target: {TARGET_STEPS:,})",
            "message": (
                f"Your recorded activity is {steps:,} steps. Taking a brisk 20-minute walk will add ~2,000 steps and boost circulation."
            )
        })
    elif steps < TARGET_STEPS:
        recommendations.append({
            "type": "activity",
            "priority": "medium",
            "title": "Keep Moving",
            "message": (
                f"You are at {steps:,} steps! Only {TARGET_STEPS - steps:,} steps left to reach today's target."
            )
        })
    else:
        recommendations.append({
            "type": "activity",
            "priority": "good",
            "title": "Movement Goal Accomplished",
            "message": f"Congratulations! You reached today's physical activity target with {steps:,} steps."
        })

    # -----------------------------
    # Stress recommendation
    # -----------------------------
    if stress >= 7:
        recommendations.append({
            "type": "stress",
            "priority": "high",
            "title": "High Stress Detected",
            "message": (
                "Your stress level is elevated (>=7/10). Take 5 minutes for guided box breathing (4s inhale, 4s hold, 4s exhale, 4s hold) to downregulate nervous system tension."
            )
        })
    elif stress >= 4:
        recommendations.append({
            "type": "stress",
            "priority": "medium",
            "title": "Moderate Stress Monitoring",
            "message": "Stress is moderate. Take regular short screen breaks and stretch to release upper back tension."
        })
    else:
        recommendations.append({
            "type": "stress",
            "priority": "good",
            "title": "Calm Autonomic State",
            "message": "Your stress level is low and balanced. Keep up this healthy psychological state!"
        })

    return {
        "recommendations": recommendations,
        "summary": {
            "calories": round(total_calories, 2),
            "protein": round(total_protein, 2),
            "carbohydrates": round(total_carbohydrates, 2),
            "fats": round(total_fats, 2),
            "water_liters": water,
            "sleep_hours": sleep,
            "steps": steps,
            "stress_level": stress,
            "mood": mood
        },
        "personalized_targets": targets,
    }
