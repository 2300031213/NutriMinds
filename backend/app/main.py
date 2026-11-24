from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database import Base, engine

from backend.app.models.user import User
from backend.app.models.user_profile import UserProfile

from backend.app.api.auth import router as auth_router
from backend.app.api.users import router as users_router
from backend.app.api.profiles import router as profiles_router
from backend.app.api.food import router as food_router
from backend.app.api.nutrition import router as nutrition_router
from backend.app.models.nutrition import NutritionFood
from backend.app.api import lifestyle
from backend.app.api import wellness
from backend.app.api import recommendations

app = FastAPI(
    title="NutriMind AI",
    description="Personalized Nutrition and Wellness Intelligence System",
    version="1.0.0"
)


# -----------------------------
# CORS Configuration
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Create Database Tables
# -----------------------------

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[NutriMind AI] Database connection note: {e}")


# -----------------------------
# API Routes
# -----------------------------

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(profiles_router)
app.include_router(food_router)
app.include_router(nutrition_router)
app.include_router(lifestyle.router)
app.include_router(wellness.router)
app.include_router(recommendations.router)
# -----------------------------
# Root Endpoint
# -----------------------------

@app.get("/")
def root():
    return {
        "message": "Welcome to NutriMind AI",
        "status": "running"
    }


# -----------------------------
# Health Check
# -----------------------------

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
