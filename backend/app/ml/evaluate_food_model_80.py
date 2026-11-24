from pathlib import Path
from collections import defaultdict

import numpy as np
from PIL import Image
from transformers import pipeline
from sklearn.metrics import classification_report, confusion_matrix

MODEL_PATH = "./food_model_80"
TEST_DIR = Path("ml_dataset/test")

classifier = pipeline(
    "image-classification",
    model=MODEL_PATH,
)

class_names = sorted(
    folder.name
    for folder in TEST_DIR.iterdir()
    if folder.is_dir()
    and any(folder.iterdir())
)

y_true = []
y_pred = []

print("\n============================================")
print("Evaluating all 800 test images")
print("============================================\n")

for class_name in class_names:

    class_dir = TEST_DIR / class_name

    images = [
        file
        for file in class_dir.iterdir()
        if file.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    ]

    print(f"Testing {class_name}: {len(images)} images")

    for image_path in images:

        result = classifier(
            str(image_path),
            top_k=1
        )[0]

        predicted_class = result["label"]

        y_true.append(class_name)
        y_pred.append(predicted_class)

print("\n============================================")
print("CLASSIFICATION REPORT")
print("============================================\n")

report = classification_report(
    y_true,
    y_pred,
    labels=class_names,
    zero_division=0
)

print(report)

accuracy = np.mean(
    np.array(y_true) == np.array(y_pred)
)

print(f"\nOverall accuracy: {accuracy * 100:.2f}%")

print("\n============================================")
print("MOST COMMON CONFUSIONS")
print("============================================\n")

matrix = confusion_matrix(
    y_true,
    y_pred,
    labels=class_names
)

confusions = []

for i, actual in enumerate(class_names):
    for j, predicted in enumerate(class_names):

        if i != j and matrix[i][j] > 0:
            confusions.append(
                (
                    matrix[i][j],
                    actual,
                    predicted
                )
            )

confusions.sort(reverse=True)

for count, actual, predicted in confusions[:20]:
    print(
        f"{actual} -> {predicted}: "
        f"{count} images"
    )

print("\n============================================")
print("Evaluation complete")
print("============================================\n")
