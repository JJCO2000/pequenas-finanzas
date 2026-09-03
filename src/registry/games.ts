import type { GameManifest } from '@/core/game-runtime';
import { COIN_CATCHER_MANIFEST } from '@/features/games/coin-catcher/manifest';
export const GAMES: GameManifest[] = [COIN_CATCHER_MANIFEST];
export function getGame(id: string) { return GAMES.find((g) => g.id === id); }
