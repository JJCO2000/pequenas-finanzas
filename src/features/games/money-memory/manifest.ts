import type { GameManifest } from '@/core/game-runtime';

export const MONEY_MEMORY_MANIFEST: GameManifest = {
  id: 'money-memory',
  title: 'Memoria financiera',
  description: 'Memoriza los objetos, detecta cuál apareció después y mantén la racha mientras el tiempo se acelera.',
  ageBands: ['6-8', '9-12'],
  learningObjective: 'Reconocer y recordar conceptos financieros cotidianos bajo presión de tiempo y dificultad progresiva.',
  financialConcept: 'Vocabulario financiero',
  durationSeconds: 60,
  controls: ['tap'],
  kit: 'arcade',
  rewardRuleId: 'score-percent-50',
  componentId: 'money-memory-v1',
  topics: ['saving', 'budget', 'needs', 'investment'],
  minimumDay: 26,
  cooldownDays: 20,
  replayable: true,
  arcadeRewards: true,
  presentation: {
    badge: 'MEMORIA',
    shortInstruction: 'Memoriza la escena y toca el elemento que antes no estaba.',
    introSteps: [
      'Memoriza todos los elementos visibles antes de que desaparezcan.',
      'Cuando vuelvan, habrá aparecido un elemento nuevo.',
      'Toca el intruso y mantén la racha mientras baja el tiempo.',
    ],
  },
};
