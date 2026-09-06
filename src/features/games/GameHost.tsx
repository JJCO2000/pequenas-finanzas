import React from 'react';
import type { GameComponentProps } from '@/core/game-runtime';
import { CoinCatcherGame } from './coin-catcher/Game';
import { BalloonAnswerGame } from './balloon-answer/Game';
import { TreasureSplitGame } from './treasure-split/Game';
import { DinoMarketGame } from './dino-market/Game';
import { FossilEscapeGame } from './fossil-escape/Game';
import { KingGreedyGame } from './king-greedy/Game';
import { MoneyMemoryGame } from './money-memory/Game';

const COMPONENTS: Record<string, React.ComponentType<GameComponentProps>> = {
  'coin-catcher-v1': CoinCatcherGame,
  'balloon-answer-v1': BalloonAnswerGame,
  'treasure-split-v1': TreasureSplitGame,
  'dino-market-v1': DinoMarketGame,
  'fossil-escape-v1': FossilEscapeGame,
  'king-greedy-v1': KingGreedyGame,
  'money-memory-v1': MoneyMemoryGame,
};

export function GameHost({ componentId, ...props }: GameComponentProps & { componentId: string }) {
  const Component = COMPONENTS[componentId];
  if (!Component) throw new Error(`Game component no registrado: ${componentId}`);
  return <Component {...props} />;
}
