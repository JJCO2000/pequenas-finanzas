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
        <CompactHeader title="Área de canje" subtitle="Elige un huevo: cada uno cambia una parte del juego." eyebrow="TIENDA" hero={ACTIVE_THEME.shop.featuredItem} onBack={() => router.back()} />
        <HudPill label="DISPONIBLE" value={formatMoney(wallet?.availableCents ?? 0)} icon="●" tone="gold" />
      </View>

      <View style={styles.shelfScene}>
        <View style={styles.shelfBack} />
        <View style={styles.eggRow}>
          {SHOP_ITEMS.map((item) => {
            const active = item.id === selected?.id;
            const isOwned = owned.has(item.id);
            const accent = EGG_ACCENTS[item.id] ?? '#72AD54';
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}. ${item.effectTitle}. ${isOwned ? 'Ya es tuyo' : formatMoney(item.priceCents)}`}
                accessibilityState={{ selected: active }}
                onPress={() => { setSelectedId(item.id); setMessage(null); }}
                style={({ pressed }) => [styles.pedestalWrap, pressed && styles.pressed]}
              >
                <View style={[styles.pedestal, { borderColor: active ? accent : 'rgba(255,255,255,0.92)' }, active && styles.pedestalActive]}>
                  {active ? <View style={[styles.selectedFlag, { backgroundColor: accent }]}><Text style={styles.selectedFlagText}>ELEGIDO</Text></View> : null}
                  <CollectibleEgg source={item.art} accent={accent} size={86} selected={active} />
                  <Text numberOfLines={1} style={styles.eggName}>{item.title.replace('Huevo ', '')}</Text>
                  <Text numberOfLines={1} style={[styles.effectTag, { color: accent }]}>{item.effectTitle}</Text>
                  <View style={[styles.pricePill, isOwned && styles.priceOwned]}><Text style={styles.priceText}>{isOwned ? 'TUYO' : formatMoney(item.priceCents)}</Text></View>
                </View>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.shelfBar} />
      </View>

      {selected ? (
        <FloatingCard style={styles.detail}>
          <View style={styles.detailEgg}><CollectibleEgg source={selected.art} accent={EGG_ACCENTS[selected.id] ?? '#72AD54'} size={68} selected /></View>
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
              disabled={selectedOwned || !selectedCanBuy}
              accessibilityLabel={selectedOwned ? `${selected.title}, ya es tuyo` : selectedCanBuy ? `Canjear ${selected.title}` : `${selected.title}, saldo insuficiente`}
              tone={selectedOwned || !selectedCanBuy ? 'light' : 'gold'}
              style={styles.buy}
            />
          </View>
        </FloatingCard>
      ) : null}

      {message ? <View accessibilityLiveRegion="polite" style={[styles.toast, message.good ? styles.toastGood : styles.toastBad]}><Text style={styles.toastText}>{message.text}</Text></View> : null}
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 10, paddingVertical: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, zIndex: 20 },
  shelfScene: { flex: 1, minHeight: 0, justifyContent: 'center', paddingBottom: 78 },
  shelfBack: { position: 'absolute', left: '6%', right: '6%', top: '21%', height: '51%', borderRadius: 24, backgroundColor: 'rgba(72,39,27,0.34)', borderWidth: 2, borderColor: 'rgba(255,244,210,0.38)' },
  eggRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 12, zIndex: 3 },
  pedestalWrap: { width: 126, alignItems: 'center' },
  pedestal: { width: 120, height: 150, borderRadius: 22, backgroundColor: 'rgba(255,253,244,0.96)', borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, paddingTop: 6, paddingBottom: 5, ...shadows.card },
  pedestalActive: { transform: [{ translateY: -6 }, { scale: 1.025 }] },
  selectedFlag: { position: 'absolute', top: 5, right: 6, zIndex: 8, borderRadius: radii.pill, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.78)' },
  selectedFlagText: { color: colors.white, fontSize: 4.8, lineHeight: 6, fontWeight: '900', letterSpacing: 0.45 },
  eggName: { color: colors.forestDark, fontSize: 9, lineHeight: 10.5, fontWeight: '900', marginTop: -4 },
  effectTag: { fontSize: 6.1, lineHeight: 7.5, fontWeight: '900', marginTop: 1, maxWidth: 100, textAlign: 'center' },
  pricePill: { marginTop: 3, borderRadius: radii.pill, backgroundColor: '#0B533A', paddingHorizontal: 8, paddingVertical: 3 },
  priceOwned: { backgroundColor: '#5D8756' },
  priceText: { color: colors.white, fontSize: 7, fontWeight: '900' },
  shelfBar: { position: 'absolute', left: '7%', right: '7%', bottom: '24%', height: 15, borderRadius: 8, backgroundColor: '#512E23', borderWidth: 2, borderColor: '#8C5B40', ...shadows.soft },
  detail: { position: 'absolute', left: 14, right: 14, bottom: 10, minHeight: 70, paddingHorizontal: 9, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailEgg: { width: 78, alignItems: 'center' },
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
