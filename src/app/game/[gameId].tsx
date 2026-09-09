import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameHost } from '@/features/games/GameHost';
import { useAppData } from '@/features/session/AppDataProvider';
import { createGameSession, type GameResult } from '@/core/game-runtime';
import type { GameRunMode } from '@/core/domain/types';
import { deriveGameModifiers } from '@/core/economy/gameUpgradePolicy';
import { getGame } from '@/registry/games';
import { getGamePresentation } from '@/registry/gamePresentation';
import { formatMoney } from '@/core/domain/money';
import { ACTIVE_THEME } from '@/core/theme';
import { MissionCompleteOverlay } from '@/features/adventure/components/MissionCompleteOverlay';
import { GameIntroScreen, LearningPeek } from '@/features/games/ui/GameIntroScreen';
import { ScenicBackdrop } from '@/features/shell/components/PFVisual';
import { colors, shadows } from '@/core/theme/tokens';

export default function GameRoute() {
  const params = useLocalSearchParams<{ gameId: string; mode?: string; day?: string }>();
  const insets = useSafeAreaInsets();
  const { profile, inventory, settings, submitGameResult } = useAppData();
  const gameId = String(params.gameId);
  const game = getGame(gameId);
  const presentation = getGamePresentation(gameId);
  const mode: GameRunMode = params.mode === 'campaign' ? 'campaign' : 'arcade';
  const parsedDay = Number(params.day ?? 0);
  const campaignDay = mode === 'campaign' && Number.isInteger(parsedDay) && parsedDay > 0 ? parsedDay : null;
  const [started, setStarted] = useState(false);
  const [learningOpen, setLearningOpen] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [reward, setReward] = useState<{ rewardCents: number; multiplier: number; maturedCount: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const modifiers = useMemo(() => ({
    ...deriveGameModifiers(inventory),
    hapticsEnabled: settings.haptics !== 'off',
    soundEnabled: settings.sound !== 'off',
  }), [inventory, settings.haptics, settings.sound]);

  const session = useMemo(
    () => (profile && game ? createGameSession(game.id, profile.id, profile.ageBand, 1, { mode, campaignDay, modifiers }) : null),
    [campaignDay, game, mode, modifiers, profile],
  );

  if (!profile || !game || !session) {
    return <ScenicBackdrop source={ACTIVE_THEME.world.shell} overlay="dark" contentStyle={styles.missingRoot}><Text style={styles.missing}>Juego no encontrado.</Text></ScenicBackdrop>;
  }

  const finish = async (nextResult: GameResult) => {
    if (submitting || result) return;
    setSubmitting(true);
    try {
      setResult(nextResult);
      const outcome = await submitGameResult(nextResult, { mode, campaignDay });
      setReward({ rewardCents: outcome.rewardCents, multiplier: outcome.multiplier, maturedCount: outcome.maturedInvestments.length });
    } finally {
      setSubmitting(false);
    }
  };

  const returnPath = mode === 'campaign' ? '/play' : '/arcade';
  const goBack = () => router.replace(returnPath as any);
  const returnToJourney = () => {
    if (mode === 'campaign' && campaignDay) {
      router.replace({ pathname: '/play', params: { completed: String(campaignDay) } } as any);
      return;
    }
    router.replace(returnPath as any);
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
          onBack={goBack}
          onStart={() => {
            setLearningOpen(false);
            setStarted(true);
          }}
        />
      </ScenicBackdrop>
    );
  }

  const safeHorizontal = Math.max(8, insets.left, insets.right);
  const safeTop = Math.max(4, insets.top);
  const safeBottom = Math.max(4, insets.bottom);

  return (
    <View style={styles.gameRoot}>
      <View style={[styles.gameViewport, { paddingLeft: safeHorizontal, paddingRight: safeHorizontal, paddingTop: safeTop, paddingBottom: safeBottom }]}>
        <GameHost componentId={game.componentId} session={session} onFinish={(nextResult: GameResult) => void finish(nextResult)} />
      </View>

      <View
        pointerEvents="box-none"
        style={[
          styles.controlsOverlay,
          {
            left: Math.max(8, insets.left + 4),
            right: Math.max(8, insets.right + 4),
            top: Math.max(8, insets.top + 4),
          },
        ]}
      >
        <Pressable accessibilityLabel="Salir del juego" onPress={goBack} style={({ pressed }) => [styles.floatingBack, pressed && styles.pressed]}>
          <Text style={styles.floatingBackText}>←</Text>
        </Pressable>
        <LearningPeek
          open={learningOpen}
          onToggle={() => setLearningOpen((value) => !value)}
          learningObjective={game.learningObjective}
          financialConcept={game.financialConcept}
        />
      </View>

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
  gameRoot: { flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: colors.forestDark },
  gameViewport: { flex: 1, minWidth: 0, minHeight: 0 },
  controlsOverlay: { position: 'absolute', zIndex: 50, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  floatingBack: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.glassDark, borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadows.card },
  floatingBackText: { color: colors.white, fontSize: 24, lineHeight: 26, fontWeight: '900' },
  pressed: { transform: [{ scale: 0.97 }] },
});
