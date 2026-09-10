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

  const urgency = getStreakUrgency(snapshot, clock);
  const minutesLeft = minutesUntilLocalMidnight(clock);
  const danger = urgency === 'danger' || urgency === 'critical';
  const safe = snapshot.completedToday;

  useEffect(() => {
    flamePulse.setValue(0);
    if (safe) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flamePulse, { toValue: 1, duration: danger ? 520 : 900, useNativeDriver: true }),
        Animated.timing(flamePulse, { toValue: 0, duration: danger ? 620 : 1100, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [danger, flamePulse, safe]);

  const urgencyText = useMemo(() => {
    if (snapshot.completedToday) return 'Tu racha está a salvo por hoy.';
    if (snapshot.currentStreak <= 0) return 'Completa el reto para empezar tu racha.';
    if (urgency === 'morning') return `Completa el reto para mantener ${snapshot.currentStreak} días.`;
    if (urgency === 'pending') return `Hoy falta 1 reto para conservar ${snapshot.currentStreak} días.`;
    if (urgency === 'danger') return `Haz el reto hoy o perderás ${snapshot.currentStreak} días.`;
    if (urgency === 'critical') {
      const hours = Math.floor(minutesLeft / 60);
      const minutes = minutesLeft % 60;
      return `Última oportunidad · ${hours}h ${String(minutes).padStart(2, '0')}m.`;
    }
    return 'Completa el reto de hoy.';
  }, [minutesLeft, snapshot.completedToday, snapshot.currentStreak, urgency]);

  if (compact) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Racha de hoy. ${urgencyText} Reto: ${challengeTitle}`}
        onPress={onPress}
        style={({ pressed }) => [styles.compactCard, safe && styles.cardSafe, danger && styles.cardDanger, pressed && styles.pressed]}
      >
        <View style={[styles.compactFlame, safe && styles.flameSafe, danger && styles.flameDanger]}>
          <Text style={styles.compactFlameGlyph}>{safe ? '✓' : '●'}</Text>
        </View>
        <View style={styles.compactCopy}>
          <View style={styles.compactTop}>
            <Text style={styles.compactEyebrow}>RACHA</Text>
            <Text style={[styles.compactDays, danger && styles.statusDanger]}>{snapshot.currentStreak}d</Text>
          </View>
          <Text numberOfLines={1} style={styles.compactChallenge}>{safe ? 'A salvo hoy' : challengeTitle}</Text>
        </View>
        <View style={[styles.compactCta, safe && styles.ctaSafe, danger && styles.ctaDanger]}>
          <Text style={styles.compactCtaText}>{safe ? 'LISTO' : 'JUGAR'}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Racha de hoy. ${urgencyText} Reto: ${challengeTitle}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, safe && styles.cardSafe, danger && styles.cardDanger, pressed && styles.pressed]}
    >
      <View style={styles.flameWell}>
        <Animated.View
          style={[
            styles.flame,
            safe && styles.flameSafe,
            danger && styles.flameDanger,
            {
              transform: [
                { scale: flamePulse.interpolate({ inputRange: [0, 1], outputRange: [0.98, danger ? 1.13 : 1.07] }) },
                { rotate: flamePulse.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '2deg'] }) },
              ],
            },
          ]}
        >
          <View style={styles.flameInner} />
        </Animated.View>
        <View style={styles.dayBubble}><Text style={styles.dayBubbleText}>{snapshot.currentStreak}</Text></View>
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{safe ? 'RACHA COMPLETADA' : 'RETO DE HOY'}</Text>
        <Text numberOfLines={1} style={styles.challengeTitle}>{challengeTitle}</Text>
        <Text numberOfLines={1} style={[styles.status, danger && styles.statusDanger]}>{urgencyText}</Text>

        <View style={styles.statRow}>
          <Stat label="RACHA" value={`${snapshot.currentStreak} día${snapshot.currentStreak === 1 ? '' : 's'}`} />
          <Stat label="SEGUROS" value={`${snapshot.freezesAvailable}/2`} />
          <Stat label="MEJOR" value={`${snapshot.bestStreak}`} />
        </View>
      </View>

      <View style={[styles.cta, safe && styles.ctaSafe, danger && styles.ctaDanger]}>
        <Text style={styles.ctaKicker}>{safe ? 'HOY' : 'SIGUIENTE'}</Text>
        <Text style={styles.ctaText}>{safe ? 'LISTO ✓' : 'JUGAR →'}</Text>
      </View>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 78,
    borderRadius: 20,
    backgroundColor: 'rgba(255,249,229,0.98)',
    borderWidth: 2,
    borderColor: '#F0C24E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    ...shadows.card,
  },
  cardSafe: { backgroundColor: 'rgba(235,248,221,0.98)', borderColor: colors.leaf },
  cardDanger: { backgroundColor: 'rgba(255,235,220,0.99)', borderColor: colors.orange },
  flameWell: { width: 56, height: 58, borderRadius: 18, backgroundColor: 'rgba(255,214,77,0.24)', borderWidth: 1, borderColor: 'rgba(229,170,52,0.36)', alignItems: 'center', justifyContent: 'center' },
  flame: { width: 31, height: 36, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 16, borderBottomRightRadius: 5, backgroundColor: '#FF8A24', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6 },
  flameSafe: { backgroundColor: '#72B74D' },
  flameDanger: { backgroundColor: '#F05A28' },
  flameInner: { width: 12, height: 16, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 7, borderBottomRightRadius: 3, backgroundColor: '#FFE66D' },
  dayBubble: { position: 'absolute', right: -3, top: -4, minWidth: 22, height: 22, borderRadius: 11, backgroundColor: colors.forestDark, borderWidth: 2, borderColor: '#FFF7D7', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  dayBubbleText: { color: colors.white, fontSize: 8, fontWeight: '900' },
  copy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.orange, fontSize: 6.2, lineHeight: 7.5, fontWeight: '900', letterSpacing: 1 },
  challengeTitle: { color: colors.forestDark, fontSize: 11.5, lineHeight: 13.5, fontWeight: '900', marginTop: 1 },
  status: { color: colors.inkMuted, fontSize: 6.7, lineHeight: 8.5, fontWeight: '800', marginTop: 2 },
  statusDanger: { color: colors.danger },
  statRow: { flexDirection: 'row', gap: 5, marginTop: 6 },
  stat: { minWidth: 55, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.64)', borderWidth: 1, borderColor: 'rgba(7,74,49,0.12)', paddingHorizontal: 6, paddingVertical: 3 },
  statLabel: { color: colors.inkMuted, fontSize: 4.9, lineHeight: 6, fontWeight: '900', letterSpacing: 0.55 },
  statValue: { color: colors.forestDark, fontSize: 7, lineHeight: 8.5, fontWeight: '900' },
  cta: { width: 72, minHeight: 48, borderRadius: 16, backgroundColor: colors.forestDark, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7, ...shadows.soft },
  ctaSafe: { backgroundColor: colors.leaf },
  ctaDanger: { backgroundColor: colors.danger },
  ctaKicker: { color: 'rgba(255,255,255,0.74)', fontSize: 4.7, lineHeight: 6, fontWeight: '900', letterSpacing: 0.6 },
  ctaText: { color: colors.white, fontSize: 8.5, lineHeight: 10, fontWeight: '900', marginTop: 1 },
  compactCard: { minHeight: 46, borderRadius: 15, backgroundColor: 'rgba(255,248,226,0.97)', borderWidth: 2, borderColor: '#F0C24E', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 7, paddingVertical: 5, ...shadows.soft },
  compactFlame: { width: 27, height: 31, borderRadius: 11, backgroundColor: '#FF8A24', alignItems: 'center', justifyContent: 'center' },
  compactFlameGlyph: { color: '#FFE66D', fontSize: 10, fontWeight: '900' },
  compactCopy: { flex: 1, minWidth: 0 },
  compactTop: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  compactEyebrow: { color: colors.forestDark, fontSize: 5.3, fontWeight: '900', letterSpacing: 0.7 },
  compactDays: { color: colors.orange, fontSize: 7.4, fontWeight: '900' },
  compactChallenge: { color: colors.inkMuted, fontSize: 6.6, lineHeight: 8, fontWeight: '800', marginTop: 1 },
  compactCta: { minWidth: 42, height: 27, borderRadius: radii.pill, backgroundColor: colors.forestDark, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  compactCtaText: { color: colors.white, fontSize: 5.8, fontWeight: '900', letterSpacing: 0.4 },
  pressed: { transform: [{ scale: 0.985 }] },
});
