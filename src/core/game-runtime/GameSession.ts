import * as Crypto from 'expo-crypto';
import type { AgeBand, GameRunMode } from '@/core/domain/types';
import type { GameModifierValue, GameSession } from './GameContract';

export function createGameSession(
  gameId: string,
  profileId: string,
  ageBand: AgeBand,
  difficulty: 1 | 2 | 3 = 1,
  options?: {
    mode?: GameRunMode;
    campaignDay?: number | null;
    modifiers?: Record<string, GameModifierValue>;
  },
): GameSession {
  return {
    sessionId: Crypto.randomUUID(),
    gameId,
    profileId,
    ageBand,
    difficulty,
    mode: options?.mode ?? 'arcade',
    campaignDay: options?.campaignDay ?? null,
    modifiers: options?.modifiers ?? {},
    startedAt: Date.now(),
  };
}
