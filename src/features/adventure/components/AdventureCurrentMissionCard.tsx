import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { AdventureDay } from '@/core/domain/types';
import { formatMoney } from '@/core/domain/money';
import { ACTIVE_THEME } from '@/core/theme';
import { AdventureStageProgress } from './AdventureStageProgress';
import { getAdventureMissionStatus, getAdventureNodeLabel } from '@/features/adventure/presentation/adventurePresentation';
import { useAppData } from '@/features/session/AppDataProvider';
import { StreakCard } from '@/features/streak/StreakCard';
import { getGamePresentation } from '@/registry/gamePresentation';
import { colors, radii, shadows } from '@/core/theme/tokens';

export function AdventureCurrentMissionCard({ day, title, onPress }: { day: AdventureDay; title: string; onPress: () => void }) {
  const { streak } = useAppData();
  const missionArt = day.gameId ? (ACTIVE_THEME.gameThumbnails?.[day.gameId] ?? ACTIVE_THEME.characters.primary) : ACTIVE_THEME.characters.primary;
  const challengeTitle = streak ? getGamePresentation(streak.challengeGameId).title : '';

  const openDailyChallenge = () => {
    if (!streak) return;
    router.push({ pathname: '/game/[gameId]', params: { gameId: streak.challengeGameId, mode: 'arcade' } });
  };

  return (
    <View pointerEvents="box-none" style={styles.dock}>
      {streak ? (
        <View style={styles.streakWrap}>
          <StreakCard snapshot={streak} challengeTitle={challengeTitle} compact onPress={openDailyChallenge} />
        </View>
      ) : null}

      <View style={styles.root}>
        <View style={styles.artWell}><Image source={missionArt} style={styles.guide} resizeMode="contain" /></View>
        <View style={styles.copy}>
          <Text style={styles.kicker}>DÍA {day.dayNumber} · {getAdventureNodeLabel(day.nodeType)}</Text>
          <Text numberOfLines={1} style={styles.title}>{title}</Text>
          <Text numberOfLines={1} style={styles.concept}>{getAdventureMissionStatus(day)}</Text>
          <View style={styles.progress}><AdventureStageProgress dayNumber={day.dayNumber} compact /></View>
        </View>
        <View style={styles.action}>
          <Text style={styles.rewardLabel}>RECOMPENSA</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.reward}>
            {day.rewardCents > 0 ? formatMoney(day.rewardCents) : day.nodeType === 'game' ? 'POR PUNTAJE' : 'MISIÓN'}
          </Text>
          <Pressable onPress={onPress} style={({ pressed }) => [styles.play, pressed && styles.pressed]}>
            <Text style={styles.playText}>{day.completed ? 'REPETIR' : 'COMENZAR →'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { position: 'absolute', left: '12%', right: '12%', bottom: 6, minHeight: 58, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center', gap: 7 },
  streakWrap: { width: '36%', minWidth: 168, maxWidth: 236, justifyContent: 'center' },
  root: { flex: 1, minWidth: 0, minHeight: 58, borderRadius: 15, backgroundColor: colors.glassCream, borderWidth: 2, borderColor: colors.forestDark, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 6, gap: 7, ...shadows.card },
  artWell: { width: 46, height: 42, borderRadius: 11, overflow: 'hidden', backgroundColor: '#DFF4D7', borderWidth: 2, borderColor: '#A8D79F' },
  guide: { width: '100%', height: '100%' },
  copy: { flex: 1, minWidth: 0 },
  kicker: { color: colors.orange, fontSize: 6, fontWeight: '900', letterSpacing: 0.8 },
  title: { color: colors.forestDark, fontSize: 10.5, fontWeight: '900', marginTop: 1 },
  concept: { color: colors.inkMuted, fontSize: 7, fontWeight: '700', marginTop: 1 },
  progress: { width: '90%', marginTop: 3 },
  action: { width: 72, alignItems: 'stretch' },
  rewardLabel: { color: colors.inkMuted, fontSize: 6, fontWeight: '900', letterSpacing: 0.6, textAlign: 'center' },
  reward: { color: colors.orange, fontSize: 9, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  play: { minWidth: 64, height: 28, borderRadius: radii.pill, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  playText: { color: colors.forestDark, fontSize: 7, fontWeight: '900', letterSpacing: 0.5 },
  pressed: { transform: [{ scale: 0.97 }] },
});
