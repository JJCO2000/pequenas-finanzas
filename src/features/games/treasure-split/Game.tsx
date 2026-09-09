import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { GameComponentProps } from '@/core/game-runtime';
import { TREASURE_SPLIT_ROUNDS, type TreasureBucket } from '@/content/games/treasureSplit';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows } from '@/core/theme/tokens';
import { FeedbackPill, GameProgress, HudChip, PrimaryGameButton } from '@/features/games/ui/GameChrome';
import { CoinPile, TreasureChest } from '@/features/games/ui/GameObjects';

const BUCKETS: Array<{ key: TreasureBucket; label: string; icon: string; hint: string }> = [
  { key: 'spend', label: 'GASTAR', icon: '●', hint: 'Para hoy' },
  { key: 'save', label: 'AHORRAR', icon: '◆', hint: 'Para una meta' },
  { key: 'invest', label: 'INVERTIR', icon: '▲', hint: 'Para crecer' },
];

const EVENTS = [
  { title: '¡Apareció un gasto sorpresa!', copy: 'El ahorro protege mejor esta expedición.' },
  { title: '¡Tu meta está más cerca!', copy: 'Guardar más hoy te deja llegar con margen.' },
  { title: '¡Buen momento para crecer!', copy: 'La parte invertida tiene más peso en esta ronda.' },
];

export function TreasureSplitGame({ session, onFinish }: GameComponentProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [allocation, setAllocation] = useState<Record<TreasureBucket, number>>({ spend: 0, save: 0, invest: 0 });
  const [phase, setPhase] = useState<'plan' | 'simulate' | 'result'>('plan');
  const [roundScore, setRoundScore] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const sim = useRef(new Animated.Value(0)).current;
  const startRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const round = TREASURE_SPLIT_ROUNDS[roundIndex] ?? TREASURE_SPLIT_ROUNDS[0]!;
  const haptics = session.modifiers.hapticsEnabled !== false;
  const used = allocation.spend + allocation.save + allocation.invest;
  const available = Math.max(0, round.total - used);

  const target = useMemo(() => ({ spend: round.spend, save: round.save, invest: round.invest }), [round]);

  const finish = (allScores: number[]) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const score = Math.round(allScores.reduce((sum, item) => sum + item, 0) / Math.max(1, allScores.length));
    onFinish({ gameId: session.gameId, sessionId: session.sessionId, score, durationMs: Date.now() - startRef.current, completed: true, metrics: { rounds: allScores.length, averageResilience: score } });
  };

  const adjust = (key: TreasureBucket, delta: number) => {
    if (phase !== 'plan') return;
    setAllocation((previous) => {
      if (delta > 0 && Object.values(previous).reduce((a, b) => a + b, 0) >= round.total) return previous;
      const nextValue = Math.max(0, previous[key] + delta);
      return { ...previous, [key]: nextValue };
    });
    if (haptics) void Haptics.selectionAsync();
  };

  const simulate = () => {
    if (used !== round.total || phase !== 'plan') return;
    setPhase('simulate');
    setFeedback(null);
    sim.setValue(0);
    Animated.timing(sim, { toValue: 1, duration: 1450, useNativeDriver: true }).start(() => {
      const distance = Math.abs(allocation.spend - target.spend) + Math.abs(allocation.save - target.save) + Math.abs(allocation.invest - target.invest);
      const score = Math.max(40, 100 - distance * 10);
      setRoundScore(score);
      setScores((previous) => [...previous, score]);
      setFeedback(score >= 90 ? 'Tu reparto resistió el evento con muy buen equilibrio.' : score >= 70 ? 'Funcionó, pero una categoría quedó más expuesta.' : 'El evento mostró que conviene repartir con más intención.');
      setPhase('result');
      if (haptics) void Haptics.notificationAsync(score >= 80 ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning);
    });
  };

  const nextRound = () => {
    const nextScores = scores;
    if (roundIndex >= TREASURE_SPLIT_ROUNDS.length - 1) {
      finish(nextScores);
      return;
    }
    setRoundIndex((value) => value + 1);
    setAllocation({ spend: 0, save: 0, invest: 0 });
    setPhase('plan');
    setFeedback(null);
    setRoundScore(0);
  };

  return (
    <ImageBackground source={ACTIVE_THEME.world.activity} resizeMode="cover" style={styles.root}>
      <View style={styles.top}>
        <View style={styles.story}>
          <Text style={styles.kicker}>EXPEDICIÓN {roundIndex + 1}/{TREASURE_SPLIT_ROUNDS.length}</Text>
          <Text style={styles.storyTitle}>{phase === 'plan' ? round.story : phase === 'simulate' ? 'El mundo responde a tu decisión…' : EVENTS[roundIndex]?.title}</Text>
          <Text style={styles.storyText}>{phase === 'result' ? EVENTS[roundIndex]?.copy : 'Tú decides primero. El evento se revela después.'}</Text>
        </View>
        <HudChip label="TESORO" value={round.total} tone="gold" />
        <HudChip label="LIBRES" value={available} tone={available === 0 ? 'dark' : 'light'} />
        <HudChip label="RONDA" value={`${roundIndex + 1}/3`} />
      </View>
      <GameProgress value={(roundIndex + (phase === 'result' ? 1 : phase === 'simulate' ? 0.6 : 0.2)) / TREASURE_SPLIT_ROUNDS.length} />

      <View style={styles.board}>
        <View style={styles.treasureSource}>
          <Image source={ACTIVE_THEME.characters.primary} resizeMode="contain" style={styles.sourceHero} />
          <Text style={styles.sourceLabel}>TU TESORO</Text>
          <View style={styles.availableCoinTray}>
            <CoinPile count={available} max={10} size={20} />
          </View>
          <Text style={styles.availableLabel}>{available} LIBRES</Text>
          <View style={styles.sourceChest}>
            <TreasureChest count={0} />
          </View>
          <Text style={styles.sourceCount}>Arrastra el valor con + / −</Text>
        </View>

        <View style={styles.buckets}>
          {BUCKETS.map((bucket) => (
            <View key={bucket.key} style={styles.bucket}>
              <View style={styles.bucketObject}><CoinPile count={Math.max(1, allocation[bucket.key])} max={6} size={25} /></View>
              <Text style={styles.bucketLabel}>{bucket.label}</Text>
              <Text style={styles.bucketHint}>{bucket.hint}</Text>
              <Text style={styles.bucketValue}>{allocation[bucket.key]}</Text>
              <View style={styles.bucketControls}>
                <Pressable onPress={() => adjust(bucket.key, -1)} style={styles.control}><Text style={styles.controlText}>−</Text></Pressable>
                <Pressable onPress={() => adjust(bucket.key, 1)} style={styles.control}><Text style={styles.controlText}>+</Text></Pressable>
              </View>
              <CoinPile count={allocation[bucket.key]} max={10} size={18} style={styles.allocatedCoins} />
            </View>
          ))}
        </View>

        <View style={styles.eventStage}>
          {phase === 'plan' ? (
            <>
              <Text style={styles.eventMark}>?</Text><Text style={styles.eventTitle}>EVENTO OCULTO</Text><Text style={styles.eventCopy}>No sabes qué ocurrirá. Reparte pensando en hoy, metas y crecimiento.</Text>
              <PrimaryGameButton label={used === round.total ? 'VIVIR EL DÍA →' : `FALTAN ${round.total - used}`} onPress={simulate} disabled={used !== round.total} />
            </>
          ) : phase === 'simulate' ? (
            <Animated.View style={[styles.simCard, { transform: [{ scale: sim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.85, 1.08, 1] }) }, { rotate: sim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-4deg', '4deg', '0deg'] }) }] }]}>
              <Text style={styles.simIcon}>✦</Text><Text style={styles.eventTitle}>SIMULANDO</Text><Text style={styles.eventCopy}>Tus decisiones están enfrentando el evento.</Text>
            </Animated.View>
          ) : (
            <>
              <Text style={styles.resultScore}>{roundScore}</Text><Text style={styles.resultLabel}>RESILIENCIA</Text>
              {feedback ? <FeedbackPill text={feedback} good={roundScore >= 80} /> : null}
              <View style={styles.targetRow}><Text style={styles.targetText}>Objetivo: {target.spend} gastar · {target.save} ahorrar · {target.invest} invertir</Text></View>
              <PrimaryGameButton label={roundIndex === TREASURE_SPLIT_ROUNDS.length - 1 ? 'TERMINAR →' : 'SIGUIENTE EXPEDICIÓN →'} onPress={nextRound} />
            </>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', padding: 10, gap: 6 },
  top: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 9 },
  story: { flex: 1, minWidth: 0, borderRadius: radii.xl, backgroundColor: colors.glassDark, borderWidth: 2, borderColor: colors.leafSoft, paddingHorizontal: 12, paddingVertical: 6, ...shadows.soft },
  kicker: { color: colors.gold, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  storyTitle: { color: colors.white, fontSize: 12, lineHeight: 14, fontWeight: '900' },
  storyText: { color: colors.cream, fontSize: 8, lineHeight: 10, fontWeight: '700', marginTop: 1 },
  board: { flex: 1, minHeight: 0, flexDirection: 'row', gap: 8 },
  treasureSource: { width: '15%', minWidth: 126, maxWidth: 158, borderRadius: radii.xl, backgroundColor: colors.glassCream, borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 6, ...shadows.card },
  sourceHero: { width: 48, height: 40, marginBottom: -3 },
  sourceLabel: { color: colors.forestDark, fontSize: 10, fontWeight: '900' },
  availableCoinTray: { width: '92%', minHeight: 42, borderRadius: 13, backgroundColor: colors.surfaceGold, borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginTop: 4, paddingHorizontal: 3, paddingVertical: 3, zIndex: 8 },
  availableLabel: { color: colors.orange, fontSize: 8, fontWeight: '900', letterSpacing: 0.8, marginTop: 2 },
  sourceChest: { height: 72, width: 112, alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden', transform: [{ scale: 0.72 }], marginTop: -5, marginBottom: -15 },
  sourceCount: { color: colors.inkMuted, fontSize: 7.5, lineHeight: 9.5, fontWeight: '800', textAlign: 'center' },
  buckets: { flex: 1, flexDirection: 'row', gap: 9 },
  bucket: { flex: 1, borderRadius: radii.xl, backgroundColor: colors.glassCream, borderWidth: 1, borderColor: colors.creamStrong, alignItems: 'center', padding: 7, ...shadows.soft },
  bucketObject: { height: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  bucketLabel: { color: colors.forestDark, fontSize: 10, lineHeight: 12, fontWeight: '900' },
  bucketHint: { color: colors.inkMuted, fontSize: 8, fontWeight: '700', marginTop: 2 },
  bucketValue: { color: colors.forestDark, fontSize: 18, lineHeight: 21, fontWeight: '900', marginTop: 4 },
  bucketControls: { flexDirection: 'row', gap: 8, marginTop: 3 },
  allocatedCoins: { minHeight: 22, marginTop: 3 },
  control: { width: 38, height: 28, borderRadius: 23, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  controlText: { color: colors.white, fontSize: 15, lineHeight: 17, fontWeight: '900' },
  eventStage: { width: '16%', minWidth: 120, maxWidth: 180, borderRadius: radii.xl, backgroundColor: colors.glassCream, borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 10, gap: 6, ...shadows.card },
  eventMark: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfacePurple, color: colors.purple, fontSize: 18, lineHeight: 30, fontWeight: '900', textAlign: 'center' },
  eventTitle: { color: colors.forestDark, fontSize: 10, lineHeight: 12, fontWeight: '900', textAlign: 'center' },
  eventCopy: { color: colors.inkMuted, fontSize: 8.5, lineHeight: 11, fontWeight: '700', textAlign: 'center' },
  simCard: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  simIcon: { color: colors.gold, fontSize: 30, lineHeight: 32 },
  resultScore: { color: colors.orange, fontSize: 24, lineHeight: 26, fontWeight: '900' },
  resultLabel: { color: colors.forestDark, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  targetRow: { borderRadius: radii.md, backgroundColor: colors.surfaceGreen, padding: 8 },
  targetText: { color: colors.forestDark, fontSize: 8, lineHeight: 11, fontWeight: '800', textAlign: 'center' },
});
