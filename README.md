# NutriMind AI - Personalized Nutrition & Wellness Intelligence System

NutriMind AI is an intelligent full-stack wellness platform that combines computer vision for food classification, daily biometric habit logging, personalized metabolic and wellness scoring, and an interactive 3D physiological Digital Twin with real-time what-if simulations.

---

## 🌟 Key Features

1. **AI Food Vision & Recognition Engine**:
   - Multi-expert neural ensemble classifying **196+ food dishes** across global international cuisine (Food-101), regional Indian culinary dishes (80-class Vision Transformer), and street food classics.
   - Cross-domain disambiguation to resolve misclassifications between regional and western foods.
   - Comprehensive offline nutrition database containing exact calories, protein, carbs, fats, fibre, and sodium.
   - Integrated live webcam / camera capture and drag-and-drop file upload.

2. **Personalized Adaptive Wellness Index**:
   - Calculates custom Basal Metabolic Rate (BMR via Mifflin-St Jeor) and Total Daily Energy Expenditure (TDEE) based on user demographics (height, weight, age, gender, activity level, health goal).
   - Multi-dimensional weighted composite index synthesizing nutrition, hydration, sleep hygiene, physical activity, autonomic stress, and mood.
   - 7-day trajectory analytics tracking habit momentum over time.

3. **Smart Clinical & Lifestyle Recommendations**:
   - Rule-based dynamic recommendation engine generating prioritized (`high`, `medium`, `good`) behavioral nudges.

4. **Interactive 3D Physiological Digital Twin**:
   - Real-time 3D human physiological avatar rendered with Three.js / React Three Fiber.
   - Dynamic aura lighting reacting to the user's composite wellness index.
   - Interactive what-if simulator adjusting hydration, sleep debt, cardiovascular steps, stress levels, and macro balance.
   - Real-time physiological biomarkers: Metabolic Flexibility, Cellular Recovery, Cognitive Endurance, and Cardiovascular Vitality.
   - Projected biological age delta ($\pm$ years compared to chronological age).

---

## 🛠️ Architecture & Tech Stack

* **Backend**: FastAPI (Python 3.12), SQLAlchemy 2.0, Pydantic v2
* **Databases Supported**:
  * **Neon Serverless PostgreSQL** (Production-ready via `psycopg2-binary`)
  * **SQLite** (Zero-configuration local development fallback)
  * **MySQL** (via `PyMySQL`)
* **Machine Learning**: PyTorch, Hugging Face Transformers (`AutoModelForImageClassification`, `AutoImageProcessor`), Pillow, Scikit-Learn
* **Frontend**: React 19, Vite 8, Tailwind CSS v4, Three.js, `@react-three/fiber`, `@react-three/drei`, Recharts, Lucide React, Axios, React Router v7

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.11+ or 3.12+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Clone the repository
git clone <repo-url>
cd NutriMind-AI

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Database Configuration (Neon DB / PostgreSQL / SQLite)
Configure your `.env` file in the project root:
```bash
cp .env.example .env
```

Edit `.env` with your preferred database:
* **For Neon Serverless PostgreSQL**:
  ```env
  DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz.region.aws.neon.tech/neondb?sslmode=require
  ```
* **For Local SQLite (Default fallback if empty)**:
  ```env
  DATABASE_URL=sqlite:///./nutrimind.db
  ```

#### Seed Nutritional Dishes
Populate the `nutrition_foods` database table with 227+ curated dishes:
```bash
python database/seed_nutrition.py
```

### 4. Run the Backend API
```bash
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Documentation (Swagger): `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### 5. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Running Automated Tests

A comprehensive integration test suite verifies API endpoints, authentication, database transactions, wellness scoring, and digital twin calculations:

```bash
python -m unittest tests/test_api.py
```

---

## 📁 Project Structure

```
NutriMind-AI/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (auth, food, nutrition, lifestyle, wellness, recommendations)
│   │   ├── core/            # Config, security (JWT/Bcrypt), personalized targets logic
│   │   ├── ml/              # Food classifier neural ensemble & nutrition dataset
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic v2 validation models
│   │   ├── database.py      # Database engine & session generator
│   │   └── main.py          # FastAPI application entry point
│   └── uploads/             # Meal image uploads
├── database/
│   └── seed_nutrition.py    # Database seeder for 227+ dishes
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API client with JWT interceptor
│   │   ├── pages/           # Dashboard, FoodScanner, Nutrition, Lifestyle, Profile, DigitalTwin, Auth
│   │   └── App.jsx          # Route declarations & lazy-loaded components
│   └── public/
│       └── models/          # 3D GLTF models (digital-twin.glb)
├── tests/
│   └── test_api.py          # Automated integration test suite
├── food_model_80/           # Trained Vision Transformer checkpoints (80 Indian dishes)
├── food_model/              # Trained Vision Transformer checkpoints (15 Indian dishes)
├── requirements.txt         # Pinned Python dependencies
└── README.md
```

---

## 🔒 Security & Best Practices
- Passwords hashed with `bcrypt`.
- Authentication handled via industry-standard JWT (`HS256`).
- Safe parameterization across all SQL queries via SQLAlchemy ORM.
- Database agnostic: handles PostgreSQL, MySQL, and SQLite seamlessly with automatic connection recycling.
