import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAppData } from '@/features/session/AppDataProvider';
import { SHOP_ITEMS } from '@/registry/shop';
import { formatMoney } from '@/core/domain/money';
import { ACTIVE_THEME } from '@/core/theme';
import { CollectibleEgg, WorldScene } from '@/features/shell/world';
import { ActionPill, CompactHeader, FloatingCard, HudPill } from '@/features/shell/gameui';
import { colors, radii, shadows } from '@/core/theme/tokens';

const EGG_META: Record<string, { accent: string; dark: string; motif: string; rarity: string }> = {
  'egg-forest': { accent: '#69A95D', dark: '#245D39', motif: '🌿', rarity: 'COMÚN' },
  'egg-sunset': { accent: '#E67F50', dark: '#874126', motif: '☀', rarity: 'RARO' },
  'egg-ocean': { accent: '#59A7C8', dark: '#245E78', motif: '🌊', rarity: 'ÉPICO' },
  'egg-volcano': { accent: '#B576C2', dark: '#683A73', motif: '🔥', rarity: 'LEGENDARIO' },
};

export default function Shop() {
  const { wallet, inventory, buyItem } = useAppData();
  const owned = useMemo(() => new Set(inventory.filter((item) => item.quantity > 0).map((item) => item.itemId)), [inventory]);
  const [selectedId, setSelectedId] = useState(SHOP_ITEMS[0]?.id ?? '');
  const [message, setMessage] = useState<{ text: string; good: boolean } | null>(null);
  const selected = SHOP_ITEMS.find((item) => item.id === selectedId) ?? SHOP_ITEMS[0];
  const selectedMeta = EGG_META[selected?.id ?? ''] ?? EGG_META['egg-forest']!;
  const wobble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    wobble.setValue(0);
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(wobble, { toValue: 1, duration: 850, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: -1, duration: 900, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: 0, duration: 750, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [selectedId, wobble]);

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
        <CompactHeader title="Área de canje" subtitle="Cada huevo es una reliquia distinta y cambia tu juego." eyebrow="TIENDA" hero={ACTIVE_THEME.shop.featuredItem} onBack={() => router.back()} />
        <HudPill label="DISPONIBLE" value={formatMoney(wallet?.availableCents ?? 0)} icon="●" tone="gold" />
      </View>

      <View style={styles.shelfScene}>
        <View style={styles.shelfBack} />
        <View style={styles.eggRow}>
          {SHOP_ITEMS.map((item) => {
            const active = item.id === selected?.id;
            const isOwned = owned.has(item.id);
            const meta = EGG_META[item.id] ?? EGG_META['egg-forest']!;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}. ${item.effectTitle}. ${meta.rarity}. ${isOwned ? 'Ya es tuyo' : formatMoney(item.priceCents)}`}
                accessibilityState={{ selected: active }}
                onPress={() => { setSelectedId(item.id); setMessage(null); }}
                style={({ pressed }) => [styles.pedestalWrap, pressed && styles.pressed]}
              >
                <View style={[styles.pedestal, { borderColor: active ? meta.accent : 'rgba(255,255,255,0.92)' }, active && styles.pedestalActive]}>
                  <View style={[styles.worldPortal, { backgroundColor: meta.dark, borderColor: meta.accent }]}>
                    <Text style={styles.motifBig}>{meta.motif}</Text>
                    <View style={[styles.portalRing, { borderColor: meta.accent }]} />
                    <CollectibleEgg source={item.art} accent={meta.accent} size={83} selected={active} />
                    <Text style={[styles.rarity, { backgroundColor: meta.accent }]}>{meta.rarity}</Text>
                  </View>
                  <Text numberOfLines={1} style={styles.eggName}>{item.title.replace('Huevo ', '')}</Text>
                  <Text numberOfLines={1} style={[styles.effectTag, { color: meta.dark }]}>{item.effectTitle}</Text>
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
          <View style={[styles.detailEggWorld, { backgroundColor: selectedMeta.dark, borderColor: selectedMeta.accent }]}>
            <Text style={styles.detailMotif}>{selectedMeta.motif}</Text>
            <Animated.View style={{ transform: [{ rotate: wobble.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-3deg', '0deg', '3deg'] }) }, { scale: wobble.interpolate({ inputRange: [-1, 0, 1], outputRange: [1.01, 1.06, 1.01] }) }] }}>
              <CollectibleEgg source={selected.art} accent={selectedMeta.accent} size={72} selected />
            </Animated.View>
          </View>
          <View style={styles.detailCopy}>
            <View style={styles.detailKickerRow}><Text style={styles.kicker}>RELIQUIA · {selectedMeta.rarity}</Text><Text style={[styles.effectChip, { backgroundColor: selectedMeta.accent }]}>{selectedMeta.motif}</Text></View>
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
  root: { paddingHorizontal: 10, paddingVertical: 8 }, topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, zIndex: 20 },
  shelfScene: { flex: 1, minHeight: 0, justifyContent: 'center', paddingBottom: 78 }, shelfBack: { position: 'absolute', left: '6%', right: '6%', top: '20%', height: '53%', borderRadius: 24, backgroundColor: 'rgba(72,39,27,0.40)', borderWidth: 2, borderColor: 'rgba(255,244,210,0.44)' }, eggRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 12, zIndex: 3 },
  pedestalWrap: { width: 132, alignItems: 'center' }, pedestal: { width: 126, height: 163, borderRadius: 22, backgroundColor: 'rgba(255,253,244,0.97)', borderWidth: 3, alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 6, paddingTop: 7, paddingBottom: 5, ...shadows.card }, pedestalActive: { transform: [{ translateY: -8 }, { scale: 1.035 }] },
  worldPortal: { width: 112, height: 108, borderRadius: 24, borderWidth: 3, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }, portalRing: { position: 'absolute', width: 92, height: 92, borderRadius: 46, borderWidth: 3, opacity: 0.7 }, motifBig: { position: 'absolute', fontSize: 53, opacity: 0.16, transform: [{ rotate: '-12deg' }] }, rarity: { position: 'absolute', top: 5, right: 5, borderRadius: radii.pill, color: colors.white, fontSize: 4.8, fontWeight: '900', letterSpacing: 0.5, paddingHorizontal: 5, paddingVertical: 2, overflow: 'hidden' },
  eggName: { color: colors.forestDark, fontSize: 9.3, fontWeight: '900', marginTop: 3 }, effectTag: { fontSize: 6.2, lineHeight: 7.5, fontWeight: '900', marginTop: 1, maxWidth: 108, textAlign: 'center' }, pricePill: { marginTop: 3, borderRadius: radii.pill, backgroundColor: '#0B533A', paddingHorizontal: 8, paddingVertical: 3 }, priceOwned: { backgroundColor: '#5D8756' }, priceText: { color: colors.white, fontSize: 7, fontWeight: '900' },
  shelfBar: { position: 'absolute', left: '7%', right: '7%', bottom: '23%', height: 15, borderRadius: 8, backgroundColor: '#512E23', borderWidth: 2, borderColor: '#8C5B40', ...shadows.soft },
  detail: { position: 'absolute', left: 14, right: 14, bottom: 10, minHeight: 76, paddingHorizontal: 9, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 9 }, detailEggWorld: { width: 92, height: 68, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, detailMotif: { position: 'absolute', fontSize: 44, opacity: 0.2 }, detailCopy: { flex: 1, minWidth: 0 }, detailKickerRow: { flexDirection: 'row', alignItems: 'center', gap: 5 }, kicker: { color: colors.orange, fontSize: 5.5, fontWeight: '900', letterSpacing: 0.6 }, effectChip: { color: colors.white, fontSize: 7, borderRadius: radii.pill, paddingHorizontal: 5, paddingVertical: 1, overflow: 'hidden' }, detailTitle: { color: colors.forestDark, fontSize: 12, lineHeight: 14, fontWeight: '900' }, effect: { color: colors.orange, fontSize: 8.5, fontWeight: '900' }, description: { color: colors.inkMuted, fontSize: 6.5, lineHeight: 8, fontWeight: '700', marginTop: 1 }, detailRight: { width: 126, alignItems: 'flex-end', gap: 3 }, detailPrice: { color: colors.forestDark, fontSize: 13, fontWeight: '900' }, buy: { minWidth: 112, minHeight: 30 },
  toast: { position: 'absolute', top: 54, alignSelf: 'center', minWidth: 180, borderRadius: 13, paddingHorizontal: 10, paddingVertical: 5, zIndex: 30 }, toastGood: { backgroundColor: colors.forest }, toastBad: { backgroundColor: colors.danger }, toastText: { color: colors.white, fontSize: 7, fontWeight: '900', textAlign: 'center' }, pressed: { transform: [{ scale: 0.97 }] },
});
