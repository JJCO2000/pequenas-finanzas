import { useMemo } from 'react';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

import {
  applyMoneyOperation,
  completeAdventureDay,
  completeLevelAndReward,
  createInvestment,
  createProfile,
  ensureAdventureDays,
  ensureAdventureState,
  getActiveProfile,
  getAdventureDays,
  getAdventureState,
  getGameUnlocks,
  getInventory,
  getInvestments,
  getProgress,
  getSettings,
  getStreakState,
  getTransactions,
  getWallet,
  purchaseItem,
  qualifyDailyStreak,
  recordGameResult,
  saveMapOffset,
  setSetting,
  settleMaturedInvestments,
  unlockGame,
} from './appRepository';
import { getDailyChallengeGameId, localDateKey, type StreakSnapshot } from '@/core/progression/streak';

function fallbackStreak(profileId: string): StreakSnapshot {
  const today = localDateKey();
  return {
    profileId,
    currentStreak: 0,
    bestStreak: 0,
    lastQualifiedDate: null,
    freezesAvailable: 0,
    lastFreezeAwardStreak: 0,
    updatedAt: new Date().toISOString(),
    today,
    challengeGameId: getDailyChallengeGameId(today),
    completedToday: false,
  };
}

export function useAppRepository() {
  const db = useSQLiteContext();

  return useMemo(() => {
    const bind = <Args extends unknown[], Result>(
      fn: (database: SQLiteDatabase, ...args: Args) => Result,
    ) => (...args: Args): Result => fn(db, ...args);

    return {
      getActiveProfile: bind(getActiveProfile),
      createProfile: bind(createProfile),
      getWallet: bind(getWallet),
      getProgress: bind(getProgress),
      getTransactions: bind(getTransactions),
      getInvestments: bind(getInvestments),
      getInventory: bind(getInventory),
      getAdventureState: bind(getAdventureState),
      ensureAdventureState: bind(ensureAdventureState),
      getAdventureDays: bind(getAdventureDays),
      ensureAdventureDays: bind(ensureAdventureDays),
      saveMapOffset: bind(saveMapOffset),
      getGameUnlocks: bind(getGameUnlocks),
      unlockGame: bind(unlockGame),
      applyMoneyOperation: bind(applyMoneyOperation),
      createInvestment: bind(createInvestment),
      settleMaturedInvestments: bind(settleMaturedInvestments),
      completeAdventureDay: bind(completeAdventureDay),
      completeLevelAndReward: bind(completeLevelAndReward),
      recordGameResult: bind(recordGameResult),
      purchaseItem: bind(purchaseItem),
      getSettings: bind(getSettings),
      setSetting: bind(setSetting),
      getStreakState: async (profileId: string) => {
        try {
          return await getStreakState(db, profileId);
        } catch {
          return fallbackStreak(profileId);
        }
      },
      qualifyDailyStreak: async (profileId: string, gameId: string) => {
        try {
          return await qualifyDailyStreak(db, profileId, gameId);
        } catch {
          return {
            snapshot: fallbackStreak(profileId),
            qualified: false,
            extended: false,
            freezeAwarded: false,
          };
        }
      },
    };
  }, [db]);
}
