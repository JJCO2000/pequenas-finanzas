import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAppData } from '@/features/session/AppDataProvider';
import { useSfx } from '@/features/audio/SfxProvider';
import { SHOP_ITEMS } from '@/registry/shop';
import { formatMoney } from '@/core/domain/money';
import { ACTIVE_THEME } from '@/core/theme';
import { CollectibleEgg, WorldScene } from '@/features/shell/world';
import { ActionPill, CompactHeader, FloatingCard, HudPill } from '@/features/shell/gameui';
import { colors, radii, shadows, typography } from '@/core/theme/tokens';

const EGG_ACCENTS: Record<string, string> = {
  'egg-forest': '#69A95D',
  'egg-sunset': '#E67F50',
  'egg-ocean': '#59A7C8',
  'egg-volcano': '#B576C2',
};

export default function Shop() {
  const { wallet, inventory, buyItem } = useAppData();
  const { play } = useSfx();
  const owned = useMemo(() => new Set(inventory.filter((item) => item.quantity > 0).map((item) => item.itemId)), [inventory]);
  const [selectedId, setSelectedId] = useState(SHOP_ITEMS[0]?.id ?? '');
  const [message, setMessage] = useState<{ text: string; good: boolean } | null>(null);
  const selected = SHOP_ITEMS.find((item) => item.id === selectedId) ?? SHOP_ITEMS[0];

  const buy = async (id: string) => {
    try {
      await buyItem(id);
      setMessage({ text: 'Poder activado para Atrapa Monedas.', good: true });
      play('success');
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'No se pudo canjear.', good: false });
      play('error');
    }
  };

  const selectedOwned = selected ? owned.has(selected.id) : false;
  const selectedCanBuy = selected ? !selectedOwned && Boolean(wallet && wallet.availableCents >= selected.priceCents) : false;

  return (
    <WorldScene background={ACTIVE_THEME.world.shop} tone="none" contentStyle={styles.root}>
      <View style={styles.topRow}>
        <CompactHeader title="Área de canje" subtitle="Cada huevo activa un poder permanente." eyebrow="TIENDA" hero={ACTIVE_THEME.shop.featuredItem} onBack={() => router.back()} />
        <HudPill label="DISPONIBLE" value={formatMoney(wallet?.availableCents ?? 0)} icon="●" tone="gold" />
      </View>

      <View style={styles.shelfScene}>
        <View style={styles.shelfBack} />
        <View style={styles.eggRow}>
          {SHOP_ITEMS.map((item) => {
            const selectedNow = item.id === selected?.id;
            const isOwned = owned.has(item.id);
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}. ${item.effectTitle}. ${isOwned ? 'Activo' : formatMoney(item.priceCents)}`}
                onPress={() => { play('tap'); setSelectedId(item.id); setMessage(null); }}
                style={({ pressed }) => [styles.pedestalWrap, pressed && styles.pressed]}
              >
                <View style={[styles.pedestal, selectedNow && styles.pedestalSelected, isOwned && styles.pedestalOwned]}>
                  <CollectibleEgg source={item.art} accent={EGG_ACCENTS[item.id] ?? '#72AD54'} size={58} selected={selectedNow || isOwned} />
                  <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.88} style={styles.eggName}>{item.title.replace('Huevo ', '')}</Text>
                  <View style={styles.effectBadge}>
                    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.76} style={styles.effectBadgeText}>{item.effectTitle}</Text>
                  </View>
                  <View style={[styles.statePill, isOwned && styles.statePillOwned]}>
                    <Text numberOfLines={1} style={[styles.stateText, isOwned && styles.stateTextOwned]}>{isOwned ? '✓ ACTIVO' : formatMoney(item.priceCents)}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.shelfBar} />
      </View>

      {selected ? (
        <FloatingCard style={styles.detail}>
          <View style={styles.detailEgg}><CollectibleEgg source={selected.art} accent={EGG_ACCENTS[selected.id] ?? '#72AD54'} size={58} selected /></View>
          <View style={styles.detailCopy}>
            <Text style={styles.kicker}>PODER PERMANENTE · ATRAPA MONEDAS</Text>
            <View style={styles.detailTitleRow}>
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.88} style={styles.detailTitle}>{selected.title}</Text>
              <View style={[styles.detailState, selectedOwned && styles.detailStateOwned]}>
                <Text style={[styles.detailStateText, selectedOwned && styles.detailStateTextOwned]}>{selectedOwned ? '✓ ACTIVO' : 'SE ACTIVA AL CANJEAR'}</Text>
              </View>
            </View>
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.88} style={styles.effect}>{selected.effectTitle}</Text>
            <Text numberOfLines={2} style={styles.description}>{selected.effectDescription}</Text>
          </View>
          <View style={styles.detailRight}>
            <Text style={styles.detailPrice}>{selectedOwned ? 'PERMANENTE' : formatMoney(selected.priceCents)}</Text>
            <ActionPill
              label={selectedOwned ? 'PODER ACTIVO' : selectedCanBuy ? 'CANJEAR →' : 'NO ALCANZA'}
              onPress={() => { if (!selectedOwned && selectedCanBuy) void buy(selected.id); }}
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
  shelfScene: { flex: 1, minHeight: 0, justifyContent: 'center', paddingBottom: 98 },
  shelfBack: { position: 'absolute', left: '7%', right: '7%', top: '18%', height: '50%', borderRadius: 22, backgroundColor: 'rgba(93,49,31,0.30)', borderWidth: 1.5, borderColor: 'rgba(255,244,210,0.32)' },
  eggRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 10, zIndex: 3 },
  pedestalWrap: { width: 116, alignItems: 'center' },
  pedestal: { width: 110, height: 154, borderRadius: 20, backgroundColor: 'rgba(255,253,244,0.94)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', padding: 7, ...shadows.soft },
  pedestalSelected: { borderColor: '#FFD54F', transform: [{ translateY: -4 }] },
  pedestalOwned: { backgroundColor: 'rgba(240,251,232,0.97)', borderColor: '#75B66B' },
  eggName: { color: colors.forestDark, fontSize: typography.caption, lineHeight: 13, fontWeight: '900', marginTop: 1, maxWidth: 94 },
  effectBadge: { width: '100%', minHeight: 24, marginTop: 3, borderRadius: 8, backgroundColor: '#FFF1C2', paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' },
  effectBadgeText: { color: colors.forestDark, fontSize: typography.micro, lineHeight: 11, fontWeight: '900', textAlign: 'center', maxWidth: 92 },
  statePill: { marginTop: 4, minWidth: 72, borderRadius: radii.pill, backgroundColor: '#0B533A', paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center' },
  statePillOwned: { backgroundColor: '#DDF3D5', borderWidth: 1, borderColor: '#75B66B' },
  stateText: { color: colors.white, fontSize: typography.micro, lineHeight: 12, fontWeight: '900' },
  stateTextOwned: { color: colors.forestDark },
  shelfBar: { position: 'absolute', left: '8%', right: '8%', bottom: '25%', height: 14, borderRadius: 7, backgroundColor: '#5C3224', borderWidth: 1.5, borderColor: '#8C5B40', ...shadows.soft },
  detail: { position: 'absolute', left: 14, right: 14, bottom: 10, minHeight: 92, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 9 },
  detailEgg: { width: 64, alignItems: 'center' },
  detailCopy: { flex: 1, minWidth: 0 },
  kicker: { color: colors.orange, fontSize: typography.micro, lineHeight: 12, fontWeight: '900', letterSpacing: 0.45 },
  detailTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 1 },
  detailTitle: { flexShrink: 1, color: colors.forestDark, fontSize: 14, lineHeight: 16, fontWeight: '900' },
  detailState: { borderRadius: radii.pill, backgroundColor: '#FFF1C2', paddingHorizontal: 7, paddingVertical: 3 },
  detailStateOwned: { backgroundColor: '#DDF3D5' },
  detailStateText: { color: colors.orange, fontSize: typography.micro, lineHeight: 11, fontWeight: '900' },
  detailStateTextOwned: { color: colors.forestDark },
  effect: { color: colors.orange, fontSize: typography.caption, lineHeight: 13, fontWeight: '900', marginTop: 2 },
  description: { color: colors.inkMuted, fontSize: typography.micro, lineHeight: 12, fontWeight: '700', marginTop: 2 },
  detailRight: { width: 138, alignItems: 'flex-end', gap: 5 },
  detailPrice: { color: colors.forestDark, fontSize: typography.caption, lineHeight: 14, fontWeight: '900' },
  buy: { minWidth: 126, minHeight: 40 },
  toast: { position: 'absolute', top: 58, alignSelf: 'center', minWidth: 210, borderRadius: 13, paddingHorizontal: 10, paddingVertical: 7, zIndex: 30 },
  toastGood: { backgroundColor: colors.forest },
  toastBad: { backgroundColor: colors.danger },
  toastText: { color: colors.white, fontSize: typography.caption, lineHeight: 13, fontWeight: '900', textAlign: 'center' },
  pressed: { transform: [{ scale: 0.97 }] },
});
