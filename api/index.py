import sys
from pathlib import Path

# Ensure project root and backend are in sys.path
_root = Path(__file__).resolve().parents[1]
_backend = _root / "backend"

for _p in [str(_root), str(_backend)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from backend.app.main import app

__all__ = ["app"]
