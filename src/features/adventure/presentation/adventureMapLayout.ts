import { ADVENTURE_DAYS_PER_STAGE, ADVENTURE_NODE_SIZE } from './adventurePresentation';

export const ADVENTURE_DAYS_PER_SCENE = ADVENTURE_DAYS_PER_STAGE;
export const ADVENTURE_DAY_STEP = 108;
export const ADVENTURE_LEFT_PAD = 86;
export const ADVENTURE_RIGHT_PAD = 140;

const Y_PATTERN = [0.74, 0.60, 0.43, 0.30, 0.40, 0.50, 0.36, 0.20, 0.29] as const;

export function adventurePointY(dayNumber: number, height: number) {
  const minY = 74;
  const maxY = Math.max(minY + 80, height - 64 - ADVENTURE_NODE_SIZE);
  const localIndex = (dayNumber - 1) % ADVENTURE_DAYS_PER_SCENE;
  const sceneIndex = Math.floor((dayNumber - 1) / ADVENTURE_DAYS_PER_SCENE);
  const base = Y_PATTERN[localIndex] ?? 0.5;
  const normalized = Math.max(0, Math.min(1, (base - 0.2) / 0.54));
  const ratio = sceneIndex % 2 === 1 ? 1 - normalized : normalized;
  return minY + (maxY - minY) * ratio;
}
