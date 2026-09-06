import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getAdventureStage } from '@/features/adventure/presentation/adventurePresentation';
import { colors, radii } from '@/core/theme/tokens';

export function AdventureStageProgress({ dayNumber, compact = false }: { dayNumber: number; compact?: boolean }) {
  const stage = getAdventureStage(dayNumber);
  return (
    <View style={[styles.root, compact && styles.rootCompact]}>
      <View style={styles.copy}>
        <Text style={[styles.stage, compact && styles.stageCompact]}>ETAPA {stage.stageNumber}</Text>
        <Text style={[styles.day, compact && styles.dayCompact]}>{stage.dayInStage}/{stage.totalSlots}</Text>
      </View>
      <View style={styles.track}>
        {Array.from({ length: stage.totalSlots }, (_, index) => {
          const active = index < stage.dayInStage;
          const current = index === stage.dayInStage - 1;
          return <View key={index} style={[styles.segment, active && styles.segmentActive, current && styles.segmentCurrent]} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%', gap: 5 },
  rootCompact: { gap: 3 },
  copy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stage: { color: colors.gold, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  stageCompact: { fontSize: 7 },
  day: { color: colors.cream, fontSize: 9, fontWeight: '900' },
  dayCompact: { fontSize: 7 },
  track: { flexDirection: 'row', gap: 3 },
  segment: { flex: 1, height: 6, borderRadius: radii.pill, backgroundColor: colors.glassWhite, opacity: 0.42 },
  segmentActive: { backgroundColor: colors.leaf, opacity: 1 },
  segmentCurrent: { backgroundColor: colors.gold, transform: [{ scaleY: 1.35 }] },
});
