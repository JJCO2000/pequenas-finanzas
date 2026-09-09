import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { GameComponentProps } from '@/core/game-runtime';
import { GREEDY_KING_ROUNDS } from '@/content/games/greedyKing';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows } from '@/core/theme/tokens';
import { FeedbackPill, GameProgress, HudChip, PrimaryGameButton, SecondaryGameButton } from '@/features/games/ui/GameChrome';
import { CoinPile } from '@/features/games/ui/GameObjects';

const SPACES = [
  { label: '+2', value: 2, kind: 'gain' as const },
  { label: '+3', value: 3, kind: 'gain' as const },
  { label: '+4', value: 4, kind: 'gain' as const },
  { label: 'CODICIA', value: 0, kind: 'bomb' as const },
  { label: '+5', value: 5, kind: 'gain' as const },
  { label: '+2', value: 2, kind: 'gain' as const },
  { label: 'SEGURO +3', value: 3, kind: 'safe' as const },
  { label: '+4', value: 4, kind: 'gain' as const },
];
const POS = [
  { left: '37%', top: '1%' }, { left: '67%', top: '12%' }, { left: '75%', top: '43%' }, { left: '66%', top: '72%' },
  { left: '37%', top: '82%' }, { left: '8%', top: '72%' }, { left: '0%', top: '43%' }, { left: '8%', top: '12%' },
] as const;
const RIVETS = [
  { left: '48%', top: '2%' }, { left: '77%', top: '17%' }, { left: '88%', top: '48%' }, { left: '76%', top: '78%' },
  { left: '48%', top: '91%' }, { left: '18%', top: '78%' }, { left: '6%', top: '48%' }, { left: '18%', top: '17%' },
] as const;
const MAX_SPINS = 8;
const TARGET = 20;

export function KingGreedyGame({ session, onFinish }: GameComponentProps) {
  const [active, setActive] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [spins, setSpins] = useState(0);
  const [banked, setBanked] = useState(0);
  const [exposed, setExposed] = useState(0);
  const [cashouts, setCashouts] = useState(0);
  const [bombs, setBombs] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; good: boolean } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const spinsRef = useRef(0);
  const bankedRef = useRef(0);
  const exposedRef = useRef(0);
  const cashoutsRef = useRef(0);
  const bombsRef = useRef(0);
  const pointerPulse = useRef(new Animated.Value(0)).current;
  const haptics = session.modifiers.hapticsEnabled !== false;
  const story = GREEDY_KING_ROUNDS[spins % GREEDY_KING_ROUNDS.length]?.offer ?? 'El Rey quiere que arriesgues más.';

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  useEffect(() => {
    pointerPulse.stopAnimation();
    if (!spinning) {
      pointerPulse.setValue(0);
      return;
    }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pointerPulse, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.timing(pointerPulse, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [pointerPulse, spinning]);

  const finish = (secured = bankedRef.current) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const finalCashouts = cashoutsRef.current;
    const finalBombs = bombsRef.current;
    const finalSpins = spinsRef.current;
    const score = Math.max(35, Math.min(100, Math.round((secured / TARGET) * 80 + Math.min(20, finalCashouts * 5) - finalBombs * 4)));
    onFinish({ gameId: session.gameId, sessionId: session.sessionId, score, durationMs: Date.now() - startRef.current, completed: true, metrics: { banked: secured, cashouts: finalCashouts, bombs: finalBombs, spins: finalSpins } });
  };

  const startSpin = () => {
    if (spinning || spins >= MAX_SPINS || finishedRef.current) return;
    setFeedback(null);
    setSpinning(true);
    if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    intervalRef.current = setInterval(() => setActive((value) => (value + 1) % SPACES.length), 92);
  };

  const stopSpin = () => {
    if (!spinning) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setSpinning(false);
    const outcome = SPACES[active];
    if (!outcome) return;
    const nextSpins = spinsRef.current + 1;
    spinsRef.current = nextSpins;
    setSpins(nextSpins);
    if (outcome.kind === 'bomb') {
      exposedRef.current = 0;
      setExposed(0);
      bombsRef.current += 1;
      setBombs(bombsRef.current);
      setFeedback({ text: '¡CODICIA! Perdiste solo lo que no habías asegurado. Tu tesoro protegido sigue intacto.', good: false });
      if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (nextSpins >= MAX_SPINS) setTimeout(() => finish(banked), 650);
      return;
    }
    const nextExposed = exposedRef.current + outcome.value;
    exposedRef.current = nextExposed;
    setExposed(nextExposed);
    setFeedback({ text: outcome.kind === 'safe' ? `Zona segura: sumaste ${outcome.value}. Puedes asegurar ahora o volver a arriesgar.` : `Ganaste ${outcome.value}. Está expuesto hasta que lo asegures.`, good: true });
    if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const secure = () => {
    if (spinning || exposed <= 0) return;
    const amountSecured = exposedRef.current;
    const nextBanked = bankedRef.current + amountSecured;
    bankedRef.current = nextBanked;
    exposedRef.current = 0;
    cashoutsRef.current += 1;
    setBanked(nextBanked);
    setExposed(0);
    setCashouts(cashoutsRef.current);
    setFeedback({ text: `Aseguraste ${amountSecured}. La codicia ya no puede quitarte ese dinero.`, good: true });
    if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (spins >= MAX_SPINS || nextBanked >= TARGET) setTimeout(() => finish(nextBanked), 500);
  };

  return (
    <ImageBackground source={ACTIVE_THEME.world.lesson} resizeMode="cover" style={styles.root}>
      <View style={styles.top}>
        <View style={styles.story}>
          <Text style={styles.kicker}>EL REY TE TIENTA · GIRO {Math.min(spins + 1, MAX_SPINS)}/{MAX_SPINS}</Text>
          <Text numberOfLines={2} style={styles.storyText}>{story}</Text>
        </View>
        <HudChip label="PROTEGIDO" value={banked} tone="gold" />
        <HudChip label="EN RIESGO" value={exposed} tone={exposed >= 8 ? 'danger' : 'dark'} />
        <HudChip label="META" value={TARGET} tone="light" />
      </View>
      <GameProgress value={Math.min(1, banked / TARGET)} />

      <View style={styles.board}>
        <View style={styles.wheelPane}>
          <Image source={ACTIVE_THEME.characters.secondary} resizeMode="contain" style={styles.kingHero} />
          <View style={styles.wheelShadow} />
          <View style={styles.wheel}>
            <View pointerEvents="none" style={styles.wheelInnerRing} />
            <View pointerEvents="none" style={styles.wheelGloss} />
            {RIVETS.map((position, index) => <View key={`rivet-${index}`} pointerEvents="none" style={[styles.rivet, position]} />)}
            {SPACES.map((space, index) => (
              <View key={`${space.label}-${index}`} style={[styles.space, POS[index], active === index && styles.spaceActive, space.kind === 'bomb' && styles.spaceBomb, space.kind === 'safe' && styles.spaceSafe]}>
                <View style={styles.spaceGloss} />
                <Text style={styles.spaceText}>{space.label}</Text>
              </View>
            ))}
            <View style={styles.center}>
              <View style={styles.centerGloss} />
              <Text style={styles.crown}>♛</Text>
              <Text style={styles.centerTitle}>{spinning ? '¡DETÉN!' : 'CODICIA'}</Text>
              <Text style={styles.centerMeta}>{spinning ? 'El selector corre' : 'Tú decides cuándo parar'}</Text>
            </View>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.pointer,
                {
                  transform: [
                    { translateY: pointerPulse.interpolate({ inputRange: [0, 1], outputRange: [0, 5] }) },
                    { scale: pointerPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
                  ],
                },
              ]}
            >
              <View style={styles.pointerGem} />
            </Animated.View>
          </View>
        </View>

        <View style={styles.riskPane}>
          <Text style={styles.riskKicker}>TU DECISIÓN</Text>
          <Text style={styles.riskTitle}>{exposed > 0 ? `Tienes ${exposed} en riesgo` : 'Nada expuesto ahora'}</Text>
          <Text style={styles.riskCopy}>Girar puede aumentar el premio. CODICIA borra únicamente el dinero que no protegiste.</Text>
          <View style={styles.vaults}>
            <View style={styles.vault}>
              <View style={styles.vaultTop}><View style={styles.vaultHandle} /></View>
              <Text style={styles.vaultLabel}>COFRE SEGURO</Text>
              <CoinPile count={banked} max={8} size={22} />
              <Text style={styles.vaultValue}>{banked}</Text>
            </View>
            <View style={[styles.vault, styles.vaultRisk]}>
              <View style={[styles.vaultTop, styles.vaultTopRisk]}><View style={styles.vaultHandle} /></View>
              <Text style={styles.vaultLabel}>MESA DE RIESGO</Text>
              <CoinPile count={exposed} max={8} size={22} />
              <Text style={styles.vaultValue}>{exposed}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            {!spinning ? <PrimaryGameButton label={spins >= MAX_SPINS ? 'ASEGURAR Y TERMINAR' : 'GIRAR →'} onPress={spins >= MAX_SPINS ? secure : startSpin} disabled={spins >= MAX_SPINS && exposed <= 0} /> : <Pressable onPress={stopSpin} style={({ pressed }: { pressed: boolean }) => [styles.stop, pressed && styles.pressed]}><Text style={styles.stopText}>DETENER</Text></Pressable>}
            <SecondaryGameButton label="ASEGURAR" onPress={secure} disabled={spinning || exposed <= 0} />
          </View>
          {spins >= MAX_SPINS && exposed <= 0 ? <PrimaryGameButton label="TERMINAR PARTIDA →" onPress={() => finish(banked)} /> : null}
          <View style={styles.feedbackSlot}>{feedback ? <FeedbackPill text={feedback.text} good={feedback.good} /> : <Text style={styles.tip}>No hay respuesta correcta fija: administra cuánto riesgo estás dispuesto a dejar expuesto.</Text>}</View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', padding: 7, gap: 6 },
  top: { height: 42, flexDirection: 'row', gap: 9, alignItems: 'center' },
  story: { flex: 1, minWidth: 0, borderRadius: radii.xl, backgroundColor: colors.glassDark, borderWidth: 2, borderColor: colors.leafSoft, paddingHorizontal: 12, paddingVertical: 6, ...shadows.soft },
  kicker: { color: colors.gold, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  storyText: { color: colors.white, fontSize: 10, lineHeight: 12, fontWeight: '800' },
  board: { flex: 1, minHeight: 0, flexDirection: 'row', gap: 8 },
  wheelPane: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  kingHero: { position: 'absolute', left: 8, bottom: -2, width: 72, height: 72 },
  wheelShadow: { position: 'absolute', width: 216, height: 46, borderRadius: 108, backgroundColor: 'rgba(20,20,14,0.34)', transform: [{ translateY: 98 }, { scaleX: 0.9 }] },
  wheel: { width: 242, height: 226, borderRadius: 113, backgroundColor: '#5B3E2A', borderWidth: 8, borderColor: '#D6A928', position: 'relative', ...shadows.card },
  wheelInnerRing: { position: 'absolute', left: 19, right: 19, top: 19, bottom: 19, borderRadius: 90, borderWidth: 4, borderColor: 'rgba(255,232,142,0.55)', backgroundColor: 'rgba(15,80,53,0.38)' },
  wheelGloss: { position: 'absolute', left: 31, top: 19, width: 128, height: 42, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.10)', transform: [{ rotate: '-15deg' }] },
  rivet: { position: 'absolute', width: 9, height: 9, borderRadius: 5, backgroundColor: '#FFE49A', borderWidth: 2, borderColor: '#8B6717', zIndex: 3 },
  space: { position: 'absolute', width: 61, height: 40, borderRadius: 14, backgroundColor: colors.forest, borderWidth: 2, borderColor: '#FFEFC3', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...shadows.soft },
  spaceActive: { backgroundColor: colors.orange, borderColor: colors.white, transform: [{ scale: 1.16 }], zIndex: 5 },
  spaceBomb: { backgroundColor: colors.danger },
  spaceSafe: { backgroundColor: colors.leaf },
  spaceGloss: { position: 'absolute', left: 5, right: 5, top: 3, height: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.18)' },
  spaceText: { color: colors.white, fontSize: 8.5, lineHeight: 10, fontWeight: '900', textAlign: 'center' },
  center: { position: 'absolute', left: 70, top: 68, width: 92, height: 84, borderRadius: 46, backgroundColor: colors.gold, borderWidth: 4, borderColor: '#FFF4C5', alignItems: 'center', justifyContent: 'center', padding: 7, overflow: 'hidden', ...shadows.soft },
  centerGloss: { position: 'absolute', left: 9, right: 9, top: 6, height: 18, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.24)' },
  crown: { color: colors.forestDark, fontSize: 15, lineHeight: 17 },
  centerTitle: { color: colors.forestDark, fontSize: 12.5, fontWeight: '900' },
  centerMeta: { color: colors.ink, fontSize: 7, lineHeight: 10, fontWeight: '800', textAlign: 'center' },
  pointer: { position: 'absolute', left: 101, top: -22, width: 30, height: 35, borderTopLeftRadius: 15, borderTopRightRadius: 15, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, backgroundColor: '#F26A2E', borderWidth: 3, borderColor: '#FFF0C0', alignItems: 'center', justifyContent: 'center', zIndex: 10, ...shadows.card },
  pointerGem: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFE269', borderWidth: 2, borderColor: '#9A6913' },
  riskPane: { width: '26%', minWidth: 220, maxWidth: 300, borderRadius: radii.xl, backgroundColor: colors.glassCream, borderWidth: 2, borderColor: colors.white, padding: 11, justifyContent: 'center', ...shadows.card },
  riskKicker: { color: colors.orange, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  riskTitle: { color: colors.forestDark, fontSize: 14, lineHeight: 17, fontWeight: '900', marginTop: 3 },
  riskCopy: { color: colors.inkMuted, fontSize: 8.5, lineHeight: 11, fontWeight: '700', marginTop: 5 },
  vaults: { flexDirection: 'row', gap: 10, marginTop: 16 },
  vault: { flex: 1, minHeight: 78, borderRadius: radii.lg, backgroundColor: colors.surfaceGreen, borderWidth: 2, borderColor: colors.leafSoft, alignItems: 'center', justifyContent: 'center', gap: 2, paddingTop: 14, paddingBottom: 7, overflow: 'hidden' },
  vaultRisk: { backgroundColor: colors.surfaceOrange, borderColor: colors.orangeSoft },
  vaultTop: { position: 'absolute', left: -2, right: -2, top: -2, height: 16, backgroundColor: '#4E7B50', borderBottomWidth: 2, borderBottomColor: '#31563A', alignItems: 'center', justifyContent: 'center' },
  vaultTopRisk: { backgroundColor: '#CB7749', borderBottomColor: '#974F2F' },
  vaultHandle: { width: 22, height: 7, borderRadius: 5, borderWidth: 2, borderColor: '#F7E6A5', backgroundColor: 'rgba(255,255,255,0.12)' },
  vaultLabel: { color: colors.inkMuted, fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  vaultValue: { color: colors.forestDark, fontSize: 15, lineHeight: 17, fontWeight: '900' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  stop: { flex: 1, minHeight: 34, borderRadius: radii.pill, backgroundColor: colors.danger, borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  stopText: { color: colors.white, fontSize: 11.5, fontWeight: '900', letterSpacing: 1 },
  feedbackSlot: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  tip: { color: colors.inkMuted, fontSize: 9, lineHeight: 13, fontWeight: '800', textAlign: 'center' },
  pressed: { transform: [{ scale: 0.96 }] },
});
