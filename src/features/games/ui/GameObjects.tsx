import React from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows } from '@/core/theme/tokens';

export function BalloonObject({ label, tone = 'orange', style }: { label: string; tone?: 'orange' | 'gold' | 'aqua' | 'green' | 'purple'; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.balloonObject, style]}>
      <View style={[styles.balloonBody, tone === 'gold' && styles.balloonGold, tone === 'aqua' && styles.balloonAqua, tone === 'green' && styles.balloonGreen, tone === 'purple' && styles.balloonPurple]}>
        <View style={styles.balloonHighlight} />
        <Text numberOfLines={2} adjustsFontSizeToFit style={styles.balloonLabel}>{label}</Text>
      </View>
      <View style={[styles.balloonKnot, tone === 'gold' && styles.knotGold, tone === 'aqua' && styles.knotAqua, tone === 'green' && styles.knotGreen, tone === 'purple' && styles.knotPurple]} />
      <View style={styles.balloonString} />
    </View>
  );
}

export function CoinSprite({ size = 34, faded = false }: { size?: number; faded?: boolean }) {
  const source = ACTIVE_THEME.coinCatcherArt?.coin ?? ACTIVE_THEME.decor.currency;
  return <Image source={source} resizeMode="contain" style={{ width: size, height: size, opacity: faded ? 0.18 : 1 }} />;
}

export function CoinPile({ count, max = 12, size = 26, style }: { count: number; max?: number; size?: number; style?: StyleProp<ViewStyle> }) {
  const safe = Math.max(0, Math.min(max, count));
  return <View style={[styles.coinPile, style]}>{Array.from({ length: safe }, (_, index) => <View key={index} style={{ marginLeft: index % 4 === 0 ? 0 : -Math.round(size * 0.22), marginTop: index >= 4 ? -Math.round(size * 0.2) : 0 }}><CoinSprite size={size} /></View>)}</View>;
}

export function FossilObject({ label, solved = false, size = 82 }: { label?: string; solved?: boolean; size?: number }) {
  return (
    <View style={[styles.fossilWrap, { width: size + 24, minHeight: size + 36 }, solved && styles.fossilSolved]}>
      <View style={[styles.fossilGlow, { width: size + 12, height: size + 12, borderRadius: (size + 12) / 2 }]} />
      <Image source={ACTIVE_THEME.decor.currency} resizeMode="contain" style={{ width: size, height: size }} />
      {label ? <Text numberOfLines={2} style={styles.fossilLabel}>{label}</Text> : null}
    </View>
  );
}

export function MemoryObject({ pairId, label, size = 68 }: { pairId: string; label: string; size?: number }) {
  let source = ACTIVE_THEME.coinCatcherArt?.coin ?? ACTIVE_THEME.decor.currency;
  if (pairId === 'saving') source = ACTIVE_THEME.decor.savings;
  if (pairId === 'need') source = ACTIVE_THEME.marketItems?.water ?? ACTIVE_THEME.decor.currency;
  if (pairId === 'invest') source = ACTIVE_THEME.characters.secondary;
  return (
    <View style={styles.memoryObject}>
      <Image source={source} resizeMode="contain" style={{ width: size, height: size }} />
      <Text numberOfLines={2} style={styles.memoryLabel}>{label}</Text>
    </View>
  );
}

export function TreasureChest({ count }: { count: number }) {
  return (
    <View style={styles.chestWrap}>
      <CoinPile count={count} max={10} size={28} style={styles.chestCoins} />
      <View style={styles.chestLid}><View style={styles.chestBand} /></View>
      <View style={styles.chestBody}><View style={styles.chestBand} /><View style={styles.chestLock}><Text style={styles.chestLockText}>◆</Text></View></View>
    </View>
  );
}

const styles = StyleSheet.create({
  balloonObject: { width: 106, height: 154, alignItems: 'center' },
  balloonBody: { width: 94, height: 110, borderRadius: 50, backgroundColor: '#F47A22', borderWidth: 3, borderColor: '#FFF8EA', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9, ...shadows.card },
  balloonGold: { backgroundColor: '#FFD34E' }, balloonAqua: { backgroundColor: '#27B8CF' }, balloonGreen: { backgroundColor: '#72AD54' }, balloonPurple: { backgroundColor: '#8C62D4' },
  balloonHighlight: { position: 'absolute', width: 20, height: 32, borderRadius: 18, left: 13, top: 11, backgroundColor: 'rgba(255,255,255,0.35)', transform: [{ rotate: '18deg' }] },
  balloonLabel: { color: colors.white, fontSize: 10, lineHeight: 12, fontWeight: '900', textAlign: 'center', maxWidth: 72 },
  balloonKnot: { width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 12, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#C35E16', marginTop: -2 },
  knotGold: { borderTopColor: '#C8A622' }, knotAqua: { borderTopColor: '#16879A' }, knotGreen: { borderTopColor: '#4E7C38' }, knotPurple: { borderTopColor: '#6844A8' },
  balloonString: { width: 2, flex: 1, minHeight: 28, backgroundColor: '#7A5B49', opacity: 0.85 },
  coinPile: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', maxWidth: 160 },
  fossilWrap: { alignItems: 'center', justifyContent: 'center', position: 'relative', paddingHorizontal: 5 },
  fossilGlow: { position: 'absolute', top: 0, backgroundColor: 'rgba(255,211,78,0.30)', borderWidth: 2, borderColor: 'rgba(255,242,178,0.85)' },
  fossilSolved: { opacity: 0.72 },
  fossilLabel: { color: '#103F2D', fontSize: 9, lineHeight: 11, fontWeight: '900', textAlign: 'center', marginTop: -4, maxWidth: 110 },
  memoryObject: { alignItems: 'center', justifyContent: 'center', gap: 5 },
  memoryLabel: { color: colors.forestDark, fontSize: 12, lineHeight: 14, fontWeight: '900', textAlign: 'center', maxWidth: 120 },
  chestWrap: { width: 142, height: 126, alignItems: 'center', justifyContent: 'flex-end', position: 'relative' },
  chestCoins: { position: 'absolute', top: 0, zIndex: 1 },
  chestLid: { width: 116, height: 36, borderTopLeftRadius: 36, borderTopRightRadius: 36, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: '#8A5B42', borderWidth: 4, borderColor: '#4B3025', zIndex: 3, overflow: 'hidden' },
  chestBody: { width: 126, height: 56, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, backgroundColor: '#A96C47', borderWidth: 4, borderColor: '#4B3025', marginTop: -3, zIndex: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  chestBand: { position: 'absolute', left: '46%', width: 14, top: 0, bottom: 0, backgroundColor: '#FFD34E', borderLeftWidth: 2, borderRightWidth: 2, borderColor: '#B68D1E' },
  chestLock: { width: 24, height: 24, borderRadius: 8, backgroundColor: '#FFD34E', borderWidth: 3, borderColor: '#6A4F17', alignItems: 'center', justifyContent: 'center', zIndex: 4 },
  chestLockText: { color: '#6A4F17', fontSize: 12, fontWeight: '900' },
});
