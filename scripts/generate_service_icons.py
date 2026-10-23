"""Regenerate simplified Transport, Lost & Found, and Guide home icons.

Run with: py scripts/generate_service_icons.py
Requires Pillow. The app uses only the generated WebP files.
"""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1] / "assets" / "Icons"
SCALE = 4
SIZE = 320
NAVY = "#123765"
YELLOW = "#FFD43B"
PALE = "#FFF2BD"
WINDOW = "#DCECF7"


def pt(values):
    return tuple(round(value * SCALE) for value in values)


def save(image, name):
    image.resize((SIZE, SIZE), Image.Resampling.LANCZOS).save(ROOT / name, "WEBP", quality=96, method=6)


def bus():
    image = Image.new("RGBA", (SIZE * SCALE, SIZE * SCALE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle(pt((69, 62, 251, 255)), radius=44 * SCALE, fill=YELLOW, outline=NAVY, width=11 * SCALE)
    draw.rounded_rectangle(pt((85, 92, 235, 177)), radius=18 * SCALE, fill=WINDOW, outline=NAVY, width=9 * SCALE)
    draw.line(pt((160, 96, 160, 174)), fill=NAVY, width=8 * SCALE)
    draw.rounded_rectangle(pt((92, 194, 228, 227)), radius=11 * SCALE, fill=PALE)
    for x in (106, 214):
        draw.ellipse(pt((x - 11, 205, x + 11, 227)), fill=PALE, outline=NAVY, width=5 * SCALE)
    draw.rounded_rectangle(pt((93, 247, 122, 269)), radius=6 * SCALE, fill=NAVY)
    draw.rounded_rectangle(pt((198, 247, 227, 269)), radius=6 * SCALE, fill=NAVY)
    save(image, "bus.webp")


def lost_found():
    image = Image.new("RGBA", (SIZE * SCALE, SIZE * SCALE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.polygon([pt(point) for point in ((95, 137), (112, 76), (198, 76), (226, 137))], fill=YELLOW)
    draw.line([pt(point) for point in ((95, 137), (112, 76), (198, 76), (226, 137))], fill=NAVY, width=11 * SCALE, joint="curve")
    draw.rounded_rectangle(pt((60, 131, 260, 164)), radius=17 * SCALE, fill=YELLOW, outline=NAVY, width=10 * SCALE)
    draw.line(pt((205, 241, 265, 291)), fill=NAVY, width=32 * SCALE, joint="curve")
    draw.line(pt((205, 241, 265, 291)), fill=YELLOW, width=15 * SCALE, joint="curve")
    draw.ellipse(pt((72, 147, 220, 295)), fill=PALE, outline=NAVY, width=13 * SCALE)
    draw.ellipse(pt((93, 168, 199, 274)), fill=(255, 255, 255, 0), outline=YELLOW, width=10 * SCALE)
    save(image, "lost-found.webp")


def guide():
    image = Image.new("RGBA", (SIZE * SCALE, SIZE * SCALE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle(pt((58, 49, 259, 271)), radius=21 * SCALE, fill=PALE, outline=NAVY, width=11 * SCALE)
    draw.rounded_rectangle(pt((58, 49, 106, 271)), radius=16 * SCALE, fill=YELLOW, outline=NAVY, width=11 * SCALE)
    draw.line(pt((104, 56, 104, 265)), fill=NAVY, width=9 * SCALE)
    draw.rounded_rectangle(pt((129, 82, 224, 114)), radius=9 * SCALE, fill=YELLOW)
    draw.line(pt((132, 154, 222, 154)), fill=NAVY, width=9 * SCALE)
    draw.line(pt((132, 185, 210, 185)), fill=NAVY, width=9 * SCALE)
    draw.line(pt((132, 216, 190, 216)), fill=NAVY, width=9 * SCALE)
    save(image, "guide.webp")


if __name__ == "__main__":
    bus()
    lost_found()
    guide()
