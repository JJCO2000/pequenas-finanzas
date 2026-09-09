import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
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

const POCKET_POS = [
  { left: '39%', top: '3%' },
  { left: '68%', top: '16%' },
  { left: '77%', top: '40%' },
  { left: '68%', top: '68%' },
  { left: '39%', top: '78%' },
  { left: '10%', top: '68%' },
  { left: '1%', top: '40%' },
  { left: '10%', top: '16%' },
] as const;

const RIVETS = [
  { left: '49%', top: '2%' }, { left: '78%', top: '16%' }, { left: '91%', top: '49%' }, { left: '78%', top: '81%' },
  { left: '49%', top: '94%' }, { left: '18%', top: '81%' }, { left: '5%', top: '49%' }, { left: '18%', top: '16%' },
] as const;

const MAX_SPINS = 8;
const TARGET = 20;
const SEGMENT_ANGLE = 360 / SPACES.length;

function outcomeIndex(sessionId: string, spinNumber: number) {
  const input = `${sessionId}:${spinNumber}`;
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0) % SPACES.length;
}

export function KingGreedyGame({ session, onFinish }: GameComponentProps) {
  const [active, setActive] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [spins, setSpins] = useState(0);
  const [banked, setBanked] = useState(0);
  const [exposed, setExposed] = useState(0);
  const [cashouts, setCashouts] = useState(0);
  const [bombs, setBombs] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; good: boolean } | null>(null);
  const startRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const spinsRef = useRef(0);
  const bankedRef = useRef(0);
  const exposedRef = useRef(0);
  const cashoutsRef = useRef(0);
  const bombsRef = useRef(0);
  const wheelRotation = useRef(new Animated.Value(0)).current;
  const rotationRef = useRef(0);
  const pointerPulse = useRef(new Animated.Value(0)).current;
  const haptics = session.modifiers.hapticsEnabled !== false;
  const story = GREEDY_KING_ROUNDS[spins % GREEDY_KING_ROUNDS.length]?.offer ?? 'El Rey quiere que arriesgues más.';

  useEffect(() => {
    pointerPulse.stopAnimation();
    if (!spinning) {
      pointerPulse.setValue(0);
      return;
    }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pointerPulse, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(pointerPulse, { toValue: 0, duration: 130, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [pointerPulse, spinning]);

  const finish = (secured = bankedRef.current) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const finalCashouts = cashoutsRef.current;
    const finalBombs = bombsRef.current;
    const finalSpins = spinsRef.current;
    const score = Math.max(35, Math.min(100, Math.round((secured / TARGET) * 80 + Math.min(20, finalCashouts * 5) - finalBombs * 4)));
    onFinish({ gameId: session.gameId, sessionId: session.sessionId, score, durationMs: Date.now() - startRef.current, completed: true, metrics: { banked: secured, cashouts: finalCashouts, bombs: finalBombs, spins: finalSpins } });
  };

  const applyOutcome = (index: number) => {
    const outcome = SPACES[index];
    if (!outcome) return;
    setActive(index);
    setSpinning(false);
    const nextSpins = spinsRef.current + 1;
    spinsRef.current = nextSpins;
    setSpins(nextSpins);

    if (outcome.kind === 'bomb') {
      exposedRef.current = 0;
      setExposed(0);
      bombsRef.current += 1;
      setBombs(bombsRef.current);
      setFeedback({ text: '¡CODICIA! La rueda cayó en rojo. Perdiste solo lo que estaba sin asegurar.', good: false });
      if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (nextSpins >= MAX_SPINS) setTimeout(() => finish(bankedRef.current), 700);
      return;
    }

    const nextExposed = exposedRef.current + outcome.value;
    exposedRef.current = nextExposed;
    setExposed(nextExposed);
    setFeedback({
      text: outcome.kind === 'safe'
        ? `La rueda cayó en SEGURO +${outcome.value}. Puedes protegerlo ahora o volver a girar.`
        : `La rueda cayó en ${outcome.label}. Tienes ${nextExposed} expuesto hasta que lo asegures.`,
      good: true,
    });
    if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const startSpin = () => {
    if (spinning || spinsRef.current >= MAX_SPINS || finishedRef.current) return;
    setFeedback(null);
    setActive(null);
    setSpinning(true);
    if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const targetIndex = outcomeIndex(session.sessionId, spinsRef.current + 1);
    const startAngle = ((rotationRef.current % 360) + 360) % 360;
    wheelRotation.setValue(startAngle);
    const targetAngle = ((360 - targetIndex * SEGMENT_ANGLE) % 360 + 360) % 360;
    const delta = (targetAngle - startAngle + 360) % 360;
    const fullTurns = 6 + (spinsRef.current % 2);
    const endAngle = startAngle + fullTurns * 360 + delta;

    Animated.timing(wheelRotation, {
      toValue: endAngle,
      duration: 2700,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished || finishedRef.current) return;
      rotationRef.current = targetAngle;
      wheelRotation.setValue(targetAngle);
      applyOutcome(targetIndex);
    });
  };

  const secure = () => {
    if (spinning || exposedRef.current <= 0) return;
    const amountSecured = exposedRef.current;
    const nextBanked = bankedRef.current + amountSecured;
    bankedRef.current = nextBanked;
    exposedRef.current = 0;
    cashoutsRef.current += 1;
    setBanked(nextBanked);
    setExposed(0);
    setCashouts(cashoutsRef.current);
    setFeedback({ text: `Aseguraste ${amountSecured}. Ya no puede quitártelo CODICIA.`, good: true });
    if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (spinsRef.current >= MAX_SPINS || nextBanked >= TARGET) setTimeout(() => finish(nextBanked), 550);
  };

  const wheelRotate = wheelRotation.interpolate({
    inputRange: [0, 3600],
    outputRange: ['0deg', '3600deg'],
    extrapolate: 'extend',
  });
  const counterRotate = wheelRotation.interpolate({
    inputRange: [0, 3600],
    outputRange: ['0deg', '-3600deg'],
    extrapolate: 'extend',
  });

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
          <View style={styles.wheelFrame}>
            <Animated.View style={[styles.wheel, { transform: [{ rotate: wheelRotate }] }]}>
              <View pointerEvents="none" style={styles.wheelInnerRing} />
              <View pointerEvents="none" style={styles.wheelGloss} />
              {RIVETS.map((position, index) => <View key={`rivet-${index}`} pointerEvents="none" style={[styles.rivet, position]} />)}
              {SPACES.map((space, index) => (
                <View key={`${space.label}-${index}`} style={[styles.pocket, POCKET_POS[index], active === index && styles.pocketActive, space.kind === 'bomb' && styles.pocketBomb, space.kind === 'safe' && styles.pocketSafe]}>
                  <View style={styles.pocketInset} />
                  <Animated.View style={[styles.pocketLabelWrap, { transform: [{ rotate: counterRotate }] }]}>
                    <Text numberOfLines={2} adjustsFontSizeToFit style={[styles.pocketText, space.kind === 'bomb' && styles.pocketTextSmall]}>{space.label}</Text>
                  </Animated.View>
                </View>
              ))}
            </Animated.View>

            <View style={styles.center}>
              <View style={styles.centerGloss} />
              <Text style={styles.crown}>♛</Text>
              <Text style={styles.centerTitle}>{spinning ? 'GIRANDO' : active === null ? 'CODICIA' : SPACES[active]?.label}</Text>
              <Text style={styles.centerMeta}>{spinning ? 'Mira el puntero' : active === null ? 'Gira y decide después' : 'Ahora decide si aseguras'}</Text>
            </View>

            <Animated.View
              pointerEvents="none"
              style={[
                styles.pointer,
                {
                  transform: [
                    { translateY: pointerPulse.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) },
                    { scale: pointerPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) },
                  ],
                },
              ]}
            >
              <View style={styles.pointerGem} />
              <View style={styles.pointerTip} />
            </Animated.View>
          </View>
          <Text style={styles.wheelInstruction}>{spinning ? '🎡 Gira rápido y frena poco a poco…' : '🎯 El bolsillo bajo el puntero es el resultado'}</Text>
        </View>

        <View style={styles.riskPane}>
          <Text style={styles.riskKicker}>TU DECISIÓN</Text>
          <Text style={styles.riskTitle}>{exposed > 0 ? `Tienes ${exposed} en riesgo` : 'Nada expuesto ahora'}</Text>
          <Text style={styles.riskCopy}>Gira la ruleta. Después elige: asegurar lo ganado o volver a arriesgarlo.</Text>
          <View style={styles.vaults}>
            <View style={styles.vault}>
              <View style={styles.vaultTop}><View style={styles.vaultHandle} /></View>
              <Text style={styles.vaultLabel}>COFRE SEGURO</Text>
              <CoinPile count={banked} max={8} size={20} />
              <Text style={styles.vaultValue}>{banked}</Text>
            </View>
            <View style={[styles.vault, styles.vaultRisk]}>
              <View style={[styles.vaultTop, styles.vaultTopRisk]}><View style={styles.vaultHandle} /></View>
              <Text style={styles.vaultLabel}>MESA DE RIESGO</Text>
              <CoinPile count={exposed} max={8} size={20} />
              <Text style={styles.vaultValue}>{exposed}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <PrimaryGameButton label={spinning ? 'GIRANDO…' : spins >= MAX_SPINS ? 'SIN GIROS' : 'GIRAR RULETA →'} onPress={startSpin} disabled={spinning || spins >= MAX_SPINS} />
            <SecondaryGameButton label="ASEGURAR" onPress={secure} disabled={spinning || exposed <= 0} />
          </View>
          {spins >= MAX_SPINS && exposed <= 0 ? <PrimaryGameButton label="TERMINAR PARTIDA →" onPress={() => finish(banked)} /> : null}
          {spins >= MAX_SPINS && exposed > 0 ? <PrimaryGameButton label="ASEGURAR Y TERMINAR →" onPress={secure} /> : null}
          <View style={styles.feedbackSlot}>{feedback ? <FeedbackPill text={feedback.text} good={feedback.good} /> : <Text style={styles.tip}>Primero decide la ruleta; después tú decides cuánto riesgo conservar.</Text>}</View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', padding: 7, gap: 6 },
  top: { height: 42, flexDirection: 'row', gap: 9, alignItems: 'center', paddingLeft: 100, paddingRight: 48 },
  story: { flex: 1, minWidth: 0, borderRadius: radii.xl, backgroundColor: colors.glassDark, borderWidth: 2, borderColor: colors.leafSoft, paddingHorizontal: 12, paddingVertical: 6, ...shadows.soft },
  kicker: { color: colors.gold, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  storyText: { color: colors.white, fontSize: 10, lineHeight: 12, fontWeight: '800' },
  board: { flex: 1, minHeight: 0, flexDirection: 'row', gap: 8 },
  wheelPane: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  kingHero: { position: 'absolute', left: 8, bottom: -2, width: 70, height: 70 },
  wheelShadow: { position: 'absolute', width: 230, height: 42, borderRadius: 115, backgroundColor: 'rgba(20,20,14,0.34)', transform: [{ translateY: 108 }, { scaleX: 0.9 }] },
  wheelFrame: { width: 268, height: 268, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  wheel: { width: 244, height: 244, borderRadius: 122, backgroundColor: '#5B3E2A', borderWidth: 8, borderColor: '#D6A928', position: 'absolute', ...shadows.card },
  wheelInnerRing: { position: 'absolute', left: 15, right: 15, top: 15, bottom: 15, borderRadius: 106, borderWidth: 5, borderColor: 'rgba(255,232,142,0.68)', backgroundColor: 'rgba(15,80,53,0.58)' },
  wheelGloss: { position: 'absolute', left: 31, top: 21, width: 132, height: 38, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.11)', transform: [{ rotate: '-15deg' }] },
  rivet: { position: 'absolute', width: 9, height: 9, borderRadius: 5, backgroundColor: '#FFE49A', borderWidth: 2, borderColor: '#8B6717', zIndex: 3 },
  pocket: { position: 'absolute', width: 54, height: 54, borderRadius: 27, backgroundColor: colors.forest, borderWidth: 3, borderColor: '#FFEFC3', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...shadows.soft },
  pocketActive: { borderColor: colors.white, borderWidth: 4, zIndex: 5 },
  pocketBomb: { backgroundColor: colors.danger },
  pocketSafe: { backgroundColor: colors.leaf },
  pocketInset: { position: 'absolute', width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: 'rgba(255,255,255,0.34)', backgroundColor: 'rgba(255,255,255,0.08)' },
  pocketLabelWrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  pocketText: { color: colors.white, fontSize: 10.5, lineHeight: 11, fontWeight: '900', textAlign: 'center' },
  pocketTextSmall: { fontSize: 7.2, lineHeight: 8.5 },
  center: { position: 'absolute', width: 94, height: 94, borderRadius: 47, backgroundColor: colors.gold, borderWidth: 5, borderColor: '#FFF4C5', alignItems: 'center', justifyContent: 'center', padding: 7, overflow: 'hidden', zIndex: 8, ...shadows.soft },
  centerGloss: { position: 'absolute', left: 9, right: 9, top: 6, height: 20, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.24)' },
  crown: { color: colors.forestDark, fontSize: 15, lineHeight: 17 },
  centerTitle: { color: colors.forestDark, fontSize: 11.5, fontWeight: '900', textAlign: 'center' },
  centerMeta: { color: colors.ink, fontSize: 6.5, lineHeight: 9, fontWeight: '800', textAlign: 'center' },
  pointer: { position: 'absolute', top: -4, width: 38, height: 40, borderTopLeftRadius: 17, borderTopRightRadius: 17, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, backgroundColor: '#F26A2E', borderWidth: 3, borderColor: '#FFF0C0', alignItems: 'center', justifyContent: 'center', zIndex: 12, ...shadows.card },
  pointerGem: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#FFE269', borderWidth: 2, borderColor: '#9A6913' },
  pointerTip: { position: 'absolute', bottom: -14, width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 16, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#F26A2E' },
  wheelInstruction: { color: colors.cream, fontSize: 7.5, fontWeight: '900', backgroundColor: 'rgba(5,67,45,0.86)', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4, marginTop: -4 },
  riskPane: { width: '27%', minWidth: 230, maxWidth: 310, borderRadius: radii.xl, backgroundColor: colors.glassCream, borderWidth: 2, borderColor: colors.white, padding: 10, justifyContent: 'center', ...shadows.card },
  riskKicker: { color: colors.orange, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  riskTitle: { color: colors.forestDark, fontSize: 14, lineHeight: 17, fontWeight: '900', marginTop: 2 },
  riskCopy: { color: colors.inkMuted, fontSize: 8, lineHeight: 10.5, fontWeight: '700', marginTop: 4 },
  vaults: { flexDirection: 'row', gap: 8, marginTop: 11 },
  vault: { flex: 1, minHeight: 75, borderRadius: radii.lg, backgroundColor: colors.surfaceGreen, borderWidth: 2, borderColor: colors.leafSoft, alignItems: 'center', justifyContent: 'center', gap: 1, paddingTop: 14, paddingBottom: 5, overflow: 'hidden' },
  vaultRisk: { backgroundColor: colors.surfaceOrange, borderColor: colors.orangeSoft },
  vaultTop: { position: 'absolute', left: -2, right: -2, top: -2, height: 16, backgroundColor: '#4E7B50', borderBottomWidth: 2, borderBottomColor: '#31563A', alignItems: 'center', justifyContent: 'center' },
  vaultTopRisk: { backgroundColor: '#CB7749', borderBottomColor: '#974F2F' },
  vaultHandle: { width: 22, height: 7, borderRadius: 5, borderWidth: 2, borderColor: '#F7E6A5', backgroundColor: 'rgba(255,255,255,0.12)' },
  vaultLabel: { color: colors.inkMuted, fontSize: 6.5, fontWeight: '900', letterSpacing: 0.55 },
  vaultValue: { color: colors.forestDark, fontSize: 14, lineHeight: 16, fontWeight: '900' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  feedbackSlot: { minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  tip: { color: colors.inkMuted, fontSize: 8, lineHeight: 11, fontWeight: '800', textAlign: 'center' },
});
