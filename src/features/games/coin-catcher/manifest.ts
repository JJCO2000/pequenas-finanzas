import type { GameManifest } from '@/core/game-runtime';

export const COIN_CATCHER_MANIFEST: GameManifest = {
  id: 'coin-catcher',
  title: 'Atrapa monedas',
  description: 'Atrapa monedas y recursos especiales, encadena rachas y evita peligros mientras aumenta la velocidad.',
  ageBands: ['6-8', '9-12'],
  learningObjective: 'Practicar que ganar recursos requiere acción y que la recompensa luego debe administrarse.',
  financialConcept: 'Ingreso y decisión de uso',
  durationSeconds: 35,
  controls: ['drag'],
  kit: 'arcade',
  rewardRuleId: 'coin-catcher-score',
  componentId: 'coin-catcher-v1',
  topics: ['income', 'saving', 'budget'],
  minimumDay: 5,
  cooldownDays: 20,
  replayable: true,
  arcadeRewards: true,
  presentation: {
    badge: 'MONEDAS',
    shortInstruction: 'Mueve la canasta, crea rachas y evita los meteoritos.',
    introSteps: [
      'Mueve la canasta arrastrando en horizontal.',
      'Atrapa monedas y recursos especiales para encadenar rachas.',
      'Evita meteoritos: no quitan lo asegurado, pero rompen tu racha.',
    ],
  },
};
