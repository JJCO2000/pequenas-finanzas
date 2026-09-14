import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { ActionPill } from '@/features/shell/gameui';
import type { HomeLayout } from '../useHomeLayout';

export type HomeMissionViewModel = {
  day: number;
  title: string;
  description: string;
  art: React.ComponentProps<typeof Image>['source'];
  stageNumber: number;
  dayInStage: number;
  totalSlots: number;
  meta: string;
  reward: string;
};

type Props = {
  mission: HomeMissionViewModel;
  layout: HomeLayout;
  onPress: () => void;
};

export function HomeMissionCard({ mission, layout, onPress }: Props) {
  const compact = layout.mode === 'compact';
  const segments = Array.from({ length: mission.totalSlots }, (_, index) => index < mission.dayInStage);

  return (
    <View
      testID="home-mission-card"
      style={[
        styles.card,
        {
          height: layout.missionHeight,
          maxWidth: layout.missionMaxWidth,
          borderRadius: compact ? 18 : 30,
          padding: compact ? 9 : 16,
          gap: compact ? 8 : 14,
          flexDirection: compact ? 'column' : 'row',
        },
      ]}
    >
      {!compact ? (
        <View style={styles.artWell} pointerEvents="none">
          <Image source={mission.art} contentFit="contain" style={styles.art} />
        </View>
      ) : null}

      <View style={styles.copy}>
        <View style={styles.kickerRow}>
          <Text numberOfLines={1} style={[styles.kicker, { fontSize: (compact ? 10 : 15) * layout.fontScale }]}>TU MISIÓN · DÍA {mission.day}</Text>
          {!compact ? <Text style={styles.ready}>LISTA</Text> : null}
        </View>
        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.title, { fontSize: (compact ? 17 : 29) * layout.fontScale, lineHeight: (compact ? 19 : 33) * layout.fontScale }]}>{mission.title}</Text>
        {!compact ? <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.description, { fontSize: 15 * layout.fontScale }]}>{mission.description}</Text> : null}

        <View style={styles.progressCopy}>
          <Text style={[styles.progressText, { fontSize: (compact ? 9 : 13) * layout.fontScale }]}>ETAPA {mission.stageNumber}</Text>
          <Text style={[styles.progressText, { fontSize: (compact ? 9 : 13) * layout.fontScale }]}>{mission.dayInStage}/{mission.totalSlots}</Text>
        </View>
        <View style={[styles.progressTrack, { gap: compact ? 3 : 5 }]}> 
          {segments.map((active, index) => (
            <View key={index} style={[styles.progressSegment, active && styles.progressSegmentActive]} />
          ))}
        </View>
        {!compact ? (
          <View style={styles.metaRow}>
            <Text numberOfLines={1} style={styles.meta}>{mission.meta}</Text>
            <Text numberOfLines={1} style={styles.reward}>PREMIO {mission.reward}</Text>
          </View>
        ) : null}
      </View>

      <ActionPill
        label="IR A MI MISIÓN →"
        accessibilityLabel="Ir a mi misión actual"
        onPress={onPress}
        style={[
          styles.action,
          compact ? styles.actionCompact : styles.actionRegular,
          { minWidth: layout.touchTarget, minHeight: layout.touchTarget },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    alignSelf: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(3, 45, 35, 0.96)',
    borderWidth: 3,
    borderColor: '#79D66B',
    overflow: 'hidden',
  },
  artWell: {
    width: 126,
    height: 126,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#D7F6A8',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: { width: '92%', height: '92%' },
  copy: { flex: 1, minWidth: 0, alignSelf: 'stretch', justifyContent: 'center' },
  kickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  kicker: { color: '#CFF5B2', fontWeight: '900', letterSpacing: 0.8 },
  ready: { color: '#062E23', backgroundColor: '#CFF5B2', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, fontSize: 11, fontWeight: '900' },
  title: { color: '#FFFFFF', fontWeight: '900', marginTop: 2 },
  description: { color: '#D7E9DE', fontWeight: '600', marginTop: 2 },
  progressCopy: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  progressText: { color: '#E9F7EE', fontWeight: '800' },
  progressTrack: { flexDirection: 'row', marginTop: 3, minHeight: 6 },
  progressSegment: { flex: 1, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.20)' },
  progressSegmentActive: { backgroundColor: '#FFD34D' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 7 },
  meta: { flexShrink: 1, color: '#B7CEC1', fontSize: 11, fontWeight: '700' },
  reward: { color: '#FFD34D', fontSize: 11, fontWeight: '900' },
  action: { flexShrink: 0 },
  actionRegular: { width: 252, height: 64 },
  actionCompact: { alignSelf: 'stretch', height: 48 },
});
