"""Build OVERVIEW.png: the 5 screens on PC and tablet, plus the two essential variants."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

DIR = Path(__file__).resolve().parent
SHOTS = DIR / "shots"
OUT = DIR / "OVERVIEW.png"

# Rows of (label, filename)
ROWS = [
    [
        ("Entrar · PC", "login-pc.png"),
        ("Inicio · PC", "inicio-pc.png"),
        ("Tablero · PC", "tablero-pc.png"),
        ("Vender · PC", "vender-pc.png"),
        ("Cobro · PC", "cobro-pc.png"),
    ],
    [
        ("Entrar · tablet", "login-tablet.png"),
        ("Inicio · tablet", "inicio-tablet.png"),
        ("Tablero · tablet", "tablero-tablet.png"),
        ("Vender · tablet", "vender-tablet.png"),
        ("Cobro · tablet", "cobro-tablet.png"),
    ],
    [
        ("Vender, catálogo · PC", "vender-grid-pc.png"),
        ("Vender, catálogo · tablet", "vender-grid-tablet.png"),
        ("Vender, DiDi · PC", "vender-didi-pc.png"),
        ("Vender, DiDi · tablet", "vender-didi-tablet.png"),
        ("Cobro DiDi · PC", "cobro-didi-pc.png"),
    ],
    [
        ("Cobro DiDi · tablet", "cobro-didi-tablet.png"),
        ("Entrar, contraseña · PC", "login-password-pc.png"),
        ("Entrar, contraseña · tablet", "login-password-tablet.png"),
        ("Inicio sin conexión · PC", "inicio-offline-pc.png"),
        ("Inicio sin conexión · tablet", "inicio-offline-tablet.png"),
    ],
]

THUMB_W = 480
PAD = 28
GAP = 16
LABEL_H = 32
TITLE_H = 72
BG = (247, 247, 248)
FG = (30, 24, 32)
MUTED = (90, 80, 92)
CARD = (255, 255, 255)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def thumb(path: Path, width: int) -> Image.Image:
    im = Image.open(path).convert("RGB")
    ratio = width / im.width
    return im.resize((width, max(1, int(im.height * ratio))), Image.Resampling.LANCZOS)


def main() -> None:
    thumbs = []
    for row in ROWS:
        items = []
        for label, name in row:
            im = thumb(SHOTS / name, THUMB_W)
            items.append((label, im))
        thumbs.append(items)

    row_heights = [max(im.height for _, im in row) + LABEL_H + GAP for row in thumbs]
    cols = max(len(row) for row in thumbs)
    width = PAD * 2 + cols * THUMB_W + (cols - 1) * GAP
    height = TITLE_H + PAD + sum(row_heights) + PAD

    canvas = Image.new("RGB", (width, height), BG)
    draw = ImageDraw.Draw(canvas)
    title_font = font(26, bold=True)
    sub_font = font(14)
    label_font = font(13, bold=True)

    draw.text((PAD, 22), "Mise · Reina de Espadas", font=title_font, fill=FG)
    draw.text(
        (PAD, 54),
        "Cinco pantallas en PC 1366×768 y tablet 1280×800, con variantes de catálogo, DiDi, contraseña y sin conexión.",
        font=sub_font,
        fill=MUTED,
    )

    y = TITLE_H
    for row in thumbs:
        x = PAD
        for label, im in row:
            # card backdrop
            card = Image.new("RGB", (im.width + 2, im.height + 2), (220, 218, 222))
            canvas.paste(card, (x, y + LABEL_H))
            canvas.paste(im, (x + 1, y + LABEL_H + 1))
            draw.text((x, y + 8), label, font=label_font, fill=FG)
            x += THUMB_W + GAP
        y += max(im.height for _, im in row) + LABEL_H + GAP

    canvas.save(OUT, "PNG", optimize=True)
    print("wrote", OUT, canvas.size)


if __name__ == "__main__":
    main()
