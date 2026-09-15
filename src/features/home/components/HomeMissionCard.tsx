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
  const expanded = layout.mode === 'expanded';
  const narrowRegular = !compact && layout.contentWidth < 1200;
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
          gap: compact ? 8 : narrowRegular ? 10 : 14,
          flexDirection: compact ? 'column' : 'row',
        },
      ]}
    >
      {!compact ? (
        <View
          style={[
            styles.artWell,
            narrowRegular && styles.artWellNarrow,
            expanded && styles.artWellExpanded,
          ]}
          pointerEvents="none"
        >
          <Image source={mission.art} contentFit="contain" cachePolicy="memory-disk" allowDownscaling style={styles.art} />
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
          compact
            ? styles.actionCompact
            : expanded
              ? styles.actionExpanded
              : narrowRegular
                ? styles.actionNarrow
                : styles.actionRegular,
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
    backgroundColor: 'rgba(3, 61, 45, 0.97)',
    borderWidth: 3,
    borderColor: '#F2D45B',
    overflow: 'hidden',
    shadowColor: '#062F23',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 7,
    elevation: 6,
  },
  artWell: {
    width: 126,
    height: 126,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#FFF7DF',
    backgroundColor: '#E9F7D7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artWellNarrow: { width: 96, height: 96, borderRadius: 20 },
  artWellExpanded: { width: 140, height: 140 },
  art: { width: '92%', height: '92%' },
  copy: { flex: 1, minWidth: 0, alignSelf: 'stretch', justifyContent: 'center' },
  kickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  kicker: { color: '#F7D95D', fontWeight: '900', letterSpacing: 0.8 },
  ready: {
    color: '#17452F',
    backgroundColor: '#D9F6B7',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#A9E780',
    fontSize: 11,
    fontWeight: '900',
  },
  title: { color: '#FFFFFF', fontWeight: '900', marginTop: 2 },
  description: { color: '#E9F4EC', fontWeight: '700', marginTop: 2 },
  progressCopy: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  progressText: { color: '#F7E77D', fontWeight: '900' },
  progressTrack: { flexDirection: 'row', marginTop: 3, minHeight: 6 },
  progressSegment: { flex: 1, height: 8, borderRadius: 5, backgroundColor: 'rgba(213, 232, 218, 0.36)' },
  progressSegmentActive: { backgroundColor: '#FFD34D' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 7 },
  meta: { flexShrink: 1, color: '#E0EEE5', fontSize: 11, fontWeight: '800' },
  reward: {
    color: '#FFD34D',
    backgroundColor: 'rgba(33, 83, 58, 0.95)',
    borderWidth: 2,
    borderColor: '#D6B93E',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: '900',
  },
  action: {
    flexShrink: 0,
    backgroundColor: '#FFD34D',
    borderWidth: 3,
    borderColor: '#FFF2A1',
    shadowColor: '#A46312',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 5,
    elevation: 6,
  },
  actionRegular: { width: 272, height: 72 },
  actionNarrow: { width: 188, height: 62 },
  actionExpanded: { width: 300, height: 78 },
  actionCompact: { alignSelf: 'stretch', height: 48 },
});
