import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppData } from '@/features/session/AppDataProvider';
import { ACTIVE_THEME } from '@/core/theme';
import { getGamePresentation } from '@/registry/gamePresentation';
import { useCampBack } from '@/features/shell/navigation/useCampBack';
import { WorldScene } from '@/features/shell/world';
import { CompactHeader, GameTile, HudPill } from '@/features/shell/gameui';
import { colors } from '@/core/theme/tokens';

export default function ProgressScreen() {
  const { currentDay, adventureDays, gameUnlocks, investments } = useAppData();
  const { goBack } = useCampBack();
  const completed = adventureDays.filter((day) => day.completed).length;
  const activeInvestments = investments.filter((item) => item.status === 'active').length;
  const recent = adventureDays.filter((day) => day.dayNumber <= currentDay).slice(-12).reverse();

  return (
    <WorldScene background={ACTIVE_THEME.world.camp ?? ACTIVE_THEME.world.onboarding} tone="none" contentStyle={styles.root}>
      <View style={styles.topRow}>
        <CompactHeader title="Diario de aventura" subtitle="Tu camino reciente." eyebrow="PROGRESO" hero={ACTIVE_THEME.characters.quaternary} onBack={goBack} />
        <View style={styles.stats}>
          <HudPill label="DÍAS" value={completed} icon="✓" />
          <HudPill label="JUEGOS" value={gameUnlocks.length} icon="◆" tone="gold" />
          <HudPill label="INVERSIONES" value={activeInvestments} icon="↗" tone="orange" />
        </View>
      </View>

      <View style={styles.trailLabel}><Text style={styles.trailTitle}>Últimas páginas</Text><Text style={styles.trailSub}>Día {currentDay} · desliza para ver más</Text></View>
      <ScrollView horizontal style={styles.scroll} contentContainerStyle={styles.row} showsHorizontalScrollIndicator={false}>
        {recent.map((day) => {
          const game = day.gameId ? getGamePresentation(day.gameId) : null;
          const art = day.gameId ? (ACTIVE_THEME.gameThumbnails?.[day.gameId] ?? game?.hero ?? ACTIVE_THEME.characters.primary) : day.nodeType === 'lesson' ? ACTIVE_THEME.decor.currency : day.nodeType === 'decision' ? ACTIVE_THEME.decor.savings : ACTIVE_THEME.characters.quaternary;
          return (
            <GameTile
              key={day.dayNumber}
              art={art}
              artBackground={day.completed ? '#E5F5DA' : '#EEEDE7'}
              title={game?.title ?? day.title}
              badge={`D${day.dayNumber}`}
              meta={day.completed ? '✓' : day.dayNumber === currentDay ? 'AHORA' : '•'}
              locked={!day.completed && day.dayNumber !== currentDay}
              style={styles.dayTile}
            />
          );
        })}
      </ScrollView>

      <View pointerEvents="none" style={styles.pathLine} />
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 10, paddingVertical: 8, overflow: 'hidden' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  stats: { flexDirection: 'row', gap: 5 },
  trailLabel: { alignSelf: 'center', marginTop: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 13, backgroundColor: 'rgba(4,54,36,0.72)', alignItems: 'center' },
  trailTitle: { color: colors.white, fontSize: 10.5, lineHeight: 12, fontWeight: '900' },
  trailSub: { color: '#DCEED7', fontSize: 5.8, lineHeight: 7, fontWeight: '700' },
  scroll: { flex: 1, minHeight: 0, zIndex: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 22, paddingBottom: 4 },
  dayTile: { width: 110, height: 88 },
  pathLine: { position: 'absolute', left: 28, right: 28, top: '58%', borderTopWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(8,71,47,0.60)', zIndex: 1 },
});
