import sys
import traceback
from pathlib import Path

# Resolve all potential project paths
_current = Path(__file__).resolve().parent
_root = _current.parent
_backend = _root / "backend"

for _p in [str(_root), str(_backend), str(_current)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

try:
    from backend.app.main import app
except Exception as _startup_exc:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI(title="NutriMind AI Diagnostic")
    _err_msg = str(_startup_exc)
    _err_trace = traceback.format_exc()

    @app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"])
    def catch_all(full_path: str = ""):
        return JSONResponse(
            status_code=500,
            content={
                "error": "STARTUP_EXCEPTION",
                "message": _err_msg,
                "traceback": _err_trace,
                "backend_path": str(_backend),
                "backend_exists": _backend.exists(),
                "root_files": [f.name for f in _root.iterdir()] if _root.exists() else []
            }
        )

__all__ = ["app"]
