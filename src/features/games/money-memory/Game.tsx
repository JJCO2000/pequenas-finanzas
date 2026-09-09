import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { GameComponentProps } from '@/core/game-runtime';
import { MONEY_MEMORY_CARDS, type MoneyMemoryCard } from '@/content/games/moneyMemory';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows } from '@/core/theme/tokens';
import { FeedbackPill, GameProgress, HudChip } from '@/features/games/ui/GameChrome';

const TOTAL_ROUNDS = 6;

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

function MemoryCardVisual({ item }: { item: MoneyMemoryCard }) {
  const visual = MEMORY_VISUALS[item.id] ?? { glyph: '💰', caption: item.pairId.toUpperCase(), tone: '#FFF0C4' };
  return (
    <View style={styles.memoryObject}>
      <View style={[styles.memoryIllustration, { backgroundColor: visual.tone }]}>
        <View style={styles.memoryHighlight} />
        <Text style={styles.memoryGlyph}>{visual.glyph}</Text>
        <View style={styles.memoryCaptionBadge}><Text style={styles.memoryCaption}>{visual.caption}</Text></View>
      </View>
      <Text numberOfLines={2} style={styles.memoryLabel}>{item.label}</Text>
    </View>
  );
}

export function MoneyMemoryGame({ session, onFinish }: GameComponentProps) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<'memorize' | 'choose' | 'feedback'>('memorize');
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
  const fade = useRef(new Animated.Value(1)).current;
  const haptics = session.modifiers.hapticsEnabled !== false;
  const baseCount = Math.min(6, 3 + Math.floor(round / 2));
  const revealMs = Math.max(1050, 2600 - streak * 170 - round * 100);

  const puzzle = useMemo(() => {
    const pool = MONEY_MEMORY_CARDS;
    const newcomerIndex = (round * 3 + 5) % pool.length;
    const newcomer = pool[newcomerIndex]!;
    const base = Array.from({ length: baseCount }, (_, index) => pool[(round + index) % pool.length]!).filter((item) => item.id !== newcomer.id);
    while (base.length < baseCount) {
      const candidate = pool[(round + base.length + 3) % pool.length]!;
      if (candidate.id !== newcomer.id && !base.some((item) => item.id === candidate.id)) base.push(candidate);
    }
    const options = [...base, newcomer].sort((a, b) => ((a.id.charCodeAt(0) + round) % 7) - ((b.id.charCodeAt(0) + round) % 7));
    return { base, newcomer, options };
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
    fade.setValue(1);
    const timer = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
        setPhase('choose');
        setChoiceSeconds(Math.max(4, 7 - Math.floor(streak / 3)));
        fade.setValue(0);
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      });
    }, revealMs);
    return () => clearTimeout(timer);
  }, [fade, phase, revealMs, round, streak]);

  useEffect(() => {
    if (phase !== 'choose') return;
    const timer = setInterval(() => {
      setChoiceSeconds((value) => {
        if (value > 1) return value - 1;
        setLastGood(false);
        setLastText(`Tiempo. El elemento nuevo era “${puzzle.newcomer.label}”.`);
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
    }, 1050);
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
      setLastText(`¡Exacto! “${puzzle.newcomer.label}” no estaba antes.`);
      if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setStreak(0);
      setLastGood(false);
      setLastText(`Ese ya estaba. El nuevo era “${puzzle.newcomer.label}”.`);
      if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    setPhase('feedback');
  };

  const shown = phase === 'memorize' ? puzzle.base : puzzle.options;

  return (
    <ImageBackground source={ACTIVE_THEME.world.activity} resizeMode="cover" style={styles.root}>
      <View style={styles.top}>
        <View style={styles.prompt}>
          <Text style={styles.kicker}>MEMORIA INVERSA · RONDA {round + 1}/{TOTAL_ROUNDS}</Text>
          <Text style={styles.title}>{phase === 'memorize' ? 'Memoriza dibujos + palabras' : phase === 'choose' ? '¿Qué tarjeta apareció que NO estaba?' : lastGood ? '¡Racha en marcha!' : 'Mira la diferencia'}</Text>
          <Text style={styles.sub}>{phase === 'memorize' ? `Tienes ${(revealMs / 1000).toFixed(1)}s. Cada concepto tiene una imagen distinta.` : 'Recuerda color, dibujo y palabra: detecta el intruso nuevo.'}</Text>
        </View>
        <HudChip label="RACHA" value={`×${streak}`} tone={streak >= 3 ? 'gold' : 'dark'} />
        <HudChip label="MEJOR" value={bestStreak} />
        <HudChip label={phase === 'choose' ? 'DECIDE' : 'ACIERTOS'} value={phase === 'choose' ? `${choiceSeconds}s` : `${correct}/${TOTAL_ROUNDS}`} tone={phase === 'choose' && choiceSeconds <= 2 ? 'danger' : 'dark'} />
      </View>
      <GameProgress value={(round + (phase === 'feedback' ? 1 : 0.5)) / TOTAL_ROUNDS} />
      <View style={styles.stage}>
        <View style={styles.stageGlow} />
        <Image source={ACTIVE_THEME.characters.primary} resizeMode="contain" style={styles.hero} />
        <Animated.View style={[styles.grid, { opacity: fade }]}>
          {shown.map((item, index) => {
            const isNew = phase === 'feedback' && item.id === puzzle.newcomer.id;
            return (
              <Pressable key={item.id} disabled={phase !== 'choose'} onPress={() => choose(item.id)} style={({ pressed }: { pressed: boolean }) => [styles.card, index % 3 === 1 && styles.cardAlt, isNew && styles.cardNew, pressed && phase === 'choose' && styles.pressed]}>
                <MemoryCardVisual item={item} />
                {isNew ? <View style={styles.newBadge}><Text style={styles.newBadgeText}>NUEVO</Text></View> : null}
              </Pressable>
            );
          })}
        </Animated.View>
        {phase === 'memorize' ? <View style={styles.memorizeBadge}><Text style={styles.memorizeText}>👀 OBSERVA · NO TOQUES</Text></View> : null}
      </View>
      <View style={styles.feedback}>{phase === 'feedback' ? <FeedbackPill text={lastText} good={Boolean(lastGood)} /> : <Text style={styles.tip}>La dificultad sube: más tarjetas y menos tiempo.</Text>}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', padding: 10, gap: 6 },
  top: { height: 42, flexDirection: 'row', gap: 9, alignItems: 'center' },
  prompt: { flex: 1, minWidth: 0, borderRadius: radii.xl, backgroundColor: colors.glassDark, borderWidth: 2, borderColor: colors.leafSoft, paddingHorizontal: 12, paddingVertical: 6, ...shadows.soft },
  kicker: { color: colors.gold, fontSize: 8, fontWeight: '900', letterSpacing: 0.9 },
  title: { color: colors.white, fontSize: 12, lineHeight: 14, fontWeight: '900' },
  sub: { color: colors.cream, fontSize: 8, lineHeight: 10, fontWeight: '700', marginTop: 1 },
  stage: { flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  stageGlow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: colors.glassForest, opacity: 0.38 },
  hero: { position: 'absolute', left: 12, bottom: -2, width: 64, height: 64 },
  grid: { width: '72%', maxWidth: 760, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 9 },
  card: { width: '28%', minWidth: 102, maxWidth: 142, height: 96, borderRadius: radii.xl, backgroundColor: colors.glassCream, borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 5, ...shadows.card },
  cardAlt: { backgroundColor: colors.surfaceGreen },
  cardNew: { borderColor: colors.gold, backgroundColor: colors.surfaceGold },
  memoryObject: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  memoryIllustration: { width: 62, height: 54, borderRadius: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...shadows.soft },
  memoryHighlight: { position: 'absolute', left: 5, top: 4, width: 28, height: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.50)', transform: [{ rotate: '-14deg' }] },
  memoryGlyph: { fontSize: 27, lineHeight: 31 },
  memoryCaptionBadge: { position: 'absolute', bottom: 3, borderRadius: 7, backgroundColor: 'rgba(10,62,43,0.88)', paddingHorizontal: 5, paddingVertical: 1 },
  memoryCaption: { color: colors.white, fontSize: 5, fontWeight: '900', letterSpacing: 0.55 },
  memoryLabel: { color: colors.forestDark, fontSize: 8.5, lineHeight: 10, fontWeight: '900', textAlign: 'center', marginTop: 3, maxWidth: 118 },
  newBadge: { position: 'absolute', right: 7, top: 7, borderRadius: radii.pill, backgroundColor: colors.orange, paddingHorizontal: 7, paddingVertical: 3 },
  newBadgeText: { color: colors.white, fontSize: 6, fontWeight: '900' },
  memorizeBadge: { position: 'absolute', bottom: 8, borderRadius: radii.pill, backgroundColor: colors.gold, borderWidth: 2, borderColor: colors.goldSoft, paddingHorizontal: 14, paddingVertical: 6, ...shadows.soft },
  memorizeText: { color: colors.forestDark, fontSize: 8.5, fontWeight: '900', letterSpacing: 0.5 },
  feedback: { height: 28, alignItems: 'center', justifyContent: 'center' },
  tip: { color: colors.forestDark, fontSize: 8, fontWeight: '800', backgroundColor: colors.glassCream, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
  pressed: { transform: [{ scale: 0.96 }] },
});
