import type { GameManifest } from '@/core/game-runtime';
export const COIN_CATCHER_MANIFEST: GameManifest = {
  id:'coin-catcher', title:'Atrapa monedas', description:'Arrastra la canasta y atrapa monedas antes de que termine el tiempo.', ageBands:['6-8','9-12'],
  learningObjective:'Practicar que ganar recursos requiere acción y que la recompensa luego debe administrarse.', financialConcept:'Ingreso y decisión de uso', durationSeconds:30,
  controls:['drag'], kit:'arcade', rewardRuleId:'coin-catcher-score', componentId:'coin-catcher-v1',
};
