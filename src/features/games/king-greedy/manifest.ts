import type { GameManifest } from '@/core/game-runtime';

export const KING_GREEDY_MANIFEST: GameManifest = {
  id: 'king-greedy',
  title: 'El Rey Codicioso',
  description: 'Detén el tablero, acumula premios y decide cuándo asegurar lo ganado antes de que aparezca la Codicia.',
  ageBands: ['6-8', '9-12'],
  learningObjective: 'Practicar autocontrol, prioridades y diferencia entre ingreso, necesidad y compra impulsiva.',
  financialConcept: 'Prioridades y autocontrol',
  durationSeconds: 55,
  controls: ['tap'],
  kit: 'narrative',
  rewardRuleId: 'score-percent-50',
  componentId: 'king-greedy-v1',
  topics: ['saving', 'wants', 'income'],
  minimumDay: 24,
  cooldownDays: 20,
  replayable: true,
  arcadeRewards: true,
  presentation: {
    badge: 'REY',
    shortInstruction: 'Detén el tablero y asegura tus ganancias antes de perder lo expuesto.',
    introSteps: [
      'Gira el tablero y pulsa DETENER cuando quieras fijar el resultado.',
      'Lo ganado queda expuesto hasta que decidas ASEGURARLO.',
      'Si aparece CODICIA pierdes lo expuesto, no lo que ya protegiste.',
    ],
  },
};
