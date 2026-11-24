"""
NutriMind AI - Fast Nutrition Database Seeder (Bulk Optimization)

Seeds the 'nutrition_foods' table in the configured database (Neon PostgreSQL, MySQL, or SQLite)
from the comprehensive curated nutrition database (227+ dishes) in a single fast transaction.
"""

import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.database import Base, engine, SessionLocal
from backend.app.models.nutrition import NutritionFood
from backend.app.ml.nutrition_data import FOOD_NUTRITION_DATABASE


def seed_database():
    print("=" * 60)
    print("NutriMind AI - Database Seeder")
    print(f"Connecting to: {engine.url.render_as_string(hide_password=True)}")
    print("=" * 60)

    # Ensure all tables exist in Neon DB
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Fetch existing dish names in one single query
        existing_names = {
            name.strip().lower() for (name,) in db.query(NutritionFood.dish_name).all()
        }
        print(f"Dishes already present in database: {len(existing_names)}")

        records_to_insert = []
        for key, item in FOOD_NUTRITION_DATABASE.items():
            dish_name = item.get("name", key.replace("_", " ").title()).strip()
            if dish_name.lower() in existing_names:
                continue

            existing_names.add(dish_name.lower())
            records_to_insert.append(
                NutritionFood(
                    dish_name=dish_name,
                    calories=item.get("calories", 0.0),
                    protein=item.get("protein", 0.0),
                    carbohydrates=item.get("carbohydrates", 0.0),
                    fats=item.get("fats", 0.0),
                    fibre=item.get("fibre", 0.0),
                    sodium=item.get("sodium", 0.0),
                )
            )

        if records_to_insert:
            print(f"Inserting {len(records_to_insert)} new dishes in bulk...")
            db.bulk_save_objects(records_to_insert)
            db.commit()
            print(f"Successfully seeded {len(records_to_insert)} dishes!")
        else:
            print("All dishes are already present in the database.")

        total_now = db.query(NutritionFood).count()
        print(f"Total dishes now in Neon database: {total_now}")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"ERROR while seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
