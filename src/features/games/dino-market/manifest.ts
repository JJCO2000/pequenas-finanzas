import type { GameManifest } from '@/core/game-runtime';

export const DINO_MARKET_MANIFEST: GameManifest = {
  id: 'dino-market',
  title: 'Mercado',
  description: 'Recorre los estantes, completa tu lista, compara precios y pasa por caja sin romper el presupuesto.',
  ageBands: ['6-8', '9-12'],
  learningObjective: 'Resolver compras simples con presupuesto limitado y priorizar categorías necesarias.',
  financialConcept: 'Presupuesto y comparación',
  durationSeconds: 70,
  controls: ['tap', 'choice'],
  kit: 'simulation',
  rewardRuleId: 'score-percent-50',
  componentId: 'dino-market-v1',
  topics: ['budget', 'shopping', 'comparison'],
  minimumDay: 17,
  cooldownDays: 20,
  replayable: true,
  arcadeRewards: true,
  presentation: {
    badge: 'MERCADO',
    shortInstruction: 'Arma tu carrito y pasa por caja sin rebasar el presupuesto.',
    introSteps: [
      'Revisa la lista y el presupuesto antes de llenar el carrito.',
      'Compara productos y toca los que quieres comprar.',
      'Pasa por caja solo cuando cubras la lista sin superar el límite.',
    ],
  },
};
