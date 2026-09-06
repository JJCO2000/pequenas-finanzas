import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AdventureDay } from '@/core/domain/types';
import { ACTIVE_THEME } from '@/core/theme';
import { ADVENTURE_NODE_SIZE } from '@/features/adventure/presentation/adventurePresentation';
import { colors, radii, shadows } from '@/core/theme/tokens';

function nodeIcon(nodeType: AdventureDay['nodeType']) {
  switch (nodeType) {
    case 'game': return ACTIVE_THEME.tabs.games;
    case 'lesson': return ACTIVE_THEME.decor.currency;
    case 'activity': return ACTIVE_THEME.decor.trail;
    case 'decision': return ACTIVE_THEME.decor.savings;
    case 'review': return ACTIVE_THEME.tabs.home;
    case 'challenge': return ACTIVE_THEME.decor.event;
    default: return ACTIVE_THEME.tabs.home;
  }
}

export function AdventureMapNode({
  day,
  x,
  y,
  locked,
  current,
  title,
  onPress,
}: {
  day: AdventureDay;
  x: number;
  y: number;
  locked: boolean;
  current: boolean;
  title: string;
  onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(0)).current;
  const gameArt = day.gameId ? ACTIVE_THEME.gameThumbnails?.[day.gameId] : undefined;

  useEffect(() => {
    if (!current) {
      pulse.setValue(0);
      return;
    }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 760, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 760, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [current, pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1.03, 1.11] });

  return (
    <Pressable
      disabled={locked}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Día ${day.dayNumber}: ${title}`}
      style={({ pressed }) => [styles.wrap, { left: x, top: y }, pressed && !locked && styles.pressed]}
    >
      {current ? <Image source={ACTIVE_THEME.characters.primary} style={styles.companion} resizeMode="contain" /> : null}
      <Animated.View style={[
        styles.node,
        Boolean(gameArt) ? styles.gameNode : undefined,
        locked && styles.nodeLocked,
        current && styles.nodeCurrent,
        current && { transform: [{ scale }] },
      ]}>
        {gameArt ? <Image source={gameArt} style={styles.gameArt} resizeMode="cover" /> : <Image source={nodeIcon(day.nodeType)} style={styles.nodeIcon} resizeMode="contain" />}
        <View style={styles.dayTag}><Text style={styles.dayTagText}>D{day.dayNumber}</Text></View>
        {locked ? <View style={styles.lockShade}><Text style={styles.lockText}>🔒</Text></View> : null}
      </Animated.View>
      <View style={[styles.typeBadge, day.nodeType === 'game' && styles.typeBadgeGame]}>
        <Text numberOfLines={1} style={styles.typeBadgeText}>{day.nodeType === 'game' ? 'JUEGO' : day.nodeType.toUpperCase()}</Text>
      </View>
      {day.completed ? <View style={styles.completed}><Text style={styles.check}>✓</Text></View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', width: ADVENTURE_NODE_SIZE, height: ADVENTURE_NODE_SIZE, zIndex: 6 },
  node: { width: ADVENTURE_NODE_SIZE, height: ADVENTURE_NODE_SIZE, borderRadius: ADVENTURE_NODE_SIZE / 2, backgroundColor: '#FFFDF5', borderWidth: 3, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...shadows.card },
  gameNode: { borderRadius: 20, backgroundColor: '#DFF2E0' },
  nodeLocked: { opacity: 0.58 },
  nodeCurrent: { borderColor: colors.gold, borderWidth: 4 },
  gameArt: { width: '100%', height: '100%' },
  nodeIcon: { width: 32, height: 32 },
  dayTag: { position: 'absolute', left: 4, bottom: 4, minWidth: 28, height: 19, borderRadius: 10, backgroundColor: 'rgba(6,67,47,0.94)', borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  dayTagText: { color: colors.white, fontSize: 7, lineHeight: 9, fontWeight: '900' },
  lockShade: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(245,248,240,0.64)', alignItems: 'center', justifyContent: 'center' },
  lockText: { fontSize: 16 },
  companion: { position: 'absolute', width: 60, height: 46, left: -4, top: -43, zIndex: 8 },
  typeBadge: { position: 'absolute', right: -18, top: -9, maxWidth: 62, minHeight: 20, borderRadius: radii.pill, backgroundColor: colors.glassCream, borderWidth: 2, borderColor: colors.forestDark, alignItems: 'center', justifyContent: 'center', zIndex: 9, paddingHorizontal: 7 },
  typeBadgeGame: { backgroundColor: colors.gold, borderColor: colors.white },
  typeBadgeText: { color: colors.forestDark, fontSize: 5.5, lineHeight: 7, fontWeight: '900' },
  completed: { position: 'absolute', left: -5, bottom: -5, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.leaf, borderWidth: 3, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  check: { color: colors.white, fontSize: 10, lineHeight: 11, fontWeight: '900' },
  pressed: { transform: [{ scale: 0.97 }] },
});
