import type { ImageSourcePropType } from 'react-native';
import { ACTIVE_THEME } from '@/core/theme';
import { getGame } from '@/registry/games';

export type GamePresentation = {
  title: string;
  description: string;
  hero: ImageSourcePropType;
  badge: string;
  shortInstruction: string;
};

const FALLBACK: GamePresentation = {
  title: 'Aventura',
  description: 'Completa el reto y sigue avanzando.',
  hero: ACTIVE_THEME.fallbackGameHero,
  badge: 'AVENTURA',
  shortInstruction: 'Completa el reto y sigue avanzando.',
};

export function getGamePresentation(gameId: string): GamePresentation {
  const game = getGame(gameId);
  if (!game) return FALLBACK;
  const themeCopy = ACTIVE_THEME.copy.games[gameId];
  return {
    title: themeCopy?.title ?? game.title,
    description: themeCopy?.description ?? game.description,
    hero: ACTIVE_THEME.gameHeroes[gameId] ?? ACTIVE_THEME.fallbackGameHero,
    badge: game.presentation.badge,
    shortInstruction: themeCopy?.shortInstruction ?? game.presentation.shortInstruction,
  };
}
