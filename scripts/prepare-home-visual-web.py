from pathlib import Path
from PIL import Image, UnidentifiedImageError

SOURCE = Path('assets/world/v7/home-approved.webp')
WEB_COPY = Path('assets/world/v7/home-approved.visual.png')
START = Path('src/app/start.tsx')
TARGET_DHASH = int('b4f1e5d4ecee182d', 16)


def dhash(image: Image.Image) -> int:
    gray = image.convert('L').resize((9, 8), Image.Resampling.LANCZOS)
    pixels = list(gray.getdata())
    value = 0
    for row in range(8):
        offset = row * 9
        for col in range(8):
            value = (value << 1) | int(pixels[offset + col + 1] > pixels[offset + col])
    return value


def hamming(left: int, right: int) -> int:
    return (left ^ right).bit_count()


try:
    with Image.open(SOURCE) as image:
        image.convert('RGBA').save(WEB_COPY, format='PNG', optimize=False)
except (UnidentifiedImageError, OSError) as error:
    candidates = []
    for suffix in ('*.png', '*.jpg', '*.jpeg', '*.webp'):
        for path in Path('.').rglob(suffix):
            if path == SOURCE or 'node_modules' in path.parts or '.git' in path.parts:
                continue
            try:
                with Image.open(path) as image:
                    score = hamming(TARGET_DHASH, dhash(image))
                    candidates.append((score, image.size[0], image.size[1], str(path)))
            except (UnidentifiedImageError, OSError):
                continue
    candidates.sort(key=lambda item: (item[0], abs((item[1] / item[2]) - (1672 / 941)), item[3]))
    print('Approved reference is not a decodable image. Closest repository candidates by 64-bit dHash:')
    for score, width, height, path in candidates[:25]:
        print(f'  distance={score:02d} size={width}x{height} {path}')
    raise SystemExit(f'Cannot prepare visual reference from {SOURCE}: {error}')

source = START.read_text(encoding='utf-8')
needle = "../../assets/world/v7/home-approved.webp"
replacement = "../../assets/world/v7/home-approved.visual.png"
count = source.count(needle)
if count != 1:
    raise SystemExit(f'expected exactly one Home reference require path, found {count}')
START.write_text(source.replace(needle, replacement), encoding='utf-8')

print(f'Prepared web-only visual asset {WEB_COPY} from approved WebP; production source change is CI-local only.')
