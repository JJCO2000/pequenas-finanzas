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
      <View pointerEvents="none" style={styles.sceneDecor}>
        <View style={styles.skyFade} />
        <View style={styles.sunGlow} />
        <View style={styles.campIsland} />
        <View style={styles.groundGlow} />
        <View style={styles.pathLine} />
        <View style={[styles.pathDot, styles.pathDotA]} />
        <View style={[styles.pathDot, styles.pathDotB]} />
        <View style={[styles.pathDot, styles.pathDotC]} />
        <Image source={ACTIVE_THEME.decor.trail} resizeMode="contain" style={styles.tracksA} />
        <Image source={ACTIVE_THEME.decor.trail} resizeMode="contain" style={styles.tracksB} />
        <View style={[styles.bush, styles.bushA]} />
        <View style={[styles.bush, styles.bushB]} />
        <View style={[styles.bush, styles.bushC]} />
        <Image source={ACTIVE_THEME.characters.startCast[2]!} resizeMode="contain" style={styles.worldDino} />
        <Image source={ACTIVE_THEME.characters.startCast[0]!} resizeMode="contain" style={styles.worldFriend} />
      </View>

      <View pointerEvents="none" style={styles.guideBadge}>
        <Text style={styles.guideBadgeKicker}>SIGUIENTE PASO</Text>
        <Text style={styles.guideBadgeText}>Tu misión está lista ↓</Text>
      </View>

      <View style={styles.headerWrap}>
        <CompactHeader
          title="Pequeñas Finanzas"
          subtitle={`Hola, ${profile.displayName} · ¿Listo para continuar?`}
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
        <View pointerEvents="none" style={styles.panelGlow} />
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelEyebrow}>CAMPAMENTO</Text>
            <Text style={styles.panelTitle}>Otros lugares</Text>
          </View>
          <View style={styles.panelInstruction}>
            <Text style={styles.panelInstructionTop}>EXPLORA</Text>
            <Text style={styles.panelHint}>Toca una tarjeta.</Text>
          </View>
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
            <Text style={styles.missionKicker}>TU MISIÓN · DÍA {currentDay}</Text>
            <View style={styles.readyPill}><Text style={styles.readyText}>LISTA</Text></View>
          </View>
          <Text numberOfLines={1} style={styles.missionTitle}>{currentTitle}</Text>
          <Text numberOfLines={1} style={styles.missionText}>{current ? getAdventureMissionStatus(current) : 'Continúa tu expedición financiera.'}</Text>
          <View style={styles.progress}><AdventureStageProgress dayNumber={currentDay} compact /></View>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{current ? getAdventureNodeLabel(current.nodeType) : 'MAPA'} · Juegos {gameUnlocks.length}/{GAMES.length}</Text>
            <View style={styles.rewardPill}><Text style={styles.rewardPillText}>PREMIO {reward}</Text></View>
          </View>
        </View>
        <ActionPill label="IR A MI MISIÓN →" accessibilityLabel="Ir a mi misión actual" onPress={() => router.replace('/play' as any)} style={styles.continueButton} />
      </FloatingCard>
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden', paddingHorizontal: 14, paddingVertical: 10 },
  sceneDecor: { ...StyleSheet.absoluteFillObject },
  skyFade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4,45,29,0.05)' },
  sunGlow: { position: 'absolute', left: '28%', top: '9%', width: 315, height: 315, borderRadius: 158, backgroundColor: 'rgba(255,232,126,0.10)' },
  campIsland: { position: 'absolute', left: '29%', top: '17%', width: '34%', height: '52%', borderRadius: 190, backgroundColor: 'rgba(236,228,160,0.11)', borderWidth: 1.5, borderColor: 'rgba(226,242,200,0.12)', transform: [{ rotate: '-7deg' }] },
  groundGlow: { position: 'absolute', left: '34%', bottom: 44, width: '31%', height: 62, borderRadius: 80, backgroundColor: 'rgba(5,53,35,0.22)' },
  pathLine: { position: 'absolute', left: '16%', right: '35%', top: '54%', height: 4, borderRadius: 2, backgroundColor: 'rgba(242,218,133,0.20)', transform: [{ rotate: '-8deg' }] },
  pathDot: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(255,223,111,0.36)', borderWidth: 2, borderColor: 'rgba(255,247,197,0.34)' },
  pathDotA: { left: '25%', top: '55%' },
  pathDotB: { left: '34%', top: '50%' },
  pathDotC: { left: '43%', top: '45%' },
  tracksA: { position: 'absolute', left: '20%', top: '44%', width: 52, height: 52, opacity: 0.24, transform: [{ rotate: '20deg' }] },
  tracksB: { position: 'absolute', left: '51%', top: '62%', width: 43, height: 43, opacity: 0.18, transform: [{ rotate: '-20deg' }] },
  bush: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(39,116,69,0.34)', borderWidth: 1, borderColor: 'rgba(104,170,100,0.22)' },
  bushA: { left: '31%', bottom: 71, width: 58, height: 24, transform: [{ rotate: '-7deg' }] },
  bushB: { left: '57%', bottom: 86, width: 45, height: 18 },
  bushC: { left: '26%', top: '23%', width: 35, height: 15 },
  worldDino: { position: 'absolute', left: '41%', bottom: 54, width: 208, height: 190, opacity: 0.96 },
  worldFriend: { position: 'absolute', left: '28%', bottom: 64, width: 82, height: 82, opacity: 0.9 },
  guideBadge: { position: 'absolute', left: '35%', top: '31%', minWidth: 164, borderRadius: radii.pill, backgroundColor: 'rgba(255,253,244,0.96)', borderWidth: 2, borderColor: 'rgba(255,224,115,0.84)', paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', ...shadows.soft },
  guideBadgeKicker: { color: '#B87722', fontSize: 5.3, lineHeight: 6.5, fontWeight: '900', letterSpacing: 0.9 },
  guideBadgeText: { color: colors.forestDark, fontSize: 7.5, lineHeight: 9.2, fontWeight: '900', marginTop: 1 },
  headerWrap: { position: 'absolute', left: 14, top: 10, zIndex: 20, width: '55%' },
  header: { width: '100%' },
  topStats: { position: 'absolute', right: 14, top: 10, zIndex: 20, flexDirection: 'row', gap: 7 },
  hotspotPanel: { position: 'absolute', right: 14, top: 58, bottom: 98, width: 332, borderRadius: 24, backgroundColor: 'rgba(4,54,36,0.82)', borderWidth: 2, borderColor: 'rgba(139,202,126,0.72)', paddingHorizontal: 10, paddingTop: 9, paddingBottom: 8, zIndex: 9, overflow: 'hidden', ...shadows.card },
  panelGlow: { position: 'absolute', right: -42, top: -58, width: 170, height: 170, borderRadius: 85, backgroundColor: 'rgba(255,216,90,0.07)' },
  panelHeader: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 4, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: 'rgba(185,224,174,0.24)' },
  panelEyebrow: { color: '#FFD85A', fontSize: 5.4, lineHeight: 6.5, fontWeight: '900', letterSpacing: 0.9 },
  panelTitle: { color: colors.white, fontSize: 13, lineHeight: 15, fontWeight: '900' },
  panelInstruction: { alignItems: 'flex-end' },
  panelInstructionTop: { color: '#FFD85A', fontSize: 4.9, lineHeight: 6, fontWeight: '900', letterSpacing: 0.8 },
  panelHint: { color: '#DDEED8', fontSize: 6.1, lineHeight: 8, fontWeight: '800' },
  hotspots: { flex: 1, minHeight: 0, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', columnGap: 10, rowGap: 8, paddingTop: 5 },
  hotspot: { width: 92 },
  mission: { position: 'absolute', left: 14, bottom: 12, width: '62%', maxWidth: 665, minHeight: 92, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 9, zIndex: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,213,79,0.62)' },
  missionAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, backgroundColor: '#FFD54F' },
  missionArtWell: { width: 72, height: 72, borderRadius: 18, backgroundColor: '#E8F4D8', borderWidth: 2, borderColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  missionArt: { width: 66, height: 66 },
  missionCopy: { flex: 1, minWidth: 0 },
  missionTopLine: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  missionKicker: { flex: 1, minWidth: 0, color: '#FFD85A', fontSize: 5.8, fontWeight: '900', letterSpacing: 0.7 },
  readyPill: { borderRadius: radii.pill, backgroundColor: '#E1F1D4', borderWidth: 1, borderColor: '#96C982', paddingHorizontal: 8, paddingVertical: 2 },
  readyText: { color: '#31623A', fontSize: 4.8, lineHeight: 6, fontWeight: '900', letterSpacing: 0.6 },
  missionTitle: { color: colors.white, fontSize: 14, lineHeight: 16.5, fontWeight: '900', marginTop: 2 },
  missionText: { color: '#DDEFD8', fontSize: 6.6, lineHeight: 8.5, fontWeight: '700', marginTop: 1 },
  progress: { marginTop: 5, maxWidth: 280 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  meta: { color: '#CFE5CA', fontSize: 5.7, fontWeight: '800' },
  rewardPill: { borderRadius: radii.pill, backgroundColor: 'rgba(255,216,90,0.15)', borderWidth: 1, borderColor: 'rgba(255,216,90,0.30)', paddingHorizontal: 6, paddingVertical: 2 },
  rewardPillText: { color: '#FFE37A', fontSize: 5.1, lineHeight: 6.2, fontWeight: '900', letterSpacing: 0.45 },
  continueButton: { minWidth: 132, height: 42 },
});
