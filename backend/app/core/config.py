import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "nutrimind-super-secret-key-change-this-later")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

# Database URL configuration (Supports Neon PostgreSQL, MySQL, and SQLite fallback)
raw_db_url = os.getenv("DATABASE_URL", "").strip()

if not raw_db_url:
    # Default to local SQLite database if no database URL is specified
    DATABASE_URL = "sqlite:///./nutrimind.db"
else:
    # Normalize postgres:// to postgresql:// for SQLAlchemy compatibility
    if raw_db_url.startswith("postgres://"):
        raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)
    DATABASE_URL = raw_db_url
