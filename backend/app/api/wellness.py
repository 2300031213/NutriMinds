from datetime import datetime, time, timedelta
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.security import get_current_user
from backend.app.core.targets import calculate_user_targets
from backend.app.database import get_db
from backend.app.models.lifestyle_log import LifestyleLog
from backend.app.models.nutrition_log import NutritionLog
from backend.app.models.user_profile import UserProfile
from backend.app.schemas.wellness import TwinSimulationRequest

router = APIRouter(prefix="/wellness", tags=["Wellness"])


def clamp(value, minimum=0.0, maximum=100.0):
    return max(float(minimum), min(float(value), float(maximum)))


def get_day_bounds(target_date: Optional[datetime.date] = None):
    d = target_date or datetime.now().date()
    start = datetime.combine(d, time.min)
    end = start + timedelta(days=1)
    return start, end


@router.get("/today")
def get_today_wellness(
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

    # Fetch user profile to calculate personalized targets
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    targets = calculate_user_targets(profile)

    start_of_day, end_of_day = get_day_bounds()

    # 1. TODAY'S NUTRITION
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
    total_fibre = sum(float(log.fibre or 0) for log in nutrition_logs)
    total_sodium = sum(float(log.sodium or 0) for log in nutrition_logs)

    # 2. TODAY'S LIFESTYLE
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

    # 3. DYNAMIC NUTRITION SCORE (Personalized)
    calorie_target = targets["calories"]
    protein_target = targets["protein"]
    fibre_target = targets["fibre"]

    calorie_score = clamp((total_calories / calorie_target) * 100) if calorie_target > 0 else 50
    protein_score = clamp((total_protein / protein_target) * 100) if protein_target > 0 else 50
    fibre_score = clamp((total_fibre / fibre_target) * 100) if fibre_target > 0 else 50

    nutrition_score = (calorie_score + protein_score + fibre_score) / 3.0

    # 4. DYNAMIC HYDRATION SCORE
    water_target = targets["water_liters"]
    hydration_score = clamp((water / water_target) * 100) if water_target > 0 else 50

    # 5. DYNAMIC SLEEP SCORE
    sleep_target = targets["sleep_hours"]
    if sleep <= (sleep_target + 1.0):
        sleep_score = clamp((sleep / sleep_target) * 100)
    else:
        sleep_score = clamp((1.0 - (sleep - (sleep_target + 1.0)) * 0.1) * 100)

    # 6. DYNAMIC ACTIVITY SCORE
    steps_target = targets["steps"]
    activity_score = clamp((steps / steps_target) * 100) if steps_target > 0 else 50

    # 7. STRESS SCORE (Lower stress = higher wellness)
    if stress > 0:
        stress_score = clamp(((10 - stress) / 9.0) * 100)
    else:
        stress_score = 50.0

    # 8. MOOD SCORE
    mood_scores = {"Low": 25, "Okay": 50, "Good": 75, "Great": 100}
    mood_score = mood_scores.get(mood, 50)

    # 9. ADAPTIVE COMPOSITE WELLNESS INDEX
    wellness_index = (
        (nutrition_score * 0.25)
        + (hydration_score * 0.15)
        + (sleep_score * 0.15)
        + (activity_score * 0.15)
        + (stress_score * 0.15)
        + (mood_score * 0.15)
    )
    wellness_index = round(clamp(wellness_index), 2)

    return {
        "wellness_index": wellness_index,
        "breakdown": {
            "nutrition": round(nutrition_score, 2),
            "hydration": round(hydration_score, 2),
            "sleep": round(sleep_score, 2),
            "activity": round(activity_score, 2),
            "stress": round(stress_score, 2),
            "mood": round(mood_score, 2)
        },
        "weights": {
            "nutrition": 25,
            "hydration": 15,
            "sleep": 15,
            "activity": 15,
            "stress": 15,
            "mood": 15
        },
        "nutrition": {
            "calories": round(total_calories, 2),
            "protein": round(total_protein, 2),
            "carbohydrates": round(total_carbohydrates, 2),
            "fats": round(total_fats, 2),
            "fibre": round(total_fibre, 2),
            "sodium": round(total_sodium, 2),
            "entries": len(nutrition_logs)
        },
        "lifestyle": {
            "water_liters": water,
            "sleep_hours": sleep,
            "steps": steps,
            "stress_level": stress,
            "mood": mood
        },
        "targets": targets,
    }


@router.get("/history")
def get_wellness_history(
    days: int = 7,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        user_id = int(current_user)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid user authentication")

    days = max(1, min(days, 90))
    today = datetime.now().date()
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    targets = calculate_user_targets(profile)

    earliest_date = today - timedelta(days=days - 1)
    earliest_start = datetime.combine(earliest_date, time.min)

    # Bulk query entire period in 2 fast queries
    all_nutrition = (
        db.query(NutritionLog)
        .filter(
            NutritionLog.user_id == user_id,
            NutritionLog.created_at >= earliest_start,
        )
        .all()
    )

    all_lifestyle = (
        db.query(LifestyleLog)
        .filter(
            LifestyleLog.user_id == user_id,
            LifestyleLog.created_at >= earliest_start,
        )
        .order_by(LifestyleLog.created_at.desc())
        .all()
    )

    # Group by YYYY-MM-DD
    nutrition_by_date = {}
    for log in all_nutrition:
        if log.created_at:
            d_str = log.created_at.date().strftime("%Y-%m-%d")
            nutrition_by_date.setdefault(d_str, []).append(log)

    lifestyle_by_date = {}
    for log in all_lifestyle:
        if log.created_at:
            d_str = log.created_at.date().strftime("%Y-%m-%d")
            if d_str not in lifestyle_by_date:
                lifestyle_by_date[d_str] = log

    history = []
    for i in range(days - 1, -1, -1):
        target_d = today - timedelta(days=i)
        d_str = target_d.strftime("%Y-%m-%d")

        day_nutrition = nutrition_by_date.get(d_str, [])
        lifestyle = lifestyle_by_date.get(d_str)

        cals = sum(float(l.calories or 0) for l in day_nutrition)
        prot = sum(float(l.protein or 0) for l in day_nutrition)
        carbs = sum(float(l.carbohydrates or 0) for l in day_nutrition)
        fats = sum(float(l.fats or 0) for l in day_nutrition)

        water = float(lifestyle.water_liters) if lifestyle else 0.0
        sleep = float(lifestyle.sleep_hours) if lifestyle else 0.0
        steps = int(lifestyle.steps) if lifestyle else 0
        stress = int(lifestyle.stress_level) if lifestyle else 0
        mood = lifestyle.mood if lifestyle else "Okay"

        has_data = bool(day_nutrition or lifestyle)

        if has_data:
            cal_s = clamp((cals / targets["calories"]) * 100) if targets["calories"] > 0 else 50
            prot_s = clamp((prot / targets["protein"]) * 100) if targets["protein"] > 0 else 50
            nutr_s = (cal_s + prot_s) / 2.0
            hydr_s = clamp((water / targets["water_liters"]) * 100)
            slp_s = clamp((sleep / targets["sleep_hours"]) * 100)
            act_s = clamp((steps / targets["steps"]) * 100)
            str_s = clamp(((10 - stress) / 9.0) * 100) if stress > 0 else 50.0

            daily_score = round(
                nutr_s * 0.25 + hydr_s * 0.20 + slp_s * 0.20 + act_s * 0.20 + str_s * 0.15,
                1
            )
        else:
            daily_score = 0.0

        history.append({
            "date": d_str,
            "day": target_d.strftime("%a"),
            "formatted_date": target_d.strftime("%b %d"),
            "wellness_index": daily_score,
            "has_data": has_data,
            "calories": round(cals, 1),
            "protein": round(prot, 1),
            "carbohydrates": round(carbs, 1),
            "fats": round(fats, 1),
            "meals_count": len(day_nutrition),
            "water_liters": water,
            "sleep_hours": sleep,
            "steps": steps,
            "stress_level": stress,
            "mood": mood,
        })

    active_entries = [h for h in history if h["has_data"]]
    stats = {
        "days_logged": len(active_entries),
        "total_days": days,
        "avg_wellness": round(sum(h["wellness_index"] for h in active_entries) / len(active_entries), 1) if active_entries else 0.0,
        "total_steps": sum(h["steps"] for h in active_entries),
        "total_water": round(sum(h["water_liters"] for h in active_entries), 1),
        "avg_sleep": round(sum(h["sleep_hours"] for h in active_entries) / len(active_entries), 1) if active_entries else 0.0,
        "avg_calories": round(sum(h["calories"] for h in active_entries) / len(active_entries), 1) if active_entries else 0.0,
    }

    return {
        "days": days,
        "history": history,
        "stats": stats,
        "targets": targets,
    }


@router.post("/twin-analysis")
def analyze_digital_twin(data: TwinSimulationRequest):
    """
    Evaluates simulated habits on the user's 3D Digital Twin and returns
    an in-depth AI physiological analysis, biomarker gauges, biological age shift,
    and personalized clinical insights.
    """
    water = float(data.water_liters)
    sleep = float(data.sleep_hours)
    steps = int(data.steps)
    stress = int(data.stress_level)
    calories = float(data.calories or 2000.0)
    protein = float(data.protein or 50.0)

    # 1. Base Domain Scores
    hydration_score = clamp((water / 2.5) * 100)

    if sleep <= 9.0:
        sleep_score = clamp((sleep / 8.0) * 100)
    else:
        sleep_score = clamp((1.0 - (sleep - 9.0) * 0.12) * 100)

    activity_score = clamp((steps / 8000.0) * 100)
    stress_score = clamp(((10 - stress) / 9.0) * 100) if stress > 0 else 50.0

    cal_ratio = clamp((calories / 2000.0) * 100)
    prot_ratio = clamp((protein / 50.0) * 100)
    nutrition_score = round((cal_ratio * 0.4 + prot_ratio * 0.6), 1)

    # 2. Composite Projected Wellness Index
    projected_score = round(
        nutrition_score * 0.25
        + hydration_score * 0.20
        + sleep_score * 0.20
        + activity_score * 0.20
        + stress_score * 0.15,
        1
    )

    # 3. Advanced Physiological Biomarkers
    metabolic_flexibility = round(clamp(activity_score * 0.5 + nutrition_score * 0.5), 1)
    cellular_recovery = round(clamp(sleep_score * 0.65 + stress_score * 0.35), 1)
    cognitive_focus = round(clamp(hydration_score * 0.40 + sleep_score * 0.35 + stress_score * 0.25), 1)
    cardiovascular_vitality = round(clamp(activity_score * 0.70 + hydration_score * 0.30), 1)
    cellular_hydration = round(hydration_score, 1)

    # 4. Biological Age Shift Projection (-3.5 yrs younger to +3.5 yrs strain)
    bio_age_shift = round((70.0 - projected_score) * 0.08, 1)

    # 5. Dynamic AI Diagnostic Insights
    insights = []
    risk_flags = []

    if water >= 2.5:
        insights.append({
            "pillar": "Hydration",
            "status": "Optimal",
            "title": "Full Cellular Hydration",
            "analysis": f"At {water:.1f}L/day, intra-cellular osmotic balance is ideal, promoting nutrient absorption and rapid metabolic waste clearance.",
            "impact": "+15% Cognitive Endurance"
        })
    elif water < 1.5:
        insights.append({
            "pillar": "Hydration",
            "status": "Suboptimal",
            "title": "Mild Hypohydration Risk",
            "analysis": f"Fluid intake of {water:.1f}L may elevate blood viscosity, lowering mitochondrial energy production and causing afternoon sluggishness.",
            "impact": "-12% Energy Transfer"
        })
        risk_flags.append("Dehydration & Toxin Accumulation Risk")
    else:
        insights.append({
            "pillar": "Hydration",
            "status": "Good",
            "title": "Moderate Fluid Balance",
            "analysis": f"{water:.1f}L provides adequate baseline hydration. Increasing by 0.5L will maximize renal efficiency and joint lubrication.",
            "impact": "+6% Alertness"
        })

    if 7.5 <= sleep <= 9.0:
        insights.append({
            "pillar": "Sleep & Recovery",
            "status": "Optimal",
            "title": "Complete Glymphatic Flush & Memory Consolidation",
            "analysis": f"{sleep:.1f} hours provides full cycles of restorative Slow-Wave and REM sleep, optimizing growth hormone release and neural repair.",
            "impact": "+20% Neuro-Plasticity"
        })
    elif sleep < 6.0:
        insights.append({
            "pillar": "Sleep & Recovery",
            "status": "Critical",
            "title": "Sleep Debt & Cortisol Elevation",
            "analysis": f"{sleep:.1f} hours fails to complete essential deep sleep stages, raising circulating ghrelin (hunger hormone) and blunting glucose sensitivity.",
            "impact": "-25% Stress Resilience"
        })
        risk_flags.append("Chronic Sleep Debt & Hormonal Imbalance")
    else:
        insights.append({
            "pillar": "Sleep & Recovery",
            "status": "Moderate",
            "title": "Basic Rest Acquired",
            "analysis": f"{sleep:.1f} hours covers basic recovery, but an extra 45-60 minutes would significantly improve immune system resilience.",
            "impact": "+8% Focus Retention"
        })

    if steps >= 8000:
        insights.append({
            "pillar": "Cardio & Mobility",
            "status": "Optimal",
            "title": "Active Mitochondrial Stimulation",
            "analysis": f"{steps:,} steps triggers endothelial nitric oxide release, enhancing arterial elasticity and continuous metabolic fat oxidation.",
            "impact": "+18% Aerobic Efficiency"
        })
    elif steps < 4000:
        insights.append({
            "pillar": "Cardio & Mobility",
            "status": "Suboptimal",
            "title": "Sedentary Metabolic Resistance",
            "analysis": f"Under 4,000 steps suppresses lipoprotein lipase activity in skeletal muscle, slowing lipid clearance and insulin responsiveness.",
            "impact": "-15% Daily Caloric Burn"
        })
        risk_flags.append("Prolonged Sedentary Inactivity")
    else:
        insights.append({
            "pillar": "Cardio & Mobility",
            "status": "Good",
            "title": "Moderate Active Baseline",
            "analysis": f"{steps:,} steps maintains baseline circulation. Reaching 8,000 steps activates systemic anti-inflammatory cytokines.",
            "impact": "+10% Cardiovascular Tone"
        })

    if stress <= 3:
        insights.append({
            "pillar": "Neuro-Stress Balance",
            "status": "Optimal",
            "title": "Parasympathetic Vagal Dominance",
            "analysis": f"Stress level {stress}/10 indicates strong heart rate variability (HRV), promoting low resting heart rate and optimal gut microbiome absorption.",
            "impact": "+22% Digestive & Immune Balance"
        })
    elif stress >= 7:
        insights.append({
            "pillar": "Neuro-Stress Balance",
            "status": "Critical",
            "title": "Sympathetic Overdrive (Fight-or-Flight)",
            "analysis": f"High stress ({stress}/10) stimulates prolonged cortisol release, promoting visceral fat storage, tension headaches, and shallow breathing.",
            "impact": "-30% Systemic Recovery"
        })
        risk_flags.append("Sympathetic Hyper-Arousal & Cortisol Surge")
    else:
        insights.append({
            "pillar": "Neuro-Stress Balance",
            "status": "Good",
            "title": "Manageable Cognitive Load",
            "analysis": f"Stress level {stress}/10 is within manageable bounds. Incorporating 5 minutes of mindful breathwork can shift you into full restorative mode.",
            "impact": "+7% Clarity"
        })

    prescriptions = []
    if water < 2.5:
        prescriptions.append(f"Drink an additional {(2.5 - water):.1f}L of water throughout the day.")
    if sleep < 8.0:
        prescriptions.append(f"Aim for {min(8.0, sleep + 1.0):.1f} hours of sleep tonight with a 30-min screen-free wind-down.")
    if steps < 8000:
        prescriptions.append(f"Add a 15-minute brisk walk to gain ~1,800 steps toward your 8,000-step target.")
    if stress >= 5:
        prescriptions.append("Practice 4-7-8 box breathing for 3 minutes to activate your vagal nerve and lower cortisol.")
    if not prescriptions:
        prescriptions.append("Maintain this optimal routine to sustain peak cellular vitality and cognitive focus.")

    return {
        "projected_wellness_index": projected_score,
        "biological_age_shift": bio_age_shift,
        "simulated_inputs": {
            "water_liters": water,
            "sleep_hours": sleep,
            "steps": steps,
            "stress_level": stress,
            "calories": calories,
            "protein": protein
        },
        "biomarkers": {
            "metabolic_flexibility": metabolic_flexibility,
            "cellular_recovery": cellular_recovery,
            "cognitive_focus": cognitive_focus,
            "cardiovascular_vitality": cardiovascular_vitality,
            "cellular_hydration": cellular_hydration
        },
        "domain_scores": {
            "hydration": round(hydration_score, 1),
            "sleep": round(sleep_score, 1),
            "activity": round(activity_score, 1),
            "stress": round(stress_score, 1),
            "nutrition": round(nutrition_score, 1)
        },
        "ai_insights": insights,
        "risk_flags": risk_flags,
        "prescriptions": prescriptions,
        "summary": (
            f"Your 3D Digital Twin projects a {projected_score}/100 wellness score. "
            f"Under this physiological profile, estimated cellular longevity shift is "
            f"{'+' if bio_age_shift > 0 else ''}{bio_age_shift} years, with "
            f"{'peak metabolic flexibility and neural recovery' if projected_score >= 80 else 'targeted opportunities in hydration and stress mitigation'}."
        )
    }
