import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  AdventureDay,
  AdventureState,
  AgeBand,
  CampaignCompletionResult,
  ChildProfile,
  GameRewardResult,
  GameRunMode,
  GameUnlock,
  InventoryItem,
  Investment,
  LessonCompletionResult,
  LevelProgress,
  Wallet,
  WalletTransaction,
} from '@/core/domain/types';
import type { GameResult } from '@/core/game-runtime';
import { useAppRepository } from '@/core/data/repositories/useAppRepository';
import {
  getInvestmentOpportunityForDay,
  type InvestmentOpportunity,
} from '@/core/economy/investmentPlan';
import { calculateGameReward } from '@/core/economy/rewardRules';
import {
  buildInitialAdventureDays,
  generateAdventureDays,
} from '@/core/progression/ProgressionDirector';
import { nextVisibleLevelId } from '@/core/progression/progression';
import { GAMES, getGame } from '@/registry/games';
import { getNextInvestmentCompanion } from '@/registry/investmentCompanions';
import { LEVELS } from '@/registry/levels';
import { getFixedReward } from '@/registry/rewards';
import { getShopItem } from '@/registry/shop';

const BUFFER_DAYS = 21;

type SubmitGameOptions = {
  mode?: GameRunMode;
  campaignDay?: number | null;
};

type AppDataContextValue = {
  loading: boolean;
  profile: ChildProfile | null;
  wallet: Wallet | null;
  progress: LevelProgress[];
  transactions: WalletTransaction[];
  investments: Investment[];
  activeInvestments: Investment[];
  activeInvestment: Investment | null;
  investmentOpportunity: InvestmentOpportunity | null;
  inventory: InventoryItem[];
  adventureState: AdventureState | null;
  adventureDays: AdventureDay[];
  currentDay: number;
  gameUnlocks: GameUnlock[];
  settings: Record<string, string>;
  refresh: () => Promise<void>;
  ensureAdventureThrough: (dayNumber: number) => Promise<void>;
  saveMapPosition: (offsetX: number) => Promise<void>;
  createChildProfile: (name: string, ageBand: AgeBand) => Promise<void>;
  save: (amountCents: number) => Promise<void>;
  invest: (amountCents: number) => Promise<void>;
  unsave: (amountCents: number) => Promise<void>;
  completeLesson: (levelId: string, score: number) => Promise<LessonCompletionResult>;
  completeCampaignDay: (dayNumber: number, contentId: string, score: number) => Promise<CampaignCompletionResult>;
  submitGameResult: (result: GameResult, options?: SubmitGameOptions) => Promise<GameRewardResult>;
  buyItem: (itemId: string) => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const repository = useAppRepository();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [progress, setProgress] = useState<LevelProgress[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [adventureState, setAdventureState] = useState<AdventureState | null>(null);
  const [adventureDays, setAdventureDays] = useState<AdventureDay[]>([]);
  const [gameUnlocks, setGameUnlocks] = useState<GameUnlock[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  const hydrateAdventure = useCallback(async (
    activeProfile: ChildProfile,
    nextProgress: LevelProgress[],
  ) => {
    let state = await repository.ensureAdventureState(activeProfile.id);
    let days = await repository.getAdventureDays(activeProfile.id);

    const initialSeeds = buildInitialAdventureDays(
      LEVELS,
      GAMES,
      activeProfile.ageBand,
      nextProgress,
      getFixedReward,
    );
    await repository.ensureAdventureDays(activeProfile.id, initialSeeds);
    days = await repository.getAdventureDays(activeProfile.id);

    const throughDay = Math.max(
      state.currentDay + BUFFER_DAYS,
      initialSeeds.length + BUFFER_DAYS,
      state.highestGeneratedDay,
    );
    const generated = generateAdventureDays({
      fromDay: 1,
      throughDay,
      levels: LEVELS,
      games: GAMES,
      ageBand: activeProfile.ageBand,
      existingDays: days,
      rewardFor: getFixedReward,
    });
    await repository.ensureAdventureDays(activeProfile.id, generated);

    state = (await repository.getAdventureState(activeProfile.id)) ?? state;
    await repository.settleMaturedInvestments(activeProfile.id, state.currentDay);
    days = await repository.getAdventureDays(activeProfile.id);
    state = (await repository.getAdventureState(activeProfile.id)) ?? state;
    return { state, days };
  }, [repository]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const activeProfile = await repository.getActiveProfile();
      setProfile(activeProfile);

      if (!activeProfile) {
        setWallet(null);
        setProgress([]);
        setTransactions([]);
        setInvestments([]);
        setInventory([]);
        setAdventureState(null);
        setAdventureDays([]);
        setGameUnlocks([]);
        setSettings({});
        return;
      }

      const nextProgress = await repository.getProgress(activeProfile.id);
      const adventure = await hydrateAdventure(activeProfile, nextProgress);
      const [
        nextWallet,
        nextTransactions,
        nextInvestments,
        nextInventory,
        nextUnlocks,
        nextSettings,
      ] = await Promise.all([
        repository.getWallet(activeProfile.id),
        repository.getTransactions(activeProfile.id),
        repository.getInvestments(activeProfile.id),
        repository.getInventory(activeProfile.id),
        repository.getGameUnlocks(activeProfile.id),
        repository.getSettings(activeProfile.id),
      ]);

      setWallet(nextWallet);
      setProgress(nextProgress);
      setTransactions(nextTransactions);
      setInvestments(nextInvestments);
      setInventory(nextInventory);
      setAdventureState(adventure.state);
      setAdventureDays(adventure.days);
      setGameUnlocks(nextUnlocks);
      setSettings(nextSettings);
    } finally {
      setLoading(false);
    }
  }, [hydrateAdventure, repository]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const requireProfile = useCallback(() => {
    if (!profile) throw new Error('No active profile');
    return profile;
  }, [profile]);

  const activeInvestments = useMemo(
    () => investments.filter((investment) => investment.status === 'active'),
    [investments],
  );

  const activeInvestment = activeInvestments[0] ?? null;
  const currentDay = adventureState?.currentDay ?? 1;
  const investmentOpportunity = useMemo(
    () => (profile ? getInvestmentOpportunityForDay(currentDay) : null),
    [currentDay, profile],
  );

  const ensureAdventureThrough = useCallback(async (dayNumber: number) => {
    const activeProfile = requireProfile();
    const throughDay = Math.max(dayNumber, currentDay + BUFFER_DAYS);
    const existingDays = await repository.getAdventureDays(activeProfile.id);
    const generated = generateAdventureDays({
      fromDay: 1,
      throughDay,
      levels: LEVELS,
      games: GAMES,
      ageBand: activeProfile.ageBand,
      existingDays,
      rewardFor: getFixedReward,
    });
    await repository.ensureAdventureDays(activeProfile.id, generated);
    const [nextDays, nextState] = await Promise.all([
      repository.getAdventureDays(activeProfile.id),
      repository.getAdventureState(activeProfile.id),
    ]);
    setAdventureDays(nextDays);
    if (nextState) setAdventureState(nextState);
  }, [currentDay, repository, requireProfile]);

  const saveMapPosition = useCallback(async (offsetX: number) => {
    const activeProfile = requireProfile();
    await repository.saveMapOffset(activeProfile.id, offsetX);
    setAdventureState((previous) => previous ? { ...previous, mapOffsetX: Math.max(0, offsetX) } : previous);
  }, [repository, requireProfile]);

  const value = useMemo<AppDataContextValue>(() => ({
    loading,
    profile,
    wallet,
    progress,
    transactions,
    investments,
    activeInvestments,
    activeInvestment,
    investmentOpportunity,
    inventory,
    adventureState,
    adventureDays,
    currentDay,
    gameUnlocks,
    settings,
    refresh,
    ensureAdventureThrough,
    saveMapPosition,
    createChildProfile: async (name, ageBand) => {
      await repository.createProfile(name, ageBand, LEVELS.map((level) => level.id));
      await refresh();
    },
    save: async (amountCents) => {
      const activeProfile = requireProfile();
      await repository.applyMoneyOperation(activeProfile.id, {
        kind: 'save',
        amountCents,
        source: 'Transferencia a ahorro',
      });
      await refresh();
    },
    invest: async (amountCents) => {
      const activeProfile = requireProfile();
      const opportunity = getInvestmentOpportunityForDay(currentDay);
      await ensureAdventureThrough(opportunity.targetLevelOrder + 7);
      const companion = getNextInvestmentCompanion(investments.length);
      await repository.createInvestment(activeProfile.id, {
        principalCents: amountCents,
        createdLevelId: opportunity.createdLevelId,
        createdLevelOrder: opportunity.createdLevelOrder,
        targetLevelId: opportunity.targetLevelId,
        targetLevelOrder: opportunity.targetLevelOrder,
        companionKey: companion.key,
      });
      await refresh();
    },
    unsave: async (amountCents) => {
      const activeProfile = requireProfile();
      await repository.applyMoneyOperation(activeProfile.id, {
        kind: 'unsave',
        amountCents,
        source: 'Retiro de ahorro',
      });
      await refresh();
    },
    completeLesson: async (levelId, score) => {
      const activeProfile = requireProfile();
      const level = LEVELS.find((candidate) => candidate.id === levelId);
      if (!level) throw new Error('Nivel inexistente');
      const rewardCents = getFixedReward(level.rewardId);
      const nextLevelId = nextVisibleLevelId(LEVELS, levelId, activeProfile.ageBand);
      const result = await repository.completeLevelAndReward(
        activeProfile.id,
        levelId,
        score,
        rewardCents,
        nextLevelId,
      );
      await refresh();
      return result;
    },
    completeCampaignDay: async (dayNumber, contentId, score) => {
      const activeProfile = requireProfile();
      const day = adventureDays.find((candidate) => candidate.dayNumber === dayNumber);
      if (!day) throw new Error(`Día ${dayNumber} no disponible`);
      const level = LEVELS.find((candidate) => candidate.id === contentId);
      const nextLevelId = level ? nextVisibleLevelId(LEVELS, level.id, activeProfile.ageBand) : null;
      const result = await repository.completeAdventureDay(
        activeProfile.id,
        dayNumber,
        score,
        day.rewardCents,
        level?.id ?? null,
        nextLevelId,
      );
      await ensureAdventureThrough(result.currentDay + BUFFER_DAYS);
      await refresh();
      return result;
    },
    submitGameResult: async (result, options) => {
      const activeProfile = requireProfile();
      const game = getGame(result.gameId);
      if (!game) throw new Error('Juego inexistente');
      const mode = options?.mode ?? 'arcade';
      const campaignDay = options?.campaignDay ?? null;
      const baseRewardCents = calculateGameReward(game.rewardRuleId, result);
      const rewardResult = await repository.recordGameResult(
        activeProfile.id,
        result,
        baseRewardCents,
        mode,
        campaignDay,
      );
      if (rewardResult.currentDay !== null) {
        await ensureAdventureThrough(rewardResult.currentDay + BUFFER_DAYS);
      }
      await refresh();
      return rewardResult;
    },
    buyItem: async (itemId) => {
      const activeProfile = requireProfile();
      const item = getShopItem(itemId);
      if (!item) throw new Error('Artículo inexistente');
      await repository.purchaseItem(activeProfile.id, item.id, item.priceCents);
      await refresh();
    },
    updateSetting: async (key, settingValue) => {
      const activeProfile = requireProfile();
      await repository.setSetting(activeProfile.id, key, settingValue);
      setSettings((previous) => ({ ...previous, [key]: settingValue }));
    },
  }), [
    activeInvestment,
    activeInvestments,
    adventureDays,
    adventureState,
    currentDay,
    ensureAdventureThrough,
    gameUnlocks,
    inventory,
    investmentOpportunity,
    investments,
    loading,
    profile,
    progress,
    refresh,
    repository,
    requireProfile,
    saveMapPosition,
    settings,
    transactions,
    wallet,
  ]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData fuera de AppDataProvider');
  return value;
}
