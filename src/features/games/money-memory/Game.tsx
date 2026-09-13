import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { GameComponentProps } from '@/core/game-runtime';
import { MONEY_MEMORY_CARDS, type MoneyMemoryCard } from '@/content/games/moneyMemory';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows } from '@/core/theme/tokens';
import { FeedbackPill, GameProgress, HudChip } from '@/features/games/ui/GameChrome';

const TOTAL_ROUNDS = 6;

type Phase = 'memorize' | 'shuffle' | 'reveal' | 'choose' | 'feedback';

const MEMORY_VISUALS: Record<string, { glyph: string; caption: string; tone: string }> = {
  'saving-concept': { glyph: '🐷', caption: 'GUARDAR', tone: '#FFF0C4' },
  'saving-action': { glyph: '🎯', caption: 'META', tone: '#E2F4D7' },
  'budget-concept': { glyph: '🧾', caption: 'CUENTAS', tone: '#E0F1FA' },
  'budget-action': { glyph: '📋', caption: 'PLAN', tone: '#EFE6FF' },
  'need-concept': { glyph: '💧', caption: 'ESENCIAL', tone: '#DCF4F8' },
  'need-action': { glyph: '❤️', caption: 'IMPORTANTE', tone: '#FFE1DE' },
  'invest-concept': { glyph: '🌱', caption: 'CRECER', tone: '#E0F3D6' },
  'invest-action': { glyph: '📈', caption: 'FUTURO', tone: '#FFF0D7' },
};

function deterministicOrder(items: MoneyMemoryCard[], round: number) {
  const score = (item: MoneyMemoryCard) => [...item.id].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3 + round), 0);
  return [...items].sort((a, b) => score(a) - score(b));
}

function CardFront({ item }: { item: MoneyMemoryCard }) {
  const visual = MEMORY_VISUALS[item.id] ?? { glyph: '💰', caption: item.pairId.toUpperCase(), tone: '#FFF0C4' };
  return (
    <View style={styles.cardFace}>
      <View style={[styles.memoryIllustration, { backgroundColor: visual.tone }]}>
        <View style={styles.memoryHighlight} />
        <Text style={styles.memoryGlyph}>{visual.glyph}</Text>
        <View style={styles.memoryCaptionBadge}><Text style={styles.memoryCaption}>{visual.caption}</Text></View>
      </View>
      <Text numberOfLines={2} style={styles.memoryLabel}>{item.label}</Text>
    </View>
  );
}

function CardBack() {
  return (
    <View style={styles.cardBackFace}>
      <View style={styles.backRing}><Text style={styles.backGlyph}>🦕</Text></View>
      <Text style={styles.backText}>PEQUEÑAS FINANZAS</Text>
    </View>
  );
}

function FlipCard({ item, faceUp, selectable, highlighted, onPress, style }: {
  item: MoneyMemoryCard;
  faceUp: boolean;
  selectable: boolean;
  highlighted?: boolean;
  onPress: () => void;
  style?: object;
}) {
  const flip = useRef(new Animated.Value(faceUp ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(flip, {
      toValue: faceUp ? 1 : 0,
      damping: 13,
      stiffness: 150,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  }, [faceUp, flip]);

  const frontStyle = {
    transform: [{ perspective: 700 }, { rotateY: flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] }) }],
    opacity: flip.interpolate({ inputRange: [0.46, 0.5], outputRange: [0, 1] }),
  };
  const backStyle = {
    transform: [{ perspective: 700 }, { rotateY: flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }],
    opacity: flip.interpolate({ inputRange: [0.49, 0.53], outputRange: [1, 0] }),
  };

  return (
    <Pressable accessibilityRole={selectable ? 'button' : undefined} accessibilityLabel={selectable ? item.label : undefined} disabled={!selectable} onPress={onPress} style={({ pressed }) => [styles.cardSlot, style, highlighted && styles.cardNew, pressed && selectable && styles.pressed]}>
      <Animated.View pointerEvents={faceUp ? 'auto' : 'none'} style={[styles.flipFace, frontStyle]}><CardFront item={item} /></Animated.View>
      <Animated.View pointerEvents="none" style={[styles.flipFace, styles.flipBack, backStyle]}><CardBack /></Animated.View>
      {highlighted ? <View style={styles.newBadge}><Text style={styles.newBadgeText}>ERA LA NUEVA</Text></View> : null}
    </Pressable>
  );
}

export function MoneyMemoryGame({ session, onFinish }: GameComponentProps) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('memorize');
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [choiceSeconds, setChoiceSeconds] = useState(7);
  const [lastGood, setLastGood] = useState<boolean | null>(null);
  const [lastText, setLastText] = useState('');
  const startRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const correctRef = useRef(0);
  const bestStreakRef = useRef(0);
  const shuffleMotion = useRef(new Animated.Value(0)).current;
  const haptics = session.modifiers.hapticsEnabled !== false;
  const baseCount = Math.min(5, 3 + Math.floor(round / 2));
  const revealMs = Math.max(1200, 2500 - streak * 130 - round * 80);

  const puzzle = useMemo(() => {
    const pool = MONEY_MEMORY_CARDS;
    const newcomerIndex = (round * 3 + 5) % pool.length;
    const newcomer = pool[newcomerIndex]!;
    const base = Array.from({ length: baseCount }, (_, index) => pool[(round + index) % pool.length]!).filter((item) => item.id !== newcomer.id);
    while (base.length < baseCount) {
      const candidate = pool[(round + base.length + 3) % pool.length]!;
      if (candidate.id !== newcomer.id && !base.some((item) => item.id === candidate.id)) base.push(candidate);
    }
    const shuffledBase = deterministicOrder(base, round);
    const options = deterministicOrder([...base, newcomer], round + 7);
    return { base, shuffledBase, newcomer, options };
  }, [baseCount, round]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const finalCorrect = correctRef.current;
    const finalBestStreak = bestStreakRef.current;
    const score = Math.min(100, Math.round((finalCorrect / TOTAL_ROUNDS) * 85 + Math.min(15, finalBestStreak * 3)));
    onFinish({ gameId: session.gameId, sessionId: session.sessionId, score, durationMs: Date.now() - startRef.current, completed: true, metrics: { correct: finalCorrect, rounds: TOTAL_ROUNDS, bestStreak: finalBestStreak } });
  };

  useEffect(() => {
    if (phase !== 'memorize' || finishedRef.current) return;
    const timer = setTimeout(() => setPhase('shuffle'), revealMs);
    return () => clearTimeout(timer);
  }, [phase, revealMs]);

  useEffect(() => {
    if (phase !== 'shuffle') return;
    shuffleMotion.setValue(0);
    if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(shuffleMotion, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(shuffleMotion, { toValue: -1, duration: 240, useNativeDriver: true }),
      Animated.timing(shuffleMotion, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => setPhase('reveal'), 760);
    return () => clearTimeout(timer);
  }, [haptics, phase, shuffleMotion]);

  useEffect(() => {
    if (phase !== 'reveal') return;
    const timer = setTimeout(() => {
      setChoiceSeconds(Math.max(4, 7 - Math.floor(streak / 3)));
      setPhase('choose');
      if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 360);
    return () => clearTimeout(timer);
  }, [haptics, phase, streak]);

  useEffect(() => {
    if (phase !== 'choose') return;
    const timer = setInterval(() => {
      setChoiceSeconds((value) => {
        if (value > 1) return value - 1;
        setLastGood(false);
        setLastText(`Tiempo. La carta nueva era “${puzzle.newcomer.label}”.`);
        setStreak(0);
        setPhase('feedback');
        if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [haptics, phase, puzzle.newcomer.label]);

  useEffect(() => {
    if (phase !== 'feedback') return;
    const timer = setTimeout(() => {
      if (round >= TOTAL_ROUNDS - 1) finish();
      else {
        setRound((value) => value + 1);
        setPhase('memorize');
        setLastGood(null);
        setLastText('');
      }
    }, 1250);
    return () => clearTimeout(timer);
  }, [phase, round]);

  const choose = (id: string) => {
    if (phase !== 'choose') return;
    const good = id === puzzle.newcomer.id;
    if (good) {
      const nextCorrect = correctRef.current + 1;
      const nextStreak = streak + 1;
      correctRef.current = nextCorrect;
      setCorrect(nextCorrect);
      setStreak(nextStreak);
      bestStreakRef.current = Math.max(bestStreakRef.current, nextStreak);
      setBestStreak(bestStreakRef.current);
      setLastGood(true);
      setLastText(`¡Exacto! “${puzzle.newcomer.label}” fue la carta que apareció.`);
      if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setStreak(0);
      setLastGood(false);
      setLastText(`Esa carta ya estaba. La nueva era “${puzzle.newcomer.label}”.`);
      if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    setPhase('feedback');
  };

  const shown = phase === 'memorize' ? puzzle.base : phase === 'shuffle' ? puzzle.shuffledBase : puzzle.options;
  const faceUp = phase === 'memorize' || phase === 'choose' || phase === 'feedback';
  const shuffleX = shuffleMotion.interpolate({ inputRange: [-1, 0, 1], outputRange: [-42, 0, 42] });
  const shuffleRotate = shuffleMotion.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-5deg', '0deg', '5deg'] });

  const phaseCopy = phase === 'memorize'
    ? ['Memoriza las cartas', `Tienes ${(revealMs / 1000).toFixed(1)}s antes de que se volteen.`]
    : phase === 'shuffle'
      ? ['¡Se están mezclando!', 'Todas están boca abajo. Sigue la secuencia.']
      : phase === 'reveal'
        ? ['Apareció una carta más…', 'Prepárate: todas se van a voltear.']
        : phase === 'choose'
          ? ['¿Cuál carta NO estaba?', 'Toca la intrusa antes de que termine el tiempo.']
          : lastGood ? ['¡La encontraste!', 'Memoria + decisión rápida.'] : ['Mira la diferencia', 'Fíjate cuál era la carta nueva.'];

  return (
    <ImageBackground source={ACTIVE_THEME.world.activity} resizeMode="cover" style={styles.root}>
      <View style={styles.top}>
        <View style={styles.prompt}>
          <Text style={styles.kicker}>MEMORIA DE CARTAS · RONDA {round + 1}/{TOTAL_ROUNDS}</Text>
          <Text style={styles.title}>{phaseCopy[0]}</Text>
          <Text style={styles.sub}>{phaseCopy[1]}</Text>
        </View>
        <HudChip label="RACHA" value={`×${streak}`} tone={streak >= 3 ? 'gold' : 'dark'} />
        <HudChip label="MEJOR" value={bestStreak} />
        <HudChip label={phase === 'choose' ? 'DECIDE' : 'ACIERTOS'} value={phase === 'choose' ? `${choiceSeconds}s` : `${correct}/${TOTAL_ROUNDS}`} tone={phase === 'choose' && choiceSeconds <= 2 ? 'danger' : 'dark'} />
      </View>
      <GameProgress value={(round + (phase === 'feedback' ? 1 : 0.45)) / TOTAL_ROUNDS} />

      <View style={styles.stage}>
        <View style={styles.stageGlow} />
        <Image source={ACTIVE_THEME.characters.primary} resizeMode="contain" style={styles.hero} />
        <Animated.View style={[styles.grid, phase === 'shuffle' && { transform: [{ translateX: shuffleX }, { rotate: shuffleRotate }] }]}>
          {shown.map((item, index) => (
            <FlipCard
              key={`${round}-${item.id}`}
              item={item}
              faceUp={faceUp}
              selectable={phase === 'choose'}
              highlighted={phase === 'feedback' && item.id === puzzle.newcomer.id}
              onPress={() => choose(item.id)}
              style={index % 2 ? styles.cardOffset : undefined}
            />
          ))}
          {phase === 'reveal' ? (
            <View pointerEvents="none" style={styles.bamBadge}><Text style={styles.bamText}>+1 CARTA</Text></View>
          ) : null}
        </Animated.View>
        {phase === 'memorize' ? <View style={styles.memorizeBadge}><Text style={styles.memorizeText}>👀 MEMORIZA</Text></View> : null}
        {phase === 'shuffle' ? <View style={styles.shuffleBadge}><Text style={styles.shuffleText}>↔ MEZCLANDO…</Text></View> : null}
      </View>
      <View style={styles.feedback}>{phase === 'feedback' ? <FeedbackPill text={lastText} good={Boolean(lastGood)} /> : <Text style={styles.tip}>Voltean · se mezclan · aparece una más · encuentra la nueva.</Text>}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', padding: 10, gap: 6 },
  top: { height: 42, flexDirection: 'row', gap: 9, alignItems: 'center', paddingLeft: 100, paddingRight: 48 },
  prompt: { flex: 1, minWidth: 0, borderRadius: radii.xl, backgroundColor: colors.glassDark, borderWidth: 2, borderColor: colors.leafSoft, paddingHorizontal: 12, paddingVertical: 6, ...shadows.soft },
  kicker: { color: colors.gold, fontSize: 8, fontWeight: '900', letterSpacing: 0.9 },
  title: { color: colors.white, fontSize: 12, lineHeight: 14, fontWeight: '900' },
  sub: { color: colors.cream, fontSize: 8, lineHeight: 10, fontWeight: '700', marginTop: 1 },
  stage: { flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  stageGlow: { position: 'absolute', width: 290, height: 250, borderRadius: 130, backgroundColor: colors.glassForest, opacity: 0.32 },
  hero: { position: 'absolute', left: 12, bottom: -2, width: 64, height: 64 },
  grid: { width: '76%', maxWidth: 790, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 10 },
  cardSlot: { width: '27%', minWidth: 108, maxWidth: 144, height: 102, position: 'relative', ...shadows.card },
  cardOffset: { transform: [{ translateY: 5 }] },
  flipFace: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 15, backfaceVisibility: 'hidden', overflow: 'hidden', borderWidth: 2, borderColor: colors.white, backgroundColor: colors.glassCream },
  flipBack: { backgroundColor: colors.forestDark, borderColor: colors.gold },
  cardFace: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 5 },
  cardBackFace: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.forestDark },
  backRing: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#F8E3A2', borderWidth: 3, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  backGlyph: { fontSize: 29, lineHeight: 32 },
  backText: { color: '#E8F2D7', fontSize: 5.4, fontWeight: '900', letterSpacing: 0.75, marginTop: 4 },
  cardNew: { borderRadius: 15, borderWidth: 3, borderColor: colors.orange },
  memoryIllustration: { width: 62, height: 54, borderRadius: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...shadows.soft },
  memoryHighlight: { position: 'absolute', left: 5, top: 4, width: 28, height: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.50)', transform: [{ rotate: '-14deg' }] },
  memoryGlyph: { fontSize: 27, lineHeight: 31 },
  memoryCaptionBadge: { position: 'absolute', bottom: 3, borderRadius: 7, backgroundColor: 'rgba(10,62,43,0.88)', paddingHorizontal: 5, paddingVertical: 1 },
  memoryCaption: { color: colors.white, fontSize: 5, fontWeight: '900', letterSpacing: 0.55 },
  memoryLabel: { color: colors.forestDark, fontSize: 8.5, lineHeight: 10, fontWeight: '900', textAlign: 'center', marginTop: 3, maxWidth: 118 },
  newBadge: { position: 'absolute', right: -4, top: -5, zIndex: 8, borderRadius: radii.pill, backgroundColor: colors.orange, paddingHorizontal: 7, paddingVertical: 3, ...shadows.soft },
  newBadgeText: { color: colors.white, fontSize: 5.7, fontWeight: '900' },
  bamBadge: { position: 'absolute', alignSelf: 'center', top: '36%', borderRadius: radii.pill, backgroundColor: colors.orange, borderWidth: 2, borderColor: colors.white, paddingHorizontal: 14, paddingVertical: 7, ...shadows.card },
  bamText: { color: colors.white, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  memorizeBadge: { position: 'absolute', bottom: 6, borderRadius: radii.pill, backgroundColor: colors.gold, borderWidth: 2, borderColor: colors.goldSoft, paddingHorizontal: 14, paddingVertical: 6, ...shadows.soft },
  memorizeText: { color: colors.forestDark, fontSize: 8.5, fontWeight: '900', letterSpacing: 0.5 },
  shuffleBadge: { position: 'absolute', bottom: 6, borderRadius: radii.pill, backgroundColor: colors.forestDark, borderWidth: 2, borderColor: colors.leafSoft, paddingHorizontal: 14, paddingVertical: 6, ...shadows.soft },
  shuffleText: { color: colors.white, fontSize: 8.5, fontWeight: '900', letterSpacing: 0.6 },
  feedback: { height: 28, alignItems: 'center', justifyContent: 'center' },
  tip: { color: colors.forestDark, fontSize: 8, fontWeight: '800', backgroundColor: colors.glassCream, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
  pressed: { transform: [{ scale: 0.96 }] },
});
