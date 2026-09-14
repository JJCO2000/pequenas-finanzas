from pathlib import Path
from PIL import Image, ImageStat

EXPECTED = {
    'home-compact-min-480x270.png': (480, 270),
    'home-compact-small-568x320.png': (568, 320),
    'home-compact-wide-854x480.png': (854, 480),
    'home-regular-4x3-1024x768.png': (1024, 768),
    'home-regular-16x10-1280x800.png': (1280, 800),
    'home-regular-reference-1536x864.png': (1536, 864),
    'home-expanded-1920x1080.png': (1920, 1080),
    'home-expanded-max-2400x1080.png': (2400, 1080),
}

root = Path('artifacts')
for name, expected_size in EXPECTED.items():
    path = root / name
    if not path.exists():
        raise SystemExit(f'missing Home visual evidence: {path}')
    with Image.open(path) as image:
        image = image.convert('RGB')
        if image.size != expected_size:
            raise SystemExit(f'{name}: expected {expected_size}, got {image.size}')
        stat = ImageStat.Stat(image.resize((128, 72)))
        if max(stat.var) < 150:
            raise SystemExit(f'{name}: screenshot appears blank or nearly uniform (variance={stat.var})')
        extrema = image.getextrema()
        if any(high - low < 25 for low, high in extrema):
            raise SystemExit(f'{name}: screenshot has suspiciously low channel range {extrema}')
        print(f'PASS {name}: size={image.size} variance={[round(v, 1) for v in stat.var]}')

print('PASS Home visual evidence: all responsive viewport screenshots exist and contain rendered scene detail.')
