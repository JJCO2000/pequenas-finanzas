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

function orderedItems(items: BalloonBudgetItem[], roundIndex: number) {
  const offset = (roundIndex * 2 + 1) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

export function BalloonAnswerGame({ session, onFinish }: GameComponentProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [seconds, setSeconds] = useState(4);
  const [feedback, setFeedback] = useState<{ text: string; good: boolean } | null>(null);
  const [resolved, setResolved] = useState(false);
  const startRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const bestComboRef = useRef(0);
  const livesRef = useRef(START_LIVES);
  const haptics = session.modifiers.hapticsEnabled !== false;
  const round = BALLOON_BUDGET_ROUNDS[roundIndex];
  const queue = useMemo(() => round ? orderedItems(round.items, roundIndex) : [], [round, roundIndex]);
  const activeItem = queue[itemIndex] ?? null;
  const flightMs = Math.max(2450, 3900 - roundIndex * 380 - bestCombo * 45);

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

  const advance = () => {
    if (finishedRef.current) return;
    setFeedback(null);
    setResolved(false);
    setSeconds(Math.max(3, Math.ceil(flightMs / 1000)));
    if (itemIndex < queue.length - 1) {
      setItemIndex((value) => value + 1);
      return;
    }
    if (roundIndex >= BALLOON_BUDGET_ROUNDS.length - 1) {
      finish(true);
      return;
    }
    setRoundIndex((value) => value + 1);
    setItemIndex(0);
  };

  useEffect(() => {
    if (!activeItem || resolved || finishedRef.current) return;
    setSeconds(Math.max(3, Math.ceil(flightMs / 1000)));
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [activeItem?.id, flightMs, resolved]);

  if (!round || !activeItem) {
    if (!finishedRef.current) finish(true);
    return null;
  }

  const loseLife = (message: string) => {
    wrongRef.current += 1;
    setWrong(wrongRef.current);
    setCombo(0);
    const nextLives = Math.max(0, livesRef.current - 1);
    livesRef.current = nextLives;
    setLives(nextLives);
    setFeedback({ text: message, good: false });
    if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (nextLives <= 0) setTimeout(() => finish(false), 420);
    else setTimeout(advance, 520);
  };

  const handlePop = () => {
    if (resolved || finishedRef.current) return;
    setResolved(true);
    const good = activeItem.category === round.target;
    if (!good) {
      loseLife(`${activeItem.label} es ${activeItem.category.toLowerCase()}. Ese globo debías dejarlo pasar.`);
      return;
    }
    const nextCombo = combo + 1;
    correctRef.current += 1;
    setCorrect(correctRef.current);
    setCombo(nextCombo);
    bestComboRef.current = Math.max(bestComboRef.current, nextCombo);
    setBestCombo(bestComboRef.current);
    setFeedback({ text: `¡POP! ${activeItem.label} sí pertenece a ${round.target.toLowerCase()}.`, good: true });
    if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(advance, 430);
  };

  const handleEscape = () => {
    if (resolved || finishedRef.current) return;
    setResolved(true);
    if (activeItem.category === round.target) {
      loseLife(`Se escapó ${activeItem.label}. Era ${round.target.toLowerCase()} y debías reventarlo.`);
      return;
    }
    setFeedback({ text: `Bien ignorado: ${activeItem.label} es ${activeItem.category.toLowerCase()}.`, good: true });
    if (haptics) void Haptics.selectionAsync();
    setTimeout(advance, 330);
  };

  const completedItems = roundIndex * 6 + itemIndex;
  const totalItems = BALLOON_BUDGET_ROUNDS.length * 6;

  return (
    <ImageBackground source={ACTIVE_THEME.world.activity} resizeMode="cover" style={styles.root}>
      <View style={styles.top}>
        <View style={styles.targetBox}>
          <Text style={styles.round}>GLOBO {itemIndex + 1}/6 · RONDA {roundIndex + 1}/3</Text>
          <Text style={styles.target}>REVIENTA SOLO: {round.target.toUpperCase()}</Text>
          <Text style={styles.instruction}>Si no pertenece a {round.target.toLowerCase()}, déjalo escapar.</Text>
        </View>
        <HudChip label="VIDAS" value={'♥'.repeat(lives) || '—'} tone={lives <= 1 ? 'danger' : 'dark'} />
        <HudChip label="RACHA" value={`×${combo}`} tone={combo >= 3 ? 'gold' : 'dark'} />
        <HudChip label="SUBE EN" value={`${seconds}s`} tone={seconds <= 1 ? 'danger' : 'dark'} />
      </View>
      <GameProgress value={(completedItems + (resolved ? 0.8 : 0.25)) / totalItems} />

      <View style={styles.sky}>
        <View style={styles.escapeLine}><Text style={styles.escapeText}>↑ ZONA DE ESCAPE</Text></View>
        <Image source={ACTIVE_THEME.characters.primary} resizeMode="contain" style={styles.hero} />
        <View style={styles.targetReminder}><Text style={styles.targetReminderSmall}>BUSCA</Text><Text style={styles.targetReminderBig}>{round.target.toUpperCase()}</Text></View>
        <RisingBalloon
          key={`${round.id}-${activeItem.id}-${itemIndex}`}
          item={activeItem}
          index={itemIndex + roundIndex * 2}
          duration={flightMs}
          resolved={resolved}
          onPress={handlePop}
          onEscape={handleEscape}
        />
        <View style={styles.decisionHint}>
          <Text style={styles.decisionTitle}>¿PERTENECE A {round.target.toUpperCase()}?</Text>
          <Text style={styles.decisionCopy}>Sí → revienta · No → no toques</Text>
        </View>
      </View>
      <View style={styles.feedbackRow}>
        {feedback ? <FeedbackPill text={feedback.text} good={feedback.good} /> : <Text style={styles.tip}>Ahora sí importa decidir rápido: los globos realmente escapan.</Text>}
      </View>
    </ImageBackground>
  );
}

function RisingBalloon({ item, index, duration, resolved, onPress, onEscape }: {
  item: BalloonBudgetItem;
  index: number;
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

  useEffect(() => {
    escapedRef.current = false;
    travel.setValue(0);
    const rise = Animated.timing(travel, { toValue: 1, duration, useNativeDriver: true });
    const swayLoop = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(sway, { toValue: -1, duration: 620, useNativeDriver: true }),
    ]));
    swayLoop.start();
    rise.start(({ finished }) => {
      if (finished && !escapedRef.current) {
        escapedRef.current = true;
        onEscape();
      }
    });
    return () => { rise.stop(); swayLoop.stop(); };
  }, [duration, item.id, onEscape, sway, travel]);

  useEffect(() => {
    if (!resolved) return;
    escapedRef.current = true;
  }, [resolved]);

  const pop = () => {
    if (resolved) return;
    escapedRef.current = true;
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.22, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0, duration: 130, useNativeDriver: true }),
      ]),
      Animated.timing(burst, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const lane = index % 3;
  const tone = (['orange', 'gold', 'aqua', 'green', 'purple'] as const)[index % 5] ?? 'orange';
  return (
    <Animated.View style={[
      styles.risingWrap,
      { left: `${34 + lane * 15}%` as `${number}%`, transform: [
        { translateY: travel.interpolate({ inputRange: [0, 1], outputRange: [190, -165] }) },
        { translateX: sway.interpolate({ inputRange: [-1, 1], outputRange: [-13, 13] }) },
      ] },
    ]}>
      <Animated.View pointerEvents="none" style={[styles.popBurst, { opacity: burst.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }), transform: [{ scale: burst.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1.8] }) }] }]}>
        {[0, 1, 2, 3, 4, 5].map((particle) => <View key={particle} style={[styles.popParticle, { transform: [{ rotate: `${particle * 60}deg` }, { translateY: -28 }] }]} />)}
      </Animated.View>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Globo ${item.label}`} disabled={resolved} onPress={pop} style={({ pressed }) => [pressed && styles.pressed]}>
          <BalloonObject label={item.label} tone={tone} />
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
  escapeLine: { position: 'absolute', top: 4, left: '29%', right: '20%', borderTopWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.72)', alignItems: 'center' },
  escapeText: { color: colors.white, fontSize: 6, fontWeight: '900', backgroundColor: 'rgba(8,72,50,0.82)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: radii.pill, marginTop: -8 },
  hero: { position: 'absolute', left: 12, bottom: 2, width: 72, height: 72 },
  targetReminder: { position: 'absolute', left: 86, top: '30%', width: 95, minHeight: 48, borderRadius: 17, backgroundColor: 'rgba(255,253,243,0.93)', borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  targetReminderSmall: { color: colors.inkMuted, fontSize: 5.5, fontWeight: '900', letterSpacing: 1 },
  targetReminderBig: { color: colors.forestDark, fontSize: 9.5, fontWeight: '900', marginTop: 1 },
  risingWrap: { position: 'absolute', bottom: 0, width: 88, height: 128, alignItems: 'center', justifyContent: 'center' },
  popBurst: { position: 'absolute', width: 74, height: 74, left: 7, top: 16, zIndex: 5 },
  popParticle: { position: 'absolute', left: 32, top: 31, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.gold, borderWidth: 1, borderColor: colors.white },
  decisionHint: { position: 'absolute', bottom: 5, left: '31%', right: '25%', minHeight: 34, borderRadius: radii.pill, backgroundColor: colors.glassDark, borderWidth: 2, borderColor: colors.leafSoft, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, ...shadows.soft },
  decisionTitle: { color: colors.gold, fontSize: 7, fontWeight: '900', letterSpacing: 0.45 },
  decisionCopy: { color: colors.white, fontSize: 7.4, fontWeight: '800', marginTop: 1 },
  feedbackRow: { minHeight: 26, alignItems: 'center', justifyContent: 'center' },
  tip: { color: colors.forestDark, fontSize: 8, fontWeight: '800', backgroundColor: colors.glassCream, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
  pressed: { transform: [{ scale: 0.95 }] },
});
