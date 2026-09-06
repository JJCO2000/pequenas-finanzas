export type AgeBand = '6-8' | '9-12';
export type ProgressStatus = 'locked' | 'available' | 'started' | 'completed';
export type WalletTransactionKind =
  | 'earn'
  | 'spend'
  | 'save'
  | 'unsave'
  | 'invest'
  | 'uninvest'
  | 'investment_return';

export type InvestmentStatus = 'active' | 'claimed';
export type InvestmentCompanionKey = 'companion-1' | 'companion-2' | 'companion-3' | 'companion-4';
export type AdventureNodeType = 'lesson' | 'activity' | 'game' | 'decision' | 'review' | 'challenge';
export type GameRunMode = 'campaign' | 'arcade';

export type ChildProfile = {
  id: string;
  displayName: string;
  ageBand: AgeBand;
  avatarKey: string;
};

export type Wallet = {
  profileId: string;
  availableCents: number;
  savingsCents: number;
  investedCents: number;
  lifetimeEarnedCents: number;
  lifetimeSpentCents: number;
};

export type LevelProgress = {
  profileId: string;
  levelId: string;
  status: ProgressStatus;
  stars: number;
  bestScore: number;
  attempts: number;
};

export type WalletTransaction = {
  id: number;
  kind: WalletTransactionKind;
  amountCents: number;
  source: string;
  createdAt: string;
};

export type InventoryItem = {
  itemId: string;
  quantity: number;
  acquiredAt: string;
};

export type Investment = {
  id: string;
  profileId: string;
  principalCents: number;
  profitCents: number;
  payoutCents: number;
  createdLevelId: string;
  createdLevelOrder: number;
  targetLevelId: string;
  targetLevelOrder: number;
  companionKey: InvestmentCompanionKey;
  status: InvestmentStatus;
  createdAt: string;
  claimedAt: string | null;
};

export type AdventureState = {
  profileId: string;
  currentDay: number;
  highestGeneratedDay: number;
  mapOffsetX: number;
  updatedAt: string;
};

export type AdventureDay = {
  profileId: string;
  dayNumber: number;
  nodeType: AdventureNodeType;
  contentId: string | null;
  gameId: string | null;
  concept: string;
  title: string;
  rewardCents: number;
  completed: boolean;
  generatedAt: string;
  completedAt: string | null;
};

export type AdventureDaySeed = Omit<
  AdventureDay,
  'profileId' | 'completed' | 'generatedAt' | 'completedAt'
> & {
  completed?: boolean;
};

export type GameUnlock = {
  profileId: string;
  gameId: string;
  unlockedDay: number;
  unlockedAt: string;
};

export type LessonCompletionResult = {
  awarded: boolean;
  maturedInvestment: Investment | null;
  maturedInvestments: Investment[];
};

export type CampaignCompletionResult = {
  awarded: boolean;
  rewardCents: number;
  currentDay: number;
  maturedInvestments: Investment[];
};

export type GameRewardResult = {
  recorded: boolean;
  rewardCents: number;
  baseRewardCents: number;
  multiplier: number;
  currentDay: number | null;
  maturedInvestments: Investment[];
};
