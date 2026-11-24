import os
import sys
from pathlib import Path
from urllib.parse import parse_qsl, urlencode

# Ensure both workspace root and backend directory are in sys.path
_current_dir = Path(__file__).resolve().parent          # backend/app
_backend_dir = _current_dir.parent                      # backend
_workspace_root = _backend_dir.parent                   # workspace root

for _p in [str(_workspace_root), str(_backend_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

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
        "https://nutri-minds.vercel.app",
        "https://nutrimind-api-tan.vercel.app",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|.*\.vercel\.app)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Create Database Tables
# -----------------------------

# Defer DB table creation on serverless so cold-start invocation never fails
if not (os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME")):
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[NutriMind AI] Database connection note: {e}")


# -----------------------------
# Path Normalizer Middleware (Vercel Compatibility)
# -----------------------------

@app.middleware("http")
async def normalize_vercel_paths(request, call_next):
    # 1. Check if Vercel rewrite passed the original path in __path query parameter
    query_string = request.scope.get("query_string", b"").decode("utf-8", errors="replace")
    params = dict(parse_qsl(query_string, keep_blank_values=True)) if query_string else {}
    query_path = params.get("__path")

    if query_path is not None:
        target_path = "/" + query_path.lstrip("/")
        # Clean __path from query_string so route handlers don't see internal parameter
        clean_params = [(k, v) for k, v in parse_qsl(query_string, keep_blank_values=True) if k != "__path"]
        request.scope["query_string"] = urlencode(clean_params).encode("utf-8")
    else:
        # 2. Check headers or fallback to current scope path
        target_path = (
            request.headers.get("x-matched-path")
            or request.headers.get("x-invoke-path")
            or request.headers.get("x-forwarded-uri")
            or request.headers.get("x-original-uri")
            or request.scope.get("path", "")
            or "/"
        )

    # 3. Strip any static Vercel entrypoint filenames if they appear in the path
    if "?" in target_path:
        target_path = target_path.split("?", 1)[0]

    for prefix in ["/main.py", "/api/index.py", "/api/index"]:
        if target_path.startswith(prefix):
            target_path = target_path[len(prefix):] or "/"
            break

    request.scope["path"] = target_path
    request.scope["raw_path"] = target_path.encode("utf-8")

    return await call_next(request)


# -----------------------------
# API Routes (Registered under both root and /api prefixes)
# -----------------------------

routers = [
    auth_router,
    users_router,
    profiles_router,
    food_router,
    nutrition_router,
    lifestyle.router,
    wellness.router,
    recommendations.router,
]

for r in routers:
    app.include_router(r)
    app.include_router(r, prefix="/api")


# -----------------------------
# Root & Health Endpoints
# -----------------------------

@app.get("/")
@app.get("/api")
def root():
    return {
        "message": "Welcome to NutriMind AI",
        "status": "running"
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy"
    }
