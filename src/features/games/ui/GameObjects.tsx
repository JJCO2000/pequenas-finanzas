import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, shadows } from '@/core/theme/tokens';

const BALLOON_TONES = {
  orange: { body: '#F47A22', shade: '#B94710', knot: '#A83F0D' },
  gold: { body: '#FFD34E', shade: '#D6A920', knot: '#B78A12' },
  aqua: { body: '#27B8CF', shade: '#14859A', knot: '#116C7C' },
  green: { body: '#72AD54', shade: '#477A35', knot: '#3E692F' },
  purple: { body: '#8C62D4', shade: '#6540A6', knot: '#573690' },
} as const;

type BalloonTone = keyof typeof BALLOON_TONES;

export function BalloonObject({ label, tone = 'orange', style }: { label: string; tone?: BalloonTone; style?: StyleProp<ViewStyle> }) {
  const palette = BALLOON_TONES[tone];
  return (
    <View style={[styles.balloonObject, style]}>
      <View style={[styles.balloonBody, { backgroundColor: palette.body, borderColor: palette.shade }]}>
        <View style={[styles.balloonShade, { backgroundColor: palette.shade }]} />
        <View style={styles.balloonHighlightWide} />
        <View style={styles.balloonHighlightDot} />
        <View style={styles.balloonTag}>
          <Text numberOfLines={2} adjustsFontSizeToFit style={styles.balloonLabel}>{label}</Text>
        </View>
      </View>
      <View style={[styles.balloonKnot, { borderTopColor: palette.knot }]} />
      <View style={styles.stringWrap}>
        <View style={[styles.stringSegment, styles.stringOne]} />
        <View style={[styles.stringSegment, styles.stringTwo]} />
        <View style={[styles.stringSegment, styles.stringThree]} />
      </View>
    </View>
  );
}

export function CoinSprite({ size = 34, faded = false }: { size?: number; faded?: boolean }) {
  const source = ACTIVE_THEME.coinCatcherArt?.coin ?? ACTIVE_THEME.decor.currency;
  return <Image source={source} resizeMode="contain" style={{ width: size, height: size, opacity: faded ? 0.18 : 1 }} />;
}

export function CoinPile({ count, max = 12, size = 26, style }: { count: number; max?: number; size?: number; style?: StyleProp<ViewStyle> }) {
  const safe = Math.max(0, Math.min(max, count));
  return (
    <View style={[styles.coinPile, style]}>
      {Array.from({ length: safe }, (_, index) => (
        <View key={index} style={{ marginLeft: index % 4 === 0 ? 0 : -Math.round(size * 0.22), marginTop: index >= 4 ? -Math.round(size * 0.2) : 0 }}>
          <CoinSprite size={size} />
        </View>
      ))}
    </View>
  );
}

export function FossilObject({ label, solved = false, size = 82 }: { label?: string; solved?: boolean; size?: number }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (solved) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 850, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, solved]);

  return (
    <View style={[styles.fossilWrap, { width: size + 30, minHeight: size + 42 }, solved && styles.fossilSolved]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.fossilGlow,
          {
            width: size + 18,
            height: size + 18,
            borderRadius: (size + 18) / 2,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.88] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1.12] }) }],
          },
        ]}
      />
      <View style={[styles.fossilStone, { width: size + 10, height: size + 10, borderRadius: (size + 10) / 2 }]}>
        <View style={styles.fossilStoneHighlight} />
        <Image source={ACTIVE_THEME.decor.currency} resizeMode="contain" style={{ width: size, height: size }} />
      </View>
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
      <View style={[styles.memoryMedallion, { width: size + 18, height: size + 18, borderRadius: (size + 18) / 2 }]}>
        <View style={styles.memoryShine} />
        <Image source={source} resizeMode="contain" style={{ width: size, height: size }} />
      </View>
      <Text numberOfLines={2} style={styles.memoryLabel}>{label}</Text>
    </View>
  );
}

export function TreasureChest({ count }: { count: number }) {
  const idle = useRef(new Animated.Value(0)).current;
  const hasTreasure = count > 0;

  useEffect(() => {
    idle.stopAnimation();
    if (!hasTreasure) {
      idle.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(idle, { toValue: 1, duration: 1050, useNativeDriver: true }),
        Animated.timing(idle, { toValue: 0, duration: 1150, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [hasTreasure, idle]);

  const lidTransform = hasTreasure
    ? [
        { translateY: idle.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) },
        { rotate: idle.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-2.5deg'] }) },
      ]
    : undefined;

  return (
    <View style={[styles.chestWrap, !hasTreasure && styles.chestEmpty]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.chestGlow,
          {
            opacity: hasTreasure ? idle.interpolate({ inputRange: [0, 1], outputRange: [0.24, 0.7] }) : 0,
            transform: [{ scale: hasTreasure ? idle.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.08] }) : 0.9 }],
          },
        ]}
      />
      {hasTreasure ? <CoinPile count={count} max={10} size={27} style={styles.chestCoins} /> : null}
      {hasTreasure ? (
        <>
          <Animated.Text style={[styles.sparkle, styles.sparkleOne, { opacity: idle }]}>✦</Animated.Text>
          <Animated.Text style={[styles.sparkle, styles.sparkleTwo, { opacity: idle.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0.15] }) }]}>✦</Animated.Text>
        </>
      ) : null}
      <Animated.View style={[styles.chestLid, { transform: lidTransform }]}>
        <View style={styles.woodPlankTop} />
        <View style={styles.chestBand} />
        <View style={[styles.rivet, styles.rivetLidLeft]} />
        <View style={[styles.rivet, styles.rivetLidRight]} />
      </Animated.View>
      <View style={styles.chestBody}>
        <View style={styles.woodPlankBody} />
        <View style={styles.chestBand} />
        <View style={[styles.rivet, styles.rivetBodyLeft]} />
        <View style={[styles.rivet, styles.rivetBodyRight]} />
        <View style={styles.chestLock}><Text style={styles.chestLockText}>◆</Text></View>
      </View>
      <View style={styles.chestFeet}><View style={styles.chestFoot} /><View style={styles.chestFoot} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  balloonObject: { width: 88, height: 128, alignItems: 'center' },
  balloonBody: {
    width: 82,
    height: 94,
    borderTopLeftRadius: 43,
    borderTopRightRadius: 43,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card,
  },
  balloonShade: { position: 'absolute', right: -15, bottom: -8, width: 43, height: 95, borderRadius: 45, opacity: 0.32, transform: [{ rotate: '12deg' }] },
  balloonHighlightWide: { position: 'absolute', width: 15, height: 37, borderRadius: 16, left: 11, top: 9, backgroundColor: 'rgba(255,255,255,0.42)', transform: [{ rotate: '18deg' }] },
  balloonHighlightDot: { position: 'absolute', width: 7, height: 7, borderRadius: 4, left: 29, top: 11, backgroundColor: 'rgba(255,255,255,0.72)' },
  balloonTag: { minWidth: 56, maxWidth: 68, minHeight: 27, borderRadius: 12, backgroundColor: 'rgba(255,251,239,0.90)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 5, paddingVertical: 3, alignItems: 'center', justifyContent: 'center' },
  balloonLabel: { color: '#214332', fontSize: 8.6, lineHeight: 10.2, fontWeight: '900', textAlign: 'center', maxWidth: 60 },
  balloonKnot: { width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -1 },
  stringWrap: { width: 24, height: 25, position: 'relative' },
  stringSegment: { position: 'absolute', width: 1.5, height: 11, borderRadius: 1, backgroundColor: '#6E584E', opacity: 0.82 },
  stringOne: { left: 11, top: 0, transform: [{ rotate: '10deg' }] },
  stringTwo: { left: 9, top: 8, transform: [{ rotate: '-18deg' }] },
  stringThree: { left: 11, top: 16, transform: [{ rotate: '15deg' }] },
  coinPile: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', maxWidth: 160 },
  fossilWrap: { alignItems: 'center', justifyContent: 'center', position: 'relative', paddingHorizontal: 5 },
  fossilGlow: { position: 'absolute', top: 1, backgroundColor: 'rgba(255,211,78,0.36)', borderWidth: 2, borderColor: 'rgba(255,242,178,0.90)' },
  fossilStone: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,244,214,0.88)', borderWidth: 2, borderColor: 'rgba(131,96,55,0.45)', overflow: 'hidden', ...shadows.soft },
  fossilStoneHighlight: { position: 'absolute', left: 6, top: 5, width: '42%', height: '24%', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.48)', transform: [{ rotate: '-16deg' }] },
  fossilSolved: { opacity: 0.72 },
  fossilLabel: { color: '#103F2D', fontSize: 8.5, lineHeight: 10.5, fontWeight: '900', textAlign: 'center', marginTop: 2, maxWidth: 110 },
  memoryObject: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  memoryMedallion: { backgroundColor: 'rgba(255,249,226,0.94)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.98)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...shadows.soft },
  memoryShine: { position: 'absolute', width: '78%', height: '28%', top: 3, left: 3, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.48)', transform: [{ rotate: '-18deg' }] },
  memoryLabel: { color: colors.forestDark, fontSize: 10.5, lineHeight: 12, fontWeight: '900', textAlign: 'center', maxWidth: 120 },
  chestWrap: { width: 142, height: 130, alignItems: 'center', justifyContent: 'flex-end', position: 'relative' },
  chestEmpty: { opacity: 0.72 },
  chestGlow: { position: 'absolute', top: 4, width: 118, height: 76, borderRadius: 59, backgroundColor: 'rgba(255,213,78,0.36)', borderWidth: 1, borderColor: 'rgba(255,240,173,0.52)' },
  chestCoins: { position: 'absolute', top: 2, zIndex: 2 },
  sparkle: { position: 'absolute', color: '#FFF3A8', fontSize: 18, zIndex: 6, textShadowColor: 'rgba(255,182,40,0.9)', textShadowRadius: 8 },
  sparkleOne: { left: 19, top: 16 },
  sparkleTwo: { right: 15, top: 3, fontSize: 13 },
  chestLid: { width: 120, height: 39, borderTopLeftRadius: 35, borderTopRightRadius: 35, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: '#8D4E2D', borderWidth: 4, borderColor: '#3E261D', zIndex: 4, overflow: 'hidden' },
  woodPlankTop: { position: 'absolute', left: 5, right: 5, top: 7, height: 8, borderRadius: 5, backgroundColor: 'rgba(255,177,91,0.26)' },
  chestBody: { width: 130, height: 58, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, backgroundColor: '#A95F35', borderWidth: 4, borderColor: '#3E261D', marginTop: -3, zIndex: 3, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  woodPlankBody: { position: 'absolute', left: 6, right: 6, top: 8, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,192,118,0.22)' },
  chestBand: { position: 'absolute', left: '45%', width: 15, top: 0, bottom: 0, backgroundColor: '#E8B42A', borderLeftWidth: 2, borderRightWidth: 2, borderColor: '#8D6510' },
  rivet: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD86A', borderWidth: 1, borderColor: '#76520D' },
  rivetLidLeft: { left: 17, bottom: 8 },
  rivetLidRight: { right: 17, bottom: 8 },
  rivetBodyLeft: { left: 16, top: 20 },
  rivetBodyRight: { right: 16, top: 20 },
  chestLock: { width: 26, height: 25, borderRadius: 7, backgroundColor: '#FFD34E', borderWidth: 3, borderColor: '#6A4F17', alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  chestLockText: { color: '#6A4F17', fontSize: 12, fontWeight: '900' },
  chestFeet: { width: 104, height: 7, marginTop: -1, flexDirection: 'row', justifyContent: 'space-between', zIndex: 2 },
  chestFoot: { width: 18, height: 7, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, backgroundColor: '#3E261D' },
});
