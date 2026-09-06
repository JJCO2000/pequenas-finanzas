import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '@/core/theme/tokens';

export function HudChip({ label, value, tone = 'dark' }: { label: string; value: string | number; tone?: 'dark' | 'gold' | 'danger' | 'light' }) {
  return (
    <View style={[styles.chip, tone === 'gold' && styles.chipGold, tone === 'danger' && styles.chipDanger, tone === 'light' && styles.chipLight]}>
      <Text style={[styles.chipLabel, tone !== 'dark' && styles.darkText]}>{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.chipValue, tone !== 'dark' && styles.darkText]}>{value}</Text>
    </View>
  );
}

export function GameProgress({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value));
  return <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${pct * 100}%` }]} /></View>;
}

export function PrimaryGameButton({ label, onPress, disabled, style }: { label: string; onPress: () => void; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primary, style, disabled && styles.disabled, pressed && !disabled && styles.pressed]}>
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryGameButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.secondary, disabled && styles.disabled, pressed && !disabled && styles.pressed]}>
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

export function FeedbackPill({ text, good }: { text: string; good?: boolean }) {
  return (
    <View pointerEvents="none" style={[styles.feedback, good === true && styles.feedbackGood, good === false && styles.feedbackBad]}>
      <Text numberOfLines={2} style={styles.feedbackText}>{text}</Text>
    </View>
  );
}

export function Panel({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  chip: { minWidth: 60, minHeight: 32, borderRadius: radii.lg, backgroundColor: colors.glassDark, borderWidth: 1, borderColor: colors.leafSoft, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  chipGold: { backgroundColor: colors.surfaceGold, borderColor: colors.goldSoft },
  chipDanger: { backgroundColor: colors.surfaceDanger, borderColor: colors.orangeSoft },
  chipLight: { backgroundColor: colors.glassCream, borderColor: colors.creamStrong },
  chipLabel: { color: colors.cream, fontSize: 7, lineHeight: 9, fontWeight: '900', letterSpacing: 0.7 },
  chipValue: { color: colors.white, fontSize: 13, lineHeight: 15, fontWeight: '900' },
  darkText: { color: colors.forestDark },
  progressTrack: { height: 6, borderRadius: radii.pill, backgroundColor: colors.glassBlack, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radii.pill, backgroundColor: colors.gold },
  primary: { minHeight: 34, borderRadius: radii.pill, backgroundColor: colors.gold, borderWidth: 2, borderColor: colors.goldSoft, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  primaryText: { color: colors.forestDark, fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
  secondary: { minHeight: 30, borderRadius: radii.pill, backgroundColor: colors.glassCream, borderWidth: 2, borderColor: colors.leafSoft, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: colors.forestDark, fontSize: 8, fontWeight: '900' },
  disabled: { opacity: 0.42 },
  pressed: { transform: [{ scale: 0.97 }] },
  feedback: { alignSelf: 'center', borderRadius: radii.pill, backgroundColor: colors.glassDark, borderWidth: 1, borderColor: colors.leafSoft, paddingHorizontal: 10, paddingVertical: 4, ...shadows.soft },
  feedbackGood: { backgroundColor: colors.forest },
  feedbackBad: { backgroundColor: colors.danger },
  feedbackText: { color: colors.white, fontSize: 7.5, lineHeight: 9.5, fontWeight: '900', textAlign: 'center' },
  panel: { borderRadius: radii.lg, backgroundColor: colors.glassCream, borderWidth: 1, borderColor: colors.creamStrong, padding: spacing.sm, ...shadows.soft },
});
