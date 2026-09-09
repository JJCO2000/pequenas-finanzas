import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  getStreakUrgency,
  minutesUntilLocalMidnight,
  type StreakSnapshot,
} from '@/core/progression/streak';
import { colors, radii, shadows } from '@/core/theme/tokens';

export function StreakCard({
  snapshot,
  challengeTitle,
  compact = false,
  onPress,
}: {
  snapshot: StreakSnapshot;
  challengeTitle: string;
  compact?: boolean;
  onPress: () => void;
}) {
  const [clock, setClock] = useState(() => new Date());
  const flamePulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flamePulse, { toValue: 1, duration: 760, useNativeDriver: true }),
        Animated.timing(flamePulse, { toValue: 0, duration: 880, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [flamePulse]);

  const urgency = getStreakUrgency(snapshot, clock);
  const minutesLeft = minutesUntilLocalMidnight(clock);
  const urgencyText = useMemo(() => {
    if (snapshot.completedToday) return 'A salvo por hoy';
    if (snapshot.currentStreak <= 0) return 'Empieza tu racha hoy';
    if (urgency === 'morning') return `Mantén tus ${snapshot.currentStreak} días`;
    if (urgency === 'pending') return 'Tu reto de hoy sigue pendiente';
    if (urgency === 'danger') return `No pierdas ${snapshot.currentStreak} días`;
    if (urgency === 'critical') {
      const hours = Math.floor(minutesLeft / 60);
      const minutes = minutesLeft % 60;
      return `Te quedan ${hours}h ${String(minutes).padStart(2, '0')}m`;
    }
    return 'Reto de hoy pendiente';
  }, [minutesLeft, snapshot.completedToday, snapshot.currentStreak, urgency]);

  const danger = urgency === 'danger' || urgency === 'critical';
  const safe = snapshot.completedToday;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Racha financiera. ${urgencyText}. Reto: ${challengeTitle}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        safe && styles.cardSafe,
        danger && styles.cardDanger,
        pressed && styles.pressed,
      ]}
    >
      <Animated.View
        style={[
          styles.flame,
          safe && styles.flameSafe,
          danger && styles.flameDanger,
          {
            transform: [
              { scale: flamePulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, safe ? 1.04 : 1.12] }) },
              { rotate: flamePulse.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '2deg'] }) },
            ],
          },
        ]}
      >
        <View style={styles.flameInner} />
      </Animated.View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.eyebrow}>RACHA FINANCIERA</Text>
          <Text style={styles.days}>{snapshot.currentStreak} día{snapshot.currentStreak === 1 ? '' : 's'}</Text>
        </View>
        <Text numberOfLines={1} style={[styles.status, danger && styles.statusDanger]}>{urgencyText}</Text>
        {compact ? (
          <Text numberOfLines={1} style={styles.challenge}>Hoy · {challengeTitle}</Text>
        ) : (
          <View style={styles.detailRow}>
            <Text numberOfLines={1} style={styles.challenge}>Reto: {challengeTitle}</Text>
            <Text style={styles.insurance}>🛡 {snapshot.freezesAvailable}/2</Text>
            <Text style={styles.best}>Mejor {snapshot.bestStreak}</Text>
          </View>
        )}
      </View>

      <View style={[styles.cta, safe && styles.ctaSafe, danger && styles.ctaDanger]}>
        <Text style={styles.ctaText}>{safe ? '✓' : '→'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 62,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(255,248,226,0.96)',
    borderWidth: 2,
    borderColor: '#F0C24E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
    ...shadows.card,
  },
  cardCompact: { minHeight: 46, maxWidth: 248, paddingVertical: 5, paddingHorizontal: 8, gap: 7 },
  cardSafe: { backgroundColor: 'rgba(235,248,221,0.97)', borderColor: colors.leaf },
  cardDanger: { backgroundColor: 'rgba(255,235,220,0.98)', borderColor: colors.orange },
  flame: { width: 34, height: 38, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 17, borderBottomRightRadius: 5, backgroundColor: '#FF8A24', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6, transform: [{ rotate: '-4deg' }] },
  flameSafe: { backgroundColor: '#F1B52F' },
  flameDanger: { backgroundColor: '#F05A28' },
  flameInner: { width: 13, height: 17, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 7, borderBottomRightRadius: 3, backgroundColor: '#FFE66D' },
  copy: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  eyebrow: { color: colors.forestDark, fontSize: 7, fontWeight: '900', letterSpacing: 0.65 },
  days: { color: colors.orange, fontSize: 10.5, lineHeight: 12, fontWeight: '900' },
  status: { color: colors.forestDark, fontSize: 9, lineHeight: 11, fontWeight: '900', marginTop: 1 },
  statusDanger: { color: colors.danger },
  challenge: { flex: 1, color: colors.inkMuted, fontSize: 7.5, lineHeight: 9.5, fontWeight: '800', marginTop: 2 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  insurance: { color: colors.forestDark, fontSize: 7.5, fontWeight: '900' },
  best: { color: colors.inkMuted, fontSize: 7.5, fontWeight: '800' },
  cta: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.forestDark, alignItems: 'center', justifyContent: 'center' },
  ctaSafe: { backgroundColor: colors.leaf },
  ctaDanger: { backgroundColor: colors.danger },
  ctaText: { color: colors.white, fontSize: 14, lineHeight: 16, fontWeight: '900' },
  pressed: { transform: [{ scale: 0.98 }] },
});
