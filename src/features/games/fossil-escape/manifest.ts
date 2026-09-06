import type { GameManifest } from '@/core/game-runtime';

export const FOSSIL_ESCAPE_MANIFEST: GameManifest = {
  id: 'fossil-escape',
  title: 'Escape financiero',
  description: 'Explora el escenario, toca objetos, resuelve cerraduras financieras y reúne las llaves para abrir la salida.',
  ageBands: ['6-8', '9-12'],
  learningObjective: 'Aplicar conceptos de ahorro, presupuesto, comparación e inversión en situaciones breves.',
  financialConcept: 'Decisiones financieras',
  durationSeconds: 65,
  controls: ['choice', 'tap'],
  kit: 'narrative',
  rewardRuleId: 'score-percent-50',
  componentId: 'fossil-escape-v1',
  topics: ['saving', 'budget', 'investment', 'comparison'],
  minimumDay: 19,
  cooldownDays: 20,
  replayable: true,
  arcadeRewards: true,
  presentation: {
    badge: 'ESCAPE',
    shortInstruction: 'Explora objetos, resuelve cerraduras y abre la puerta final.',
    introSteps: [
      'Explora el escenario y toca los puntos que brillan.',
      'Resuelve cada cerradura para conseguir una llave financiera.',
      'Reúne las cuatro llaves y abre la puerta final.',
    ],
  },
};
