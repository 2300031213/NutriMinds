import os
from pathlib import Path
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from backend.app.ml.food_classifier import classify_food
from backend.app.ml.nutrition_data import FOOD_NUTRITION_DATABASE
from backend.app.ml.nutrition_service import get_food_nutrition_estimate
from backend.app.schemas.nutrition import FoodCorrectionRequest, PortionScaleRequest

router = APIRouter(prefix="/food", tags=["Food Scanner"])

# Use /tmp on serverless environments where root filesystem is read-only
if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
    UPLOAD_DIR = Path("/tmp/uploads/food")
else:
    UPLOAD_DIR = Path("backend/uploads/food")

try:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    UPLOAD_DIR = Path("/tmp/uploads/food")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


@router.post("/upload")
async def upload_food_image(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are supported."
        )

    extension = ALLOWED_TYPES[file.content_type]
    filename = f"{uuid4().hex}{extension}"
    file_path = UPLOAD_DIR / filename

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty."
        )

    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image size must be less than 10 MB."
        )

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    # Run Universal Food Classifier (multi-item localization + ensemble recognition + nutrition facts)
    predictions = classify_food(str(file_path))

    return {
        "message": "Food image uploaded and analyzed successfully",
        "filename": filename,
        "content_type": file.content_type,
        "size": len(contents),
        "path": str(file_path),
        "is_multi_item": predictions["is_multi_item"],
        "detected_items": predictions["detected_items"],
        "combined_nutrition": predictions["combined_nutrition"],
        "predictions": predictions["top_predictions"],
        "top_prediction": predictions["food"],
        "display_name": predictions.get("display_name", predictions["food"]),
        "category": predictions.get("category", "Food"),
        "score": predictions["score"],
        "second_best": predictions["second_best"],
        "second_score": predictions["second_score"],
        "margin": predictions["margin"],
        "nutrition": predictions["nutrition"],
    }


@router.post("/scale")
def scale_food_portion(req: PortionScaleRequest):
    """
    Dynamically recalculate exact nutrients given a food name and serving multiplier or custom gram weight.
    """
    nutrition = get_food_nutrition_estimate(
        food_name=req.food_name,
        serving_multiplier=req.serving_multiplier or 1.0,
        custom_grams=req.custom_grams,
        preferred_source=req.preferred_source,
    )

    if nutrition.get("error"):
        raise HTTPException(status_code=404, detail=nutrition.get("message"))

    return {
        "food_name": req.food_name,
        "nutrition": nutrition,
    }


@router.post("/correct")
def correct_food_prediction(req: FoodCorrectionRequest):
    """
    Allows user to correct the detected dish name to an alternative or custom choice
    and retrieves authentic nutritional facts.
    """
    nutrition = get_food_nutrition_estimate(
        food_name=req.food_name,
        serving_multiplier=req.serving_multiplier or 1.0,
        custom_grams=req.custom_grams,
    )

    if nutrition.get("error"):
        raise HTTPException(status_code=404, detail=nutrition.get("message"))

    return {
        "food_name": req.food_name,
        "display_name": nutrition.get("display_name", req.food_name),
        "nutrition": nutrition,
    }


@router.get("/search")
def search_food_catalog(q: str = Query(..., min_length=1)):
    """
    Search food items in the database and catalog for user corrections or manual additions.
    """
    query_str = q.strip().lower()
    matches = []

    for key, data in FOOD_NUTRITION_DATABASE.items():
        name = data.get("name", "").lower()
        cat = data.get("category", "").lower()
        if query_str in key or query_str in name or query_str in cat:
            matches.append({
                "food_key": key,
                "name": data.get("name"),
                "category": data.get("category"),
                "calories": data.get("calories"),
                "protein": data.get("protein"),
                "carbohydrates": data.get("carbohydrates"),
                "fats": data.get("fats"),
            })
            if len(matches) >= 20:
                break

    return {"query": q, "count": len(matches), "results": matches}
