import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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
const REFERENCE_WIDTH = 1536;
const REFERENCE_HEIGHT = 864;

export default function StartScreen() {
  const { profile, currentDay, adventureDays, wallet, gameUnlocks } = useAppData();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const current = useMemo(() => adventureDays.find((day) => day.dayNumber === currentDay) ?? null, [adventureDays, currentDay]);
  if (!profile) return <Redirect href={'/onboarding' as any} />;

  const referenceScale = Math.min(viewportWidth / REFERENCE_WIDTH, viewportHeight / REFERENCE_HEIGHT);
  const px = (value: number) => value * referenceScale;
  const currentTitle = current ? current.gameId ? getGamePresentation(current.gameId).title : current.title : 'Explora el mapa';
  const missionArt = current?.gameId ? (ACTIVE_THEME.gameThumbnails?.[current.gameId] ?? ACTIVE_THEME.characters.primary) : ACTIVE_THEME.characters.primary;
  const reward = current?.rewardCents ? formatMoney(current.rewardCents) : current?.nodeType === 'game' ? 'POR PUNTAJE' : 'MISIÓN';

  return (
    <WorldScene background={HOME_REFERENCE} tone="none" safe={false} contentStyle={styles.root}>
      <View pointerEvents="none" style={styles.guideWrap}>
        <View style={[styles.guideRay, { width: px(24), height: px(5), borderRadius: px(4), shadowRadius: px(4) }, styles.guideRayLeftTop]} />
        <View style={[styles.guideRay, { width: px(24), height: px(5), borderRadius: px(4), shadowRadius: px(4) }, styles.guideRayLeftMid]} />
        <View style={[styles.guideRay, { width: px(24), height: px(5), borderRadius: px(4), shadowRadius: px(4) }, styles.guideRayLeftBottom]} />
        <View style={[styles.guideRay, { width: px(24), height: px(5), borderRadius: px(4), shadowRadius: px(4) }, styles.guideRayRightTop]} />
        <View style={[styles.guideRay, { width: px(24), height: px(5), borderRadius: px(4), shadowRadius: px(4) }, styles.guideRayRightMid]} />
        <View style={[styles.guideRay, { width: px(24), height: px(5), borderRadius: px(4), shadowRadius: px(4) }, styles.guideRayRightBottom]} />
        <View style={[styles.guideBadge, { borderRadius: px(999), borderWidth: px(3), paddingHorizontal: px(18), paddingVertical: px(7) }]}>
          <Text style={[styles.guideBadgeKicker, { fontSize: px(15), lineHeight: px(18), letterSpacing: px(1.6) }]}>SIGUIENTE PASO</Text>
          <Text style={[styles.guideBadgeText, { fontSize: px(25), lineHeight: px(29), marginTop: px(1) }]}>Tu misión está lista ↓</Text>
        </View>
      </View>

      <View pointerEvents="none" style={styles.headerWrap}>
        <View style={[styles.referenceHeader, { paddingHorizontal: px(16), paddingVertical: px(6), borderRadius: px(34), borderWidth: px(3) }]}>
          <Image
            source={ACTIVE_THEME.characters.primary}
            resizeMode="contain"
            style={{ width: px(68), height: px(68), marginRight: px(10) }}
          />
          <View style={styles.referenceHeaderCopy}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.referenceHeaderTitle, { fontSize: px(39), lineHeight: px(43), letterSpacing: px(-0.9) }]}
            >
              Pequeñas Finanzas
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.referenceHeaderSubtitle, { fontSize: px(20), lineHeight: px(23), marginTop: px(1) }]}
            >
              Hola, {profile.displayName} · ¿Listo para continuar?
            </Text>
          </View>
        </View>
      </View>

      <View pointerEvents="none" style={[styles.topStats, { gap: px(12) }]}>
        <View style={[styles.referenceStat, styles.referenceStatGold, { borderRadius: px(34), borderWidth: px(2) }]}>
          <Text style={[styles.referenceStar, { fontSize: px(44), lineHeight: px(48), textShadowRadius: px(1) }]}>★</Text>
          <Text numberOfLines={1} style={[styles.referenceStatValue, { fontSize: px(32), lineHeight: px(36) }]}>{currentDay}</Text>
        </View>
        <View style={[styles.referenceStat, styles.referenceStatMoney, { borderRadius: px(34), borderWidth: px(2), gap: px(10), paddingHorizontal: px(12) }]}>
          <View style={[styles.moneyIcon, { width: px(44), height: px(44), borderRadius: px(22), borderWidth: px(3) }]}>
            <Text style={[styles.moneyIconText, { fontSize: px(28), lineHeight: px(31) }]}>$</Text>
          </View>
          <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.referenceMoneyValue, { fontSize: px(31), lineHeight: px(35) }]}>{formatMoney(wallet?.availableCents ?? 0)}</Text>
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

  headerWrap: { position: 'absolute', left: '2.2%', top: '2.2%', zIndex: 20, width: '37.0%', height: '11.7%' },
  referenceHeader: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(1,65,43,0.96)', borderColor: '#79D66B', ...shadows.card },
  referenceHeaderCopy: { flex: 1, minWidth: 0, justifyContent: 'center' },
  referenceHeaderTitle: { color: '#FFFDF4', fontWeight: '900' },
  referenceHeaderSubtitle: { color: '#F4F4D8', fontWeight: '800' },

  topStats: { position: 'absolute', right: '2.35%', top: '3.05%', zIndex: 20, width: '25.6%', height: '9.0%', flexDirection: 'row', justifyContent: 'flex-end' },
  referenceStat: { height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  referenceStatGold: { width: '44.5%', backgroundColor: '#FFF2A9', borderColor: '#F5CF48' },
  referenceStatMoney: { width: '52.5%', backgroundColor: 'rgba(255,255,249,0.97)', borderColor: 'rgba(239,244,229,0.98)' },
  referenceStar: { color: '#FFB21A', fontWeight: '900', textShadowColor: '#D78300', textShadowOffset: { width: 0, height: 1 } },
  referenceStatValue: { color: '#073E2D', fontWeight: '900' },
  moneyIcon: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#26A637', borderColor: '#8BD44F' },
  moneyIconText: { color: '#FFFBE8', fontWeight: '900' },
  referenceMoneyValue: { flex: 1, minWidth: 0, color: '#073E2D', fontWeight: '900' },

  guideWrap: { position: 'absolute', left: '32.35%', top: '22.7%', zIndex: 18, width: '26.9%', height: '10.8%', alignItems: 'center', justifyContent: 'center' },
  guideBadge: { width: '82%', minHeight: '82%', backgroundColor: 'rgba(255,253,245,0.98)', borderColor: '#F4D45B', alignItems: 'center', justifyContent: 'center', ...shadows.card },
  guideBadgeKicker: { color: '#D16E24', fontWeight: '900' },
  guideBadgeText: { color: '#073F2F', fontWeight: '900' },
  guideRay: { position: 'absolute', backgroundColor: '#FFD942', shadowColor: '#FFE76B', shadowOpacity: 0.8 },
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
