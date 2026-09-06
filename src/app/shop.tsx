import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAppData } from '@/features/session/AppDataProvider';
import { SHOP_ITEMS } from '@/registry/shop';
import { formatMoney } from '@/core/domain/money';
import { ACTIVE_THEME } from '@/core/theme';
import { CollectibleEgg, WorldScene } from '@/features/shell/world';
import { ActionPill, CompactHeader, FloatingCard, HudPill } from '@/features/shell/gameui';
import { colors, radii, shadows } from '@/core/theme/tokens';

const EGG_ACCENTS: Record<string, string> = {
  'egg-forest': '#69A95D',
  'egg-sunset': '#E67F50',
  'egg-ocean': '#59A7C8',
  'egg-volcano': '#B576C2',
};

export default function Shop() {
  const { wallet, inventory, buyItem } = useAppData();
  const owned = useMemo(() => new Set(inventory.filter((item) => item.quantity > 0).map((item) => item.itemId)), [inventory]);
  const [selectedId, setSelectedId] = useState(SHOP_ITEMS[0]?.id ?? '');
  const [message, setMessage] = useState<{ text: string; good: boolean } | null>(null);
  const selected = SHOP_ITEMS.find((item) => item.id === selectedId) ?? SHOP_ITEMS[0];

  const buy = async (id: string) => {
    try {
      await buyItem(id);
      setMessage({ text: 'Mejora desbloqueada.', good: true });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'No se pudo canjear.', good: false });
    }
  };

  const selectedOwned = selected ? owned.has(selected.id) : false;
  const selectedCanBuy = selected ? !selectedOwned && Boolean(wallet && wallet.availableCents >= selected.priceCents) : false;

  return (
    <WorldScene background={ACTIVE_THEME.world.shop} tone="none" contentStyle={styles.root}>
      <View style={styles.topRow}>
        <CompactHeader title="Área de canje" subtitle="Toca un huevo para ver su mejora." eyebrow="TIENDA" hero={ACTIVE_THEME.shop.featuredItem} onBack={() => router.back()} />
        <HudPill label="DISPONIBLE" value={formatMoney(wallet?.availableCents ?? 0)} icon="●" tone="gold" />
      </View>

      <View style={styles.shelfScene}>
        <View style={styles.shelfBack} />
        <View style={styles.eggRow}>
          {SHOP_ITEMS.map((item) => {
            const active = item.id === selected?.id;
            const isOwned = owned.has(item.id);
            return (
              <Pressable key={item.id} onPress={() => { setSelectedId(item.id); setMessage(null); }} style={({ pressed }) => [styles.pedestalWrap, pressed && styles.pressed]}>
                <View style={[styles.pedestal, active && styles.pedestalActive]}>
                  <CollectibleEgg source={item.art} accent={EGG_ACCENTS[item.id] ?? '#72AD54'} size={76} selected={active} />
                  <Text numberOfLines={1} style={styles.eggName}>{item.title.replace('Huevo ', '')}</Text>
                  <View style={styles.pricePill}><Text style={styles.priceText}>{isOwned ? 'TUYO' : formatMoney(item.priceCents)}</Text></View>
                </View>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.shelfBar} />
      </View>

      {selected ? (
        <FloatingCard style={styles.detail}>
          <View style={styles.detailEgg}><CollectibleEgg source={selected.art} accent={EGG_ACCENTS[selected.id] ?? '#72AD54'} size={64} selected /></View>
          <View style={styles.detailCopy}>
            <Text style={styles.kicker}>MEJORA</Text>
            <Text numberOfLines={1} style={styles.detailTitle}>{selected.title}</Text>
            <Text numberOfLines={1} style={styles.effect}>{selected.effectTitle}</Text>
            <Text numberOfLines={2} style={styles.description}>{selected.effectDescription}</Text>
          </View>
          <View style={styles.detailRight}>
            <Text style={styles.detailPrice}>{formatMoney(selected.priceCents)}</Text>
            <ActionPill
              label={selectedOwned ? 'YA ES TUYO' : selectedCanBuy ? 'CANJEAR →' : 'NO ALCANZA'}
              onPress={() => void buy(selected.id)}
              tone={selectedOwned || !selectedCanBuy ? 'light' : 'gold'}
              style={styles.buy}
            />
          </View>
        </FloatingCard>
      ) : null}

      {message ? <View style={[styles.toast, message.good ? styles.toastGood : styles.toastBad]}><Text style={styles.toastText}>{message.text}</Text></View> : null}
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 10, paddingVertical: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, zIndex: 20 },
  shelfScene: { flex: 1, minHeight: 0, justifyContent: 'center', paddingBottom: 76 },
  shelfBack: { position: 'absolute', left: '7%', right: '7%', top: '24%', height: '46%', borderRadius: 22, backgroundColor: 'rgba(93,49,31,0.30)', borderWidth: 1.5, borderColor: 'rgba(255,244,210,0.32)' },
  eggRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 16, zIndex: 3 },
  pedestalWrap: { width: 120, alignItems: 'center' },
  pedestal: { width: 112, height: 138, borderRadius: 20, backgroundColor: 'rgba(255,253,244,0.94)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', padding: 7, ...shadows.soft },
  pedestalActive: { borderColor: '#FFD54F', transform: [{ translateY: -4 }] },
  eggName: { color: colors.forestDark, fontSize: 8.5, lineHeight: 10, fontWeight: '900', marginTop: 1 },
  pricePill: { marginTop: 3, borderRadius: radii.pill, backgroundColor: '#0B533A', paddingHorizontal: 8, paddingVertical: 3 },
  priceText: { color: colors.white, fontSize: 7, fontWeight: '900' },
  shelfBar: { position: 'absolute', left: '8%', right: '8%', bottom: '25%', height: 14, borderRadius: 7, backgroundColor: '#5C3224', borderWidth: 1.5, borderColor: '#8C5B40', ...shadows.soft },
  detail: { position: 'absolute', left: 14, right: 14, bottom: 10, minHeight: 68, paddingHorizontal: 9, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailEgg: { width: 70, alignItems: 'center' },
  detailCopy: { flex: 1, minWidth: 0 },
  kicker: { color: colors.orange, fontSize: 5.5, fontWeight: '900', letterSpacing: 0.6 },
  detailTitle: { color: colors.forestDark, fontSize: 12, lineHeight: 14, fontWeight: '900' },
  effect: { color: colors.orange, fontSize: 8.5, lineHeight: 10, fontWeight: '900' },
  description: { color: colors.inkMuted, fontSize: 6.5, lineHeight: 8, fontWeight: '700', marginTop: 1 },
  detailRight: { width: 126, alignItems: 'flex-end', gap: 3 },
  detailPrice: { color: colors.forestDark, fontSize: 13, lineHeight: 15, fontWeight: '900' },
  buy: { minWidth: 112, minHeight: 30 },
  toast: { position: 'absolute', top: 54, alignSelf: 'center', minWidth: 180, borderRadius: 13, paddingHorizontal: 10, paddingVertical: 5, zIndex: 30 },
  toastGood: { backgroundColor: colors.forest },
  toastBad: { backgroundColor: colors.danger },
  toastText: { color: colors.white, fontSize: 7, fontWeight: '900', textAlign: 'center' },
  pressed: { transform: [{ scale: 0.97 }] },
});
