import React from 'react';
import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';

export function CollectibleEgg({
  source,
  accent = '#7DBB6C',
  size = 82,
  selected = false,
}: {
  source: ImageSourcePropType;
  accent?: string;
  size?: number;
  selected?: boolean;
}) {
  const glow = Math.round(size * 1.12);
  const ring = Math.round(size * 0.98);
  const imageSize = Math.round(size * 1.08);
  return (
    <View style={[styles.eggStage, { width: size + 42, height: size + 38 }, selected && styles.eggStageSelected]}>
      <View style={[styles.eggGlow, { width: glow, height: glow, borderRadius: glow / 2, backgroundColor: accent, opacity: selected ? 0.34 : 0.22 }]} />
      <View style={[styles.eggRing, { width: ring, height: ring, borderRadius: ring / 2, borderColor: accent, opacity: selected ? 0.72 : 0.42 }]} />
      <View style={[styles.eggCore, { width: Math.round(size * 0.78), height: Math.round(size * 0.82), borderRadius: Math.round(size * 0.4), backgroundColor: accent }]} />
      <View style={[styles.eggShadow, { width: Math.round(size * 0.82), backgroundColor: accent }]} />
      <Image source={source} contentFit="contain" cachePolicy="memory-disk" allowDownscaling style={{ width: imageSize, height: imageSize, zIndex: 4 }} />
      <View pointerEvents="none" style={[styles.eggShine, { width: Math.max(12, Math.round(size * 0.19)), height: Math.max(22, Math.round(size * 0.34)) }]} />
      <View style={[styles.spark, styles.sparkA, { backgroundColor: accent }]} />
      <View style={[styles.spark, styles.sparkB, { backgroundColor: accent }]} />
      <View style={[styles.sparkSmall, styles.sparkC, { backgroundColor: accent }]} />
      {selected ? <View style={[styles.sparkSelected, { borderColor: accent }]} /> : null}
    </View>
  );
}

export function AdventureVolcano({ width = 170, height = 128 }: { width?: number; height?: number }) {
  const scale = width / 170;
  return (
    <View pointerEvents="none" style={{ width, height, position: 'relative' }}>
      <View style={[styles.volcanoShadow, { width: 156 * scale, height: 25 * scale, borderRadius: 80 * scale, left: 7 * scale, bottom: 0 }]} />
      <View style={[styles.mountain, {
        left: 19 * scale,
        bottom: 14 * scale,
        borderLeftWidth: 66 * scale,
        borderRightWidth: 66 * scale,
        borderBottomWidth: 82 * scale,
      }]} />
      <View style={[styles.crater, { width: 64 * scale, height: 16 * scale, borderRadius: 32 * scale, left: 53 * scale, top: 28 * scale }]} />
      <View style={[styles.lava, { width: 8 * scale, height: 50 * scale, left: 75 * scale, top: 42 * scale, transform: [{ rotate: '9deg' }] }]} />
      <View style={[styles.lava, { width: 6 * scale, height: 36 * scale, left: 98 * scale, top: 46 * scale, transform: [{ rotate: '-13deg' }] }]} />
      <View style={[styles.lavaGold, { width: 5 * scale, height: 29 * scale, left: 58 * scale, top: 50 * scale, transform: [{ rotate: '18deg' }] }]} />
      <View style={[styles.smoke, { width: 43 * scale, height: 33 * scale, borderRadius: 22 * scale, left: 50 * scale, top: 3 * scale }]} />
      <View style={[styles.smoke, { width: 52 * scale, height: 38 * scale, borderRadius: 26 * scale, left: 74 * scale, top: 0 }]} />
      <View style={[styles.smokeLight, { width: 38 * scale, height: 29 * scale, borderRadius: 20 * scale, left: 104 * scale, top: 9 * scale }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  eggStage: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  eggStageSelected: { transform: [{ translateY: -2 }, { scale: 1.04 }] },
  eggGlow: { position: 'absolute' },
  eggRing: { position: 'absolute', borderWidth: 3, backgroundColor: 'rgba(255,255,255,0.34)' },
  eggCore: { position: 'absolute', opacity: 0.14, transform: [{ scaleX: 0.86 }] },
  eggShadow: { position: 'absolute', bottom: 1, height: 10, borderRadius: 999, opacity: 0.28, transform: [{ scaleX: 1.18 }] },
  eggShine: { position: 'absolute', zIndex: 5, left: '31%', top: '23%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.46)', transform: [{ rotate: '18deg' }], opacity: 0.78 },
  spark: { position: 'absolute', width: 8, height: 8, borderRadius: 2, opacity: 0.9, transform: [{ rotate: '45deg' }] },
  sparkSmall: { position: 'absolute', width: 5, height: 5, borderRadius: 1, opacity: 0.82, transform: [{ rotate: '45deg' }] },
  sparkA: { right: 6, top: 12 },
  sparkB: { left: 9, top: 28 },
  sparkC: { right: 16, bottom: 18 },
  sparkSelected: { position: 'absolute', width: 14, height: 14, right: 1, top: 3, borderWidth: 3, borderRadius: 3, transform: [{ rotate: '45deg' }], backgroundColor: 'rgba(255,255,255,0.76)' },

  volcanoShadow: { position: 'absolute', backgroundColor: 'rgba(12,45,31,0.26)' },
  mountain: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#394955',
  },
  crater: { position: 'absolute', backgroundColor: '#202F35', borderWidth: 3, borderColor: '#F58222' },
  lava: { position: 'absolute', borderRadius: 8, backgroundColor: '#F26A21' },
  lavaGold: { position: 'absolute', borderRadius: 8, backgroundColor: '#FFB12D' },
  smoke: { position: 'absolute', backgroundColor: '#AEBEC3' },
  smokeLight: { position: 'absolute', backgroundColor: '#C8D4D7' },
});
