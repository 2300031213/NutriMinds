"""
NutriMind AI - Automated Test Suite
Tests API authentication, profile management, nutrition tracking,
lifestyle logging, dynamic wellness scoring, 3D digital twin simulation,
multi-item batch logging, portion scaling, food correction, and 30-day analytics.
"""

import unittest
from uuid import uuid4
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.database import Base, engine


class TestNutriMindAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)
        cls.unique_suffix = uuid4().hex[:8]
        cls.test_email = f"tester_{cls.unique_suffix}@nutrimind.ai"
        cls.test_password = "SecurePassword123!"
        cls.auth_token = None

    def test_01_health_and_root(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json().get("status"), "healthy")

        res_root = self.client.get("/")
        self.assertEqual(res_root.status_code, 200)
        self.assertEqual(res_root.json().get("status"), "running")

    def test_02_register_and_login(self):
        # Register
        reg_res = self.client.post(
            "/auth/register",
            json={
                "name": "Alex Morgan",
                "email": self.test_email,
                "password": self.test_password,
            },
        )
        self.assertEqual(reg_res.status_code, 200)
        self.assertIn("id", reg_res.json())

        # Login
        login_res = self.client.post(
            "/auth/login",
            data={
                "username": self.test_email,
                "password": self.test_password,
            },
        )
        self.assertEqual(login_res.status_code, 200)
        token = login_res.json().get("access_token")
        self.assertIsNotNone(token)
        self.__class__.auth_token = token

    def test_03_profile_management(self):
        headers = {"Authorization": f"Bearer {self.auth_token}"}

        # Create/Update profile
        prof_res = self.client.post(
            "/profile/",
            headers=headers,
            json={
                "age": 28,
                "gender": "Female",
                "height": 165.0,
                "weight": 58.0,
                "activity_level": "Moderately Active",
                "health_goal": "Improve General Wellness",
            },
        )
        self.assertEqual(prof_res.status_code, 200)
        profile = prof_res.json().get("profile")
        self.assertEqual(profile.get("age"), 28)
        self.assertEqual(profile.get("weight"), 58.0)

        # Retrieve profile
        get_prof = self.client.get("/profile/", headers=headers)
        self.assertEqual(get_prof.status_code, 200)
        self.assertEqual(get_prof.json().get("gender"), "Female")

    def test_04_nutrition_logging_and_history(self):
        headers = {"Authorization": f"Bearer {self.auth_token}"}

        # Log food
        log_res = self.client.post(
            "/nutrition/log",
            headers=headers,
            json={
                "food_name": "Grilled Chicken Salad",
                "calories": 420.0,
                "protein": 36.0,
                "carbohydrates": 18.0,
                "fats": 12.0,
                "fibre": 6.0,
                "sodium": 380.0,
            },
        )
        self.assertEqual(log_res.status_code, 200)

        # Get today's nutrition
        today_res = self.client.get("/nutrition/today", headers=headers)
        self.assertEqual(today_res.status_code, 200)
        data = today_res.json()
        self.assertGreaterEqual(data["total"]["calories"], 420.0)
        self.assertGreaterEqual(data["total"]["protein"], 36.0)

        # Get nutrition history
        hist_res = self.client.get("/nutrition/history?days=7", headers=headers)
        self.assertEqual(hist_res.status_code, 200)
        self.assertEqual(len(hist_res.json()["history"]), 7)

    def test_05_lifestyle_logging_and_history(self):
        headers = {"Authorization": f"Bearer {self.auth_token}"}

        # Save lifestyle
        life_res = self.client.post(
            "/lifestyle/log",
            headers=headers,
            json={
                "water_liters": 2.4,
                "sleep_hours": 7.8,
                "steps": 8500,
                "stress_level": 3,
                "mood": "Good",
            },
        )
        self.assertEqual(life_res.status_code, 200)

        # Retrieve lifestyle
        today_life = self.client.get("/lifestyle/today", headers=headers)
        self.assertEqual(today_life.status_code, 200)
        entries = today_life.json()["entries"]
        self.assertGreater(len(entries), 0)
        self.assertEqual(entries[0]["water_liters"], 2.4)

        # Retrieve lifestyle history
        hist_life = self.client.get("/lifestyle/history?days=7", headers=headers)
        self.assertEqual(hist_life.status_code, 200)
        self.assertEqual(len(hist_life.json()["history"]), 7)

    def test_06_wellness_and_recommendations(self):
        headers = {"Authorization": f"Bearer {self.auth_token}"}

        # Wellness summary
        well_res = self.client.get("/wellness/today", headers=headers)
        self.assertEqual(well_res.status_code, 200)
        well_data = well_res.json()
        self.assertIn("wellness_index", well_data)
        self.assertIn("targets", well_data)
        self.assertGreater(well_data["wellness_index"], 0)

        # Recommendations
        rec_res = self.client.get("/recommendations/today", headers=headers)
        self.assertEqual(rec_res.status_code, 200)
        rec_data = rec_res.json()
        self.assertIn("recommendations", rec_data)
        self.assertIn("personalized_targets", rec_data)

    def test_07_digital_twin_simulation(self):
        # Digital twin analysis
        sim_res = self.client.post(
            "/wellness/twin-analysis",
            json={
                "water_liters": 2.8,
                "sleep_hours": 8.0,
                "steps": 10000,
                "stress_level": 2,
                "calories": 2100.0,
                "protein": 75.0,
            },
        )
        self.assertEqual(sim_res.status_code, 200)
        sim_data = sim_res.json()
        self.assertIn("projected_wellness_index", sim_data)
        self.assertIn("biological_age_shift", sim_data)
        self.assertIn("biomarkers", sim_data)
        self.assertIn("ai_insights", sim_data)

    def test_08_batch_nutrition_logging(self):
        headers = {"Authorization": f"Bearer {self.auth_token}"}

        # Batch log two dishes in one meal (e.g. Samosa and Dal Makhani)
        batch_res = self.client.post(
            "/nutrition/log-batch",
            headers=headers,
            json={
                "meal_type": "Lunch",
                "items": [
                    {
                        "food_name": "Samosa",
                        "calories": 262.0,
                        "protein": 4.5,
                        "carbohydrates": 32.0,
                        "fats": 13.0,
                        "fibre": 2.5,
                        "sodium": 280.0,
                        "serving_size": "1 piece (100g)",
                        "data_source": "Indian Food Composition Tables (ICMR-NIN / IFCT)",
                    },
                    {
                        "food_name": "Dal Makhani",
                        "calories": 240.0,
                        "protein": 11.0,
                        "carbohydrates": 26.0,
                        "fats": 10.5,
                        "fibre": 6.0,
                        "sodium": 410.0,
                        "serving_size": "1 bowl (200g)",
                        "data_source": "Indian Food Composition Tables (ICMR-NIN / IFCT)",
                    },
                ],
            },
        )
        self.assertEqual(batch_res.status_code, 200)
        b_data = batch_res.json()
        self.assertEqual(b_data["logged_count"], 2)
        self.assertIn("today_totals", b_data)
        self.assertGreaterEqual(b_data["today_totals"]["calories"], 500.0)

    def test_09_food_portion_scaling_and_correction(self):
        # 1. Test Portion Scaling
        scale_res = self.client.post(
            "/food/scale",
            json={
                "food_name": "biryani",
                "serving_multiplier": 1.5,
            },
        )
        self.assertEqual(scale_res.status_code, 200)
        s_data = scale_res.json()
        self.assertIn("nutrition", s_data)
        # Standard biryani is 290 kcal; 1.5x should be 435 kcal
        self.assertAlmostEqual(s_data["nutrition"]["calories"], 435.0, delta=5.0)

        # 2. Test Food Correction
        corr_res = self.client.post(
            "/food/correct",
            json={
                "food_name": "paneer_butter_masala",
                "serving_multiplier": 1.0,
            },
        )
        self.assertEqual(corr_res.status_code, 200)
        c_data = corr_res.json()
        self.assertIn("nutrition", c_data)
        self.assertGreater(c_data["nutrition"]["protein"], 8.0)

        # 3. Test Food Search
        search_res = self.client.get("/food/search?q=dosa")
        self.assertEqual(search_res.status_code, 200)
        search_data = search_res.json()
        self.assertGreater(search_data["count"], 0)

    def test_10_weekly_and_monthly_analytics(self):
        headers = {"Authorization": f"Bearer {self.auth_token}"}

        # 7-day history
        res_7 = self.client.get("/wellness/history?days=7", headers=headers)
        self.assertEqual(res_7.status_code, 200)
        data_7 = res_7.json()
        self.assertEqual(len(data_7["history"]), 7)
        self.assertIn("stats", data_7)
        self.assertIn("targets", data_7)

        # 30-day history
        res_30 = self.client.get("/wellness/history?days=30", headers=headers)
        self.assertEqual(res_30.status_code, 200)
        data_30 = res_30.json()
        self.assertEqual(len(data_30["history"]), 30)
        self.assertIn("total_steps", data_30["stats"])
        self.assertIn("total_water", data_30["stats"])


if __name__ == "__main__":
    unittest.main()
