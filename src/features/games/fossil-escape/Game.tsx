import React, { useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { GameComponentProps } from '@/core/game-runtime';
import { FOSSIL_ESCAPE_CLUES } from '@/content/games/fossilEscape';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows } from '@/core/theme/tokens';
import { FeedbackPill, GameProgress, HudChip, PrimaryGameButton } from '@/features/games/ui/GameChrome';

const HOTSPOTS = [
  { icon: '☁', label: 'Mural de tormenta', hint: 'IMPREVISTOS' },
  { icon: '¤', label: 'Mercado antiguo', hint: 'DECISIONES' },
  { icon: '▦', label: 'Tablilla de cuentas', hint: 'REGISTRO' },
  { icon: '↗', label: 'Puente del futuro', hint: 'CRECIMIENTO' },
] as const;

export function FossilEscapeGame({ session, onFinish }: GameComponentProps) {
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; good: boolean } | null>(null);
  const startRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const shake = useRef(new Animated.Value(0)).current;
  const haptics = session.modifiers.hapticsEnabled !== false;
  const complete = solved.size;
  const activeClue = active === null ? null : (FOSSIL_ESCAPE_CLUES[active] ?? null);
  const activeSpot = active === null ? null : (HOTSPOTS[active] ?? null);

  const finish = () => {
    if (finishedRef.current || solved.size < FOSSIL_ESCAPE_CLUES.length) return;
    finishedRef.current = true;
    const score = Math.max(45, 100 - wrong * 8);
    if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onFinish({ gameId: session.gameId, sessionId: session.sessionId, score, durationMs: Date.now() - startRef.current, completed: true, metrics: { keys: solved.size, wrongAnswers: wrong } });
  };

  const answer = (optionIndex: number) => {
    if (active === null) return;
    const clue = FOSSIL_ESCAPE_CLUES[active];
    if (!clue) return;
    if (optionIndex === clue.correctIndex) {
      setSolved((previous) => new Set(previous).add(active));
      setFeedback({ text: `Llave conseguida: ${clue.keyWord}`, good: true });
      setActive(null);
      if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setWrong((value) => value + 1);
      setFeedback({ text: 'Esa pieza no encaja. Mira la pista y prueba otra decisión.', good: false });
      shake.setValue(0);
      Animated.sequence([
        Animated.timing(shake, { toValue: -9, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 9, duration: 70, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]).start();
      if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <View style={styles.objective}>
          <Text style={styles.kicker}>ESCAPE · EXPLORA LA {ACTIVE_THEME.copy.escapeLocationLabel.toUpperCase()}</Text>
          <Text style={styles.title}>Encuentra 4 llaves financieras y abre la salida</Text>
          <Text style={styles.sub}>Toca objetos del escenario. Cada uno esconde una pista distinta.</Text>
        </View>
        <HudChip label="LLAVES" value={`${complete}/4`} tone={complete === 4 ? 'gold' : 'dark'} />
        <HudChip label="ERRORES" value={wrong} tone={wrong >= 3 ? 'danger' : 'dark'} />
      </View>
      <GameProgress value={complete / FOSSIL_ESCAPE_CLUES.length} />

      <ImageBackground source={ACTIVE_THEME.world.lesson} resizeMode="cover" style={styles.scene} imageStyle={styles.sceneImage}>
        <View style={styles.sceneLabel}><Text style={styles.sceneLabelText}>BUSCA LOS 4 LUGARES QUE BRILLAN</Text></View>
        <View style={styles.landmarkField}>
          {FOSSIL_ESCAPE_CLUES.map((clue, index) => {
            const spot = HOTSPOTS[index] ?? HOTSPOTS[0]!;
            const isSolved = solved.has(index);
            return (
              <Pressable
                key={clue.id}
                accessibilityRole="button"
                accessibilityLabel={isSolved ? `${spot.label}, pista resuelta` : `Explorar ${spot.label}`}
                accessibilityState={{ disabled: isSolved }}
                disabled={isSolved}
                onPress={() => { setActive(index); setFeedback(null); if (haptics) void Haptics.selectionAsync(); }}
                style={({ pressed }: { pressed: boolean }) => [styles.hotspot, isSolved && styles.hotspotSolved, pressed && styles.pressed]}
              >
                <View style={[styles.landmarkIcon, isSolved && styles.landmarkIconSolved]}><Text style={styles.landmarkGlyph}>{isSolved ? '✓' : spot.icon}</Text></View>
                <View style={styles.landmarkCopy}>
                  <Text numberOfLines={2} style={styles.hotspotLabel}>{isSolved ? clue.keyWord : spot.label}</Text>
                  <Text style={styles.hotspotHint}>{isSolved ? 'PISTA RESUELTA' : spot.hint}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.door, complete === 4 && styles.doorOpen]}>
          <Text style={styles.doorIcon}>{complete === 4 ? '◈' : '▥'}</Text>
          <Text style={styles.doorTitle}>{complete === 4 ? 'SALIDA ABIERTA' : 'PUERTA FINAL'}</Text>
          <Text style={styles.doorMeta}>{complete}/4 llaves</Text>
          {complete === 4 ? <PrimaryGameButton label="ESCAPAR →" onPress={finish} /> : null}
        </View>
        <Image source={ACTIVE_THEME.characters.escapeGuide} style={styles.guide} resizeMode="contain" />
      </ImageBackground>

      <View style={styles.keyTray}>
        <Text style={styles.keyTrayLabel}>INVENTARIO</Text>
        {FOSSIL_ESCAPE_CLUES.map((clue, index) => <View key={clue.id} style={[styles.key, solved.has(index) && styles.keyOn]}><Text style={styles.keyText}>{solved.has(index) ? clue.keyWord : '???'}</Text></View>)}
        <View style={styles.feedbackSlot}>{feedback ? <FeedbackPill text={feedback.text} good={feedback.good} /> : null}</View>
      </View>

      {active !== null && activeClue && activeSpot ? (
        <View style={styles.modalShade} accessibilityViewIsModal>
          <Animated.View style={[styles.puzzle, { transform: [{ translateX: shake }] }]}>
            <Text style={styles.puzzleKicker}>PISTA {active + 1} · {activeSpot.label.toUpperCase()}</Text>
            <Text style={styles.clue}>{activeClue.clue}</Text>
            <Text style={styles.question}>{activeClue.question}</Text>
            <View style={styles.options}>
              {activeClue.options.map((option, index) => (
                <Pressable key={option} accessibilityRole="button" accessibilityLabel={`Opción ${index + 1}: ${option}`} onPress={() => answer(index)} style={({ pressed }: { pressed: boolean }) => [styles.option, pressed && styles.pressed]}><Text style={styles.optionIndex}>{index + 1}</Text><Text style={styles.optionText}>{option}</Text></Pressable>
              ))}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Seguir explorando" onPress={() => setActive(null)} style={({ pressed }) => [styles.close, pressed && styles.pressed]}><Text style={styles.closeText}>SEGUIR EXPLORANDO</Text></Pressable>
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', padding: 10, gap: 6, backgroundColor: colors.forestDark },
  top: { height: 42, flexDirection: 'row', gap: 9, alignItems: 'center', paddingLeft: 100, paddingRight: 48 },
  objective: { flex: 1, minWidth: 0, borderRadius: radii.lg, backgroundColor: colors.glassDark, borderWidth: 2, borderColor: colors.leafSoft, paddingHorizontal: 12, paddingVertical: 6, ...shadows.soft },
  kicker: { color: colors.gold, fontSize: 8, fontWeight: '900', letterSpacing: 0.9 },
  title: { color: colors.white, fontSize: 15, lineHeight: 17, fontWeight: '900' },
  sub: { color: colors.cream, fontSize: 8, lineHeight: 10, fontWeight: '700' },
  scene: { flex: 1, minHeight: 0, borderRadius: radii.lg, overflow: 'hidden', borderWidth: 2, borderColor: colors.white, position: 'relative', ...shadows.card },
  sceneImage: { opacity: 1 },
  sceneLabel: { position: 'absolute', top: 10, left: 12, borderRadius: radii.pill, backgroundColor: colors.glassDark, paddingHorizontal: 12, paddingVertical: 5, zIndex: 3 },
  sceneLabelText: { color: colors.gold, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  landmarkField: { position: 'absolute', left: 76, right: '21%', top: 38, bottom: 8, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', alignContent: 'space-around', columnGap: 8, rowGap: 8 },
  hotspot: { width: '42%', maxWidth: 190, minWidth: 122, height: '38%', minHeight: 68, maxHeight: 98, borderRadius: radii.lg, backgroundColor: colors.glassCream, borderWidth: 2, borderColor: colors.goldSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', padding: 7, gap: 7, ...shadows.card },
  hotspotSolved: { backgroundColor: colors.surfaceGreen, borderColor: colors.leaf, opacity: 0.78 },
  landmarkIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surfaceGold, borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  landmarkIconSolved: { backgroundColor: colors.leaf, borderColor: colors.white },
  landmarkGlyph: { color: colors.forestDark, fontSize: 19, lineHeight: 21, fontWeight: '900' },
  landmarkCopy: { flex: 1, minWidth: 0 },
  hotspotLabel: { color: colors.forestDark, fontSize: 9.5, lineHeight: 11, fontWeight: '900' },
  hotspotHint: { color: colors.orange, fontSize: 6.5, lineHeight: 8, fontWeight: '900', letterSpacing: 0.55, marginTop: 3 },
  door: { position: 'absolute', right: '2.5%', top: '18%', bottom: '18%', width: '15%', minWidth: 108, maxWidth: 150, borderRadius: radii.lg, backgroundColor: colors.glassDark, borderWidth: 3, borderColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center', padding: 8, gap: 4, ...shadows.card },
  doorOpen: { borderColor: colors.gold, backgroundColor: colors.glassForest },
  doorIcon: { color: colors.gold, fontSize: 28, lineHeight: 31, fontWeight: '900' },
  doorTitle: { color: colors.white, fontSize: 9.5, lineHeight: 11, fontWeight: '900', textAlign: 'center' },
  doorMeta: { color: colors.cream, fontSize: 9, fontWeight: '800', marginBottom: 5 },
  guide: { position: 'absolute', left: 8, bottom: 2, width: 62, height: 62 },
  keyTray: { height: 46, borderRadius: radii.lg, backgroundColor: colors.glassCream, borderWidth: 2, borderColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, ...shadows.soft },
  keyTrayLabel: { color: colors.forestDark, fontSize: 10.5, fontWeight: '900' },
  key: { flex: 1, minWidth: 76, height: 32, borderRadius: radii.lg, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.creamStrong, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  keyOn: { backgroundColor: colors.surfaceGold, borderColor: colors.gold },
  keyText: { color: colors.forestDark, fontSize: 8, fontWeight: '900', textAlign: 'center' },
  feedbackSlot: { flex: 1.5, minWidth: 140, alignItems: 'center', justifyContent: 'center' },
  modalShade: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.glassBlack, alignItems: 'center', justifyContent: 'center', padding: 20 },
  puzzle: { width: '42%', minWidth: 340, maxWidth: 520, borderRadius: radii.lg, backgroundColor: colors.glassCream, borderWidth: 2, borderColor: colors.goldSoft, padding: 12, ...shadows.card },
  puzzleKicker: { color: colors.orange, fontSize: 8, fontWeight: '900', letterSpacing: 0.9 },
  clue: { color: colors.forestDark, fontSize: 10.5, lineHeight: 13, fontWeight: '900', marginTop: 5 },
  question: { color: colors.ink, fontSize: 9, lineHeight: 12, fontWeight: '700', marginTop: 6 },
  options: { gap: 8, marginTop: 12 },
  option: { minHeight: 38, borderRadius: radii.lg, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.creamStrong, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 9 },
  optionIndex: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.forest, color: colors.white, fontSize: 9, lineHeight: 22, fontWeight: '900', textAlign: 'center' },
  optionText: { flex: 1, color: colors.forestDark, fontSize: 8.5, lineHeight: 11, fontWeight: '800' },
  close: { alignSelf: 'flex-end', marginTop: 12, borderRadius: radii.pill, backgroundColor: colors.forestDark, paddingHorizontal: 16, paddingVertical: 9 },
  closeText: { color: colors.white, fontSize: 9, fontWeight: '900' },
  pressed: { transform: [{ scale: 0.97 }] },
});
