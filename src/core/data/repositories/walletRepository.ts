import type { SQLiteDatabase } from 'expo-sqlite';
import type { Wallet, WalletTransaction, WalletTransactionKind } from '@/core/domain/types';
import { enqueueSync, now, txLog } from './repositorySupport';

export async function getWallet(db: SQLiteDatabase, id: string): Promise<Wallet | null> {
  const row = await db.getFirstAsync<any>('SELECT * FROM wallets WHERE profile_id=?', id);
  return row
    ? {
        profileId: id,
        availableCents: row.available_cents,
        savingsCents: row.savings_cents,
        investedCents: row.invested_cents,
        lifetimeEarnedCents: row.lifetime_earned_cents,
        lifetimeSpentCents: row.lifetime_spent_cents,
      }
    : null;
}

export async function getTransactions(
  db: SQLiteDatabase,
  id: string,
): Promise<WalletTransaction[]> {
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM wallet_transactions WHERE profile_id=? ORDER BY id DESC LIMIT 60',
    id,
  );
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    amountCents: row.amount_cents,
    source: row.source,
    createdAt: row.created_at,
  }));
}

export async function applyMoneyOperation(
  db: SQLiteDatabase,
  profileId: string,
  op: { kind: WalletTransactionKind; amountCents: number; source: string },
) {
  const amount = Math.max(0, Math.trunc(op.amountCents));
  if (amount <= 0) throw new Error('Monto invalido');

  await db.withExclusiveTransactionAsync(async (tx) => {
    const wallet = await tx.getFirstAsync<any>('SELECT * FROM wallets WHERE profile_id=?', profileId);
    if (!wallet) throw new Error('Wallet inexistente');

    let available = wallet.available_cents;
    let savings = wallet.savings_cents;
    let invested = wallet.invested_cents;
    let earned = wallet.lifetime_earned_cents;
    let spent = wallet.lifetime_spent_cents;

    switch (op.kind) {
      case 'earn':
        available += amount;
        earned += amount;
        break;
      case 'spend':
        if (available < amount) throw new Error('Saldo insuficiente');
        available -= amount;
        spent += amount;
        break;
      case 'save':
        if (available < amount) throw new Error('Saldo insuficiente');
        available -= amount;
        savings += amount;
        break;
      case 'unsave':
        if (savings < amount) throw new Error('Ahorro insuficiente');
        savings -= amount;
        available += amount;
        break;
      case 'invest':
        if (available < amount) throw new Error('Saldo insuficiente');
        available -= amount;
        invested += amount;
        break;
      case 'uninvest':
        if (invested < amount) throw new Error('Inversión insuficiente');
        invested -= amount;
        available += amount;
        break;
      case 'investment_return':
        throw new Error('Los rendimientos solo pueden liquidarse desde el sistema de inversiones.');
    }

    await tx.runAsync(
      'UPDATE wallets SET available_cents=?,savings_cents=?,invested_cents=?,lifetime_earned_cents=?,lifetime_spent_cents=? WHERE profile_id=?',
      available,
      savings,
      invested,
      earned,
      spent,
      profileId,
    );
    await txLog(tx, profileId, op.kind, amount, op.source);

    const eventType =
      op.kind === 'save'
        ? 'MONEY_SAVED'
        : op.kind === 'invest'
          ? 'MONEY_INVESTED'
          : op.kind === 'spend'
            ? 'MONEY_SPENT'
            : null;
    if (eventType) {
      await tx.runAsync(
        'INSERT INTO learning_events(profile_id,event_type,payload_json,created_at) VALUES(?,?,?,?)',
        profileId,
        eventType,
        JSON.stringify({ amountCents: amount, source: op.source }),
        now(),
      );
    }
    await enqueueSync(tx, profileId, 'wallet', profileId, op.kind, { amountCents: amount, source: op.source });
  });
}
