export function deterministicSpawnX(seed: number, min: number, max: number) {
  'worklet';
  if (max <= min) return min;
  const normalized = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
  return min + normalized * (max - min);
}
