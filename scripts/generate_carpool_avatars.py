"""Create ten local illustrated profile pictures for fictional carpool previews.

Run with: py scripts/generate_carpool_avatars.py
Requires Pillow. These images are bundled so the previews work offline.
"""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1] / "assets" / "Carpool"
SIZE = 256
SCALE = 4

PALETTES = [
    ("#DDEEF7", "#B87955", "#252936", "#446EA1", None),
    ("#FCE7D3", "#D49A6B", "#332B35", "#B65765", "#A64B69"),
    ("#E6E9FC", "#E1AE83", "#282A35", "#426A73", None),
    ("#DDF0E8", "#BD835E", "#3C3432", "#7556A6", None),
    ("#F3E8F6", "#C98C68", "#282936", "#487D91", "#7661A8"),
    ("#E6EAF5", "#8F583E", "#25262D", "#C66D49", None),
    ("#F5E9D8", "#D7A17B", "#343136", "#3D7498", None),
    ("#DCECEB", "#A66C4C", "#27262F", "#C35D6B", "#396E79"),
    ("#F6E9E3", "#C88D65", "#2F3039", "#555E9E", None),
    ("#E2E9F8", "#AA7253", "#292A32", "#D08D47", "#3C6086"),
]


def box(*coordinates):
    return tuple(round(value * SCALE) for value in coordinates)


def polygon(points):
    return [box(*point) for point in points]


def portrait(number, palette):
    background, skin, hair, shirt, headscarf = palette
    image = Image.new("RGB", (SIZE * SCALE, SIZE * SCALE), background)
    draw = ImageDraw.Draw(image)

    draw.ellipse(box(12, 178, 244, 359), fill=shirt)
    if headscarf:
        draw.ellipse(box(57, 40, 199, 230), fill=headscarf)
        draw.polygon(polygon([(65, 140), (191, 140), (205, 256), (48, 256)]), fill=headscarf)
        draw.ellipse(box(79, 70, 177, 184), fill=skin)
        draw.pieslice(box(76, 49, 180, 139), 180, 355, fill=headscarf)
    else:
        draw.rounded_rectangle(box(108, 164, 148, 209), radius=13 * SCALE, fill=skin)
        draw.ellipse(box(65, 48, 191, 190), fill=hair)
        draw.ellipse(box(78, 66, 178, 184), fill=skin)
        draw.pieslice(box(74, 45, 183, 115), 180, 360, fill=hair)
        if number in (2, 5, 8):
            draw.ellipse(box(61, 54, 89, 166), fill=hair)
            draw.ellipse(box(169, 54, 197, 166), fill=hair)

    draw.ellipse(box(101, 119, 108, 126), fill=hair)
    draw.ellipse(box(149, 119, 156, 126), fill=hair)
    draw.arc(box(112, 139, 146, 157), 10, 170, fill="#754A42", width=3 * SCALE)
    draw.arc(box(117, 128, 138, 145), 5, 165, fill="#96664F", width=2 * SCALE)

    ROOT.mkdir(parents=True, exist_ok=True)
    image.resize((SIZE, SIZE), Image.Resampling.LANCZOS).save(ROOT / f"driver-{number + 1}.webp", "WEBP", quality=90, method=6)


if __name__ == "__main__":
    for index, colors in enumerate(PALETTES):
        portrait(index, colors)
