export type AgeBand = '6-8' | '9-12';
export type ProgressStatus = 'locked' | 'available' | 'started' | 'completed';
export type WalletTransactionKind = 'earn' | 'spend' | 'save' | 'unsave' | 'invest' | 'uninvest';

export type ChildProfile = { id: string; displayName: string; ageBand: AgeBand; avatarKey: string };
export type Wallet = { profileId: string; availableCents: number; savingsCents: number; investedCents: number; lifetimeEarnedCents: number; lifetimeSpentCents: number };
export type LevelProgress = { profileId: string; levelId: string; status: ProgressStatus; stars: number; bestScore: number; attempts: number };
export type WalletTransaction = { id: number; kind: WalletTransactionKind; amountCents: number; source: string; createdAt: string };
export type InventoryItem = { itemId: string; quantity: number; acquiredAt: string };
