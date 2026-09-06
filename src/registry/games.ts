import type { GameManifest } from '@/core/game-runtime';
import { COIN_CATCHER_MANIFEST } from '@/features/games/coin-catcher/manifest';
import { BALLOON_ANSWER_MANIFEST } from '@/features/games/balloon-answer/manifest';
import { TREASURE_SPLIT_MANIFEST } from '@/features/games/treasure-split/manifest';
import { DINO_MARKET_MANIFEST } from '@/features/games/dino-market/manifest';
import { FOSSIL_ESCAPE_MANIFEST } from '@/features/games/fossil-escape/manifest';
import { KING_GREEDY_MANIFEST } from '@/features/games/king-greedy/manifest';
import { MONEY_MEMORY_MANIFEST } from '@/features/games/money-memory/manifest';

export const GAMES: GameManifest[] = [
  COIN_CATCHER_MANIFEST,
  BALLOON_ANSWER_MANIFEST,
  TREASURE_SPLIT_MANIFEST,
  DINO_MARKET_MANIFEST,
  FOSSIL_ESCAPE_MANIFEST,
  KING_GREEDY_MANIFEST,
  MONEY_MEMORY_MANIFEST,
];

export function getGame(id: string) {
  return GAMES.find((game) => game.id === id);
}
