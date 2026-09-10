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
import { colors, radii, shadows } from '@/core/theme/tokens';

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
      <View pointerEvents="none" style={styles.campGlow} />
      <View pointerEvents="none" style={styles.groundGlow} />
      <Image source={ACTIVE_THEME.characters.startCast[2]!} resizeMode="contain" style={styles.worldDino} />
      <View pointerEvents="none" style={styles.guideBadge}>
        <Text style={styles.guideBadgeKicker}>EXPEDICIÓN EN CURSO</Text>
        <Text style={styles.guideBadgeText}>Día {currentDay} · sigue tu ruta financiera</Text>
      </View>

      <View style={styles.headerWrap}>
        <CompactHeader
          title="Pequeñas Finanzas"
          subtitle={`Hola, ${profile.displayName} · Tu siguiente misión ya está lista.`}
          eyebrow="AVENTURA FINANCIERA"
          hero={ACTIVE_THEME.characters.primary}
          style={styles.header}
        />
      </View>
      <View style={styles.topStats}>
        <HudPill label="DÍA" value={currentDay} icon="★" tone="gold" />
        <HudPill label="DISPONIBLE" value={formatMoney(wallet?.availableCents ?? 0)} icon="●" tone="light" />
      </View>

      <View style={styles.hotspotPanel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelEyebrow}>CAMPAMENTO</Text>
            <Text style={styles.panelTitle}>Explora</Text>
          </View>
          <Text style={styles.panelHint}>Todo lo importante, sin salir de tu aventura.</Text>
        </View>
        <View style={styles.hotspots}>
          <SceneHotspot style={styles.hotspot} art={ACTIVE_THEME.characters.primary} label="Mapa" sublabel="Aventura" onPress={() => router.replace('/play' as any)} artBackground="#DFF4D7" />
          <SceneHotspot style={styles.hotspot} art={ACTIVE_THEME.gameThumbnails?.['coin-catcher'] ?? ACTIVE_THEME.characters.primary} label="Arcade" sublabel={`${GAMES.length} retos`} onPress={() => router.push('/arcade' as any)} artBackground="#E8F4D8" />
          <SceneHotspot style={styles.hotspot} art={ACTIVE_THEME.coinCatcherArt?.coin ?? ACTIVE_THEME.decor.currency} label="Mi dinero" sublabel={formatMoney(wallet?.availableCents ?? 0)} onPress={() => router.push('/wallet' as any)} artBackground="#FFF0AF" />
          <SceneHotspot style={styles.hotspot} art={ACTIVE_THEME.characters.secondary} label="Inversiones" sublabel="Expediciones" onPress={() => router.push('/investments' as any)} artBackground="#FFE1C8" />
          <SceneHotspot style={styles.hotspot} art={ACTIVE_THEME.shop.featuredItem} label="Tienda" sublabel="Mejoras" onPress={() => router.push('/shop' as any)} artBackground="#EFE5FF" />
          <SceneHotspot style={styles.hotspot} art={ACTIVE_THEME.characters.quaternary} label="Colección" sublabel="Museo" onPress={() => router.push('/collection' as any)} artBackground="#DDF3F7" />
        </View>
      </View>

      <FloatingCard tone="dark" style={styles.mission}>
        <View pointerEvents="none" style={styles.missionAccent} />
        <View style={styles.missionArtWell}>
          <Image source={missionArt} resizeMode="contain" style={styles.missionArt} />
        </View>
        <View style={styles.missionCopy}>
          <View style={styles.missionTopLine}>
            <Text style={styles.missionKicker}>DÍA {currentDay} · {current ? getAdventureNodeLabel(current.nodeType) : 'MAPA'}</Text>
            <View style={styles.readyPill}><Text style={styles.readyText}>LISTO</Text></View>
          </View>
          <Text numberOfLines={1} style={styles.missionTitle}>{currentTitle}</Text>
          <Text numberOfLines={1} style={styles.missionText}>{current ? getAdventureMissionStatus(current) : 'Continúa tu expedición financiera.'}</Text>
          <View style={styles.progress}><AdventureStageProgress dayNumber={currentDay} compact /></View>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>Juegos {gameUnlocks.length}/{GAMES.length}</Text>
            <Text style={styles.meta}>Premio {reward}</Text>
          </View>
        </View>
        <ActionPill label="CONTINUAR →" onPress={() => router.replace('/play' as any)} style={styles.continueButton} />
      </FloatingCard>
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden', paddingHorizontal: 14, paddingVertical: 10 },
  skyFade: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(4,45,29,0.07)' },
  campGlow: { position: 'absolute', left: '35%', top: '19%', width: '31%', height: '48%', borderRadius: 180, backgroundColor: 'rgba(244,235,163,0.12)', transform: [{ rotate: '-8deg' }] },
  groundGlow: { position: 'absolute', left: '37%', bottom: 44, width: '28%', height: 55, borderRadius: 80, backgroundColor: 'rgba(5,53,35,0.18)' },
  worldDino: { position: 'absolute', left: '42%', bottom: 52, width: 195, height: 178, opacity: 0.9 },
  guideBadge: { position: 'absolute', left: '36%', top: '32%', minWidth: 188, borderRadius: radii.pill, backgroundColor: 'rgba(255,253,244,0.9)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.94)', paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', ...shadows.soft },
  guideBadgeKicker: { color: '#A66E22', fontSize: 5.3, lineHeight: 6.5, fontWeight: '900', letterSpacing: 0.8 },
  guideBadgeText: { color: colors.forestDark, fontSize: 7.2, lineHeight: 9, fontWeight: '900', marginTop: 1 },
  headerWrap: { position: 'absolute', left: 14, top: 10, zIndex: 20, width: '54%' },
  header: { width: '100%' },
  topStats: { position: 'absolute', right: 14, top: 10, zIndex: 20, flexDirection: 'row', gap: 7 },
  hotspotPanel: { position: 'absolute', right: 14, top: 58, bottom: 98, width: 332, borderRadius: 24, backgroundColor: 'rgba(4,54,36,0.72)', borderWidth: 1.5, borderColor: 'rgba(139,202,126,0.64)', paddingHorizontal: 10, paddingTop: 9, paddingBottom: 8, zIndex: 9, ...shadows.soft },
  panelHeader: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 4, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: 'rgba(185,224,174,0.22)' },
  panelEyebrow: { color: '#FFD85A', fontSize: 5.4, lineHeight: 6.5, fontWeight: '900', letterSpacing: 0.9 },
  panelTitle: { color: colors.white, fontSize: 13, lineHeight: 15, fontWeight: '900' },
  panelHint: { maxWidth: 150, color: '#DDEED8', fontSize: 6.1, lineHeight: 8, fontWeight: '700', textAlign: 'right' },
  hotspots: { flex: 1, minHeight: 0, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', columnGap: 10, rowGap: 8, paddingTop: 5 },
  hotspot: { width: 92 },
  mission: { position: 'absolute', left: 14, bottom: 12, width: '61%', maxWidth: 650, minHeight: 88, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 9, zIndex: 12, overflow: 'hidden' },
  missionAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, backgroundColor: '#FFD54F' },
  missionArtWell: { width: 70, height: 70, borderRadius: 17, backgroundColor: '#E8F4D8', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  missionArt: { width: 64, height: 64 },
  missionCopy: { flex: 1, minWidth: 0 },
  missionTopLine: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  missionKicker: { flex: 1, minWidth: 0, color: '#FFD85A', fontSize: 5.8, fontWeight: '900', letterSpacing: 0.65 },
  readyPill: { borderRadius: radii.pill, backgroundColor: 'rgba(221,240,212,0.16)', borderWidth: 1, borderColor: 'rgba(221,240,212,0.34)', paddingHorizontal: 7, paddingVertical: 2 },
  readyText: { color: '#DDF0D4', fontSize: 4.8, lineHeight: 6, fontWeight: '900', letterSpacing: 0.6 },
  missionTitle: { color: colors.white, fontSize: 13.5, lineHeight: 16, fontWeight: '900', marginTop: 2 },
  missionText: { color: '#DDEFD8', fontSize: 6.6, lineHeight: 8.5, fontWeight: '700', marginTop: 1 },
  progress: { marginTop: 5, maxWidth: 275 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 3 },
  meta: { color: '#CFE5CA', fontSize: 5.9, fontWeight: '800' },
  continueButton: { minWidth: 118, height: 40 },
});
