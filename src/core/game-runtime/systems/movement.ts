export type Body2D = { x: number; y: number; vx: number; vy: number };

export function integrate(body: Body2D, deltaSeconds: number): Body2D {
  'worklet';
  const dt = Math.max(0, Math.min(deltaSeconds, 0.05));
  return { ...body, x: body.x + body.vx * dt, y: body.y + body.vy * dt };
}

export function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.max(min, Math.min(max, value));
}
