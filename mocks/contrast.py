"""Contrast of Mise text/UI pairs computed in Chrome over the live mock app. Writes contrast.md."""
from __future__ import annotations

import os
from pathlib import Path

from playwright.sync_api import sync_playwright

DIR = Path(__file__).resolve().parent
BASE = "http://127.0.0.1:5173"

# (path, selector, name, mode)  mode: None text | 'edge' border vs parent bg | 'ui' icon/UI (3:1)
PAIRS = [
    ("/login", '[data-contrast="login-title"]', "Login title", None),
    ("/login", '[data-contrast="login-tagline"]', "Login tagline (muted)", None),
    ("/login", '[data-contrast="login-desc"]', "Login description (muted)", None),
    ("/login", '[data-contrast="login-cta"]', "Entrar con passkey", None),
    ("/login", '[data-contrast="passkey-hint"]', "Passkey hint (muted)", None),
    ("/login", '[data-contrast="login-fallback"]', "Usar contraseña (link)", None),
    ("/login", '[data-contrast="login-foot"]', "Login footer (muted)", None),
    ("/login?password=1", '[data-contrast="input"]', "Email input text", None),
    ("/login?password=1", '[data-contrast="input"]', "Email input border (UI)", "edge"),
    ("/login?password=1", '[data-contrast="login-cta"]', "Entrar (password)", None),
    ("/", '[data-contrast="home-title"]', "Home greeting", None),
    ("/", '[data-contrast="home-kicker"]', "Home date (muted)", None),
    ("/", '[data-contrast="nueva-venta"]', "Nueva venta", None),
    ("/", '[data-contrast="kpi-label"]', "Home KPI label (muted)", None),
    ("/", '[data-contrast="kpi-value"]', "Home KPI value", None),
    ("/", '[data-contrast="tickets-desc"]', "Tickets description (muted)", None),
    ("/", '[data-contrast="ticket-meta"]', "Ticket meta (muted)", None),
    ("/", '[data-contrast="ticket-time"]', "Ticket time (muted)", None),
    ("/", '[data-contrast="sync-ok"]', "Sync chip Sincronizado", None),
    ("/", '[data-contrast="printer-ok"]', "Printer chip Impresora lista", None),
    ("/", '[data-contrast="status-help"]', "Device status help (muted)", None),
    ("/", '[data-contrast="tagline"]', "Sidebar tagline (muted)", None),
    ("/", '[data-contrast="device-label"]', "Device label (muted)", None),
    ("/", '[data-contrast="date-label"]', "Header date (muted)", None),
    ("/?offline=1", '[data-contrast="sync-offline"]', "Sync chip offline", None),
    ("/?offline=1", '[data-contrast="offline-alert"]', "Offline alert", None),
    ("/tablero", '[data-contrast="period-label"]', "Period label (muted)", None),
    ("/tablero", '[data-contrast="coverage-alert"]', "Coverage alert", None),
    ("/tablero", '[data-contrast="dash-kpi-label"]', "Dashboard KPI label (muted)", None),
    ("/tablero", '[data-contrast="dash-kpi-value"]', "Dashboard KPI value", None),
    ("/tablero", '[data-contrast="breakdown-pct"]', "Breakdown percent (muted)", None),
    ("/vender?picker=1", '[data-contrast="variant-price"]', "Variant price", None),
    ("/vender?picker=1", '[data-contrast="picker-hint"]', "Picker hint (muted)", None),
    ("/vender?picker=1", '[data-contrast="cart-total"]', "Cart total", None),
    ("/vender?cobro=1", '[data-contrast="cobro-total"]', "Checkout total", None),
    ("/vender?cobro=1", '[data-contrast="cambio"]', "Change amount", None),
    ("/vender?cobro=1", '[data-contrast="confirmar-cta"]', "Cobrar e imprimir", None),
    ("/vender?didi=1", '[data-contrast="didi-banner"]', "DiDi example prices banner", None),
    ("/vender?didi=1&cobro=1", '[data-contrast="didi-manual-alert"]', "DiDi manual record alert", None),
    ("/vender?didi=1&cobro=1", '[data-contrast="confirmar-cta"]', "Registrar venta DiDi e imprimir", None),
]

JS = """([s, mode]) => {
  const e = document.querySelector(s);
  const cv = document.createElement('canvas').getContext('2d');
  const rgb = (c) => {
    cv.clearRect(0, 0, 1, 1);
    cv.fillStyle = '#000';
    cv.fillStyle = c;
    cv.fillRect(0, 0, 1, 1);
    const d = cv.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const layers = [];
  let b = (mode === 'edge') ? e.parentElement : e;
  while (b) {
    const v = getComputedStyle(b).backgroundColor;
    const c = rgb(v);
    if (c[3] > 0) layers.push(c);
    if (c[3] >= 1) break;
    b = b.parentElement;
  }
  if (!layers.length || layers[layers.length - 1][3] < 1) {
    layers.push(rgb(getComputedStyle(document.body).backgroundColor));
  }
  let bg = layers.pop();
  while (layers.length) {
    const c = layers.pop();
    bg = [0, 1, 2].map((i) => c[i] * c[3] + bg[i] * (1 - c[3])).concat(1);
  }
  const cs = getComputedStyle(e);
  const fg = mode === 'edge' ? rgb(cs.borderTopColor) : rgb(cs.color);
  return { fg, bg, size: cs.fontSize, w: cs.fontWeight };
}"""


def rel_luminance(c):
    def f(v):
        v = v / 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])


def hex_color(c):
    return "#%02x%02x%02x" % tuple(round(x) for x in c[:3])


def main() -> None:
    rows = [
        "# Contrast · Mise (computed in Chrome, translucent layers composited)",
        "",
        "Light mode only. Thresholds: 4.5:1 for text, 3:1 for UI/edges and large text.",
        "",
        "| State | Pair | fg | bg | ratio | AA |",
        "|---|---|---|---|---|---|",
    ]
    fails = 0
    n = 0
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/google-chrome",
            args=["--headless=new", "--no-sandbox"],
        )
        for path, selector, name, mode in PAIRS:
            page = browser.new_page(viewport={"width": 1366, "height": 768})
            page.goto(BASE + path, wait_until="networkidle")
            page.evaluate("document.documentElement.dataset.capture = '1'")
            page.wait_for_timeout(200)
            exists = page.evaluate(
                "(s) => { const e = document.querySelector(s); return !!e && e.getBoundingClientRect().width > 0; }",
                selector,
            )
            if not exists:
                rows.append(f"| {path} | {name} | – | – | – | not rendered |")
                page.close()
                continue
            result = page.evaluate(JS, [selector, mode])
            page.close()
            a = result["fg"][3]
            fg = [result["fg"][i] * a + result["bg"][i] * (1 - a) for i in range(3)]
            x, y = sorted([rel_luminance(fg), rel_luminance(result["bg"])], reverse=True)
            ratio = (x + 0.05) / (y + 0.05)
            size = float(str(result["size"]).replace("px", ""))
            large = size >= 24 or (size >= 18.66 and int(result["w"]) >= 700)
            need = 3 if (mode in ("ui", "edge") or large) else 4.5
            ok = ratio >= need
            fails += not ok
            n += 1
            rows.append(
                f"| {path} | {name} | {hex_color(fg)} | {hex_color(result['bg'])} | {ratio:.2f} | {'pass' if ok else 'FAIL'} ({need}) |"
            )
        browser.close()
    rows.append(f"\n{n} pairs, {fails} fail.")
    (DIR / "contrast.md").write_text("\n".join(rows) + "\n")
    print("\n".join(r for r in rows if "FAIL" in r or "not rendered" in r or "pairs" in r))


if __name__ == "__main__":
    main()
