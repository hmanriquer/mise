"""Capture Mise mocks from the scratch Vite app at 1366x768 (PC) and 1280x800 (tablet)."""
from __future__ import annotations

import subprocess
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

DIR = Path(__file__).resolve().parent
SHOTS = DIR / "shots"
APP = Path("/workspace/mise-mock-app")
BASE = "http://127.0.0.1:5173"

SHOT_LIST = [
    # (filename without .png, path, width, height)
    ("login-pc", "/login", 1366, 768),
    ("login-tablet", "/login?shell=tablet", 1280, 800),
    ("login-password-pc", "/login?password=1", 1366, 768),
    ("login-password-tablet", "/login?shell=tablet&password=1", 1280, 800),
    ("inicio-pc", "/", 1366, 768),
    ("inicio-tablet", "/?shell=tablet", 1280, 800),
    ("inicio-offline-pc", "/?offline=1", 1366, 768),
    ("inicio-offline-tablet", "/?shell=tablet&offline=1", 1280, 800),
    ("tablero-pc", "/tablero", 1366, 768),
    ("tablero-tablet", "/tablero?shell=tablet", 1280, 800),
    ("vender-pc", "/vender?picker=1", 1366, 768),
    ("vender-tablet", "/vender?shell=tablet&picker=1", 1280, 800),
    ("vender-grid-pc", "/vender", 1366, 768),
    ("vender-grid-tablet", "/vender?shell=tablet", 1280, 800),
    ("vender-didi-pc", "/vender?didi=1", 1366, 768),
    ("vender-didi-tablet", "/vender?shell=tablet&didi=1", 1280, 800),
    ("cobro-pc", "/vender?cobro=1", 1366, 768),
    ("cobro-tablet", "/vender?shell=tablet&cobro=1", 1280, 800),
    ("cobro-didi-pc", "/vender?didi=1&cobro=1", 1366, 768),
    ("cobro-didi-tablet", "/vender?shell=tablet&didi=1&cobro=1", 1280, 800),
]


def server_up() -> bool:
    try:
        with urllib.request.urlopen(BASE + "/", timeout=1) as res:
            return res.status == 200
    except Exception:
        return False


def main() -> None:
    SHOTS.mkdir(parents=True, exist_ok=True)
    proc = None
    if not server_up():
        proc = subprocess.Popen(
            ["npx", "vite", "--host", "127.0.0.1", "--port", "5173"],
            cwd=APP,
        )
        for _ in range(40):
            if server_up():
                break
            time.sleep(0.25)
        else:
            raise SystemExit("Vite did not start on :5173")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/google-chrome",
            args=["--headless=new", "--no-sandbox"],
        )
        for name, path, width, height in SHOT_LIST:
            page = browser.new_page(viewport={"width": width, "height": height})
            page.goto(BASE + path, wait_until="networkidle")
            page.evaluate("document.documentElement.dataset.capture = '1'")
            page.wait_for_function("document.fonts.status === 'loaded'")
            page.wait_for_timeout(400)
            dest = SHOTS / f"{name}.png"
            page.screenshot(path=str(dest), full_page=False)
            print("wrote", dest.name)
            page.close()
        browser.close()

    if proc is not None:
        proc.terminate()


if __name__ == "__main__":
    main()
