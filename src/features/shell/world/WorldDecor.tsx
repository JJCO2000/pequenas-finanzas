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
  const glow = Math.round(size * 0.92);
  return (
    <View style={[styles.eggStage, { width: size + 34, height: size + 30 }]}>
      <View style={[styles.eggGlow, { width: glow, height: glow, borderRadius: glow / 2, backgroundColor: accent, opacity: selected ? 0.28 : 0.16 }]} />
      <View style={[styles.eggShadow, { width: Math.round(size * 0.72), backgroundColor: accent }]} />
      <Image source={source} contentFit="contain" cachePolicy="memory-disk" allowDownscaling style={{ width: size, height: size }} />
      <View style={[styles.spark, styles.sparkA, { backgroundColor: accent }]} />
      <View style={[styles.spark, styles.sparkB, { backgroundColor: accent }]} />
      <View style={[styles.sparkSmall, styles.sparkC, { backgroundColor: accent }]} />
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
  eggGlow: { position: 'absolute' },
  eggShadow: { position: 'absolute', bottom: 2, height: 9, borderRadius: 999, opacity: 0.20, transform: [{ scaleX: 1.15 }] },
  spark: { position: 'absolute', width: 7, height: 7, borderRadius: 4, opacity: 0.78 },
  sparkSmall: { position: 'absolute', width: 4, height: 4, borderRadius: 2, opacity: 0.70 },
  sparkA: { right: 8, top: 16 },
  sparkB: { left: 12, top: 30 },
  sparkC: { right: 19, bottom: 22 },

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
