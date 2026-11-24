import sys
from pathlib import Path

_root = str(Path(__file__).resolve().parent)
_backend = str(Path(__file__).resolve().parent / "backend")

for p in [_root, _backend]:
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.app.main import app

__all__ = ["app"]
