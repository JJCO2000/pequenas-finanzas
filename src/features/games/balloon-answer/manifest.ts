import type { GameManifest } from '@/core/game-runtime';

export const BALLOON_ANSWER_MANIFEST: GameManifest = {
  id: 'balloon-answer',
  title: 'Globos del presupuesto',
  description: 'Persigue globos en movimiento, revienta los de la categoría correcta y conserva tu racha antes de que acabe el tiempo.',
  ageBands: ['6-8', '9-12'],
  learningObjective: 'Distinguir necesidades, deseos y metas de ahorro mediante clasificación rápida.',
  financialConcept: 'Necesidades, deseos y ahorro',
  durationSeconds: 45,
  controls: ['tap'],
  kit: 'arcade',
  rewardRuleId: 'score-percent-50',
  componentId: 'balloon-answer-v1',
  topics: ['budget', 'needs', 'wants', 'saving'],
  minimumDay: 10,
  cooldownDays: 20,
  replayable: true,
  arcadeRewards: true,
  presentation: {
    badge: 'GLOBOS',
    shortInstruction: 'Revienta los globos correctos en movimiento y protege tu racha.',
    introSteps: [
      'Lee la categoría objetivo antes de que empiece la ronda.',
      'Toca únicamente los globos correctos mientras siguen moviéndose.',
      'Protege tus vidas y encadena aciertos para mejorar tu puntuación.',
    ],
  },
};
