import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows } from '@/core/theme/tokens';

export function AdventureReturnToast({ completedDay, currentDay, onDone }: { completedDay: number | null; currentDay: number; onDone: () => void }) {
  const translateY = useRef(new Animated.Value(-90)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!completedDay) return;
    translateY.setValue(-90);
    opacity.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, damping: 13, stiffness: 150, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]),
      Animated.delay(2600),
      Animated.parallel([
        Animated.timing(translateY, { toValue: -90, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]),
    ]).start(({ finished }) => { if (finished) onDone(); });
  }, [completedDay, currentDay, onDone, opacity, translateY]);

  if (!completedDay) return null;
  const advanced = currentDay > completedDay;

  return (
    <Animated.View pointerEvents="none" style={[styles.root, { opacity, transform: [{ translateY }] }]}>
      <Image source={ACTIVE_THEME.characters.primary} style={styles.avatar} resizeMode="contain" />
      <View style={styles.copy}>
        <Text style={styles.kicker}>MISIÓN COMPLETADA · DÍA {completedDay}</Text>
        <Text style={styles.title}>{advanced ? `¡Día ${currentDay} desbloqueado!` : '¡Buen trabajo!'}</Text>
      </View>
      <View style={styles.badge}><Text style={styles.badgeText}>✓</Text></View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute', top: 56, alignSelf: 'center', minWidth: 300, maxWidth: 420, height: 54, borderRadius: radii.lg, backgroundColor: colors.glassCream, borderWidth: 2, borderColor: colors.gold, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, zIndex: 30, ...shadows.card },
  avatar: { width: 52, height: 50, marginTop: 3 },
  copy: { flex: 1, minWidth: 0, paddingHorizontal: 6 },
  kicker: { color: colors.orange, fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  title: { color: colors.forestDark, fontSize: 13, fontWeight: '900', marginTop: 1 },
  badge: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.leaf, borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.white, fontSize: 15, fontWeight: '900' },
});
