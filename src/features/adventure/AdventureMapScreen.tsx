import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '@/features/session/AppDataProvider';
import { ACTIVE_THEME } from '@/core/theme';
import { getInvestmentCompanion } from '@/registry/investmentCompanions';
import { formatMoney } from '@/core/domain/money';
import type { AdventureDay } from '@/core/domain/types';
import { getGamePresentation } from '@/registry/gamePresentation';
import { INVESTMENT_RETURN_PERCENT } from '@/core/economy/investmentPlan';
import { AdventureStageProgress } from '@/features/adventure/components/AdventureStageProgress';
import { AdventureReturnToast } from '@/features/adventure/components/AdventureReturnToast';
import { AdventureMapNode } from '@/features/adventure/components/AdventureMapNode';
import { AdventureCurrentMissionCard } from '@/features/adventure/components/AdventureCurrentMissionCard';
import { AdventureCampMenu, type CampRoute } from '@/features/adventure/components/AdventureCampMenu';
import { ADVENTURE_NODE_SIZE } from '@/features/adventure/presentation/adventurePresentation';
import { ADVENTURE_DAYS_PER_SCENE, ADVENTURE_DAY_STEP, ADVENTURE_LEFT_PAD, ADVENTURE_RIGHT_PAD, adventurePointY } from '@/features/adventure/presentation/adventureMapLayout';
import { colors, radii, shadows } from '@/core/theme/tokens';

export function AdventureMapScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {
    profile,
    wallet,
    adventureState,
    adventureDays,
    currentDay,
    investments,
    ensureAdventureThrough,
    saveMapPosition,
  } = useAppData();
  const scrollRef = useRef<ScrollView>(null);
  const lastOffset = useRef(0);
  const restored = useRef(false);
  const loadingMore = useRef(false);
  const params = useLocalSearchParams<{ camp?: string | string[]; completed?: string | string[] }>();
  const campRequested = (Array.isArray(params.camp) ? params.camp[0] : params.camp) === '1';
  const completedRaw = Array.isArray(params.completed) ? params.completed[0] : params.completed;
  const completedParam = Number(completedRaw ?? 0);
  const [completedToastDay, setCompletedToastDay] = useState<number | null>(
    Number.isInteger(completedParam) && completedParam > 0 ? completedParam : null,
  );
  const [menuOpen, setMenuOpen] = useState(campRequested);

  const days = useMemo(
    () => [...adventureDays].sort((a, b) => a.dayNumber - b.dayNumber),
    [adventureDays],
  );
  const mapInvestments = useMemo(
    () => investments.filter((investment) =>
      investment.status === 'active'
      || (investment.status === 'claimed' && investment.targetLevelOrder === currentDay),
    ),
    [currentDay, investments],
  );
  const highestDay = days.at(-1)?.dayNumber ?? Math.max(1, currentDay);
  const sceneWidth = Math.max(width, ADVENTURE_LEFT_PAD + (highestDay - 1) * ADVENTURE_DAY_STEP + ADVENTURE_RIGHT_PAD);
  const sceneHeight = Math.max(height, 330);
  const backgroundCount = Math.max(1, Math.ceil(sceneWidth / Math.max(1, width)));
  const sceneCount = Math.max(1, Math.ceil(highestDay / ADVENTURE_DAYS_PER_SCENE));
  const points = useMemo(
    () => days.map((day) => ({
      day,
      x: ADVENTURE_LEFT_PAD + (day.dayNumber - 1) * ADVENTURE_DAY_STEP,
      y: adventurePointY(day.dayNumber, sceneHeight),
    })),
    [days, sceneHeight],
  );
  const current = days.find((day) => day.dayNumber === currentDay) ?? days[0] ?? null;
  const displayTitle = (day: AdventureDay) => day.gameId ? getGamePresentation(day.gameId).title : day.title;

  useEffect(() => {
    if (campRequested) setMenuOpen(true);
  }, [campRequested]);

  useEffect(() => {
    if (Number.isInteger(completedParam) && completedParam > 0) setCompletedToastDay(completedParam);
  }, [completedParam]);

  useEffect(() => {
    if (restored.current || !adventureState || points.length === 0) return;
    restored.current = true;
    const currentPoint = points.find((point) => point.day.dayNumber === currentDay);
    const fallback = Math.max(0, (currentPoint?.x ?? 0) - width * 0.46);
    const target = adventureState.mapOffsetX > 0 ? adventureState.mapOffsetX : fallback;
    lastOffset.current = target;
    const timer = setTimeout(() => scrollRef.current?.scrollTo({ x: target, animated: false }), 60);
    return () => clearTimeout(timer);
  }, [adventureState, currentDay, points, width]);

  if (!profile) return null;

  const persistOffset = async () => {
    await saveMapPosition(lastOffset.current);
  };

  const openDay = async (dayNumber: number) => {
    const day = days.find((candidate) => candidate.dayNumber === dayNumber);
    if (!day || dayNumber > currentDay) return;
    await persistOffset();

    if (day.nodeType === 'game' && day.gameId) {
      router.push({
        pathname: '/game/[gameId]',
        params: { gameId: day.gameId, mode: 'campaign', day: String(day.dayNumber) },
      });
      return;
    }

    if (day.contentId) {
      router.push({ pathname: '/lesson/[id]', params: { id: day.contentId, day: String(day.dayNumber) } });
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    lastOffset.current = Math.max(0, event.nativeEvent.contentOffset.x);
  };

  const handleMomentumEnd = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    lastOffset.current = Math.max(0, contentOffset.x);
    await saveMapPosition(lastOffset.current);
    const closeToEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - width * 1.25;
    if (closeToEnd && !loadingMore.current) {
      loadingMore.current = true;
      try {
        await ensureAdventureThrough(highestDay + 18);
      } finally {
        loadingMore.current = false;
      }
    }
  };

  const dismissCompletedToast = useCallback(() => {
    setCompletedToastDay(null);
    if (completedRaw) router.setParams({ completed: '' } as any);
  }, [completedRaw]);

  const closeMenu = () => {
    setMenuOpen(false);
    if (campRequested) router.setParams({ camp: '0' } as any);
  };

  const navigateFromMenu = async (route: CampRoute) => {
    setMenuOpen(false);
    if (campRequested) router.setParams({ camp: '0' } as any);
    await persistOffset();
    const path = `${route}?from=camp`;
    router.push(path as any);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={handleScroll}
        onScrollEndDrag={(event) => void handleMomentumEnd(event)}
        onMomentumScrollEnd={(event) => void handleMomentumEnd(event)}
      >
        <View style={{ width: sceneWidth, height: sceneHeight, position: 'relative', overflow: 'hidden' }}>
          {Array.from({ length: backgroundCount }, (_, index) => (
            <ExpoImage
              key={`world-${index}`}
              source={ACTIVE_THEME.destinations.map.background}
              contentFit="cover"
              cachePolicy="memory-disk"
              allowDownscaling
              blurRadius={ACTIVE_THEME.destinations.backgroundBlurRadius}
              style={{ position: 'absolute', left: index * width, top: 0, width, height: sceneHeight }}
            />
          ))}

          {Array.from({ length: sceneCount }, (_, sceneIndex) => {
            const sceneX = ADVENTURE_LEFT_PAD + sceneIndex * ADVENTURE_DAYS_PER_SCENE * ADVENTURE_DAY_STEP;
            return (
              <React.Fragment key={`scene-${sceneIndex}`}>
                <Image
                  source={ACTIVE_THEME.world.mapVolcano}
                  resizeMode="contain"
                  style={[
                    styles.volcano,
                    { left: sceneX - 62, top: sceneIndex % 2 === 0 ? 82 : sceneHeight - 120 },
                  ]}
                />
                <Image
                  source={ACTIVE_THEME.world.mapIslands}
                  resizeMode="contain"
                  style={[
                    styles.islands,
                    { left: sceneX + ADVENTURE_DAY_STEP * 4.9, top: sceneIndex % 2 === 0 ? sceneHeight - 142 : 56 },
                  ]}
                />
              </React.Fragment>
            );
          })}

          {points.slice(0, -1).map((point, index) => {
            const next = points[index + 1];
            if (!next) return null;
            const x1 = point.x + ADVENTURE_NODE_SIZE / 2;
            const y1 = point.y + ADVENTURE_NODE_SIZE / 2;
            const x2 = next.x + ADVENTURE_NODE_SIZE / 2;
            const y2 = next.y + ADVENTURE_NODE_SIZE / 2;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View
                key={`path-${point.day.dayNumber}`}
                style={[
                  styles.connector,
                  {
                    width: length,
                    left: (x1 + x2) / 2 - length / 2,
                    top: (y1 + y2) / 2,
                    transform: [{ rotate: `${angle}deg` }],
                  },
                ]}
              />
            );
          })}

          {mapInvestments.map((investment, index) => {
            const point = points.find((candidate) => candidate.day.dayNumber === investment.targetLevelOrder);
            if (!point) return null;
            const companion = getInvestmentCompanion(investment.companionKey);
            const sameTargetBefore = mapInvestments
              .slice(0, index)
              .filter((candidate) => candidate.targetLevelOrder === investment.targetLevelOrder).length;
            return (
              <View
                key={investment.id}
                pointerEvents="none"
                style={[
                  styles.investmentMarker,
                  {
                    left: point.x - 36 + sameTargetBefore * 40,
                    top: Math.max(72, point.y - 100 - sameTargetBefore * 16),
                  },
                ]}
              >
                <View style={[styles.investmentBadge, investment.status === 'claimed' && styles.investmentBadgeClaimed]}>
                  <Text style={styles.investmentBadgeText}>
                    {investment.status === 'claimed'
                      ? `COBRADA · D${investment.targetLevelOrder}`
                      : `+${INVESTMENT_RETURN_PERCENT}% · D${investment.targetLevelOrder}`}
                  </Text>
                </View>
                <Image source={companion.asset} style={styles.investmentCompanion} resizeMode="contain" />
              </View>
            );
          })}

          {points.map(({ day, x, y }) => (
            <AdventureMapNode
              key={day.dayNumber}
              day={day}
              x={x}
              y={y}
              locked={day.dayNumber > currentDay}
              current={day.dayNumber === currentDay}
              title={displayTitle(day)}
              onPress={() => void openDay(day.dayNumber)}
            />
          ))}
        </View>
      </ScrollView>

      <View pointerEvents="box-none" style={[styles.hud, { left: Math.max(12, insets.left + 8), right: Math.max(12, insets.right + 8), top: Math.max(8, insets.top + 4) }]}>
        <Pressable onPress={() => setMenuOpen(true)} style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}>
          <Text style={styles.menuGlyph}>☰</Text>
        </Pressable>
        <View style={styles.mapTitle} pointerEvents="none">
          <Text style={styles.mapTitleText}>Mapa de aventuras</Text>
          <View style={styles.mapStage}><AdventureStageProgress dayNumber={currentDay} compact /></View>
        </View>
        <View style={styles.rightButtons}>
          <Pressable onPress={() => void navigateFromMenu('/arcade')} style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}>
            <Image source={ACTIVE_THEME.tabs.games} style={styles.circleIcon} resizeMode="contain" />
          </Pressable>
          <Pressable onPress={async () => { await persistOffset(); router.push('/shop'); }} style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}>
            <Image source={ACTIVE_THEME.shop.featuredItem} style={styles.circleIcon} resizeMode="contain" />
          </Pressable>
        </View>
      </View>

      <Image source={ACTIVE_THEME.world.mapCompass} style={[styles.compass, { left: Math.max(12, insets.left + 8), bottom: Math.max(10, insets.bottom + 8) }]} resizeMode="contain" />

      {current ? (
        <AdventureCurrentMissionCard
          day={current}
          title={displayTitle(current)}
          onPress={() => void openDay(current.dayNumber)}
        />
      ) : null}

      <View pointerEvents="none" style={[styles.moneyPill, { right: Math.max(12, insets.right + 8), bottom: Math.max(12, insets.bottom + 8) }]}>
        <Text style={styles.moneyLabel}>DISPONIBLE</Text>
        <Text style={styles.moneyValue}>{formatMoney(wallet?.availableCents ?? 0)}</Text>
      </View>

      <AdventureReturnToast completedDay={completedToastDay} currentDay={currentDay} onDone={dismissCompletedToast} />

      <AdventureCampMenu
        visible={menuOpen}
        profileName={profile.displayName}
        currentDay={currentDay}
        onClose={closeMenu}
        onNavigate={(route) => void navigateFromMenu(route)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.aqua },
  volcano: { position: 'absolute', width: 112, height: 84, opacity: 0.88 },
  islands: { position: 'absolute', width: 164, height: 104, opacity: 0.76 },
  connector: { position: 'absolute', height: 0, borderTopWidth: 3, borderStyle: 'dashed', borderColor: colors.ink, opacity: 0.78 },
  investmentMarker: { position: 'absolute', width: 86, height: 72, zIndex: 5, alignItems: 'center', justifyContent: 'flex-end' },
  investmentCompanion: { width: 78, height: 58 },
  investmentBadge: { position: 'absolute', top: 0, zIndex: 2, borderRadius: radii.pill, backgroundColor: colors.orange, borderWidth: 2, borderColor: colors.white, paddingHorizontal: 7, paddingVertical: 2, ...shadows.card },
  investmentBadgeText: { color: colors.white, fontSize: 7, fontWeight: '900' },
  investmentBadgeClaimed: { backgroundColor: colors.forest },
  hud: { position: 'absolute', left: 10, right: 10, top: 7, height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rightButtons: { flexDirection: 'row', gap: 6 },
  circleButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.glassCream, borderWidth: 2, borderColor: colors.forestDark, alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  circleIcon: { width: 22, height: 22 },
  menuGlyph: { color: colors.forestDark, fontSize: 18, lineHeight: 20, fontWeight: '900' },
  mapTitle: { width: 190, alignItems: 'center', paddingHorizontal: 10 },
  mapTitleText: { color: colors.white, fontSize: 14, lineHeight: 16, fontWeight: '900', textShadowColor: colors.ink, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 1 },
  mapStage: { width: 126, marginTop: 1 },
  compass: { position: 'absolute', left: 12, bottom: 10, width: 46, height: 46, opacity: 0.90 },
  moneyPill: { position: 'absolute', right: 12, bottom: 12, minWidth: 82, borderRadius: radii.pill, backgroundColor: colors.glassDark, borderWidth: 1.5, borderColor: colors.gold, paddingHorizontal: 9, paddingVertical: 4 },
  moneyLabel: { color: colors.cream, fontSize: 7, fontWeight: '900', letterSpacing: 0.9 },
  moneyValue: { color: colors.gold, fontSize: 11, fontWeight: '900' },
  pressed: { transform: [{ scale: 0.97 }] },
});
