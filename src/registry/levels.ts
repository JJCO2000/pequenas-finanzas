import { LEVEL_DEFINITIONS } from '@/content/curriculum/levels';
export const LEVELS = LEVEL_DEFINITIONS;
export function getLevel(id: string) { return LEVELS.find((l) => l.id === id); }
