import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { Investment, InvestmentCompanionKey } from '@/core/domain/types';
import { calculateInvestmentPayout, calculateInvestmentProfit, INVESTMENT_TERM_LEVELS } from '@/core/economy/investmentPlan';
import { enqueueSync, mapInvestment, now, txLog } from './repositorySupport';

export async function getInvestments(db: SQLiteDatabase, id: string): Promise<Investment[]> {
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM investments WHERE profile_id=? ORDER BY created_level_order ASC,created_at ASC',
    id,
  );
  return rows.map(mapInvestment);
}

export async function createInvestment(
  db: SQLiteDatabase,
  profileId: string,
  input: {
    principalCents: number;
    createdLevelId: string;
    createdLevelOrder: number;
    targetLevelId: string;
    targetLevelOrder: number;
    companionKey: InvestmentCompanionKey;
  },
): Promise<Investment> {
  const id = Crypto.randomUUID();
  const timestamp = now();
  const principal = Math.max(0, Math.trunc(input.principalCents));
  if (principal <= 0) throw new Error('Monto de inversión inválido');
  if (input.targetLevelOrder - input.createdLevelOrder !== INVESTMENT_TERM_LEVELS) {
    throw new Error(`La inversión debe vencer exactamente ${INVESTMENT_TERM_LEVELS} días después.`);
  }
  const profitCents = calculateInvestmentProfit(principal);
  const payoutCents = calculateInvestmentPayout(principal);

  await db.withExclusiveTransactionAsync(async (tx) => {
    const wallet = await tx.getFirstAsync<{ available_cents: number }>(
      'SELECT available_cents FROM wallets WHERE profile_id=?',
      profileId,
    );
    if (!wallet || wallet.available_cents < principal) throw new Error('Saldo insuficiente');

    await tx.runAsync(
      'UPDATE wallets SET available_cents=available_cents-?,invested_cents=invested_cents+? WHERE profile_id=?',
      principal,
      principal,
      profileId,
    );
    await tx.runAsync(
      `INSERT INTO investments(
        id,profile_id,principal_cents,profit_cents,payout_cents,
        created_level_id,created_level_order,target_level_id,target_level_order,
        dinosaur_key,status,created_at,claimed_at
      ) VALUES(?,?,?,?,?,?,?,?,?,?, 'active', ?, NULL)`,
      id,
      profileId,
      principal,
      profitCents,
      payoutCents,
      input.createdLevelId,
      input.createdLevelOrder,
      input.targetLevelId,
      input.targetLevelOrder,
      input.companionKey,
      timestamp,
    );
    await txLog(tx, profileId, 'invest', principal, `Inversión rumbo al día ${input.targetLevelOrder}`);
    await tx.runAsync(
      'INSERT INTO learning_events(profile_id,event_type,content_id,payload_json,created_at) VALUES(?,?,?,?,?)',
      profileId,
      'INVESTMENT_CREATED',
      id,
      JSON.stringify({
        principalCents: principal,
        payoutCents,
        targetDay: input.targetLevelOrder,
        companionKey: input.companionKey,
      }),
      timestamp,
    );
    await enqueueSync(tx, profileId, 'investment', id, 'create', { ...input, profitCents, payoutCents });
  });

  return {
    id,
    profileId,
    principalCents: principal,
    profitCents,
    payoutCents,
    createdLevelId: input.createdLevelId,
    createdLevelOrder: input.createdLevelOrder,
    targetLevelId: input.targetLevelId,
    targetLevelOrder: input.targetLevelOrder,
    companionKey: input.companionKey,
    status: 'active',
    createdAt: timestamp,
    claimedAt: null,
  };
}

export async function claimMaturedInvestmentsTx(
  tx: SQLiteDatabase,
  profileId: string,
  reachedDay: number,
): Promise<Investment[]> {
  const rows = await tx.getAllAsync<any>(
    "SELECT * FROM investments WHERE profile_id=? AND status='active' AND target_level_order<=? ORDER BY target_level_order ASC,created_at ASC",
    profileId,
    reachedDay,
  );
  if (rows.length === 0) return [];

  const investments = rows.map(mapInvestment);
  const payoutTotal = investments.reduce((sum, item) => sum + item.payoutCents, 0);
  const principalTotal = investments.reduce((sum, item) => sum + item.principalCents, 0);
  const profitTotal = investments.reduce((sum, item) => sum + item.profitCents, 0);

  await tx.runAsync(
    `UPDATE wallets
     SET available_cents=available_cents+?,
         invested_cents=MAX(0,invested_cents-?),
         lifetime_earned_cents=lifetime_earned_cents+?
     WHERE profile_id=?`,
    payoutTotal,
    principalTotal,
    profitTotal,
    profileId,
  );

  const claimedAt = now();
  for (const investment of investments) {
    await tx.runAsync(
      "UPDATE investments SET status='claimed',claimed_at=? WHERE id=? AND status='active'",
      claimedAt,
      investment.id,
    );
    const returnPercent = Math.round((investment.profitCents / Math.max(1, investment.principalCents)) * 100);
    await txLog(
      tx,
      profileId,
      'investment_return',
      investment.payoutCents,
      `Inversión cobrada en día ${investment.targetLevelOrder} (+${returnPercent}%)`,
    );
    await tx.runAsync(
      'INSERT INTO learning_events(profile_id,event_type,content_id,payload_json,created_at) VALUES(?,?,?,?,?)',
      profileId,
      'INVESTMENT_MATURED',
      investment.id,
      JSON.stringify({
        principalCents: investment.principalCents,
        profitCents: investment.profitCents,
        payoutCents: investment.payoutCents,
        targetDay: investment.targetLevelOrder,
      }),
      claimedAt,
    );
    await enqueueSync(tx, profileId, 'investment', investment.id, 'claim', {
      claimedAt,
      reachedDay,
      payoutCents: investment.payoutCents,
    });
  }

  return investments.map((investment) => ({ ...investment, status: 'claimed', claimedAt }));
}

export async function settleMaturedInvestments(
  db: SQLiteDatabase,
  profileId: string,
  reachedDay: number,
) {
  let result: Investment[] = [];
  await db.withExclusiveTransactionAsync(async (tx) => {
    result = await claimMaturedInvestmentsTx(tx, profileId, reachedDay);
  });
  return result;
}
