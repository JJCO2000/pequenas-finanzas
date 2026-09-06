export function circleIntersectsRect(cx: number, cy: number, radius: number, rx: number, ry: number, rw: number, rh: number) {
  'worklet';
  const nearestX = Math.max(rx, Math.min(cx, rx + rw));
  const nearestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy <= radius * radius;
}
