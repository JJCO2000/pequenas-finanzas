import type { AgeBand } from '@/core/domain/types';
import type { LevelDefinition } from '@/content/curriculum/levels';
export function visibleLevels(levels: LevelDefinition[], ageBand: AgeBand) { return levels.filter((l) => l.ageBands.includes(ageBand)).sort((a,b) => a.order-b.order); }
export function nextVisibleLevelId(levels: LevelDefinition[], currentId: string, ageBand: AgeBand): string | null {
  const visible = visibleLevels(levels, ageBand); const i = visible.findIndex((l) => l.id === currentId); return i >= 0 ? visible[i + 1]?.id ?? null : null;
}
