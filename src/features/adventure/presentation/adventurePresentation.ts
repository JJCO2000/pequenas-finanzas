import type { AdventureDay, AdventureNodeType } from '@/core/domain/types';

export const ADVENTURE_DAYS_PER_STAGE = 9;
export const ADVENTURE_NODE_SIZE = 44;

export type AdventureStage = {
  stageNumber: number;
  dayInStage: number;
  completedSlots: number;
  totalSlots: number;
  progress: number;
};

export function getAdventureStage(dayNumber: number): AdventureStage {
  const safeDay = Math.max(1, Math.trunc(dayNumber || 1));
  const stageNumber = Math.floor((safeDay - 1) / ADVENTURE_DAYS_PER_STAGE) + 1;
  const dayInStage = ((safeDay - 1) % ADVENTURE_DAYS_PER_STAGE) + 1;
  const completedSlots = Math.max(0, dayInStage - 1);
  return {
    stageNumber,
    dayInStage,
    completedSlots,
    totalSlots: ADVENTURE_DAYS_PER_STAGE,
    progress: completedSlots / ADVENTURE_DAYS_PER_STAGE,
  };
}

export function getAdventureNodeLabel(nodeType: AdventureNodeType) {
  switch (nodeType) {
    case 'lesson': return 'DESCUBRIMIENTO';
    case 'activity': return 'PRÁCTICA';
    case 'game': return 'MINIJUEGO';
    case 'decision': return 'DECISIÓN';
    case 'review': return 'REPASO';
    case 'challenge': return 'RETO';
  }
}

export function getAdventureMissionStatus(day: AdventureDay) {
  if (day.completed) return 'Misión completada · puedes volver a jugar';
  if (day.nodeType === 'game') return 'Supera el minijuego para abrir el siguiente día';
  return 'Completa el reto para avanzar por el mapa';
}
