import React, { useMemo } from 'react';
import { Redirect } from 'expo-router';
import { useAppData } from '@/features/session/AppDataProvider';
import { ACTIVE_THEME } from '@/core/theme';
import { formatMoney } from '@/core/domain/money';
import { getGamePresentation } from '@/registry/gamePresentation';
import { GAMES } from '@/registry/games';
import { getAdventureNodeLabel, getAdventureMissionStatus, getAdventureStage } from '@/features/adventure/presentation/adventurePresentation';
import { HomeSceneLayout } from '@/features/home';

const HOME_AVATAR = require('../../assets/ui/home/trex-avatar-vector.svg');

export default function StartScreen() {
  const { profile, currentDay, adventureDays, wallet, gameUnlocks } = useAppData();
  const current = useMemo(
    () => adventureDays.find((day) => day.dayNumber === currentDay) ?? null,
    [adventureDays, currentDay],
  );

  if (!profile) return <Redirect href={'/onboarding' as any} />;

  const currentTitle = current
    ? current.gameId
      ? getGamePresentation(current.gameId).title
      : current.title
    : 'Explora el mapa';
  const missionArt = current?.gameId
    ? (ACTIVE_THEME.gameThumbnails?.[current.gameId] ?? ACTIVE_THEME.characters.primary)
    : HOME_AVATAR;
  const reward = current?.rewardCents
    ? formatMoney(current.rewardCents)
    : current?.nodeType === 'game'
      ? 'POR PUNTAJE'
      : 'MISIÓN';
  const stage = getAdventureStage(currentDay);

  return (
    <HomeSceneLayout
      profileName={profile.displayName}
      day={currentDay}
      balanceLabel={formatMoney(wallet?.availableCents ?? 0)}
      avatar={HOME_AVATAR}
      mission={{
        day: currentDay,
        title: currentTitle,
        description: current ? getAdventureMissionStatus(current) : 'Continúa tu expedición financiera.',
        art: missionArt,
        stageNumber: stage.stageNumber,
        dayInStage: stage.dayInStage,
        totalSlots: stage.totalSlots,
        meta: `${current ? getAdventureNodeLabel(current.nodeType) : 'MAPA'} · Juegos ${gameUnlocks.length}/${GAMES.length}`,
        reward,
      }}
    />
  );
}
