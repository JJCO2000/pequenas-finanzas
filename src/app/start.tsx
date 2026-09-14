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
import { ActionPill, FloatingCard, SceneHotspot } from '@/features/shell/gameui';
import { colors, radii, shadows } from '@/core/theme/tokens';

// Approved 16:9 visual target. It already bakes in the environmental detail
// previously represented by tracksA and worldFriend, so no procedural scene layer is needed.
const HOME_REFERENCE = require('../../assets/world/v7/home-approved.webp');

export default function StartScreen() {
  const { profile, currentDay, adventureDays, wallet, gameUnlocks } = useAppData();
  const current = useMemo(() => adventureDays.find((day) => day.dayNumber === currentDay) ?? null, [adventureDays, currentDay]);
  if (!profile) return <Redirect href={'/onboarding' as any} />;

  const currentTitle = current ? current.gameId ? getGamePresentation(current.gameId).title : current.title : 'Explora el mapa';
  const missionArt = current?.gameId ? (ACTIVE_THEME.gameThumbnails?.[current.gameId] ?? ACTIVE_THEME.characters.primary) : ACTIVE_THEME.characters.primary;
  const reward = current?.rewardCents ? formatMoney(current.rewardCents) : current?.nodeType === 'game' ? 'POR PUNTAJE' : 'MISIÓN';

  return (
    <WorldScene background={HOME_REFERENCE} tone="none" safe={false} contentStyle={styles.root}>
      <View pointerEvents="none" style={styles.guideWrap}>
        <View style={[styles.guideRay, styles.guideRayLeftTop]} />
        <View style={[styles.guideRay, styles.guideRayLeftMid]} />
        <View style={[styles.guideRay, styles.guideRayLeftBottom]} />
        <View style={[styles.guideRay, styles.guideRayRightTop]} />
        <View style={[styles.guideRay, styles.guideRayRightMid]} />
        <View style={[styles.guideRay, styles.guideRayRightBottom]} />
        <View style={styles.guideBadge}>
          <Text style={styles.guideBadgeKicker}>SIGUIENTE PASO</Text>
          <Text style={styles.guideBadgeText}>Tu misión está lista ↓</Text>
        </View>
      </View>

      <View pointerEvents="none" style={styles.headerWrap}>
        <View style={styles.referenceHeader}>
          <Image source={ACTIVE_THEME.characters.primary} resizeMode="contain" style={styles.referenceHeaderHero} />
          <View style={styles.referenceHeaderCopy}>
            <Text numberOfLines={1} adjustsFontSizeToFit style={styles.referenceHeaderTitle}>Pequeñas Finanzas</Text>
            <Text numberOfLines={1} adjustsFontSizeToFit style={styles.referenceHeaderSubtitle}>Hola, {profile.displayName} · ¿Listo para continuar?</Text>
          </View>
        </View>
      </View>

      <View pointerEvents="none" style={styles.topStats}>
        <View style={[styles.referenceStat, styles.referenceStatGold]}>
          <Text style={styles.referenceStar}>★</Text>
          <Text numberOfLines={1} style={styles.referenceStatValue}>{currentDay}</Text>
        </View>
        <View style={[styles.referenceStat, styles.referenceStatMoney]}>
          <View style={styles.moneyIcon}><Text style={styles.moneyIconText}>$</Text></View>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.referenceMoneyValue}>{formatMoney(wallet?.availableCents ?? 0)}</Text>
        </View>
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
  root: { flex: 1, overflow: 'hidden' },

  headerWrap: { position: 'absolute', left: '2.45%', top: '2.15%', zIndex: 20, width: '36.9%', height: '11.6%' },
  referenceHeader: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 30, backgroundColor: 'rgba(1,65,43,0.96)', borderWidth: 3, borderColor: '#79D66B', ...shadows.card },
  referenceHeaderHero: { width: '14%', height: '88%', marginRight: 8 },
  referenceHeaderCopy: { flex: 1, minWidth: 0, justifyContent: 'center' },
  referenceHeaderTitle: { color: '#FFFDF4', fontSize: 24, lineHeight: 27, fontWeight: '900', letterSpacing: -0.7 },
  referenceHeaderSubtitle: { color: '#F4F4D8', fontSize: 11.5, lineHeight: 14, fontWeight: '800', marginTop: 1 },

  topStats: { position: 'absolute', right: '2.45%', top: '2.55%', zIndex: 20, width: '27%', height: '8.9%', flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  referenceStat: { height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 30, borderWidth: 2, ...shadows.soft },
  referenceStatGold: { width: '43%', backgroundColor: '#FFF2A9', borderColor: '#F5CF48', gap: 8 },
  referenceStatMoney: { width: '51%', backgroundColor: 'rgba(255,255,249,0.96)', borderColor: 'rgba(239,244,229,0.98)', gap: 9, paddingHorizontal: 10 },
  referenceStar: { color: '#FFB21A', fontSize: 30, lineHeight: 32, fontWeight: '900', textShadowColor: '#D78300', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 0.5 },
  referenceStatValue: { color: '#073E2D', fontSize: 23, lineHeight: 26, fontWeight: '900' },
  moneyIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#26A637', borderWidth: 3, borderColor: '#8BD44F' },
  moneyIconText: { color: '#FFFBE8', fontSize: 20, lineHeight: 22, fontWeight: '900' },
  referenceMoneyValue: { flex: 1, minWidth: 0, color: '#073E2D', fontSize: 22, lineHeight: 25, fontWeight: '900' },

  guideWrap: { position: 'absolute', left: '33.7%', top: '23.1%', zIndex: 18, width: '25.3%', height: '10.3%', alignItems: 'center', justifyContent: 'center' },
  guideBadge: { width: '86%', minHeight: '82%', borderRadius: 999, backgroundColor: 'rgba(255,253,245,0.98)', borderWidth: 3, borderColor: '#F4D45B', paddingHorizontal: 17, paddingVertical: 7, alignItems: 'center', justifyContent: 'center', ...shadows.card },
  guideBadgeKicker: { color: '#D16E24', fontSize: 9, lineHeight: 11, fontWeight: '900', letterSpacing: 1.3 },
  guideBadgeText: { color: '#073F2F', fontSize: 15, lineHeight: 18, fontWeight: '900', marginTop: 2 },
  guideRay: { position: 'absolute', width: 23, height: 5, borderRadius: 4, backgroundColor: '#FFD942', shadowColor: '#FFE76B', shadowOpacity: 0.8, shadowRadius: 4 },
  guideRayLeftTop: { left: 0, top: '17%', transform: [{ rotate: '40deg' }] },
  guideRayLeftMid: { left: -5, top: '47%' },
  guideRayLeftBottom: { left: 1, bottom: '13%', transform: [{ rotate: '-40deg' }] },
  guideRayRightTop: { right: 0, top: '17%', transform: [{ rotate: '-40deg' }] },
  guideRayRightMid: { right: -5, top: '47%' },
  guideRayRightBottom: { right: 1, bottom: '13%', transform: [{ rotate: '40deg' }] },

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