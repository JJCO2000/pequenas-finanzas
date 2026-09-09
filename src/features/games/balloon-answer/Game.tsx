import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { GameComponentProps } from '@/core/game-runtime';
import { BALLOON_BUDGET_ROUNDS, type BalloonBudgetItem } from '@/content/games/balloonBudget';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows } from '@/core/theme/tokens';
import { FeedbackPill, GameProgress, HudChip } from '@/features/games/ui/GameChrome';
import { BalloonObject } from '@/features/games/ui/GameObjects';

const ROUND_SECONDS = 14;
const TOTAL_TARGETS = BALLOON_BUDGET_ROUNDS.reduce((sum, item) => sum + item.items.filter((candidate) => candidate.category === item.target).length, 0);

export function BalloonAnswerGame({ session, onFinish }: GameComponentProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [seconds, setSeconds] = useState(ROUND_SECONDS);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [popped, setPopped] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ text: string; good: boolean } | null>(null);
  const startRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const bestComboRef = useRef(0);
  const livesRef = useRef(3);
  const roundRef = useRef(0);
  const haptics = session.modifiers.hapticsEnabled !== false;
  const round = BALLOON_BUDGET_ROUNDS[roundIndex];

  const finish = (didComplete: boolean) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const finalCorrect = correctRef.current;
    const finalWrong = wrongRef.current;
    const finalBestCombo = bestComboRef.current;
    const accuracy = finalCorrect / Math.max(1, finalCorrect + finalWrong);
    const progress = finalCorrect / Math.max(1, TOTAL_TARGETS);
    const score = Math.round(Math.min(100, progress * 70 + accuracy * 20 + Math.min(10, finalBestCombo * 2)));
    onFinish({
      gameId: session.gameId,
      sessionId: session.sessionId,
      score,
      durationMs: Date.now() - startRef.current,
      completed: didComplete,
      metrics: { correct: finalCorrect, wrong: finalWrong, bestCombo: finalBestCombo, livesLeft: livesRef.current, rounds: roundRef.current + 1 },
    });
  };

  useEffect(() => {
    if (finishedRef.current) return;
    const timer = setInterval(() => {
      setSeconds((value) => {
        if (value > 1) return value - 1;
        setLives((current) => {
          const next = Math.max(0, current - 1);
          livesRef.current = next;
          if (next <= 0) setTimeout(() => finish(false), 0);
          return next;
        });
        setCombo(0);
        setFeedback({ text: 'Se acabó el tiempo de esta ronda. ¡Sigue!', good: false });
        setPopped(new Set());
        return ROUND_SECONDS;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [roundIndex]);

  if (!round) {
    finish(true);
    return null;
  }

  const targetCount = round.items.filter((item) => item.category === round.target).length;
  const poppedTargets = round.items.filter((item) => popped.has(item.id) && item.category === round.target).length;

  const handlePop = (item: BalloonBudgetItem) => {
    if (popped.has(item.id) || finishedRef.current) return;
    const good = item.category === round.target;
    setPopped((previous) => new Set(previous).add(item.id));
    if (good) {
      const nextCombo = combo + 1;
      correctRef.current += 1;
      setCorrect(correctRef.current);
      setCombo(nextCombo);
      bestComboRef.current = Math.max(bestComboRef.current, nextCombo);
      setBestCombo(bestComboRef.current);
      setFeedback({ text: `¡POP correcto! ${item.label} sí es ${round.target.toLowerCase()}.`, good: true });
      if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (poppedTargets + 1 >= targetCount) {
        setTimeout(() => {
          if (roundIndex >= BALLOON_BUDGET_ROUNDS.length - 1) finish(true);
          else {
            const nextRound = roundRef.current + 1;
            roundRef.current = nextRound;
            setRoundIndex(nextRound);
            setPopped(new Set());
            setSeconds(ROUND_SECONDS);
            setFeedback(null);
          }
        }, 520);
      }
    } else {
      wrongRef.current += 1;
      setWrong(wrongRef.current);
      setCombo(0);
      setLives((value) => {
        const next = Math.max(0, value - 1);
        livesRef.current = next;
        if (next <= 0) setTimeout(() => finish(false), 0);
        return next;
      });
      setFeedback({ text: `${item.label} pertenece a ${item.category}.`, good: false });
      if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  return (
    <ImageBackground source={ACTIVE_THEME.world.activity} resizeMode="cover" style={styles.root}>
      <View style={styles.top}>
        <View style={styles.targetBox}>
          <Text style={styles.round}>RONDA {roundIndex + 1}/{BALLOON_BUDGET_ROUNDS.length}</Text>
          <Text style={styles.target}>Revienta: {round.target.toUpperCase()}</Text>
          <Text style={styles.instruction}>{round.instruction}</Text>
        </View>
        <HudChip label="VIDAS" value={'♥'.repeat(lives) || '—'} tone={lives <= 1 ? 'danger' : 'dark'} />
        <HudChip label="RACHA" value={`×${combo}`} tone={combo >= 3 ? 'gold' : 'dark'} />
        <HudChip label="TIEMPO" value={`${seconds}s`} tone={seconds <= 4 ? 'danger' : 'dark'} />
      </View>
      <GameProgress value={(roundIndex + poppedTargets / targetCount) / BALLOON_BUDGET_ROUNDS.length} />
      <View style={styles.sky}>
        <Image source={ACTIVE_THEME.characters.primary} resizeMode="contain" style={styles.hero} />
        {round.items.map((item, index) => (
          <FloatingBalloon key={`${round.id}-${item.id}`} item={item} index={index} popped={popped.has(item.id)} onPress={() => handlePop(item)} />
        ))}
        <View style={styles.ground}><Text style={styles.groundText}>Lee, decide y toca antes de que escapen ↑</Text></View>
      </View>
      <View style={styles.feedbackRow}>
        {feedback ? <FeedbackPill text={feedback.text} good={feedback.good} /> : <Text style={styles.tip}>Piensa por categoría, no por color.</Text>}
      </View>
    </ImageBackground>
  );
}

function FloatingBalloon({ item, index, popped, onPress }: { item: BalloonBudgetItem; index: number; popped: boolean; onPress: () => void }) {
  const bob = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const balloonScale = useRef(new Animated.Value(1)).current;
  const burst = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: -13 - (index % 3) * 3, duration: 850 + index * 70, useNativeDriver: true }),
      Animated.timing(bob, { toValue: 8, duration: 900 + index * 60, useNativeDriver: true }),
    ]));
    const b = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: index % 2 === 0 ? 8 : -8, duration: 1100 + index * 80, useNativeDriver: true }),
      Animated.timing(sway, { toValue: index % 2 === 0 ? -7 : 7, duration: 1050 + index * 70, useNativeDriver: true }),
    ]));
    a.start(); b.start();
    return () => { a.stop(); b.stop(); };
  }, [bob, index, sway]);

  useEffect(() => {
    if (popped) {
      burst.setValue(0);
      Animated.parallel([
        Animated.sequence([
          Animated.spring(balloonScale, { toValue: 1.22, useNativeDriver: true }),
          Animated.timing(balloonScale, { toValue: 0, duration: 135, useNativeDriver: true }),
        ]),
        Animated.timing(burst, { toValue: 1, duration: 330, useNativeDriver: true }),
      ]).start();
    } else {
      balloonScale.setValue(1);
      burst.setValue(0);
    }
  }, [balloonScale, burst, popped]);

  const row = Math.floor(index / 3);
  const col = index % 3;
  const tone = (['orange', 'gold', 'aqua', 'green', 'purple'] as const)[index % 5] ?? 'orange';
  return (
    <Animated.View style={[styles.balloonWrap, { left: `${22 + col * 23}%`, top: row === 0 ? '3%' : '47%', transform: [{ translateX: sway }, { translateY: bob }] }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.popBurst,
          {
            opacity: burst.interpolate({ inputRange: [0, 0.18, 1], outputRange: [0, 1, 0] }),
            transform: [{ scale: burst.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1.7] }) }],
          },
        ]}
      >
        <View style={[styles.popParticle, styles.p1]} />
        <View style={[styles.popParticle, styles.p2]} />
        <View style={[styles.popParticle, styles.p3]} />
        <View style={[styles.popParticle, styles.p4]} />
        <View style={[styles.popParticle, styles.p5]} />
        <View style={[styles.popParticle, styles.p6]} />
      </Animated.View>
      <Animated.View style={{ transform: [{ scale: balloonScale }] }}>
        <Pressable disabled={popped} onPress={onPress} style={({ pressed }: { pressed: boolean }) => [pressed && styles.pressed]}>
          <BalloonObject label={item.label} tone={tone} />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', padding: 10, gap: 6 },
  top: { height: 42, flexDirection: 'row', gap: 9, alignItems: 'center', paddingLeft: 100, paddingRight: 48 },
  targetBox: { flex: 1, minWidth: 0, borderRadius: radii.lg, backgroundColor: 'rgba(5,75,51,0.90)', borderWidth: 1, borderColor: colors.leafSoft, paddingHorizontal: 12, paddingVertical: 6, ...shadows.soft },
  round: { color: colors.gold, fontSize: 8, fontWeight: '900', letterSpacing: 0.9 },
  target: { color: colors.white, fontSize: 12, lineHeight: 14, fontWeight: '900' },
  instruction: { color: colors.cream, fontSize: 8, lineHeight: 10, fontWeight: '700', marginTop: 1 },
  sky: { flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' },
  hero: { position: 'absolute', left: 14, bottom: 4, width: 70, height: 70 },
  balloonWrap: { position: 'absolute', width: 88, height: 128, alignItems: 'center', justifyContent: 'center' },
  popBurst: { position: 'absolute', width: 72, height: 72, left: 8, top: 15, zIndex: 5 },
  popParticle: { position: 'absolute', width: 9, height: 9, borderRadius: 5, backgroundColor: colors.gold, borderWidth: 1, borderColor: colors.white },
  p1: { left: 3, top: 29 }, p2: { right: 3, top: 29 }, p3: { left: 30, top: 2 }, p4: { left: 30, bottom: 2 }, p5: { left: 10, top: 9 }, p6: { right: 9, bottom: 10 },
  ground: { position: 'absolute', bottom: 5, alignSelf: 'center', left: '36%', right: '36%', minHeight: 24, borderRadius: radii.pill, backgroundColor: colors.glassDark, borderWidth: 1, borderColor: colors.leafSoft, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  groundText: { color: colors.white, fontSize: 8.5, fontWeight: '900', textAlign: 'center' },
  feedbackRow: { minHeight: 26, alignItems: 'center', justifyContent: 'center' },
  tip: { color: colors.forestDark, fontSize: 8, fontWeight: '800', backgroundColor: colors.glassCream, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
  pressed: { transform: [{ scale: 0.95 }] },
});
