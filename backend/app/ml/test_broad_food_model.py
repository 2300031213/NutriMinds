"""
NutriMind AI - Universal Food Recognition System Test.

Tests universal food recognition across global/international dishes,
Indian regional cuisine, and street foods.
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[3]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.ml.food_classifier import classify_food
from backend.app.ml.nutrition_data import lookup_nutrition
IMAGE_PATH = PROJECT_ROOT / "backend" / "uploads" / "food" / "14ec10cde2974ff192203a8e3bbc572e.jpg"

print("=" * 60)
print("NutriMind AI - Universal Food Classifier Test")
print("=" * 60)
print(f"Target Image: {IMAGE_PATH.name}")

if not IMAGE_PATH.exists():
    print(f"\nERROR: Image file not found at {IMAGE_PATH}")
    exit(1)

print("\nAnalyzing food image with Multi-Expert AI...")
result = classify_food(str(IMAGE_PATH))

print(f"\n[AI Detection Results]")
print(f"Top Prediction : {result['display_name']} ({result['food']})")
print(f"Confidence     : {result['score']}%")
print(f"Second Best    : {result['second_best']} ({result['second_score']}%)")
print(f"Margin         : {result['margin']}%")
print(f"Category       : {result['category']}")

print("\n[Top 5 Candidates]")
for i, pred in enumerate(result["top_predictions"], start=1):
    print(f"  {i}. {pred['display_name']:<30} -> {pred['score']:>6.2f}% ({pred['category']})")

nutrition = lookup_nutrition(result["food"])
if nutrition:
    print(f"\n[Nutritional Facts for {nutrition['name']}]")
    print(f"  Calories      : {nutrition['calories']} kcal")
    print(f"  Protein       : {nutrition['protein']} g")
    print(f"  Carbohydrates : {nutrition['carbohydrates']} g")
    print(f"  Fats          : {nutrition['fats']} g")
    print(f"  Dietary Fibre : {nutrition['fibre']} g")
    print(f"  Sodium        : {nutrition['sodium']} mg")

print("\n" + "=" * 60)
