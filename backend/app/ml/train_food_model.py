from pathlib import Path

import numpy as np
import torch
from datasets import load_dataset
from transformers import (
    ViTImageProcessor,
    ViTForImageClassification,
    TrainingArguments,
    Trainer,
    DefaultDataCollator,
)

# ============================================================
# PATHS
# ============================================================

DATASET_DIR = Path("ml_dataset")
MODEL_NAME = "google/vit-base-patch16-224-in21k"
OUTPUT_DIR = "./food_model_80"

# ============================================================
# LOAD DATASET
# ============================================================

print("Loading NutriMind 80-class food dataset...")

dataset = load_dataset(
    "imagefolder",
    data_dir=str(DATASET_DIR),
)

print("\nDataset loaded successfully.")
print(dataset)

# ============================================================
# LABEL INFORMATION
# ============================================================

labels = dataset["train"].features["label"].names

id2label = {
    str(i): label
    for i, label in enumerate(labels)
}

label2id = {
    label: i
    for i, label in enumerate(labels)
}

print(f"\nNumber of classes: {len(labels)}")
print("\nClasses:")

for i, label in enumerate(labels):
    print(f"{i}: {label}")

# ============================================================
# IMAGE PROCESSOR
# ============================================================

image_processor = ViTImageProcessor.from_pretrained(
    MODEL_NAME
)

# ============================================================
# IMAGE PREPROCESSING
# ============================================================
def transform(example_batch):
    images = [
        image.convert("RGB")
        for image in example_batch["image"]
    ]

    inputs = image_processor(
        images=images,
        return_tensors="pt"
    )

    inputs["labels"] = example_batch["label"]

    return inputs

dataset = dataset.with_transform(transform)

# ============================================================
# LOAD MODEL
# ============================================================

print("\nLoading ViT model...")

model = ViTForImageClassification.from_pretrained(
    MODEL_NAME,
    num_labels=len(labels),
    id2label=id2label,
    label2id=label2id,
    ignore_mismatched_sizes=True,
)

# ============================================================
# METRICS
# ============================================================

def compute_metrics(eval_pred):
    predictions, labels_true = eval_pred

    predictions = np.asarray(predictions)
    labels_true = np.asarray(labels_true)

    predicted_labels = np.argmax(predictions, axis=1)

    accuracy = (
        predicted_labels == labels_true
    ).mean()

    return {
        "accuracy": float(accuracy)
    }

# ============================================================
# TRAINING CONFIGURATION
# ============================================================

training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
  remove_unused_columns=False,
    learning_rate=2e-5,

    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,

    num_train_epochs=5,

    weight_decay=0.01,

    eval_strategy="epoch",
    save_strategy="epoch",

    load_best_model_at_end=True,

    metric_for_best_model="accuracy",
    greater_is_better=True,

    logging_steps=20,

    report_to="none",

    fp16=torch.cuda.is_available(),
)

# ============================================================
# DATA COLLATOR
# ============================================================

data_collator = DefaultDataCollator()

# ============================================================
# TRAINER
# ============================================================

trainer = Trainer(
    model=model,

    args=training_args,

    train_dataset=dataset["train"],

    eval_dataset=dataset["test"],

    processing_class=image_processor,

    data_collator=data_collator,

    compute_metrics=compute_metrics,
)

# ============================================================
# TRAIN
# ============================================================

print("\n============================================")
print("Starting NutriMind 80-Class Food Training")
print("============================================\n")

trainer.train()

print("\nTraining completed!")

# ============================================================
# SAVE MODEL
# ============================================================

trainer.save_model(OUTPUT_DIR)

image_processor.save_pretrained(OUTPUT_DIR)

print(f"\nModel saved to: {OUTPUT_DIR}")

# ============================================================
# FINAL EVALUATION
# ============================================================

print("\nEvaluating trained model...")

metrics = trainer.evaluate()

print("\nEvaluation results:")

for key, value in metrics.items():
    print(f"{key}: {value}")

print("\n============================================")
print("NutriMind 80-Class Model Complete")
print("============================================")
