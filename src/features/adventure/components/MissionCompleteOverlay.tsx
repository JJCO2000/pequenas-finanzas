import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Modal, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows } from '@/core/theme/tokens';

type Props = {
  visible: boolean;
  eyebrow: string;
  title: string;
  subtitle?: string;
  rewardText?: string;
  scoreText?: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  hapticsEnabled?: boolean;
  hero?: ImageSourcePropType;
};

export function MissionCompleteOverlay({
  visible,
  eyebrow,
  title,
  subtitle,
  rewardText,
  scoreText,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  hapticsEnabled = true,
  hero = ACTIVE_THEME.characters.primary,
}: Props) {
  const scale = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const particles = useMemo(() => Array.from({ length: 12 }, (_, index) => index), []);
  const [actionLocked, setActionLocked] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setActionLocked(false);
    scale.setValue(0.88);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, damping: 11, stiffness: 145, mass: 0.8, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
    if (hapticsEnabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [hapticsEnabled, opacity, scale, visible]);

  const runAction = (action: () => void) => {
    if (actionLocked) return;
    setActionLocked(true);
    action();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.shade} accessibilityViewIsModal>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {particles.map((index) => (
            <View
              key={index}
              style={[
                styles.particle,
                index % 3 === 0 ? styles.particleGold : index % 3 === 1 ? styles.particleLeaf : styles.particleOrange,
                {
                  left: `${8 + ((index * 17) % 84)}%` as `${number}%`,
                  top: `${8 + ((index * 23) % 76)}%` as `${number}%`,
                  transform: [{ rotate: `${index * 31}deg` }],
                },
              ]}
            />
          ))}
        </View>

        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <View style={styles.heroWrap}>
            <View style={styles.heroHalo} />
            <Image source={hero} style={styles.hero} resizeMode="contain" />
            <Image source={ACTIVE_THEME.decor.currency} style={styles.currencyA} resizeMode="contain" />
            <Image source={ACTIVE_THEME.decor.currency} style={styles.currencyB} resizeMode="contain" />
          </View>

          <View style={styles.copy}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            <View style={styles.statsRow}>
              {scoreText ? <ResultPill label="PUNTAJE" value={scoreText} /> : null}
              {rewardText ? <ResultPill label="RECOMPENSA" value={rewardText} /> : null}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={primaryLabel} accessibilityState={{ disabled: actionLocked }} disabled={actionLocked} onPress={() => runAction(onPrimary)} style={({ pressed }) => [styles.primary, actionLocked && styles.disabled, pressed && !actionLocked && styles.pressed]}>
              <Text style={styles.primaryText}>{primaryLabel}</Text>
            </Pressable>
            {secondaryLabel && onSecondary ? (
              <Pressable accessibilityRole="button" accessibilityLabel={secondaryLabel} accessibilityState={{ disabled: actionLocked }} disabled={actionLocked} onPress={() => runAction(onSecondary)} style={({ pressed }) => [styles.secondary, actionLocked && styles.disabled, pressed && !actionLocked && styles.pressed]}>
                <Text style={styles.secondaryText}>{secondaryLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function ResultPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shade: { flex: 1, backgroundColor: colors.glassBlack, alignItems: 'center', justifyContent: 'center', padding: 14 },
  card: { width: '56%', maxWidth: 520, minHeight: 174, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.gold, flexDirection: 'row', overflow: 'hidden', ...shadows.card },
  heroWrap: { width: '30%', minWidth: 120, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroHalo: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: colors.gold, opacity: 0.26 },
  hero: { width: '92%', height: '88%', zIndex: 2 },
  currencyA: { position: 'absolute', width: 36, height: 30, left: 8, top: 8, transform: [{ rotate: '-16deg' }] },
  currencyB: { position: 'absolute', width: 34, height: 28, right: 6, bottom: 4, transform: [{ rotate: '18deg' }] },
  copy: { flex: 1, paddingHorizontal: 11, paddingVertical: 10, justifyContent: 'center' },
  eyebrow: { color: colors.orange, fontSize: 7, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: colors.forestDark, fontSize: 17, lineHeight: 19, fontWeight: '900', marginTop: 3 },
  subtitle: { color: colors.inkMuted, fontSize: 7.5, lineHeight: 10, fontWeight: '700', marginTop: 6 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 9 },
  statPill: { flex: 1, minHeight: 34, borderRadius: radii.md, backgroundColor: colors.cream, borderWidth: 2, borderColor: colors.creamStrong, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  statLabel: { color: colors.inkMuted, fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  statValue: { color: colors.forestDark, fontSize: 11, fontWeight: '900', marginTop: 1, maxWidth: '100%' },
  primary: { minHeight: 28, borderRadius: radii.pill, backgroundColor: colors.orange, borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginTop: 9, paddingHorizontal: 16 },
  primaryText: { color: colors.white, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  secondary: { minHeight: 28, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  secondaryText: { color: colors.forestDark, fontSize: 7.5, fontWeight: '900' },
  particle: { position: 'absolute', width: 12, height: 22, borderRadius: 4, opacity: 0.9 },
  particleGold: { backgroundColor: colors.gold },
  particleLeaf: { backgroundColor: colors.leaf },
  particleOrange: { backgroundColor: colors.orange },
  disabled: { opacity: 0.45 },
  pressed: { transform: [{ scale: 0.98 }] },
});
