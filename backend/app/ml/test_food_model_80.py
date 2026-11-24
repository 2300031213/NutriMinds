from pathlib import Path
from transformers import pipeline

MODEL_PATH = "./food_model_80"

classifier = pipeline(
    "image-classification",
    model=MODEL_PATH,
)

BASE_DIR = Path("ml_dataset/test")

test_foods = [
    "biryani",
    "gulab_jamun",
    "naan",
    "palak_paneer",
    "jalebi",
]

print("\n============================================")
print("NutriMind 80-Class Model - Sample Testing")
print("============================================\n")

for food in test_foods:

    food_dir = BASE_DIR / food

    images = [
        file for file in food_dir.iterdir()
        if file.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    ]

    if not images:
        print(f"No image found for {food}")
        continue

    image_path = images[0]

    results = classifier(
        str(image_path),
        top_k=5
    )

    print(f"\nActual food: {food}")
    print(f"Image: {image_path.name}")
    print("--------------------------------------------")

    for result in results:
        print(
            f"{result['label']:<30} "
            f"{result['score'] * 100:>6.2f}%"
        )

print("\n============================================")
print("Testing complete")
print("============================================\n")
