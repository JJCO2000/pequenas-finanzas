import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAppData } from '@/features/session/AppDataProvider';
import { ACTIVE_THEME } from '@/core/theme';
import { formatMoney } from '@/core/domain/money';
import { getGamePresentation } from '@/registry/gamePresentation';
import { GAMES } from '@/registry/games';
import { AdventureStageProgress } from '@/features/adventure/components/AdventureStageProgress';
import { getAdventureNodeLabel, getAdventureMissionStatus } from '@/features/adventure/presentation/adventurePresentation';
import { WorldScene } from '@/features/shell/world';
import { ActionPill, CompactHeader, FloatingCard, HudPill, SceneHotspot } from '@/features/shell/gameui';
import { colors } from '@/core/theme/tokens';

export default function StartScreen() {
  const { profile, currentDay, adventureDays, wallet, gameUnlocks } = useAppData();
  const current = useMemo(() => adventureDays.find((day) => day.dayNumber === currentDay) ?? null, [adventureDays, currentDay]);
  if (!profile) return <Redirect href={'/onboarding' as any} />;

  const currentTitle = current ? current.gameId ? getGamePresentation(current.gameId).title : current.title : 'Explora el mapa';
  const missionArt = current?.gameId ? (ACTIVE_THEME.gameThumbnails?.[current.gameId] ?? ACTIVE_THEME.characters.primary) : ACTIVE_THEME.characters.primary;
  const reward = current?.rewardCents ? formatMoney(current.rewardCents) : current?.nodeType === 'game' ? 'POR PUNTAJE' : 'MISIÓN';

  return (
    <WorldScene background={ACTIVE_THEME.world.shell} tone="none" safe={false} contentStyle={styles.root}>
      <View pointerEvents="none" style={styles.skyFade} />
      <Image source={ACTIVE_THEME.characters.startCast[2]!} resizeMode="contain" style={styles.worldDino} />

      <View style={styles.headerWrap}>
        <CompactHeader title="Pequeñas Finanzas" subtitle={`Hola, ${profile.displayName} · Tu siguiente misión ya está lista.`} eyebrow="AVENTURA FINANCIERA" hero={ACTIVE_THEME.characters.primary} />
      </View>
      <View style={styles.topStats}>
        <HudPill label="DÍA" value={currentDay} icon="★" tone="gold" />
        <HudPill label="DISPONIBLE" value={formatMoney(wallet?.availableCents ?? 0)} icon="●" tone="light" />
      </View>

      <View style={styles.hotspots}>
        <SceneHotspot art={ACTIVE_THEME.characters.primary} label="Mapa" sublabel="Aventura" onPress={() => router.replace('/play' as any)} artBackground="#DFF4D7" />
        <SceneHotspot art={ACTIVE_THEME.gameThumbnails?.['coin-catcher'] ?? ACTIVE_THEME.characters.primary} label="Arcade" sublabel={`${GAMES.length} retos`} onPress={() => router.push('/arcade' as any)} artBackground="#E8F4D8" />
        <SceneHotspot art={ACTIVE_THEME.coinCatcherArt?.coin ?? ACTIVE_THEME.decor.currency} label="Mi dinero" sublabel={formatMoney(wallet?.availableCents ?? 0)} onPress={() => router.push('/wallet' as any)} artBackground="#FFF0AF" />
        <SceneHotspot art={ACTIVE_THEME.characters.secondary} label="Inversiones" sublabel="Expediciones" onPress={() => router.push('/investments' as any)} artBackground="#FFE1C8" />
        <SceneHotspot art={ACTIVE_THEME.shop.featuredItem} label="Tienda" sublabel="Mejoras" onPress={() => router.push('/shop' as any)} artBackground="#EFE5FF" />
        <SceneHotspot art={ACTIVE_THEME.characters.quaternary} label="Colección" sublabel="Museo" onPress={() => router.push('/collection' as any)} artBackground="#DDF3F7" />
      </View>

      <FloatingCard tone="dark" style={styles.mission}>
        <Image source={missionArt} resizeMode={current?.gameId ? 'contain' : 'contain'} style={styles.missionArt} />
        <View style={styles.missionCopy}>
          <Text style={styles.missionKicker}>DÍA {currentDay} · {current ? getAdventureNodeLabel(current.nodeType) : 'MAPA'}</Text>
          <Text numberOfLines={1} style={styles.missionTitle}>{currentTitle}</Text>
          <Text numberOfLines={1} style={styles.missionText}>{current ? getAdventureMissionStatus(current) : 'Continúa tu expedición financiera.'}</Text>
          <View style={styles.progress}><AdventureStageProgress dayNumber={currentDay} compact /></View>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>Juegos {gameUnlocks.length}/{GAMES.length}</Text>
            <Text style={styles.meta}>Premio {reward}</Text>
          </View>
        </View>
        <ActionPill label="CONTINUAR →" onPress={() => router.replace('/play' as any)} />
      </FloatingCard>
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 9 },
  skyFade: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(9,45,30,0.04)' },
  worldDino: { position: 'absolute', right: 18, bottom: -8, width: 138, height: 126, opacity: 0.92 },
  headerWrap: { position: 'absolute', left: 12, top: 9, zIndex: 20 },
  topStats: { position: 'absolute', right: 12, top: 9, zIndex: 20, flexDirection: 'row', gap: 6 },
  hotspots: { position: 'absolute', right: 12, top: 58, bottom: 82, width: 290, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: 8, zIndex: 8 },
  mission: { position: 'absolute', left: 12, bottom: 10, width: '58%', maxWidth: 560, minHeight: 74, padding: 7, flexDirection: 'row', alignItems: 'center', gap: 7, zIndex: 12 },
  missionArt: { width: 58, height: 58, borderRadius: 12, backgroundColor: '#E8F4D8' },
  missionCopy: { flex: 1, minWidth: 0 },
  missionKicker: { color: '#FFD85A', fontSize: 5.5, fontWeight: '900', letterSpacing: 0.55 },
  missionTitle: { color: colors.white, fontSize: 12, lineHeight: 14, fontWeight: '900', marginTop: 1 },
  missionText: { color: '#DDEFD8', fontSize: 6.2, lineHeight: 8, fontWeight: '700', marginTop: 1 },
  progress: { marginTop: 4, maxWidth: 250 },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 3 },
  meta: { color: '#CFE5CA', fontSize: 5.7, fontWeight: '800' },
});
