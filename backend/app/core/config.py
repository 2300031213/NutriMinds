import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in current working dir, backend/, or workspace root
_candidates = [
    Path.cwd() / ".env",
    Path(__file__).resolve().parents[2] / ".env",
    Path(__file__).resolve().parents[3] / ".env",
]
for _env_path in _candidates:
    if _env_path.is_file():
        load_dotenv(dotenv_path=_env_path)
        break
else:
    load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "nutrimind-super-secret-key-change-this-later")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

# Database URL configuration (Supports Neon PostgreSQL, MySQL, and SQLite fallback)
raw_db_url = os.getenv("DATABASE_URL", "").strip()

if not raw_db_url:
    # On serverless (Vercel / AWS Lambda), the filesystem is read-only except /tmp
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME") or os.path.exists("/tmp"):
        DATABASE_URL = "sqlite:////tmp/nutrimind.db"
    else:
        DATABASE_URL = "sqlite:///./nutrimind.db"
else:
    # Normalize postgres:// to postgresql:// for SQLAlchemy compatibility
    if raw_db_url.startswith("postgres://"):
        raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)
    DATABASE_URL = raw_db_url
