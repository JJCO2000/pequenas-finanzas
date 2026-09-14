import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAppData } from '@/features/session/AppDataProvider';
import { ACTIVE_THEME } from '@/core/theme';
import { formatMoney } from '@/core/domain/money';
import { getGamePresentation } from '@/registry/gamePresentation';
import { GAMES } from '@/registry/games';
import { AdventureStageProgress } from '@/features/adventure/components/AdventureStageProgress';
import { getAdventureNodeLabel, getAdventureMissionStatus, getAdventureStage } from '@/features/adventure/presentation/adventurePresentation';
import { WorldScene } from '@/features/shell/world';
import { ActionPill, FloatingCard } from '@/features/shell/gameui';
import { colors, shadows } from '@/core/theme/tokens';

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
  const stage = getAdventureStage(currentDay);

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

      <View pointerEvents="box-none" style={styles.campInteractionLayer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mapa"
          accessibilityHint="Abre la aventura principal"
          onPress={() => router.replace('/play' as any)}
          style={({ pressed }) => [styles.campHitbox, styles.campMap, pressed && styles.campHitboxPressed]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Arcade"
          accessibilityHint={`Abre los ${GAMES.length} retos del arcade`}
          onPress={() => router.push('/arcade' as any)}
          style={({ pressed }) => [styles.campHitbox, styles.campArcade, pressed && styles.campHitboxPressed]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mi dinero"
          accessibilityHint="Abre tu cartera"
          onPress={() => router.push('/wallet' as any)}
          style={({ pressed }) => [styles.campHitbox, styles.campWallet, pressed && styles.campHitboxPressed]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Inversiones"
          accessibilityHint="Abre tus expediciones de inversión"
          onPress={() => router.push('/investments' as any)}
          style={({ pressed }) => [styles.campHitbox, styles.campInvestments, pressed && styles.campHitboxPressed]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tienda"
          accessibilityHint="Abre la tienda de mejoras"
          onPress={() => router.push('/shop' as any)}
          style={({ pressed }) => [styles.campHitbox, styles.campShop, pressed && styles.campHitboxPressed]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Colección"
          accessibilityHint="Abre el museo y tu colección"
          onPress={() => router.push('/collection' as any)}
          style={({ pressed }) => [styles.campHitbox, styles.campCollection, pressed && styles.campHitboxPressed]}
        />
      </View>

      <FloatingCard
        tone="dark"
        style={[
          styles.mission,
          {
            borderRadius: px(42),
            borderWidth: px(4),
            paddingLeft: px(26),
            paddingRight: px(18),
            paddingVertical: px(18),
            gap: px(16),
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            styles.missionAccent,
            { left: px(8), top: px(14), bottom: px(14), width: px(8), borderRadius: px(4) },
          ]}
        />
        <View
          style={[
            styles.missionArtWell,
            { width: px(158), height: px(158), borderRadius: px(28), borderWidth: px(5) },
          ]}
        >
          <Image source={missionArt} resizeMode="contain" style={styles.missionArt} />
        </View>

        <View style={styles.missionCopy}>
          <View style={[styles.missionTopLine, { gap: px(12) }]}>
            <Text
              numberOfLines={1}
              style={[
                styles.missionKicker,
                { fontSize: px(17), lineHeight: px(20), letterSpacing: px(1.2) },
              ]}
            >
              TU MISIÓN · DÍA {currentDay}
            </Text>
            <View
              style={[
                styles.readyPill,
                { width: px(98), height: px(34), borderRadius: px(17), borderWidth: px(2) },
              ]}
            >
              <Text
                style={[
                  styles.readyText,
                  { fontSize: px(14), lineHeight: px(17), letterSpacing: px(0.8) },
                ]}
              >
                LISTA
              </Text>
            </View>
          </View>

          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.missionTitle, { fontSize: px(33), lineHeight: px(38), marginTop: px(3) }]}
          >
            {currentTitle}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.missionText, { fontSize: px(18), lineHeight: px(22), marginTop: px(1) }]}
          >
            {current ? getAdventureMissionStatus(current) : 'Continúa tu expedición financiera.'}
          </Text>

          <View style={[styles.referenceProgress, { marginTop: px(8), maxWidth: px(515) }]}>
            <View style={styles.progressCopy}>
              <Text style={[styles.progressStage, { fontSize: px(16), lineHeight: px(19) }]}>ETAPA {stage.stageNumber}</Text>
              <Text style={[styles.progressDay, { fontSize: px(16), lineHeight: px(19) }]}>{stage.dayInStage}/{stage.totalSlots}</Text>
            </View>
            <View style={[styles.progressTrack, { gap: px(7), marginTop: px(4) }]}>
              {Array.from({ length: stage.totalSlots }, (_, index) => {
                const active = index < stage.dayInStage;
                const currentSegment = index === stage.dayInStage - 1;
                return (
                  <View
                    key={index}
                    style={[
                      styles.progressSegment,
                      { height: px(12), borderRadius: px(6) },
                      active && styles.progressSegmentActive,
                      currentSegment && styles.progressSegmentCurrent,
                    ]}
                  />
                );
              })}
            </View>
          </View>

          <View style={[styles.metaRow, { gap: px(14), marginTop: px(6) }]}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.meta, { fontSize: px(14), lineHeight: px(17) }]}
            >
              {current ? getAdventureNodeLabel(current.nodeType) : 'MAPA'} · Juegos {gameUnlocks.length}/{GAMES.length}
            </Text>
            <View
              style={[
                styles.rewardPill,
                { borderRadius: px(16), borderWidth: px(2), paddingHorizontal: px(12), paddingVertical: px(4) },
              ]}
            >
              <Text
                style={[
                  styles.rewardPillText,
                  { fontSize: px(14), lineHeight: px(17), letterSpacing: px(0.5) },
                ]}
              >
                PREMIO {reward}
              </Text>
            </View>
          </View>

          <View pointerEvents="none" style={styles.hiddenProgress}>
            <AdventureStageProgress dayNumber={currentDay} compact />
          </View>
        </View>

        <View
          style={[
            styles.continueButtonVisual,
            {
              width: px(331),
              height: px(90),
              borderRadius: px(45),
              borderWidth: px(4),
              marginLeft: px(18),
            },
          ]}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.continueButtonText, { fontSize: px(29), lineHeight: px(34) }]}
          >
            IR A MI MISIÓN →
          </Text>
          <ActionPill
            label="IR A MI MISIÓN →"
            accessibilityLabel="Ir a mi misión actual"
            onPress={() => router.replace('/play' as any)}
            style={styles.continueButtonHitbox}
          />
        </View>
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

  // The six cards are already rendered pixel-for-pixel in HOME_REFERENCE.
  // These hitboxes are measured directly from the 1536x864 approved image.
  campInteractionLayer: { ...StyleSheet.absoluteFillObject, zIndex: 19 },
  campHitbox: { position: 'absolute', borderRadius: 18 },
  campHitboxPressed: { backgroundColor: 'rgba(255,255,255,0.12)' },
  campMap: { left: '61.7188%', top: '25.9259%', width: '10.6771%', height: '20.4861%' },
  campArcade: { left: '73.8932%', top: '25.9259%', width: '10.7422%', height: '20.3704%' },
  campWallet: { left: '86.1328%', top: '26.0417%', width: '10.7422%', height: '20.2546%' },
  campInvestments: { left: '61.7188%', top: '48.1481%', width: '10.7422%', height: '20.6019%' },
  campShop: { left: '73.8281%', top: '48.2639%', width: '10.7422%', height: '20.6019%' },
  campCollection: { left: '86.0677%', top: '48.2639%', width: '10.8073%', height: '20.6019%' },

  mission: {
    position: 'absolute',
    left: '1.75%',
    bottom: '4.2%',
    width: '71.0%',
    height: '25.4%',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,76,55,0.98)',
    borderColor: '#FFD54F',
  },
  missionAccent: { position: 'absolute', backgroundColor: '#FFD54F' },
  missionArtWell: {
    backgroundColor: '#E8F7DE',
    borderColor: '#FFFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.soft,
  },
  missionArt: { width: '94%', height: '94%' },
  missionCopy: { flex: 1, minWidth: 0, alignSelf: 'stretch', justifyContent: 'center' },
  missionTopLine: { flexDirection: 'row', alignItems: 'center' },
  missionKicker: { flex: 1, minWidth: 0, color: '#FFD85A', fontWeight: '900' },
  readyPill: { backgroundColor: '#DFF8C9', borderColor: '#91D274', alignItems: 'center', justifyContent: 'center' },
  readyText: { color: '#185C37', fontWeight: '900' },
  missionTitle: { color: colors.white, fontWeight: '900' },
  missionText: { color: '#F3F2DB', fontWeight: '700' },
  referenceProgress: { width: '100%' },
  progressCopy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressStage: { color: '#FFD84B', fontWeight: '900' },
  progressDay: { color: '#FFFDF3', fontWeight: '900' },
  progressTrack: { flexDirection: 'row' },
  progressSegment: { flex: 1, backgroundColor: 'rgba(213,232,217,0.42)' },
  progressSegmentActive: { backgroundColor: '#90C982' },
  progressSegmentCurrent: { backgroundColor: '#FFD447' },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  meta: { flexShrink: 1, color: '#F1F0D9', fontWeight: '800' },
  rewardPill: { backgroundColor: 'rgba(255,216,90,0.12)', borderColor: 'rgba(255,216,90,0.55)' },
  rewardPillText: { color: '#FFE26B', fontWeight: '900' },
  hiddenProgress: { position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' },
  continueButtonVisual: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD34D',
    borderColor: '#FFF0A0',
    shadowColor: '#B87400',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  continueButtonText: { color: '#074C35', fontWeight: '900' },
  continueButtonHitbox: { ...StyleSheet.absoluteFillObject, opacity: 0 },
});
