import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing } from '@/core/theme/tokens';

type Props = {
  score: number;
  combo: number;
  seconds: number;
  totalSeconds: number;
  magnetActive: boolean;
};

export function CoinCatcherHud({ score, combo, seconds, totalSeconds, magnetActive }: Props) {
  const timeRatio = Math.max(0, Math.min(1, seconds / Math.max(1, totalSeconds)));
  const danger = seconds <= 5;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.pill}>
          <Text style={styles.label}>RECURSOS</Text>
          <Text style={styles.value}>{score}</Text>
        </View>
        <View style={[styles.pill, combo >= 3 && styles.comboHot]}>
          <Text style={styles.label}>RACHA</Text>
          <Text style={[styles.value, combo >= 3 && styles.comboValue]}>×{combo}</Text>
        </View>
        {magnetActive ? (
          <View style={[styles.pill, styles.magnet]}>
            <Text style={styles.label}>MEJORA</Text>
            <Text style={styles.magnetValue}>IMÁN</Text>
          </View>
        ) : null}
        <View style={[styles.pill, danger && styles.dangerPill]}>
          <Text style={styles.label}>TIEMPO</Text>
          <Text style={[styles.value, danger && styles.dangerValue]}>{seconds}s</Text>
        </View>
      </View>
      <View style={styles.timeTrack}>
        <View style={[styles.timeFill, { width: `${timeRatio * 100}%` }, danger && styles.timeDanger]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    top: spacing.sm,
    zIndex: 20,
    gap: 5,
  },
  topRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-end',
  },
  pill: {
    minWidth: 52,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.glassDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    ...shadows.card,
  },
  label: {
    color: colors.cream,
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  value: {
    color: colors.white,
    fontSize: 9.5,
    fontWeight: '900',
  },
  comboHot: {
    borderColor: colors.gold,
    backgroundColor: colors.glassBrown,
  },
  comboValue: { color: colors.gold },
  magnet: { borderColor: colors.aqua },
  magnetValue: { color: colors.aqua, fontSize: 8, fontWeight: '900' },
  dangerPill: { borderColor: colors.danger },
  dangerValue: { color: '#FFD2D2' },
  timeTrack: {
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(10, 66, 44, 0.35)',
    overflow: 'hidden',
  },
  timeFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.gold,
  },
  timeDanger: { backgroundColor: colors.danger },
});
