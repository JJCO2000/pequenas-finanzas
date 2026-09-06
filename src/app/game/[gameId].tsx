import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { GameHost } from '@/features/games/GameHost';
import { useAppData } from '@/features/session/AppDataProvider';
import { useSfx } from '@/features/audio/SfxProvider';
import { createGameSession, type GameResult } from '@/core/game-runtime';
import type { GameRunMode } from '@/core/domain/types';
import { deriveGameModifiers } from '@/core/economy/gameUpgradePolicy';
import { getGame } from '@/registry/games';
import { getGamePresentation } from '@/registry/gamePresentation';
import { SHOP_ITEMS } from '@/registry/shop';
import { formatMoney } from '@/core/domain/money';
import { ACTIVE_THEME } from '@/core/theme';
import { MissionCompleteOverlay } from '@/features/adventure/components/MissionCompleteOverlay';
import { GameIntroScreen, LearningPeek } from '@/features/games/ui/GameIntroScreen';
import { ActionPill, FloatingCard } from '@/features/shell/gameui';
import { ScenicBackdrop } from '@/features/shell/components/PFVisual';
import { colors, shadows, typography } from '@/core/theme/tokens';

export default function GameRoute() {
  const params = useLocalSearchParams<{ gameId: string; mode?: string; day?: string; from?: string }>();
  const { profile, inventory, settings, submitGameResult } = useAppData();
  const { play } = useSfx();
  const gameId = String(params.gameId);
  const game = getGame(gameId);
  const presentation = getGamePresentation(gameId);
  const mode: GameRunMode = params.mode === 'campaign' ? 'campaign' : 'arcade';
  const fromCamp = params.from === 'camp';
  const parsedDay = Number(params.day ?? 0);
  const campaignDay = mode === 'campaign' && Number.isInteger(parsedDay) && parsedDay > 0 ? parsedDay : null;
  const [started, setStarted] = useState(false);
  const [learningOpen, setLearningOpen] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [pendingResult, setPendingResult] = useState<GameResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reward, setReward] = useState<{ rewardCents: number; multiplier: number; maturedCount: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const modifiers = useMemo(() => ({
    ...deriveGameModifiers(inventory),
    hapticsEnabled: settings.haptics !== 'off',
    soundEnabled: settings.sound !== 'off',
  }), [inventory, settings.haptics, settings.sound]);

  const activePowerLabels = useMemo(() => {
    if (gameId !== 'coin-catcher') return [];
    const owned = new Set(inventory.filter((item) => item.quantity > 0).map((item) => item.itemId));
    return SHOP_ITEMS.filter((item) => item.gameId === gameId && owned.has(item.id)).map((item) => item.effectTitle);
  }, [gameId, inventory]);

  const session = useMemo(
    () => (profile && game ? createGameSession(game.id, profile.id, profile.ageBand, 1, { mode, campaignDay, modifiers }) : null),
    [campaignDay, game, mode, modifiers, profile],
  );

  if (!profile || !game || !session) {
    return <ScenicBackdrop source={ACTIVE_THEME.world.shell} overlay="dark" contentStyle={styles.missingRoot}><Text style={styles.missing}>Juego no encontrado.</Text></ScenicBackdrop>;
  }

  const persistResult = async (nextResult: GameResult) => {
    if (submittingRef.current || result) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    setPendingResult(nextResult);
    try {
      const outcome = await submitGameResult(nextResult, { mode, campaignDay });
      setReward({ rewardCents: outcome.rewardCents, multiplier: outcome.multiplier, maturedCount: outcome.maturedInvestments.length });
      setResult(nextResult);
      setPendingResult(null);
      play('celebrate');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo guardar el resultado.');
      play('error');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const finish = async (nextResult: GameResult) => {
    if (submittingRef.current || result || pendingResult) return;
    await persistResult(nextResult);
  };

  const arcadeHref = fromCamp
    ? ({ pathname: '/arcade', params: { from: 'camp' } } as const)
    : ('/arcade' as const);

  const goBack = () => {
    if (mode === 'campaign') {
      if (router.canGoBack()) router.back();
      else router.replace('/play' as any);
      return;
    }
    router.dismissTo(arcadeHref as any);
  };

  const returnToJourney = () => {
    if (mode === 'campaign' && campaignDay) {
      router.replace({ pathname: '/play', params: { completed: String(campaignDay) } } as any);
      return;
    }
    router.dismissTo(arcadeHref as any);
  };

  const resultSubtitle = reward?.maturedCount
    ? `${reward.maturedCount} inversión(es) también llegaron a su fecha de cobro.`
    : mode === 'campaign'
      ? 'El siguiente punto de la expedición ya está listo en el mapa.'
      : `Tu resultado quedó guardado. Multiplicador de hoy: ×${reward?.multiplier ?? 1}.`;

  if (!started) {
    return (
      <ScenicBackdrop source={ACTIVE_THEME.world.gameIntro ?? ACTIVE_THEME.world.shell} overlay="none" contentStyle={styles.introRoot}>
        <GameIntroScreen
          badge={presentation.badge}
          title={presentation.title}
          description={presentation.description}
          learningObjective={game.learningObjective}
          financialConcept={game.financialConcept}
          durationSeconds={game.durationSeconds}
          controls={game.controls}
          hero={presentation.hero}
          introSteps={game.presentation.introSteps}
          modeLabel={mode === 'campaign' ? `AVENTURA · DÍA ${campaignDay ?? ''}` : 'ARCADE · JUEGO LIBRE'}
          activePowerLabels={activePowerLabels}
          onBack={goBack}
          onStart={() => {
            setLearningOpen(false);
            setStarted(true);
          }}
        />
      </ScenicBackdrop>
    );
  }

  return (
    <View style={styles.gameRoot}>
      <GameHost componentId={game.componentId} session={session} onFinish={(nextResult: GameResult) => void finish(nextResult)} />

      <View pointerEvents="box-none" style={styles.controlsOverlay}>
        <Pressable accessibilityLabel="Salir del juego" onPress={() => { play('tap'); goBack(); }} style={({ pressed }) => [styles.floatingBack, pressed && styles.pressed]}>
          <Text style={styles.floatingBackText}>←</Text>
        </Pressable>
        <LearningPeek
          open={learningOpen}
          onToggle={() => setLearningOpen((value) => !value)}
          learningObjective={game.learningObjective}
          financialConcept={game.financialConcept}
        />
      </View>

      {pendingResult && !result ? (
        <View style={styles.saveShade}>
          <FloatingCard style={styles.saveCard}>
            <Text style={styles.saveKicker}>{submitError ? 'GUARDADO PENDIENTE' : 'GUARDANDO PARTIDA'}</Text>
            <Text style={styles.saveTitle}>{submitError ? 'No pudimos confirmar el guardado' : 'Guardando tu resultado…'}</Text>
            <Text style={styles.saveText}>
              {submitError
                ? 'Tu partida se conserva aquí. Reintenta con el mismo resultado: la recompensa no se duplica.'
                : 'Estamos registrando puntaje y recompensa de forma segura.'}
            </Text>
            {submitError ? <Text numberOfLines={2} style={styles.saveError}>{submitError}</Text> : null}
            <View style={styles.saveActions}>
              {submitError ? (
                <ActionPill
                  label={submitting ? 'GUARDANDO…' : 'REINTENTAR GUARDADO'}
                  onPress={() => { if (!submitting) void persistResult(pendingResult); }}
                  tone="gold"
                  style={styles.retryButton}
                />
              ) : null}
              {submitError ? <ActionPill label="VOLVER SIN CONFIRMAR" onPress={goBack} tone="light" style={styles.exitButton} /> : null}
            </View>
          </FloatingCard>
        </View>
      ) : null}

      <MissionCompleteOverlay
        visible={Boolean(result && reward)}
        eyebrow={mode === 'campaign' ? `DÍA ${campaignDay ?? ''} SUPERADO` : 'PARTIDA COMPLETADA'}
        title={mode === 'campaign' ? '¡Misión cumplida!' : '¡Buen trabajo!'}
        subtitle={resultSubtitle}
        scoreText={result ? String(result.score) : undefined}
        rewardText={reward ? formatMoney(reward.rewardCents) : undefined}
        primaryLabel={mode === 'campaign' ? 'CONTINUAR AVENTURA →' : 'VOLVER A ARCADE'}
        onPrimary={returnToJourney}
        secondaryLabel="VER MI DINERO"
        onSecondary={() => router.push('/wallet' as any)}
        hapticsEnabled={settings.haptics !== 'off'}
        hero={presentation.hero}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  missingRoot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  missing: { color: colors.white, fontSize: 26, fontWeight: '900' },
  introRoot: { flex: 1 },
  gameRoot: { flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: colors.ink },
  controlsOverlay: { position: 'absolute', zIndex: 50, left: 8, right: 8, top: 8, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  floatingBack: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.glassDark, borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadows.card },
  floatingBackText: { color: colors.white, fontSize: 24, lineHeight: 26, fontWeight: '900' },
  saveShade: { ...StyleSheet.absoluteFillObject, zIndex: 80, backgroundColor: 'rgba(4,24,16,0.62)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  saveCard: { width: '58%', minWidth: 430, maxWidth: 620, minHeight: 170, paddingHorizontal: 18, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  saveKicker: { color: colors.orange, fontSize: typography.micro, lineHeight: 12, fontWeight: '900', letterSpacing: 0.7 },
  saveTitle: { color: colors.forestDark, fontSize: 18, lineHeight: 21, fontWeight: '900', marginTop: 3, textAlign: 'center' },
  saveText: { color: colors.inkMuted, fontSize: typography.caption, lineHeight: 15, fontWeight: '700', marginTop: 5, textAlign: 'center', maxWidth: 500 },
  saveError: { color: colors.danger, fontSize: typography.micro, lineHeight: 12, fontWeight: '800', marginTop: 5, textAlign: 'center' },
  saveActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 },
  retryButton: { minWidth: 180 },
  exitButton: { minWidth: 160 },
  pressed: { transform: [{ scale: 0.97 }] },
});
