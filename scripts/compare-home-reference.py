from pathlib import Path
from PIL import Image, ImageChops, ImageDraw

REFERENCE = Path('assets/world/v7/home-approved.webp')
RENDER = Path('artifacts/home-render.png')
DIFF = Path('artifacts/home-diff.png')
WIDTH = 1536
HEIGHT = 864

reference = Image.open(REFERENCE).convert('RGB')
render = Image.open(RENDER).convert('RGB')

if reference.size != (WIDTH, HEIGHT):
    raise SystemExit(f'approved reference size changed: {reference.size}')
if render.size != (WIDTH, HEIGHT):
    raise SystemExit(f'rendered canvas must be {(WIDTH, HEIGHT)}, got {render.size}')

# White pixels are compared. Dynamic overlays are masked because their copy/data are
# intentionally live; the approved scene and six baked camp cards must remain visually stable.
mask = Image.new('L', (WIDTH, HEIGHT), 255)
draw = ImageDraw.Draw(mask)

def mask_percent(left, top, width, height, pad):
    x0 = int(left * WIDTH / 100) - pad
    y0 = int(top * HEIGHT / 100) - pad
    x1 = int((left + width) * WIDTH / 100) + pad
    y1 = int((top + height) * HEIGHT / 100) + pad
    draw.rectangle((max(0, x0), max(0, y0), min(WIDTH, x1), min(HEIGHT, y1)), fill=0)

mask_percent(2.2, 2.2, 37.0, 11.7, 30)      # header
mask_percent(72.05, 3.05, 25.6, 9.0, 30)    # live HUD
mask_percent(32.35, 22.7, 26.9, 10.8, 36)   # next-step cue
mask_percent(1.75, 70.4, 71.0, 25.4, 42)    # live mission card

compared_pixels = mask.histogram()[255]
if compared_pixels < WIDTH * HEIGHT * 0.35:
    raise SystemExit('visual mask compares too little of the approved reference')

diff = ImageChops.difference(render, reference)
channels = diff.split()
channel_histograms = [channel.histogram(mask=mask) for channel in channels]
total_abs = sum(value * count for histogram in channel_histograms for value, count in enumerate(histogram))
mae = total_abs / (compared_pixels * 3)

max_channel = ImageChops.lighter(channels[0], ImageChops.lighter(channels[1], channels[2]))
max_hist = max_channel.histogram(mask=mask)
bad_pixels = sum(max_hist[13:])
bad_ratio = bad_pixels / compared_pixels

cutoff = compared_pixels * 0.99
running = 0
p99 = 255
for value, count in enumerate(max_hist):
    running += count
    if running >= cutoff:
        p99 = value
        break

visual_diff = Image.eval(diff, lambda value: min(255, value * 8))
black = Image.new('RGB', (WIDTH, HEIGHT), (0, 0, 0))
visual_diff = Image.composite(visual_diff, black, mask)
DIFF.parent.mkdir(parents=True, exist_ok=True)
visual_diff.save(DIFF)

print(f'Home visual comparison: compared={compared_pixels} MAE={mae:.4f} p99={p99} bad_ratio={bad_ratio:.5%}')

if mae > 2.5:
    raise SystemExit(f'visual drift too large: MAE {mae:.4f} > 2.5')
if p99 > 10:
    raise SystemExit(f'visual drift too large: p99 {p99} > 10')
if bad_ratio > 0.01:
    raise SystemExit(f'visual drift too large: {bad_ratio:.5%} pixels exceed 12 levels')

print('PASS home rendered-reference comparison')
