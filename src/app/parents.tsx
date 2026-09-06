import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ParentGate } from '@/features/parents/ParentGate';
import { useAppData } from '@/features/session/AppDataProvider';
import { ACTIVE_THEME } from '@/core/theme';
import { formatMoney } from '@/core/domain/money';
import { useCampBack } from '@/features/shell/navigation/useCampBack';
import { WorldScene } from '@/features/shell/world';
import { CompactHeader, FloatingCard, HudPill } from '@/features/shell/gameui';
import { colors } from '@/core/theme/tokens';

export default function ParentsScreen() {
  const { profile, wallet, currentDay, adventureDays, activeInvestments, gameUnlocks } = useAppData();
  const { goBack } = useCampBack();
  const completed = adventureDays.filter((day) => day.completed).length;

  return (
    <WorldScene background={ACTIVE_THEME.world.parents} tone="none" contentStyle={styles.root}>
      <CompactHeader eyebrow="ACOMPAÑAMIENTO" title="Cabaña para adultos" subtitle="Resumen sin cambiar decisiones." hero={ACTIVE_THEME.characters.tertiary} onBack={goBack} />
      <View style={styles.body}>
        <ParentGate>
          <View style={styles.openView}>
            <Image source={ACTIVE_THEME.characters.tertiary} style={styles.hero} resizeMode="contain" />
            <FloatingCard tone="dark" style={styles.summary}>
              <Text style={styles.kicker}>AVENTURA DE</Text>
              <Text numberOfLines={1} style={styles.name}>{profile?.displayName ?? 'tu explorador'}</Text>
              <View style={styles.stats}>
                <HudPill label="DÍA" value={currentDay} icon="★" tone="gold" />
                <HudPill label="COMPLETADOS" value={completed} icon="✓" />
                <HudPill label="ARCADE" value={gameUnlocks.length} icon="◆" />
                <HudPill label="DISPONIBLE" value={formatMoney(wallet?.availableCents ?? 0)} icon="●" />
                <HudPill label="AHORRO" value={formatMoney(wallet?.savingsCents ?? 0)} icon="◎" tone="dark" />
                <HudPill label="INVERSIONES" value={activeInvestments.length} icon="↗" tone="orange" />
              </View>
            </FloatingCard>
          </View>
        </ParentGate>
      </View>
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  body: { flex: 1, minHeight: 0 },
  openView: { flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center' },
  hero: { position: 'absolute', left: '9%', bottom: 8, width: 128, height: 118 },
  summary: { width: '64%', maxWidth: 620, padding: 9 },
  kicker: { color: '#FFD85A', fontSize: 5.5, fontWeight: '900', letterSpacing: 0.7 },
  name: { color: colors.white, fontSize: 14, lineHeight: 16, fontWeight: '900', marginTop: 1 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 7, justifyContent: 'center' },
});
