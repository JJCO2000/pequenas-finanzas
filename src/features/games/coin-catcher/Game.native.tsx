import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';
import type { GameComponentProps } from '@/core/game-runtime';
import { circleIntersectsRect } from '@/core/game-runtime/systems/collision';
import { clamp } from '@/core/game-runtime/systems/movement';
import { deterministicSpawnX } from '@/core/game-runtime/systems/spawn';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows } from '@/core/theme/tokens';
import { getWorldLayout } from '@/features/shell/world';
import { GameProgress, HudChip } from '@/features/games/ui/GameChrome';

// Gameplay constants intentionally match the accepted v5 mechanics.
const COIN_R = 16;
const BONUS_R = 18;
const HAZARD_R = 20;
const BASE_BASKET_WIDTH = 98;
const BASKET_HEIGHT = 25;
const BASE_SECONDS = 35;

function numericModifier(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function useCenteredSpriteStyle(
  x: SharedValue<number>,
  y: SharedValue<number>,
  logicalW: number,
  logicalH: number,
  canvasScale: number,
) {
  return useAnimatedStyle(() => ({
    width: logicalW * canvasScale,
    height: logicalH * canvasScale,
    transform: [
      { translateX: (x.value - logicalW / 2) * canvasScale },
      { translateY: (y.value - logicalH / 2) * canvasScale },
    ],
  }));
}

export function CoinCatcherGame({ session, onFinish }: GameComponentProps) {
  const { width, height } = useWindowDimensions();

  // Uniform reference-canvas scaling: aspect-ratio differences reveal more world; they never stretch gameplay.
  const worldLayout = getWorldLayout(width, height);
  const canvasScale = worldLayout.scale;
  const stageWidth = worldLayout.logicalWidth;
  const stageHeight = worldLayout.logicalHeight;

  const extraSeconds = numericModifier(session.modifiers.extraSeconds);
  const basketWidthBonus = numericModifier(session.modifiers.basketWidthBonus);
  const magnetRadius = numericModifier(session.modifiers.magnetRadius);
  const scoreBonusEvery = numericModifier(session.modifiers.scoreBonusEvery);
  const hapticsEnabled = session.modifiers.hapticsEnabled !== false;
  const basketWidth = BASE_BASKET_WIDTH + basketWidthBonus;
  const basketY = stageHeight - 72;
  const totalSeconds = BASE_SECONDS + extraSeconds;
  const art = ACTIVE_THEME.coinCatcherArt;

  const basketX = useSharedValue<number>((stageWidth - basketWidth) / 2);
  const coin1X = useSharedValue<number>(stageWidth * 0.32);
  const coin1Y = useSharedValue<number>(-40);
  const coin2X = useSharedValue<number>(stageWidth * 0.7);
  const coin2Y = useSharedValue<number>(-170);
  const bonusX = useSharedValue<number>(stageWidth * 0.52);
  const bonusY = useSharedValue<number>(-520);
  const hazardX = useSharedValue<number>(stageWidth * 0.8);
  const hazardY = useSharedValue<number>(-330);
  const speed = useSharedValue<number>(178);
  const paused = useSharedValue<boolean>(true);
  const pausedRef = useRef(true);
  const finishedRef = useRef(false);
  const startRef = useRef(Date.now());
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [bonusCaught, setBonusCaught] = useState(0);
  const [hazards, setHazards] = useState(0);
  const [seconds, setSeconds] = useState(totalSeconds);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    basketX.value = clamp(basketX.value, 0, Math.max(0, stageWidth - basketWidth));
  }, [basketWidth, basketX, stageWidth]);

  const catchCoin = () => {
    setCombo((current) => {
      const next = current + 1;
      setBestCombo((best) => Math.max(best, next));
      setScore((currentScore) => {
        const bonus = scoreBonusEvery > 0 && next % scoreBonusEvery === 0 ? 1 : 0;
        return currentScore + 1 + bonus;
      });
      return next;
    });
    if (hapticsEnabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const catchBonus = () => {
    setScore((value) => value + 2);
    setCombo((current) => {
      const next = current + 1;
      setBestCombo((best) => Math.max(best, next));
      return next;
    });
    setBonusCaught((value) => value + 1);
    if (hapticsEnabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const hitHazard = () => {
    setCombo(0);
    setHazards((value) => value + 1);
    if (hapticsEnabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };
  const missCoin = () => setCombo(0);

  const frame = useFrameCallback((info) => {
    if (finishedRef.current || paused.value) return;
    const dt = Math.min(info.timeSincePreviousFrame ?? 16, 32) / 1000;
    const currentSpeed = speed.value;
    coin1Y.value += currentSpeed * dt;
    coin2Y.value += currentSpeed * 1.08 * dt;
    bonusY.value += currentSpeed * 0.78 * dt;
    hazardY.value += currentSpeed * 0.92 * dt;

    if (magnetRadius > 0) {
      const basketCenter = basketX.value + basketWidth / 2;
      for (const coin of [[coin1X, coin1Y], [coin2X, coin2Y]] as const) {
        const dx = basketCenter - coin[0].value;
        const dy = basketY - coin[1].value;
        if (dy > 0 && dy < magnetRadius * 2.3 && Math.abs(dx) < magnetRadius) {
          coin[0].value += dx * Math.min(1, dt * 4.1);
        }
      }
    }

    const reset = (x: typeof coin1X, y: typeof coin1Y, salt: number, vertical = 50) => {
      y.value = -vertical;
      x.value = deterministicSpawnX(info.timestamp + salt, 34, Math.max(35, stageWidth - 34));
    };

    if (circleIntersectsRect(coin1X.value, coin1Y.value, COIN_R, basketX.value, basketY, basketWidth, BASKET_HEIGHT)) {
      reset(coin1X, coin1Y, 11);
      speed.value = Math.min(330, speed.value + 3.3);
      scheduleOnRN(catchCoin);
    } else if (coin1Y.value > stageHeight + COIN_R) {
      reset(coin1X, coin1Y, 31);
      scheduleOnRN(missCoin);
    }

    if (circleIntersectsRect(coin2X.value, coin2Y.value, COIN_R, basketX.value, basketY, basketWidth, BASKET_HEIGHT)) {
      reset(coin2X, coin2Y, 53, 120);
      speed.value = Math.min(330, speed.value + 2.8);
      scheduleOnRN(catchCoin);
    } else if (coin2Y.value > stageHeight + COIN_R) {
      reset(coin2X, coin2Y, 71, 130);
      scheduleOnRN(missCoin);
    }

    if (circleIntersectsRect(bonusX.value, bonusY.value, BONUS_R, basketX.value, basketY, basketWidth, BASKET_HEIGHT)) {
      reset(bonusX, bonusY, 101, 500);
      scheduleOnRN(catchBonus);
    } else if (bonusY.value > stageHeight + BONUS_R) {
      reset(bonusX, bonusY, 131, 520);
    }

    if (circleIntersectsRect(hazardX.value, hazardY.value, HAZARD_R, basketX.value, basketY, basketWidth, BASKET_HEIGHT)) {
      reset(hazardX, hazardY, 173, 360);
      scheduleOnRN(hitHazard);
    } else if (hazardY.value > stageHeight + HAZARD_R) {
      reset(hazardX, hazardY, 199, 330);
    }
  }, true);

  useEffect(() => {
    if (countdown <= 0) {
      pausedRef.current = false;
      paused.value = false;
      startRef.current = Date.now();
      frame.setActive(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((value) => value - 1), 650);
    return () => clearTimeout(timer);
  }, [countdown, frame, paused]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      const isPaused = state !== 'active' || countdown > 0;
      pausedRef.current = isPaused;
      paused.value = isPaused;
      frame.setActive(!isPaused && !finishedRef.current);
    });
    return () => sub.remove();
  }, [countdown, frame, paused]);

  useEffect(() => {
    if (countdown > 0) return;
    const timer = setInterval(() => {
      if (pausedRef.current || finishedRef.current) return;
      setSeconds((value) => {
        if (value > 1) return value - 1;
        finishedRef.current = true;
        paused.value = true;
        frame.setActive(false);
        return 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, frame, paused]);

  useEffect(() => {
    if (seconds > 0 || !finishedRef.current) return;
    onFinish({
      gameId: session.gameId,
      sessionId: session.sessionId,
      score,
      durationMs: Date.now() - startRef.current,
      completed: true,
      metrics: { coins: score, bestCombo, bonusCaught, hazards, extraSeconds, basketWidthBonus, magnetRadius, scoreBonusEvery },
    });
  }, [basketWidthBonus, bestCombo, bonusCaught, extraSeconds, hazards, magnetRadius, onFinish, score, scoreBonusEvery, seconds, session.gameId, session.sessionId]);

  const pan = useMemo(() => Gesture.Pan()
    .onBegin((event) => {
      const logicalX = event.x / canvasScale;
      basketX.value = clamp(logicalX - basketWidth / 2, 0, stageWidth - basketWidth);
    })
    .onChange((event) => {
      const logicalX = event.x / canvasScale;
      basketX.value = clamp(logicalX - basketWidth / 2, 0, stageWidth - basketWidth);
    }), [basketWidth, basketX, canvasScale, stageWidth]);

  // Visual art can be richer/larger than the unchanged v5 collision geometry.
  const coin1Style = useCenteredSpriteStyle(coin1X, coin1Y, 56, 64, canvasScale);
  const coin2Style = useCenteredSpriteStyle(coin2X, coin2Y, 56, 64, canvasScale);
  const bonusStyle = useCenteredSpriteStyle(bonusX, bonusY, 62, 70, canvasScale);
  const hazardStyle = useCenteredSpriteStyle(hazardX, hazardY, 72, 78, canvasScale);
  const basketVisualWidth = basketWidth + 64;
  const basketStyle = useAnimatedStyle(() => ({
    width: basketVisualWidth * canvasScale,
    height: 76 * canvasScale,
    transform: [
      { translateX: (basketX.value - (basketVisualWidth - basketWidth) / 2) * canvasScale },
      { translateY: (basketY - 30) * canvasScale },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.root}>
        <ExpoImage
          source={ACTIVE_THEME.world.coinField ?? ACTIVE_THEME.world.activity}
          contentFit="cover"
          contentPosition="center"
          cachePolicy="memory-disk"
          allowDownscaling
          style={styles.background}
        />
        <View pointerEvents="none" style={styles.hud}>
          <HudChip label="MONEDAS" value={score} tone="light" />
          <HudChip label="RACHA" value={`×${combo}`} tone={combo >= 4 ? 'gold' : 'light'} />
          <HudChip label="TIEMPO" value={`${seconds}s`} tone={seconds <= 7 ? 'danger' : 'light'} />
        </View>
        <View pointerEvents="none" style={styles.progressWrap}><GameProgress value={1 - seconds / totalSeconds} /></View>

        {art ? (
          <>
            <Animated.Image source={art.coin} resizeMode="contain" style={[styles.moving, coin1Style]} />
            <Animated.Image source={art.coin} resizeMode="contain" style={[styles.moving, coin2Style]} />
            <Animated.Image source={art.bonus} resizeMode="contain" style={[styles.moving, bonusStyle]} />
            <Animated.Image source={art.hazard} resizeMode="contain" style={[styles.moving, hazardStyle]} />
            <Animated.Image source={art.basket} resizeMode="contain" style={[styles.moving, basketStyle]} />
          </>
        ) : (
          <>
            <Animated.View style={[styles.fallbackCoin, coin1Style]}><Text style={styles.fallbackGlyph}>$</Text></Animated.View>
            <Animated.View style={[styles.fallbackCoin, coin2Style]}><Text style={styles.fallbackGlyph}>$</Text></Animated.View>
            <Animated.View style={[styles.fallbackBonus, bonusStyle]}><Text style={styles.fallbackGlyph}>★</Text></Animated.View>
            <Animated.View style={[styles.fallbackHazard, hazardStyle]}><Text style={styles.fallbackGlyph}>!</Text></Animated.View>
            <Animated.View style={[styles.fallbackBasket, basketStyle]} />
          </>
        )}

        <Image source={art?.hero ?? ACTIVE_THEME.characters.primary} style={styles.hero} resizeMode="contain" />
        <View pointerEvents="none" style={styles.dragHint}><Text style={styles.dragHintText}>☝  Arrastra la canasta</Text></View>
        {countdown > 0 ? <View pointerEvents="none" style={styles.countdown}><Text style={styles.countdownNumber}>{countdown}</Text><Text style={styles.countdownText}>PREPÁRATE</Text></View> : null}
        {combo >= 3 ? <View pointerEvents="none" style={styles.comboBurst}><Text style={styles.comboBurstText}>🔥 ×{combo}</Text></View> : null}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: colors.sky },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  moving: { position: 'absolute', left: 0, top: 0, zIndex: 4 },
  hud: { position: 'absolute', zIndex: 8, top: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  progressWrap: { position: 'absolute', zIndex: 7, top: 60, left: '30%', right: '30%' },
  hero: { position: 'absolute', left: 26, bottom: 22, width: 118, height: 118, zIndex: 5 },
  dragHint: { position: 'absolute', bottom: 10, alignSelf: 'center', minWidth: 180, minHeight: 34, borderRadius: radii.pill, backgroundColor: 'rgba(4,73,49,0.93)', borderWidth: 1, borderColor: '#85C77B', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, ...shadows.card },
  dragHintText: { color: colors.white, fontSize: 9.5, fontWeight: '900' },
  countdown: { position: 'absolute', alignSelf: 'center', top: '34%', width: 108, height: 108, borderRadius: 54, backgroundColor: 'rgba(255,253,243,0.96)', borderWidth: 3, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', ...shadows.card },
  countdownNumber: { color: colors.forestDark, fontSize: 44, lineHeight: 46, fontWeight: '900' },
  countdownText: { color: colors.orange, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  comboBurst: { position: 'absolute', right: 42, top: 68, borderRadius: radii.pill, backgroundColor: '#FF8C45', borderWidth: 2, borderColor: '#FFD0AE', paddingHorizontal: 10, paddingVertical: 5, ...shadows.soft },
  comboBurstText: { color: colors.white, fontSize: 10.5, fontWeight: '900' },
  fallbackCoin: { position: 'absolute', left: 0, top: 0, zIndex: 4, borderRadius: 999, backgroundColor: '#FFD54F', borderWidth: 3, borderColor: '#FFF3A5', alignItems: 'center', justifyContent: 'center' },
  fallbackBonus: { position: 'absolute', left: 0, top: 0, zIndex: 4, borderRadius: 999, backgroundColor: '#4DBCE8', borderWidth: 3, borderColor: '#D8F6FF', alignItems: 'center', justifyContent: 'center' },
  fallbackHazard: { position: 'absolute', left: 0, top: 0, zIndex: 4, borderRadius: 999, backgroundColor: '#E85A45', borderWidth: 3, borderColor: '#FFD2C9', alignItems: 'center', justifyContent: 'center' },
  fallbackBasket: { position: 'absolute', left: 0, top: 0, zIndex: 4, borderRadius: 18, backgroundColor: '#B66C37', borderWidth: 3, borderColor: '#F0B06B' },
  fallbackGlyph: { color: '#083E2C', fontWeight: '900', fontSize: 20 },
});
