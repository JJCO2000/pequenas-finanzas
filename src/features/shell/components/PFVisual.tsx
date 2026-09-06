import React from 'react';
import { Pressable, StyleSheet, Text, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors, radii, shadows, spacing } from '@/core/theme/tokens';

export function ScenicBackdrop({
  source,
  children,
  overlay = 'soft',
  contentStyle,
}: {
  source: ImageSourcePropType;
  children: React.ReactNode;
  overlay?: 'none' | 'soft' | 'dark';
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={styles.sceneRoot}>
      <Image source={source} contentFit="cover" cachePolicy="memory-disk" allowDownscaling style={styles.sceneImage} />
      {overlay !== 'none' ? <View pointerEvents="none" style={[styles.sceneOverlay, overlay === 'dark' && styles.sceneOverlayDark]} /> : null}
      <View style={[styles.sceneContent, contentStyle]}>{children}</View>
    </View>
  );
}

export function GlassPanel({ children, style, cream = false }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; cream?: boolean }) {
  return <View style={[styles.panel, cream && styles.panelCream, style]}>{children}</View>;
}

export function SoftCard({ children, style, tone = 'cream' }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; tone?: 'cream' | 'green' | 'gold' | 'aqua' | 'orange' }) {
  return <View style={[styles.card, tone === 'green' && styles.cardGreen, tone === 'gold' && styles.cardGold, tone === 'aqua' && styles.cardAqua, tone === 'orange' && styles.cardOrange, style]}>{children}</View>;
}

export function RoundIcon({ children, tone = 'gold', size = 48 }: { children: React.ReactNode; tone?: 'gold' | 'green' | 'orange' | 'aqua' | 'purple' | 'danger'; size?: number }) {
  return (
    <View style={[
      styles.roundIcon,
      { width: size, height: size, borderRadius: size / 2 },
      tone === 'green' && styles.roundGreen,
      tone === 'orange' && styles.roundOrange,
      tone === 'aqua' && styles.roundAqua,
      tone === 'purple' && styles.roundPurple,
      tone === 'danger' && styles.roundDanger,
    ]}>{children}</View>
  );
}

export function MetricCard({ label, value, hint, tone = 'gold' }: { label: string; value: string; hint?: string; tone?: 'gold' | 'green' | 'orange' | 'aqua' | 'purple' }) {
  return (
    <SoftCard style={styles.metric}>
      <View style={styles.metricTop}>
        <View style={[styles.metricDot, tone === 'green' && styles.dotGreen, tone === 'orange' && styles.dotOrange, tone === 'aqua' && styles.dotAqua, tone === 'purple' && styles.dotPurple]} />
        <Text numberOfLines={1} style={styles.metricLabel}>{label}</Text>
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.metricValue}>{value}</Text>
      {hint ? <Text numberOfLines={1} style={styles.metricHint}>{hint}</Text> : null}
    </SoftCard>
  );
}

export function YellowButton({ label, onPress, disabled = false, style }: { label: string; onPress: () => void; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }: { pressed: boolean }) => [styles.yellowButton, style, disabled && styles.disabled, pressed && !disabled && styles.pressed]}>
      <Text style={styles.yellowButtonText}>{label}</Text>
    </Pressable>
  );
}

export function BackCircle({ onPress, label = '←' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={onPress} style={({ pressed }: { pressed: boolean }) => [styles.backCircle, pressed && styles.pressed]}>
      <Text style={styles.backCircleText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sceneRoot: { flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: colors.forestDark },
  sceneImage: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  sceneOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.glassWhite, opacity: 0.08 },
  sceneOverlayDark: { backgroundColor: colors.glassBlack, opacity: 0.16 },
  sceneContent: { flex: 1 },
  panel: { borderRadius: 28, backgroundColor: 'rgba(5,75,51,0.96)', borderWidth: 2, borderColor: '#59A96B', ...shadows.card },
  panelCream: { backgroundColor: 'rgba(255,253,243,0.96)', borderColor: '#E2E7D5' },
  card: { borderRadius: 23, backgroundColor: '#FFFDF5', borderWidth: 2, borderColor: '#E3E8D8', ...shadows.soft },
  cardGreen: { backgroundColor: colors.surfaceGreen, borderColor: colors.leafSoft },
  cardGold: { backgroundColor: colors.surfaceGold, borderColor: colors.goldSoft },
  cardAqua: { backgroundColor: colors.surfaceAqua, borderColor: colors.aquaSoft },
  cardOrange: { backgroundColor: colors.surfaceOrange, borderColor: colors.orangeSoft },
  roundIcon: { backgroundColor: colors.surfaceGold, alignItems: 'center', justifyContent: 'center' },
  roundGreen: { backgroundColor: colors.surfaceGreen },
  roundOrange: { backgroundColor: colors.surfaceOrange },
  roundAqua: { backgroundColor: colors.surfaceAqua },
  roundPurple: { backgroundColor: colors.surfacePurple },
  roundDanger: { backgroundColor: colors.surfaceDanger },
  metric: { flex: 1, minWidth: 0, paddingHorizontal: spacing.md, paddingVertical: 10, justifyContent: 'center' },
  metricTop: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  metricDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold },
  dotGreen: { backgroundColor: colors.leaf },
  dotOrange: { backgroundColor: colors.orange },
  dotAqua: { backgroundColor: colors.aqua },
  dotPurple: { backgroundColor: colors.purple },
  metricLabel: { flex: 1, color: colors.inkMuted, fontSize: 9, fontWeight: '900' },
  metricValue: { color: colors.forestDark, fontSize: 22, lineHeight: 24, fontWeight: '900', marginTop: 3 },
  metricHint: { color: colors.inkMuted, fontSize: 7, lineHeight: 9, fontWeight: '700', marginTop: 2 },
  yellowButton: { minHeight: 52, borderRadius: radii.pill, backgroundColor: '#FFD54F', borderWidth: 2, borderColor: '#FFF2A3', paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center', ...shadows.card },
  yellowButtonText: { color: colors.forestDark, fontSize: 14, fontWeight: '900' },
  backCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(4,68,47,0.97)', borderWidth: 2, borderColor: '#82C77A', alignItems: 'center', justifyContent: 'center', ...shadows.card },
  backCircleText: { color: colors.white, fontSize: 25, lineHeight: 27, fontWeight: '900' },
  disabled: { opacity: 0.42 },
  pressed: { transform: [{ scale: 0.98 }] },
});
