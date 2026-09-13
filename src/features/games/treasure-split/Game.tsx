import React, { useMemo, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { GameComponentProps } from '@/core/game-runtime';
import { TREASURE_SPLIT_ROUNDS, type TreasureBucket } from '@/content/games/treasureSplit';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows } from '@/core/theme/tokens';
import { GameProgress, HudChip, PrimaryGameButton } from '@/features/games/ui/GameChrome';
import { CoinPile, TreasureChest } from '@/features/games/ui/GameObjects';

const BUCKETS: Array<{ key: TreasureBucket; label: string; hint: string }> = [
  { key: 'spend', label: 'GASTAR', hint: 'Para hoy' },
  { key: 'save', label: 'AHORRAR', hint: 'Para una meta' },
  { key: 'invest', label: 'INVERTIR', hint: 'Para crecer' },
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
  const [feedback, setFeedback] = useState('');
  const sim = useRef(new Animated.Value(0)).current;
  const startRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const round = TREASURE_SPLIT_ROUNDS[roundIndex] ?? TREASURE_SPLIT_ROUNDS[0]!;
  const haptics = session.modifiers.hapticsEnabled !== false;
  const used = allocation.spend + allocation.save + allocation.invest;
  const available = Math.max(0, round.total - used);
  const planning = phase === 'plan';
  const target = useMemo(() => ({ spend: round.spend, save: round.save, invest: round.invest }), [round]);

  const finish = (allScores: number[]) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const score = Math.round(allScores.reduce((sum, item) => sum + item, 0) / Math.max(1, allScores.length));
    onFinish({ gameId: session.gameId, sessionId: session.sessionId, score, durationMs: Date.now() - startRef.current, completed: true, metrics: { rounds: allScores.length, averageResilience: score } });
  };

  const adjust = (key: TreasureBucket, delta: number) => {
    if (!planning) return;
    setAllocation((previous) => {
      const total = Object.values(previous).reduce((a, b) => a + b, 0);
      if (delta > 0 && total >= round.total) return previous;
      return { ...previous, [key]: Math.max(0, previous[key] + delta) };
    });
    if (haptics) void Haptics.selectionAsync();
  };

  const simulate = () => {
    if (used !== round.total || !planning) return;
    setPhase('simulate');
    sim.setValue(0);
    Animated.timing(sim, { toValue: 1, duration: 1050, useNativeDriver: true }).start(() => {
      const distance = Math.abs(allocation.spend - target.spend) + Math.abs(allocation.save - target.save) + Math.abs(allocation.invest - target.invest);
      const score = Math.max(40, 100 - distance * 10);
      const copy = score >= 90 ? 'Tu reparto resistió el evento con muy buen equilibrio.' : score >= 70 ? 'Funcionó, pero una categoría quedó más expuesta.' : 'El evento mostró que conviene repartir con más intención.';
      setRoundScore(score);
      setScores((previous) => [...previous, score]);
      setFeedback(copy);
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
    setFeedback('');
    setRoundScore(0);
  };

  return (
    <ImageBackground source={ACTIVE_THEME.world.activity} resizeMode="cover" style={styles.root}>
      <View style={styles.top}>
        <View style={styles.story}>
          <Text style={styles.kicker}>EXPEDICIÓN {roundIndex + 1}/{TREASURE_SPLIT_ROUNDS.length}</Text>
          <Text numberOfLines={1} style={styles.storyTitle}>{phase === 'plan' ? round.story : phase === 'simulate' ? 'El mundo responde a tu decisión…' : 'Resultado listo'}</Text>
          <Text numberOfLines={1} style={styles.storyText}>{phase === 'plan' ? 'Reparte todo el tesoro; el evento se revela después.' : phase === 'simulate' ? 'Tu decisión está enfrentando el evento.' : 'Lee el resultado en la ventana central.'}</Text>
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
          <View style={styles.availableCoinTray}><CoinPile count={available} max={10} size={18} /></View>
          <Text style={styles.availableLabel}>{available} LIBRES</Text>
          <View style={styles.sourceChest}><View style={styles.sourceChestScale}><TreasureChest count={0} /></View></View>
          <Text style={styles.sourceCount}>{planning ? 'Usa + / − para repartir' : phase === 'simulate' ? 'Reparto bloqueado' : 'Ronda completada'}</Text>
        </View>

        <View style={styles.buckets}>
          {BUCKETS.map((bucket) => {
            const value = allocation[bucket.key];
            const minusDisabled = !planning || value <= 0;
            const plusDisabled = !planning || available <= 0;
            return (
              <View key={bucket.key} style={styles.bucket}>
                <CoinPile count={Math.max(1, value)} max={5} size={24} />
                <Text style={styles.bucketLabel}>{bucket.label}</Text>
                <Text style={styles.bucketHint}>{bucket.hint}</Text>
                <Text style={styles.bucketValue}>{value}</Text>
                <View style={styles.bucketControls}>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Quitar uno de ${bucket.label.toLowerCase()}`} accessibilityState={{ disabled: minusDisabled }} disabled={minusDisabled} onPress={() => adjust(bucket.key, -1)} style={({ pressed }) => [styles.control, minusDisabled && styles.controlDisabled, pressed && !minusDisabled && styles.controlPressed]}><Text style={styles.controlText}>−</Text></Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Agregar uno a ${bucket.label.toLowerCase()}`} accessibilityState={{ disabled: plusDisabled }} disabled={plusDisabled} onPress={() => adjust(bucket.key, 1)} style={({ pressed }) => [styles.control, plusDisabled && styles.controlDisabled, pressed && !plusDisabled && styles.controlPressed]}><Text style={styles.controlText}>+</Text></Pressable>
                </View>
                <CoinPile count={value} max={10} size={17} style={styles.allocatedCoins} />
              </View>
            );
          })}
        </View>

        <View style={styles.eventStage}>
          {phase === 'plan' ? (
            <>
              <Text style={styles.eventMark}>?</Text><Text style={styles.eventTitle}>EVENTO OCULTO</Text><Text style={styles.eventCopy}>Primero decide. Después verás qué pasó.</Text>
              <PrimaryGameButton label={used === round.total ? 'VIVIR EL DÍA →' : `FALTAN ${round.total - used}`} onPress={simulate} disabled={used !== round.total} />
            </>
          ) : phase === 'simulate' ? (
            <Animated.View style={[styles.simCard, { transform: [{ scale: sim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.85, 1.08, 1] }) }, { rotate: sim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-4deg', '4deg', '0deg'] }) }] }]}>
              <Text style={styles.simIcon}>✦</Text><Text style={styles.eventTitle}>SIMULANDO</Text><Text style={styles.eventCopy}>El evento está reaccionando.</Text>
            </Animated.View>
          ) : (
            <><Text style={styles.resultScore}>{roundScore}</Text><Text style={styles.resultLabel}>RESILIENCIA</Text><Text style={styles.eventCopy}>Resultado en ventana.</Text></>
          )}
        </View>
      </View>

      <Modal visible={phase === 'result'} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.popupShade} accessibilityViewIsModal>
          <View style={styles.popupCard}>
            <View style={styles.popupHero}><Image source={ACTIVE_THEME.characters.primary} resizeMode="contain" style={styles.popupDino} /><Text style={styles.popupScore}>{roundScore}</Text><Text style={styles.popupScoreLabel}>RESILIENCIA</Text></View>
            <View style={styles.popupCopy}>
              <Text style={styles.popupEyebrow}>RESULTADO · RONDA {roundIndex + 1}/3</Text>
              <Text style={styles.popupTitle}>{EVENTS[roundIndex]?.title}</Text>
              <Text style={styles.popupText}>{EVENTS[roundIndex]?.copy}</Text>
              <View style={styles.lessonBox}><Text style={styles.lessonTitle}>QUÉ PASÓ</Text><Text style={styles.lessonText}>{feedback}</Text></View>
              <View style={styles.compareRow}><MiniCompare label="TÚ" value={`${allocation.spend} · ${allocation.save} · ${allocation.invest}`} /><MiniCompare label="EQUILIBRIO" value={`${target.spend} · ${target.save} · ${target.invest}`} /></View>
              <Text style={styles.compareLegend}>Gastar · Ahorrar · Invertir</Text>
              <PrimaryGameButton label={roundIndex === TREASURE_SPLIT_ROUNDS.length - 1 ? 'TERMINAR →' : 'SIGUIENTE EXPEDICIÓN →'} onPress={nextRound} />
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

function MiniCompare({ label, value }: { label: string; value: string }) { return <View style={styles.compareCard}><Text style={styles.compareLabel}>{label}</Text><Text style={styles.compareValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', padding: 10, gap: 6 }, top: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 9, paddingLeft: 100, paddingRight: 48 },
  story: { flex: 1, minWidth: 0, borderRadius: radii.xl, backgroundColor: colors.glassDark, borderWidth: 2, borderColor: colors.leafSoft, paddingHorizontal: 12, paddingVertical: 5, ...shadows.soft }, kicker: { color: colors.gold, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 }, storyTitle: { color: colors.white, fontSize: 11.5, fontWeight: '900' }, storyText: { color: colors.cream, fontSize: 7.7, fontWeight: '700', marginTop: 1 },
  board: { flex: 1, minHeight: 0, flexDirection: 'row', gap: 8 }, treasureSource: { width: '15%', minWidth: 126, maxWidth: 158, borderRadius: radii.xl, backgroundColor: colors.glassCream, borderWidth: 2, borderColor: colors.white, alignItems: 'center', padding: 5, ...shadows.card }, sourceHero: { width: 42, height: 34, marginBottom: -3 }, sourceLabel: { color: colors.forestDark, fontSize: 9.5, fontWeight: '900' }, availableCoinTray: { width: '92%', minHeight: 38, borderRadius: 12, backgroundColor: colors.surfaceGold, borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginTop: 3 }, availableLabel: { color: colors.orange, fontSize: 7.5, fontWeight: '900', marginTop: 1 }, sourceChest: { width: 92, height: 74, alignItems: 'center', justifyContent: 'center', overflow: 'visible' }, sourceChestScale: { width: 142, height: 130, alignItems: 'center', justifyContent: 'center', transform: [{ scale: 0.56 }] }, sourceCount: { color: colors.inkMuted, fontSize: 7.3, lineHeight: 9, fontWeight: '900', textAlign: 'center', marginTop: -2 },
  buckets: { flex: 1, flexDirection: 'row', gap: 9 }, bucket: { flex: 1, borderRadius: radii.xl, backgroundColor: colors.glassCream, borderWidth: 1, borderColor: colors.creamStrong, alignItems: 'center', justifyContent: 'center', padding: 6, ...shadows.soft }, bucketLabel: { color: colors.forestDark, fontSize: 10, fontWeight: '900' }, bucketHint: { color: colors.inkMuted, fontSize: 7.5, fontWeight: '700' }, bucketValue: { color: colors.forestDark, fontSize: 18, fontWeight: '900', marginTop: 3 }, bucketControls: { flexDirection: 'row', gap: 8, marginTop: 2 }, allocatedCoins: { minHeight: 20, marginTop: 2 }, control: { width: 38, height: 28, borderRadius: 23, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center', ...shadows.soft }, controlDisabled: { opacity: 0.35 }, controlPressed: { transform: [{ scale: 0.95 }] }, controlText: { color: colors.white, fontSize: 15, fontWeight: '900' },
  eventStage: { width: '15%', minWidth: 112, maxWidth: 155, borderRadius: radii.xl, backgroundColor: colors.glassCream, borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 8, gap: 5, ...shadows.card }, eventMark: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfacePurple, color: colors.purple, fontSize: 18, lineHeight: 30, fontWeight: '900', textAlign: 'center' }, eventTitle: { color: colors.forestDark, fontSize: 9.5, fontWeight: '900', textAlign: 'center' }, eventCopy: { color: colors.inkMuted, fontSize: 7.7, lineHeight: 9.5, fontWeight: '700', textAlign: 'center' }, simCard: { alignItems: 'center', justifyContent: 'center', gap: 7 }, simIcon: { color: colors.gold, fontSize: 28 }, resultScore: { color: colors.orange, fontSize: 23, fontWeight: '900' }, resultLabel: { color: colors.forestDark, fontSize: 8.5, fontWeight: '900', letterSpacing: 1 },
  popupShade: { flex: 1, backgroundColor: 'rgba(3,28,19,0.62)', alignItems: 'center', justifyContent: 'center', padding: 14 }, popupCard: { width: '58%', maxWidth: 560, minHeight: 210, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.gold, flexDirection: 'row', overflow: 'hidden', ...shadows.card }, popupHero: { width: '29%', backgroundColor: colors.surfaceGreen, alignItems: 'center', justifyContent: 'center', padding: 9 }, popupDino: { width: 100, height: 82 }, popupScore: { color: colors.orange, fontSize: 30, fontWeight: '900' }, popupScoreLabel: { color: colors.forestDark, fontSize: 7, fontWeight: '900', letterSpacing: 1 }, popupCopy: { flex: 1, padding: 12, justifyContent: 'center' }, popupEyebrow: { color: colors.orange, fontSize: 6.5, fontWeight: '900', letterSpacing: 1 }, popupTitle: { color: colors.forestDark, fontSize: 15, fontWeight: '900', marginTop: 2 }, popupText: { color: colors.inkMuted, fontSize: 8, lineHeight: 10, fontWeight: '700', marginTop: 3 }, lessonBox: { marginTop: 7, borderRadius: 10, backgroundColor: colors.surfaceGold, borderWidth: 1, borderColor: colors.gold, padding: 7 }, lessonTitle: { color: colors.orange, fontSize: 5.5, fontWeight: '900' }, lessonText: { color: colors.forestDark, fontSize: 7.5, lineHeight: 9.5, fontWeight: '800', marginTop: 2 }, compareRow: { flexDirection: 'row', gap: 6, marginTop: 6 }, compareCard: { flex: 1, borderRadius: 9, backgroundColor: colors.surfaceGreen, padding: 5, alignItems: 'center' }, compareLabel: { color: colors.inkMuted, fontSize: 5.5, fontWeight: '900' }, compareValue: { color: colors.forestDark, fontSize: 9, fontWeight: '900', marginTop: 1 }, compareLegend: { color: colors.inkMuted, fontSize: 5.8, textAlign: 'center', marginTop: 2, marginBottom: 5 },
});
