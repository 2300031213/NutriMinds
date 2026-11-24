from typing import Any, Dict, Optional


def calculate_user_targets(profile: Optional[Any] = None) -> Dict[str, float]:
    """
    Calculates personalized daily nutritional and lifestyle targets based
    on the user's demographic profile (BMR via Mifflin-St Jeor equation,
    TDEE, and goal adjustments).
    """
    # Base standard defaults
    defaults = {
        "calories": 2000.0,
        "protein": 50.0,
        "carbohydrates": 250.0,
        "fats": 65.0,
        "fibre": 28.0,
        "water_liters": 2.5,
        "sleep_hours": 8.0,
        "steps": 8000,
    }

    if not profile:
        return defaults

    weight = float(profile.weight) if profile.weight else None
    height = float(profile.height) if profile.height else None
    age = int(profile.age) if profile.age else None
    gender = (profile.gender or "female").strip().lower()
    activity = (profile.activity_level or "").strip().lower()
    goal = (profile.health_goal or "").strip().lower()

    if not (weight and height and age):
        return defaults

    # 1. Basal Metabolic Rate (Mifflin-St Jeor)
    if "male" in gender and "female" not in gender:
        bmr = (10.0 * weight) + (6.25 * height) - (5.0 * age) + 5.0
    else:
        bmr = (10.0 * weight) + (6.25 * height) - (5.0 * age) - 161.0

    # 2. Activity Multiplier
    if "sedentary" in activity:
        activity_mult = 1.2
        target_steps = 6000
    elif "light" in activity:
        activity_mult = 1.375
        target_steps = 7500
    elif "very" in activity or "heavy" in activity or "athlete" in activity:
        activity_mult = 1.725
        target_steps = 11000
    else:  # Moderately active / default
        activity_mult = 1.55
        target_steps = 8500

    tdee = bmr * activity_mult

    # 3. Health Goal Caloric Adjustment
    if "lose" in goal or "loss" in goal:
        target_calories = max(1200.0, tdee - 450.0)
        target_protein = max(55.0, round(weight * 1.6, 1))
    elif "gain" in goal or "muscle" in goal or "bulk" in goal:
        target_calories = tdee + 400.0
        target_protein = max(65.0, round(weight * 1.8, 1))
    else:
        target_calories = tdee
        target_protein = max(50.0, round(weight * 1.1, 1))

    # 4. Macros breakdown
    # 25-30% calories from fat, remainder carbs
    target_fats = round((target_calories * 0.28) / 9.0, 1)
    carb_cals = target_calories - (target_protein * 4.0) - (target_fats * 9.0)
    target_carbs = max(50.0, round(carb_cals / 4.0, 1))

    # 5. Hydration: ~35 ml / kg bodyweight
    target_water = round(max(2.0, min(4.5, (weight * 35.0) / 1000.0)), 2)

    return {
        "calories": round(target_calories, 1),
        "protein": round(target_protein, 1),
        "carbohydrates": round(target_carbs, 1),
        "fats": round(target_fats, 1),
        "fibre": 28.0,
        "water_liters": target_water,
        "sleep_hours": 8.0,
        "steps": target_steps,
    }
