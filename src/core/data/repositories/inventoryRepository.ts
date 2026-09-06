import type { SQLiteDatabase } from 'expo-sqlite';
import type { InventoryItem } from '@/core/domain/types';
import { enqueueSync, now, txLog } from './repositorySupport';

export async function getInventory(db: SQLiteDatabase, id: string): Promise<InventoryItem[]> {
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM inventory WHERE profile_id=? ORDER BY acquired_at ASC',
    id,
  );
  return rows.map((row) => ({
    itemId: row.item_id,
    quantity: row.quantity,
    acquiredAt: row.acquired_at,
  }));
}

export async function purchaseItem(
  db: SQLiteDatabase,
  profileId: string,
  itemId: string,
  priceCents: number,
) {
  await db.withExclusiveTransactionAsync(async (tx) => {
    const owned = await tx.getFirstAsync<{ quantity: number }>(
      'SELECT quantity FROM inventory WHERE profile_id=? AND item_id=?',
      profileId,
      itemId,
    );
    if (owned && owned.quantity > 0) throw new Error('Ya tienes esta mejora.');

    const wallet = await tx.getFirstAsync<any>(
      'SELECT available_cents FROM wallets WHERE profile_id=?',
      profileId,
    );
    if (!wallet || wallet.available_cents < priceCents) throw new Error('Saldo insuficiente');

    await tx.runAsync(
      'UPDATE wallets SET available_cents=available_cents-?,lifetime_spent_cents=lifetime_spent_cents+? WHERE profile_id=?',
      priceCents,
      priceCents,
      profileId,
    );
    await tx.runAsync(
      'INSERT INTO inventory(profile_id,item_id,quantity,acquired_at) VALUES(?,?,1,?)',
      profileId,
      itemId,
      now(),
    );
    await txLog(tx, profileId, 'spend', priceCents, `Canje: ${itemId}`);
    await tx.runAsync(
      'INSERT INTO learning_events(profile_id,event_type,content_id,payload_json,created_at) VALUES(?,?,?,?,?)',
      profileId,
      'ITEM_PURCHASED',
      itemId,
      JSON.stringify({ priceCents }),
      now(),
    );
    await enqueueSync(tx, profileId, 'inventory', itemId, 'create', { itemId, priceCents });
  });
}
