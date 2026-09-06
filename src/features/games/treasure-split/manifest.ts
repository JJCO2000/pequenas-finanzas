import type { GameManifest } from '@/core/game-runtime';

export const TREASURE_SPLIT_MANIFEST: GameManifest = {
  id: 'treasure-split',
  title: 'Reparte el tesoro',
  description: 'Planea cómo repartir recursos, descubre un evento sorpresa y observa qué tan resistente fue tu decisión.',
  ageBands: ['6-8', '9-12'],
  learningObjective: 'Practicar la asignación de una cantidad limitada entre gasto, ahorro e inversión.',
  financialConcept: 'Distribución del dinero',
  durationSeconds: 60,
  controls: ['tap'],
  kit: 'simulation',
  rewardRuleId: 'score-percent-50',
  componentId: 'treasure-split-v1',
  topics: ['budget', 'saving', 'investment'],
  minimumDay: 12,
  cooldownDays: 20,
  replayable: true,
  arcadeRewards: true,
  presentation: {
    badge: 'TESORO',
    shortInstruction: 'Planea el reparto, simula el evento y aprende de la consecuencia.',
    introSteps: [
      'Reparte todo el tesoro entre gastar, ahorrar e invertir.',
      'Confirma tu plan sin conocer el evento que aparecerá.',
      'Observa la consecuencia y ajusta tu estrategia en la siguiente ronda.',
    ],
  },
};
