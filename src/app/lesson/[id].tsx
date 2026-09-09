import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { DecisionQuiz } from '@/game-kits/quiz/DecisionQuiz';
import { useAppData } from '@/features/session/AppDataProvider';
import { getLevel } from '@/registry/levels';
import { getFixedReward } from '@/registry/rewards';
import { ACTIVE_THEME } from '@/core/theme';
import { formatMoney } from '@/core/domain/money';
import { MissionCompleteOverlay } from '@/features/adventure/components/MissionCompleteOverlay';
import { WorldScene } from '@/features/shell/world';
import { ActionPill, FloatingCard, HudPill, IconButton } from '@/features/shell/gameui';
import { colors } from '@/core/theme/tokens';

type Mode = 'info' | 'activity';
type CompletionState = { rewardText: string; subtitle: string };

export default function Lesson() {
  const params = useLocalSearchParams<{ id: string; day?: string }>();
  const level = getLevel(String(params.id));
  const { completeCampaignDay, completeLesson, settings } = useAppData();
  const [mode, setMode] = useState<Mode>('info');
  const [busy, setBusy] = useState(false);
  const [completion, setCompletion] = useState<CompletionState | null>(null);
  const dayNumber = Number(params.day ?? 0);
  const isCampaign = Number.isInteger(dayNumber) && dayNumber > 0;

  if (!level) {
    return (
      <WorldScene background={ACTIVE_THEME.world.lesson} tone="dark" safe={false} contentStyle={styles.root}>
        <Text style={styles.missing}>Nivel no encontrado.</Text>
      </WorldScene>
    );
  }

  const done = async (score: number) => {
    if (score < 100 || busy) return;
    setBusy(true);
    try {
      if (isCampaign) {
        const result = await completeCampaignDay(dayNumber, level.id, score);
        const investmentText = result.maturedInvestments.length > 0
          ? ` Además, ${result.maturedInvestments.length} inversión(es) llegaron a su fecha de cobro.`
          : '';
        setCompletion({
          rewardText: result.awarded ? formatMoney(result.rewardCents) : 'YA COBRADA',
          subtitle: `Completaste el reto y el siguiente punto del mapa ya está listo.${investmentText}`,
        });
      } else {
        const result = await completeLesson(level.id, score);
        setCompletion({
          rewardText: result.awarded ? formatMoney(getFixedReward(level.rewardId)) : 'YA COBRADA',
          subtitle: result.awarded
            ? 'Tu recompensa quedó guardada. Continúa por el mapa para descubrir el siguiente reto.'
            : 'Ya habías completado este reto; puedes seguir avanzando desde el mapa.',
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const continueJourney = () => {
    if (isCampaign) {
      router.replace({ pathname: '/play', params: { completed: String(dayNumber) } } as any);
      return;
    }
    router.replace('/play' as any);
  };

  if (mode === 'activity') {
    return (
      <WorldScene background={ACTIVE_THEME.world.activity} tone="soft" safe={false} contentStyle={styles.root}>
        <View style={styles.topBar}>
          <IconButton label="←" accessibilityLabel="Volver al tema" onPress={() => setMode('info')} />
          <HudPill label={isCampaign ? `DÍA ${dayNumber}` : 'PRÁCTICA'} value="ACTIVIDAD" />
        </View>
        <Image source={ACTIVE_THEME.decor.trail} style={styles.tracks} resizeMode="contain" />
        <View style={styles.activityContent}>
          <DecisionQuiz
            situation={level.situation}
            options={level.options}
            explanation={level.explanation}
            onComplete={done}
          />
        </View>
        <Image source={ACTIVE_THEME.characters.quaternary} style={styles.activityCharacter} resizeMode="contain" />

        <MissionCompleteOverlay
          visible={Boolean(completion)}
          eyebrow={isCampaign ? `DÍA ${dayNumber} SUPERADO` : 'RETO COMPLETADO'}
          title="¡Decisión correcta!"
          subtitle={completion?.subtitle}
          scoreText="100"
          rewardText={completion?.rewardText}
          primaryLabel="CONTINUAR AVENTURA →"
          onPrimary={continueJourney}
          hapticsEnabled={settings.haptics !== 'off'}
          hero={ACTIVE_THEME.characters.quaternary}
        />
      </WorldScene>
    );
  }

  return (
    <WorldScene background={ACTIVE_THEME.world.lesson} tone="dark" safe={false} contentStyle={styles.root}>
      <View style={styles.topBar}>
        <IconButton label="←" accessibilityLabel="Volver al mapa" onPress={() => router.replace('/play' as any)} />
        <HudPill label={isCampaign ? `DÍA ${dayNumber}` : 'TEMA'} value={level.concept} />
      </View>

      <Image source={ACTIVE_THEME.decor.currency} style={styles.currencyLeft} resizeMode="contain" />
      <Image source={ACTIVE_THEME.decor.currency} style={styles.currencyRight} resizeMode="contain" />

      <View style={styles.infoContent}>
        <View style={styles.topicWrap}>
          <Text style={styles.topicLabel}>DESCUBRE</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.topicTitle}>{level.title}</Text>
        </View>
        <View style={styles.panels}>
          <FloatingCard style={[styles.panel, styles.objectivePanel]}>
            <Text style={styles.panelEyebrow}>{level.concept.toUpperCase()}</Text>
            <Text style={styles.panelTitle}>Objetivo</Text>
            <Text numberOfLines={4} adjustsFontSizeToFit style={styles.panelText}>{level.learningObjective}</Text>
          </FloatingCard>
          <FloatingCard style={[styles.panel, styles.infoPanel]}>
            <Text style={styles.panelTitle}>Idea clave</Text>
            <Text numberOfLines={5} adjustsFontSizeToFit style={styles.panelText}>{level.explanation}</Text>
          </FloatingCard>
        </View>
        <ActionPill label="IR A LA ACTIVIDAD →" onPress={() => setMode('activity')} />
      </View>
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  missing: { color: colors.white, fontSize: 16, fontWeight: '900', alignSelf: 'center', marginTop: 60 },
  topBar: { position: 'absolute', left: 10, right: 10, top: 8, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoContent: { flex: 1, paddingHorizontal: 54, paddingTop: 38, paddingBottom: 8, alignItems: 'center', justifyContent: 'center', gap: 7 },
  topicWrap: { alignItems: 'center', justifyContent: 'center', gap: 1 },
  topicLabel: { color: colors.gold, fontSize: 7, fontWeight: '900', letterSpacing: 1.2 },
  topicTitle: { color: colors.white, fontSize: 17, lineHeight: 19, fontWeight: '900', maxWidth: 500, textShadowColor: colors.glassBlack, textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 2 },
  panels: { width: '68%', maxWidth: 700, flexDirection: 'row', gap: 8 },
  panel: { flex: 1, minHeight: 92, maxHeight: 126, padding: 10, justifyContent: 'center' },
  objectivePanel: { backgroundColor: 'rgba(255,249,227,0.95)' },
  infoPanel: { backgroundColor: 'rgba(239,248,232,0.95)' },
  panelEyebrow: { color: colors.orange, fontSize: 6.5, fontWeight: '900', letterSpacing: 0.9 },
  panelTitle: { color: colors.forestDark, fontSize: 11, lineHeight: 13, fontWeight: '900', marginTop: 2, marginBottom: 3 },
  panelText: { color: colors.inkMuted, fontSize: 8, lineHeight: 10.5, fontWeight: '700' },
  currencyLeft: { position: 'absolute', width: 48, height: 40, left: 10, top: 48, opacity: 0.7 },
  currencyRight: { position: 'absolute', width: 50, height: 42, right: 10, bottom: 8, transform: [{ scaleX: -1 }], opacity: 0.7 },
  activityContent: { flex: 1, paddingHorizontal: 36, paddingTop: 40, paddingBottom: 6, zIndex: 3 },
  tracks: { position: 'absolute', width: 54, height: 40, left: 4, top: 52, opacity: 0.55 },
  activityCharacter: { position: 'absolute', width: 72, height: 62, right: 2, bottom: -4 },
});
