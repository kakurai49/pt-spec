import importlib.util
import sys
from pathlib import Path
from typing import Callable, Optional

import atexit

_COMTYPES_SHUTDOWN: Optional[Callable[[], None]] = None

if importlib.util.find_spec("comtypes") is not None:
    import comtypes

    if hasattr(comtypes, "_shutdown"):
        _COMTYPES_SHUTDOWN = comtypes._shutdown
        try:
            atexit.unregister(comtypes._shutdown)
        except Exception:
            pass


def pytest_sessionfinish(session: object, exitstatus: int) -> None:
    """Run comtypes shutdown explicitly to avoid atexit crash."""
    if _COMTYPES_SHUTDOWN is None:
        return
    try:
        _COMTYPES_SHUTDOWN()
    except Exception:
        pass

# Ensure the repository root is importable for local packages.
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
