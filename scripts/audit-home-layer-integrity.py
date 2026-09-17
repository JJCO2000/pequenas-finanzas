from __future__ import annotations

import io
import json
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageFile, ImageFont

# Several legacy Home assets are browser-renderable but have truncated image streams.
# Load them for diagnosis so the audit can inspect all blocks instead of stopping at
# the first decoder error. The visual/semantic report still exposes the real pixels.
ImageFile.LOAD_TRUNCATED_IMAGES = True

try:
    import cairosvg
except ImportError as exc:
    raise SystemExit('cairosvg is required for Home layer integrity audit') from exc

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts' / 'layer-audit'
OUT.mkdir(parents=True, exist_ok=True)

BLOCKS = {
    'bloque1-mapa': [
        ('background', 'assets/ui/home/destinations/mapa/background.jpg', True),
        ('dino', 'assets/ui/home/destinations/mapa/dino.webp', False),
        ('sign', 'assets/ui/home/destinations/mapa/sign.webp', False),
    ],
    'bloque2-arcade': [
        ('background', 'assets/ui/home/destinations/arcade/background.webp', True),
        ('pterosaur', 'assets/ui/home/destinations/arcade/pterosaur.webp', False),
        ('star-blocks', 'assets/ui/home/destinations/arcade/star-blocks.webp', False),
    ],
    'bloque3-mi-dinero': [
        ('background', 'assets/ui/home/destinations/dinero/background.png', True),
        ('coin-stack', 'assets/ui/home/destinations/dinero/coin-stack.svg', False),
        ('star-coin', 'assets/ui/home/destinations/dinero/star-coin.svg', False),
    ],
    'bloque4-inversiones': [
        ('background', 'assets/ui/home/destinations/inversiones/background.webp', True),
        ('stegosaur', 'assets/ui/home/destinations/inversiones/stegosaur.png', False),
    ],
    'bloque5-tienda': [
        ('background', 'assets/ui/home/destinations/tienda/background.webp', True),
        ('egg-nest', 'assets/ui/home/destinations/tienda/egg-nest.webp', False),
    ],
    'bloque6-coleccion': [
        ('background', 'assets/ui/home/destinations/coleccion/background.webp', True),
        ('longneck', 'assets/ui/home/destinations/coleccion/longneck.webp', False),
    ],
}

CHECKER_A = (238, 238, 238, 255)
CHECKER_B = (214, 214, 214, 255)
CARD_BG = (250, 250, 247, 255)
TEXT = (24, 53, 44, 255)
MUTED = (93, 112, 105, 255)
SCALE = 3
PAD = 24
LABEL_H = 64


def checkerboard(size: tuple[int, int], cell: int = 12) -> Image.Image:
    image = Image.new('RGBA', size, CHECKER_A)
    draw = ImageDraw.Draw(image)
    w, h = size
    for y in range(0, h, cell):
        for x in range(0, w, cell):
            if ((x // cell) + (y // cell)) % 2:
                draw.rectangle((x, y, min(x + cell - 1, w - 1), min(y + cell - 1, h - 1)), fill=CHECKER_B)
    return image


def load_layer(path: Path, canvas: tuple[int, int] | None = None) -> Image.Image:
    if path.suffix.lower() == '.svg':
        if canvas is None:
            raise ValueError(f'canvas required to rasterize SVG: {path}')
        png = cairosvg.svg2png(url=str(path), output_width=canvas[0], output_height=canvas[1])
        return Image.open(io.BytesIO(png)).convert('RGBA')
    with Image.open(path) as source:
        source.load()
        return source.convert('RGBA')


def alpha_metrics(image: Image.Image) -> dict[str, object]:
    alpha = image.getchannel('A')
    histogram = alpha.histogram()
    total = image.width * image.height
    transparent = sum(histogram[:8])
    partial = sum(histogram[8:255])
    opaque = histogram[255]
    bbox = alpha.point(lambda p: 255 if p > 8 else 0).getbbox()
    return {
        'size': [image.width, image.height],
        'transparent_pixels_alpha_lt_8': transparent,
        'partial_alpha_pixels_8_to_254': partial,
        'opaque_pixels_alpha_255': opaque,
        'opaque_ratio': round(opaque / total, 6),
        'visible_bbox_alpha_gt_8': list(bbox) if bbox else None,
    }


def enclosed_transparent_pixels(image: Image.Image, threshold: int = 8) -> int:
    """Count transparent pixels not connected to the canvas boundary.

    This is diagnostic only. Foregrounds can have legitimate negative space, so it is
    never used alone to fail CI.
    """
    alpha = image.getchannel('A')
    w, h = image.size
    px = alpha.load()
    seen = bytearray(w * h)
    queue: deque[tuple[int, int]] = deque()

    def push(x: int, y: int) -> None:
        idx = y * w + x
        if not seen[idx] and px[x, y] <= threshold:
            seen[idx] = 1
            queue.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while queue:
        x, y = queue.popleft()
        if x > 0:
            push(x - 1, y)
        if x + 1 < w:
            push(x + 1, y)
        if y > 0:
            push(x, y - 1)
        if y + 1 < h:
            push(x, y + 1)

    enclosed = 0
    for y in range(h):
        for x in range(w):
            idx = y * w + x
            if px[x, y] <= threshold and not seen[idx]:
                enclosed += 1
    return enclosed


def preview(layer: Image.Image) -> Image.Image:
    base = checkerboard(layer.size)
    base.alpha_composite(layer)
    return base.resize((layer.width * SCALE, layer.height * SCALE), Image.Resampling.NEAREST)


def make_contact_sheet(block: str, layers: list[tuple[str, Image.Image]], composition: Image.Image) -> Path:
    cards = layers + [('recomposition', composition)]
    card_w = composition.width * SCALE
    card_h = composition.height * SCALE + LABEL_H
    width = PAD + len(cards) * (card_w + PAD)
    height = PAD * 2 + card_h + 44
    sheet = Image.new('RGBA', (width, height), CARD_BG)
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    draw.text((PAD, 12), block, fill=TEXT, font=font)

    x = PAD
    y = PAD + 32
    for name, layer in cards:
        tile = preview(layer)
        sheet.alpha_composite(tile, (x, y))
        draw.text((x, y + tile.height + 10), name, fill=TEXT, font=font)
        if name != 'recomposition':
            m = alpha_metrics(layer)
            draw.text(
                (x, y + tile.height + 30),
                f"opaque={m['opaque_ratio']:.3f} enclosed-hole-px={enclosed_transparent_pixels(layer)}",
                fill=MUTED,
                font=font,
            )
        x += card_w + PAD

    out = OUT / f'{block}-layers.png'
    sheet.convert('RGB').save(out, quality=95)
    return out


failures: list[str] = []
report: dict[str, object] = {}

for block, specs in BLOCKS.items():
    _, bg_rel, _ = specs[0]
    bg_path = ROOT / bg_rel
    if not bg_path.exists():
        failures.append(f'{block}: missing {bg_rel}')
        continue

    try:
        background = load_layer(bg_path)
    except Exception as exc:
        failures.append(f'{block}/background: cannot decode {bg_rel}: {exc}')
        continue

    canvas = background.size
    loaded: list[tuple[str, Image.Image]] = []
    block_report: dict[str, object] = {}

    for name, rel, must_be_complete_background in specs:
        path = ROOT / rel
        if not path.exists():
            failures.append(f'{block}: missing {rel}')
            continue
        try:
            image = load_layer(path, canvas)
        except Exception as exc:
            failures.append(f'{block}/{name}: cannot decode {rel}: {exc}')
            continue
        if image.size != canvas:
            failures.append(f'{block}/{name}: canvas {image.size} != background canvas {canvas}')
            image = image.resize(canvas, Image.Resampling.LANCZOS)
        metrics = alpha_metrics(image)
        metrics['enclosed_transparent_pixels'] = enclosed_transparent_pixels(image)
        metrics['path'] = rel
        block_report[name] = metrics
        loaded.append((name, image))

        if must_be_complete_background:
            alpha_min, alpha_max = image.getchannel('A').getextrema()
            if alpha_min != 255 or alpha_max != 255:
                failures.append(
                    f'{block}/{name}: background is not complete/opaque; alpha range={alpha_min}..{alpha_max}, '
                    f"opaque_ratio={metrics['opaque_ratio']}"
                )

    if loaded:
        composition = Image.new('RGBA', canvas, (0, 0, 0, 0))
        for _, image in loaded:
            composition.alpha_composite(image)
        evidence = make_contact_sheet(block, loaded, composition)
        block_report['evidence'] = str(evidence.relative_to(ROOT))

    report[block] = block_report

(OUT / 'report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')

for block, data in report.items():
    print(f'\n{block}')
    for name, metrics in data.items():
        if name == 'evidence':
            print(f'  evidence: {metrics}')
            continue
        print(
            f"  {name}: size={metrics['size']} opaque_ratio={metrics['opaque_ratio']} "
            f"transparent={metrics['transparent_pixels_alpha_lt_8']} "
            f"enclosed-hole-px={metrics['enclosed_transparent_pixels']}"
        )

if failures:
    print('\nFAIL Home reusable-layer integrity:')
    for failure in failures:
        print(f'  - {failure}')
    raise SystemExit(1)

print('\nPASS Home reusable-layer integrity: all destination backgrounds are full opaque canvases; visual layer sheets generated for manual semantic review.')
