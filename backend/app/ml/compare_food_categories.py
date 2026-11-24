from pathlib import Path

NUTRIMIND_DIR = Path("ml_dataset/train")

DATASET_DIR = Path(
    "/Users/sabbavarapubhavyaharshitha/.cache/kagglehub/"
    "datasets/iamsouravbanerjee/indian-food-images-dataset/"
    "versions/5/Indian Food Images/Indian Food Images"
)

nutrimind_categories = sorted(
    folder.name
    for folder in NUTRIMIND_DIR.iterdir()
    if folder.is_dir()
)

dataset_categories = sorted(
    folder.name
    for folder in DATASET_DIR.iterdir()
    if folder.is_dir()
)

nutrimind_set = set(nutrimind_categories)
dataset_set = set(dataset_categories)

exact_matches = sorted(nutrimind_set & dataset_set)
new_categories = sorted(dataset_set - nutrimind_set)
missing_categories = sorted(nutrimind_set - dataset_set)

print("\n========== NUTRIMIND DATASET ANALYSIS ==========\n")

print(f"NutriMind categories : {len(nutrimind_categories)}")
print(f"Dataset categories   : {len(dataset_categories)}")
print(f"Exact matches        : {len(exact_matches)}")
print(f"New useful categories: {len(new_categories)}")
print(f"Categories needing data: {len(missing_categories)}")

print("\n========== EXACT MATCHES ==========\n")

for category in exact_matches:
    print(f"✓ {category}")

print("\n========== DATASET CATEGORIES NOT YET IN NUTRIMIND ==========\n")

for category in new_categories:
    print(f"+ {category}")

print("\n========== NUTRIMIND CATEGORIES WITHOUT THIS DATASET ==========\n")

for category in missing_categories:
    print(f"- {category}")

print("\n==============================================\n")
