import * as Crypto from 'expo-crypto';
import type { AgeBand } from '@/core/domain/types';
import type { GameSession } from './GameContract';
export function createGameSession(gameId: string, profileId: string, ageBand: AgeBand, difficulty: 1 | 2 | 3 = 1): GameSession {
  return { sessionId: Crypto.randomUUID(), gameId, profileId, ageBand, difficulty, startedAt: Date.now() };
}
