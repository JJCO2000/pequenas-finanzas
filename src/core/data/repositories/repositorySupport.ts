import { Platform } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  AdventureDay,
  AdventureState,
  Investment,
  InvestmentCompanionKey,
  WalletTransactionKind,
} from '@/core/domain/types';

export const ACTIVE_PROFILE_STATE_KEY = 'active_profile_id';
export const now = () => new Date().toISOString();

export async function withWriteTransaction(
  db: SQLiteDatabase,
  task: (tx: SQLiteDatabase) => Promise<void>,
) {
  if (Platform.OS === 'web') {
    await db.withTransactionAsync(() => task(db));
    return;
  }
  await db.withExclusiveTransactionAsync(task);
}

const LEGACY_INVESTMENT_COMPANION_KEYS: Record<string, InvestmentCompanionKey> = {
  stegosaurus: 'companion-1',
  trex: 'companion-2',
  longneck: 'companion-3',
  raptorGreen: 'companion-4',
};

export function normalizeInvestmentCompanionKey(value: unknown): InvestmentCompanionKey {
  if (value === 'companion-1' || value === 'companion-2' || value === 'companion-3' || value === 'companion-4') return value;
  return LEGACY_INVESTMENT_COMPANION_KEYS[String(value)] ?? 'companion-1';
}

export function mapInvestment(row: any): Investment {
  return {
    id: row.id,
    profileId: row.profile_id,
    principalCents: row.principal_cents,
    profitCents: row.profit_cents,
    payoutCents: row.payout_cents,
    createdLevelId: row.created_level_id,
    createdLevelOrder: row.created_level_order,
    targetLevelId: row.target_level_id,
    targetLevelOrder: row.target_level_order,
    companionKey: normalizeInvestmentCompanionKey(row.dinosaur_key),
    status: row.status,
    createdAt: row.created_at,
    claimedAt: row.claimed_at ?? null,
  };
}

export function mapAdventureState(row: any): AdventureState {
  return {
    profileId: row.profile_id,
    currentDay: row.current_day,
    highestGeneratedDay: row.highest_generated_day,
    mapOffsetX: Number(row.map_offset_x ?? 0),
    updatedAt: row.updated_at,
  };
}

export function mapAdventureDay(row: any): AdventureDay {
  return {
    profileId: row.profile_id,
    dayNumber: row.day_number,
    nodeType: row.node_type,
    contentId: row.content_id ?? null,
    gameId: row.game_id ?? null,
    concept: row.concept,
    title: row.title,
    rewardCents: row.reward_cents,
    completed: Boolean(row.completed),
    generatedAt: row.generated_at,
    completedAt: row.completed_at ?? null,
  };
}

export async function txLog(
  tx: SQLiteDatabase,
  profileId: string,
  kind: WalletTransactionKind,
  amountCents: number,
  source: string,
) {
  await tx.runAsync(
    'INSERT INTO wallet_transactions(profile_id,kind,amount_cents,source,created_at) VALUES(?,?,?,?,?)',
    profileId,
    kind,
    amountCents,
    source,
    now(),
  );
}

export async function enqueueSync(
  tx: SQLiteDatabase,
  profileId: string,
  entityType: string,
  entityId: string,
  operation: string,
  payload: unknown,
) {
  await tx.runAsync(
    'INSERT INTO sync_outbox(profile_id,entity_type,entity_id,operation,payload_json,status,created_at) VALUES(?,?,?,?,?,\'pending\',?)',
    profileId,
    entityType,
    entityId,
    operation,
    JSON.stringify(payload),
    now(),
  );
}
