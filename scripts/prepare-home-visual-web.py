from pathlib import Path
from PIL import Image

SOURCE = Path('assets/world/v7/home-approved.webp')
WEB_COPY = Path('assets/world/v7/home-approved.visual.png')
START = Path('src/app/start.tsx')

with Image.open(SOURCE) as image:
    image.convert('RGBA').save(WEB_COPY, format='PNG', optimize=False)

source = START.read_text(encoding='utf-8')
needle = "../../assets/world/v7/home-approved.webp"
replacement = "../../assets/world/v7/home-approved.visual.png"
count = source.count(needle)
if count != 1:
    raise SystemExit(f'expected exactly one Home reference require path, found {count}')
START.write_text(source.replace(needle, replacement), encoding='utf-8')

print(f'Prepared web-only visual asset {WEB_COPY} from approved WebP; production source change is CI-local only.')
