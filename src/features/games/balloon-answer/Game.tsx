import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { GameComponentProps } from '@/core/game-runtime';
import { BALLOON_BUDGET_ROUNDS, type BalloonBudgetItem } from '@/content/games/balloonBudget';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows } from '@/core/theme/tokens';
import { FeedbackPill, GameProgress, HudChip } from '@/features/games/ui/GameChrome';
import { BalloonObject } from '@/features/games/ui/GameObjects';

const TOTAL_TARGETS = BALLOON_BUDGET_ROUNDS.reduce((sum, item) => sum + item.items.filter((candidate) => candidate.category === item.target).length, 0);
const START_LIVES = 3;
const ITEMS_PER_WAVE = 2;

const ITEM_ICON: Record<string, string> = {
  water: '💧', notebook: '📒', toy: '🧸', candy: '🍬', goal: '🎯', emergency: '🛟',
  medicine: '💊', lunch: '🥪', stickers: '✨', game: '🎮', bike: '🚲', trip: '✈️',
  rent: '🚌', uniform: '👕', plush: '🧸', snack: '🍪', console: '🎮', rainy: '☔',
};

function orderedItems(items: BalloonBudgetItem[], roundIndex: number) {
  const offset = (roundIndex * 2 + 1) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

export function BalloonAnswerGame({ session, onFinish }: GameComponentProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [waveIndex, setWaveIndex] = useState(0);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [lives, setLives] = useState(START_LIVES);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [seconds, setSeconds] = useState(7);
  const [feedback, setFeedback] = useState<{ text: string; good: boolean } | null>(null);
  const startRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const bestComboRef = useRef(0);
  const livesRef = useRef(START_LIVES);
  const haptics = session.modifiers.hapticsEnabled !== false;
  const round = BALLOON_BUDGET_ROUNDS[roundIndex];
  const queue = useMemo(() => round ? orderedItems(round.items, roundIndex) : [], [round, roundIndex]);
  const waveItems = useMemo(() => queue.slice(waveIndex * ITEMS_PER_WAVE, waveIndex * ITEMS_PER_WAVE + ITEMS_PER_WAVE), [queue, waveIndex]);
  const flightMs = Math.max(5200, 6800 - roundIndex * 500 - Math.min(700, bestCombo * 70));

  const finish = (didComplete: boolean) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const finalCorrect = correctRef.current;
    const finalWrong = wrongRef.current;
    const finalBestCombo = bestComboRef.current;
    const accuracy = finalCorrect / Math.max(1, finalCorrect + finalWrong);
    const progress = finalCorrect / Math.max(1, TOTAL_TARGETS);
    const score = Math.round(Math.min(100, progress * 72 + accuracy * 18 + Math.min(10, finalBestCombo * 2)));
    onFinish({
      gameId: session.gameId,
      sessionId: session.sessionId,
      score,
      durationMs: Date.now() - startRef.current,
      completed: didComplete,
      metrics: { correct: finalCorrect, wrong: finalWrong, bestCombo: finalBestCombo, livesLeft: livesRef.current, rounds: roundIndex + 1 },
    });
  };

  const advanceWave = () => {
    if (finishedRef.current) return;
    setFeedback(null);
    setResolvedIds([]);
    if (waveIndex < Math.ceil(queue.length / ITEMS_PER_WAVE) - 1) {
      setWaveIndex((value) => value + 1);
      return;
    }
    if (roundIndex >= BALLOON_BUDGET_ROUNDS.length - 1) {
      finish(true);
      return;
    }
    setRoundIndex((value) => value + 1);
    setWaveIndex(0);
  };

  const markResolved = (itemId: string, delay = 520) => {
    setResolvedIds((previous) => {
      if (previous.includes(itemId)) return previous;
      const next = [...previous, itemId];
      if (next.length >= waveItems.length) setTimeout(advanceWave, delay);
      return next;
    });
  };

  useEffect(() => {
    if (!round || waveItems.length === 0 || finishedRef.current) return;
    setSeconds(Math.max(5, Math.ceil(flightMs / 1000)));
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [flightMs, round?.id, waveIndex, waveItems.length]);

  if (!round || waveItems.length === 0) {
    if (!finishedRef.current) finish(true);
    return null;
  }

  const loseLife = (message: string, itemId: string) => {
    wrongRef.current += 1;
    setWrong(wrongRef.current);
    setCombo(0);
    const nextLives = Math.max(0, livesRef.current - 1);
    livesRef.current = nextLives;
    setLives(nextLives);
    setFeedback({ text: message, good: false });
    if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    markResolved(itemId, 650);
    if (nextLives <= 0) setTimeout(() => finish(false), 520);
  };

  const handlePop = (item: BalloonBudgetItem) => {
    if (resolvedIds.includes(item.id) || finishedRef.current) return;
    const good = item.category === round.target;
    if (!good) {
      loseLife(`${item.label} es ${item.category.toLowerCase()}. Ese globo debías dejarlo escapar.`, item.id);
      return;
    }
    const nextCombo = combo + 1;
    correctRef.current += 1;
    setCorrect(correctRef.current);
    setCombo(nextCombo);
    bestComboRef.current = Math.max(bestComboRef.current, nextCombo);
    setBestCombo(bestComboRef.current);
    setFeedback({ text: `¡POP! ${item.label} sí pertenece a ${round.target.toLowerCase()}.`, good: true });
    if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    markResolved(item.id, 440);
  };

  const handleEscape = (item: BalloonBudgetItem) => {
    if (resolvedIds.includes(item.id) || finishedRef.current) return;
    if (item.category === round.target) {
      loseLife(`Se escapó ${item.label}. Era ${round.target.toLowerCase()} y debías reventarlo.`, item.id);
      return;
    }
    setFeedback({ text: `Bien: dejaste pasar ${item.label}; es ${item.category.toLowerCase()}.`, good: true });
    if (haptics) void Haptics.selectionAsync();
    markResolved(item.id, 360);
  };

  const completedItems = roundIndex * 6 + waveIndex * ITEMS_PER_WAVE + resolvedIds.length;
  const totalItems = BALLOON_BUDGET_ROUNDS.length * 6;

  return (
    <ImageBackground source={ACTIVE_THEME.world.activity} resizeMode="cover" style={styles.root}>
      <View style={styles.top}>
        <View style={styles.targetBox}>
          <Text style={styles.round}>OLEADA {waveIndex + 1}/3 · RONDA {roundIndex + 1}/3</Text>
          <Text style={styles.target}>REVIENTA SOLO: {round.target.toUpperCase()}</Text>
          <Text style={styles.instruction}>Mira dibujo + palabra. Toca los que sí cumplen; deja escapar los demás.</Text>
        </View>
        <HudChip label="VIDAS" value={'♥'.repeat(lives) || '—'} tone={lives <= 1 ? 'danger' : 'dark'} />
        <HudChip label="RACHA" value={`×${combo}`} tone={combo >= 3 ? 'gold' : 'dark'} />
        <HudChip label="TIEMPO" value={`${seconds}s`} tone={seconds <= 2 ? 'danger' : 'dark'} />
      </View>
      <GameProgress value={(completedItems + 0.2) / totalItems} />

      <View style={styles.sky}>
        <View pointerEvents="none" style={styles.escapeLine}><Text style={styles.escapeText}>↑ ZONA DE ESCAPE</Text></View>
        <Image pointerEvents="none" source={ACTIVE_THEME.characters.primary} resizeMode="contain" style={styles.hero} />
        <View pointerEvents="none" style={styles.targetReminder}><Text style={styles.targetReminderSmall}>BUSCA</Text><Text style={styles.targetReminderBig}>{round.target.toUpperCase()}</Text></View>

        {waveItems.map((item, index) => (
          <RisingBalloon
            key={`${round.id}-${waveIndex}-${item.id}`}
            item={item}
            icon={ITEM_ICON[item.id] ?? '💰'}
            lane={index}
            duration={flightMs + index * 260}
            resolved={resolvedIds.includes(item.id)}
            onPress={() => handlePop(item)}
            onEscape={() => handleEscape(item)}
          />
        ))}

        <View pointerEvents="none" style={styles.decisionHint}>
          <Text style={styles.decisionTitle}>DOS GLOBOS · UNA DECISIÓN POR CADA UNO</Text>
          <Text style={styles.decisionCopy}>Sí pertenece → revienta · No pertenece → déjalo subir</Text>
        </View>
      </View>
      <View pointerEvents="none" style={styles.feedbackRow}>
        {feedback ? <FeedbackPill text={feedback.text} good={feedback.good} /> : <Text style={styles.tip}>Tienes más tiempo y dos objetos a la vez para comparar.</Text>}
      </View>
    </ImageBackground>
  );
}

function RisingBalloon({ item, icon, lane, duration, resolved, onPress, onEscape }: {
  item: BalloonBudgetItem;
  icon: string;
  lane: number;
  duration: number;
  resolved: boolean;
  onPress: () => void;
  onEscape: () => void;
}) {
  const travel = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const escapedRef = useRef(false);
  const pressedRef = useRef(false);
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    escapedRef.current = false;
    pressedRef.current = false;
    travel.setValue(0);
    scale.setValue(1);
    burst.setValue(0);
    const rise = Animated.timing(travel, { toValue: 1, duration, useNativeDriver: true });
    const swayLoop = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(sway, { toValue: -1, duration: 820, useNativeDriver: true }),
    ]));
    swayLoop.start();
    rise.start(({ finished }) => {
      if (finished && !escapedRef.current) {
        escapedRef.current = true;
        onEscapeRef.current();
      }
    });
    return () => { rise.stop(); swayLoop.stop(); };
  }, [burst, duration, item.id, scale, sway, travel]);

  useEffect(() => {
    if (!resolved) return;
    escapedRef.current = true;
  }, [resolved]);

  const pop = () => {
    if (resolved || pressedRef.current) return;
    pressedRef.current = true;
    escapedRef.current = true;
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.18, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]),
      Animated.timing(burst, { toValue: 1, duration: 340, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const tone = lane === 0 ? 'gold' : 'aqua';
  return (
    <Animated.View
      pointerEvents={resolved ? 'none' : 'box-none'}
      style={[
        styles.risingWrap,
        { left: lane === 0 ? '42%' : '66%', transform: [
          { translateY: travel.interpolate({ inputRange: [0, 1], outputRange: [190, -170] }) },
          { translateX: sway.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] }) },
        ] },
      ]}
    >
      <Animated.View pointerEvents="none" style={[styles.popBurst, { opacity: burst.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }), transform: [{ scale: burst.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1.8] }) }] }]}>
        {[0, 1, 2, 3, 4, 5].map((particle) => <View key={particle} style={[styles.popParticle, { transform: [{ rotate: `${particle * 60}deg` }, { translateY: -28 }] }]} />)}
      </Animated.View>
      <Animated.View pointerEvents="box-none" style={{ transform: [{ scale }] }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Reventar globo ${item.label}`}
          accessibilityState={{ disabled: resolved }}
          disabled={resolved}
          hitSlop={14}
          onPressIn={pop}
          style={({ pressed }) => [styles.balloonButton, pressed && !resolved && styles.pressed]}
        >
          <BalloonObject label={item.label} tone={tone} />
          <View pointerEvents="none" style={styles.itemIcon}><Text style={styles.itemIconText}>{icon}</Text></View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', padding: 10, gap: 6 },
  top: { height: 42, flexDirection: 'row', gap: 9, alignItems: 'center', paddingLeft: 100, paddingRight: 48 },
  targetBox: { flex: 1, minWidth: 0, borderRadius: radii.lg, backgroundColor: 'rgba(5,75,51,0.92)', borderWidth: 2, borderColor: colors.leafSoft, paddingHorizontal: 12, paddingVertical: 5, ...shadows.soft },
  round: { color: colors.gold, fontSize: 6.8, fontWeight: '900', letterSpacing: 0.8 },
  target: { color: colors.white, fontSize: 11.5, lineHeight: 13, fontWeight: '900' },
  instruction: { color: colors.cream, fontSize: 7.3, lineHeight: 9, fontWeight: '700', marginTop: 1 },
  sky: { flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' },
  escapeLine: { position: 'absolute', top: 4, left: '29%', right: '16%', borderTopWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.72)', alignItems: 'center' },
  escapeText: { color: colors.white, fontSize: 6, fontWeight: '900', backgroundColor: 'rgba(8,72,50,0.82)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: radii.pill, marginTop: -8 },
  hero: { position: 'absolute', left: 12, bottom: 2, width: 72, height: 72 },
  targetReminder: { position: 'absolute', left: 86, top: '27%', width: 105, minHeight: 52, borderRadius: 17, backgroundColor: 'rgba(255,253,243,0.95)', borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  targetReminderSmall: { color: colors.inkMuted, fontSize: 5.5, fontWeight: '900', letterSpacing: 1 },
  targetReminderBig: { color: colors.forestDark, fontSize: 10, fontWeight: '900', marginTop: 1 },
  risingWrap: { position: 'absolute', bottom: 0, width: 118, height: 150, alignItems: 'center', justifyContent: 'center', zIndex: 20, elevation: 20 },
  balloonButton: { width: 110, height: 144, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  itemIcon: { position: 'absolute', top: 31, alignSelf: 'center', width: 40, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.90)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.98)', alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  itemIconText: { fontSize: 18, lineHeight: 20 },
  popBurst: { position: 'absolute', width: 74, height: 74, left: 22, top: 25, zIndex: 25 },
  popParticle: { position: 'absolute', left: 32, top: 31, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.gold, borderWidth: 1, borderColor: colors.white },
  decisionHint: { position: 'absolute', bottom: 5, left: '31%', right: '18%', minHeight: 36, borderRadius: radii.pill, backgroundColor: colors.glassDark, borderWidth: 2, borderColor: colors.leafSoft, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, ...shadows.soft },
  decisionTitle: { color: colors.gold, fontSize: 6.5, fontWeight: '900', letterSpacing: 0.4 },
  decisionCopy: { color: colors.white, fontSize: 7.2, fontWeight: '800', marginTop: 1 },
  feedbackRow: { minHeight: 26, alignItems: 'center', justifyContent: 'center' },
  tip: { color: colors.forestDark, fontSize: 8, fontWeight: '800', backgroundColor: colors.glassCream, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
  pressed: { transform: [{ scale: 0.96 }] },
});
