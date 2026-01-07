from __future__ import annotations

import os
import time
from datetime import datetime
from pathlib import Path
from typing import Callable, Optional

import pytest

try:
    from pywinauto.application import Application
    from pywinauto.base_wrapper import BaseWrapper
except ModuleNotFoundError:
    pytest.skip("pywinauto is required for Windows UI automation tests.", allow_module_level=True)

ARTIFACTS_DIR = Path(__file__).resolve().parents[1] / "artifacts"


@pytest.fixture(scope="session")
def app_exe_path() -> Path:
    """Return the configured Electron executable path."""
    value = os.environ.get("APP_EXE")
    if not value:
        pytest.fail("APP_EXE environment variable is required.")
    path = Path(value)
    if not path.exists():
        pytest.fail(f"APP_EXE does not exist: {path}")
    return path


def launch_app(app_exe: Path) -> Application:
    """Launch the Electron app in E2E mode via pywinauto."""
    cmdline = f'"{app_exe}" --e2e'
    return Application(backend="uia").start(cmdline, timeout=10)


def get_main_window(app: Application) -> BaseWrapper:
    """Wait for the main window to become visible."""
    window = app.window(title_re=r".*PT Spec Desktop.*")
    window.wait("visible", timeout=10)
    return window


def retry_until(predicate: Callable[[], Optional[str]], timeout: float) -> Optional[str]:
    """Retry a predicate until it returns a truthy string or times out."""
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        result = predicate()
        if result:
            return result
        time.sleep(0.2)
    return None


def click_link(window: BaseWrapper, label: str) -> None:
    """Click a labeled link within the main window."""
    window.set_focus()
    link = window.child_window(title=label, control_type="Hyperlink")
    if not link.exists():
        link = window.child_window(title=label)
    link.wait("enabled", timeout=10)
    link.click_input()


def wait_for_path_suffix(window: BaseWrapper, expected_suffix: str) -> None:
    """Wait for the PATH overlay to show the expected suffix."""
    def predicate() -> Optional[str]:
        overlay = window.child_window(title_re=r"^PATH: .*")
        if not overlay.exists():
            return None
        text = overlay.window_text()
        if text.endswith(expected_suffix):
            return text
        return None

    result = retry_until(predicate, timeout=10)
    assert result is not None, (
        "PATH overlay did not update to expected suffix: "
        f"{expected_suffix}"
    )


def save_screenshot(window: BaseWrapper, name: str) -> None:
    """Save a screenshot for debugging if possible."""
    try:
        ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        path = ARTIFACTS_DIR / f"{name}_{timestamp}.png"
        image = window.capture_as_image()
        image.save(path)
    except Exception:
        return None


def close_app(app: Application) -> None:
    """Terminate the Electron application process."""
    try:
        app.kill()
    except Exception:
        return None


def test_links_update_path(app_exe_path: Path) -> None:
    """Click key links and verify the E2E PATH overlay updates."""
    app = launch_app(app_exe_path)
    window = get_main_window(app)

    try:
        scenarios = [
            ("VEGAを開始", "bt7/index.html"),
            ("ALTAIRを開始", "bt30/index.html"),
            ("DENEBを開始", "qr/index.html"),
        ]
        for label, expected_suffix in scenarios:
            click_link(window, label)
            wait_for_path_suffix(window, expected_suffix)
    except Exception:
        save_screenshot(window, "test_links_update_path")
        raise
    finally:
        close_app(app)
