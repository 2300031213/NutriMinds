from pathlib import Path
import random
import shutil

SOURCE_DIR = Path(
    "/Users/sabbavarapubhavyaharshitha/.cache/kagglehub/"
    "datasets/iamsouravbanerjee/indian-food-images-dataset/"
    "versions/5/Indian Food Images/Indian Food Images"
)

TRAIN_DIR = Path("ml_dataset/train")
TEST_DIR = Path("ml_dataset/test")

TRAIN_PER_CLASS = 40
TEST_PER_CLASS = 10
SEED = 42

random.seed(SEED)

image_extensions = {".jpg", ".jpeg", ".png", ".webp"}

categories = sorted(
    folder for folder in SOURCE_DIR.iterdir()
    if folder.is_dir()
)

print(f"\nFound {len(categories)} categories.\n")

total_train = 0
total_test = 0

for category_dir in categories:
    images = sorted(
        file for file in category_dir.iterdir()
        if file.is_file() and file.suffix.lower() in image_extensions
    )

    if len(images) != 50:
        raise ValueError(
            f"{category_dir.name} has {len(images)} images instead of 50."
        )

    random.shuffle(images)

    train_images = images[:TRAIN_PER_CLASS]
    test_images = images[TRAIN_PER_CLASS:TRAIN_PER_CLASS + TEST_PER_CLASS]

    train_category = TRAIN_DIR / category_dir.name
    test_category = TEST_DIR / category_dir.name

    train_category.mkdir(parents=True, exist_ok=True)
    test_category.mkdir(parents=True, exist_ok=True)

    for image in train_images:
        shutil.copy2(image, train_category / image.name)

    for image in test_images:
        shutil.copy2(image, test_category / image.name)

    total_train += len(train_images)
    total_test += len(test_images)

    print(
        f"{category_dir.name}: "
        f"{len(train_images)} train, {len(test_images)} test"
    )

print("\n===================================")
print("DATASET PREPARATION COMPLETE")
print("===================================")
print(f"Categories : {len(categories)}")
print(f"Train      : {total_train}")
print(f"Test       : {total_test}")
print(f"Total      : {total_train + total_test}")
print("===================================\n")
