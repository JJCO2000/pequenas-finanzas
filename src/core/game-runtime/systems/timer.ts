export function remainingMs(startedAt: number, durationMs: number, now = Date.now()) { return Math.max(0, durationMs - (now - startedAt)); }
export function isFinished(startedAt: number, durationMs: number, now = Date.now()) { return remainingMs(startedAt, durationMs, now) === 0; }
