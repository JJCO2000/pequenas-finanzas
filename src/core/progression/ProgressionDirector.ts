import type { GameManifest } from '@/core/game-runtime';
import type { AdventureDay, AdventureDaySeed, AdventureNodeType, AgeBand, LevelProgress } from '@/core/domain/types';
import type { LevelDefinition } from '@/content/curriculum/levels';
import { visibleLevels } from '@/core/progression/progression';

const CYCLE: readonly AdventureNodeType[] = [
  'lesson',
  'activity',
  'game',
  'decision',
  'game',
  'review',
  'challenge',
] as const;

function compatibleLevels(levels: LevelDefinition[], ageBand: AgeBand) {
  const route = visibleLevels(levels, ageBand).sort((a, b) => a.order - b.order);
  if (route.length === 0) throw new Error(`No curriculum for age band ${ageBand}`);
  return route;
}

function chooseGame(
  games: GameManifest[],
  dayNumber: number,
  recentDays: AdventureDay[],
  ageBand: AgeBand,
) {
  const eligible = games.filter((game) => {
    if (!game.ageBands.includes(ageBand)) return false;
    if ((game.minimumDay ?? 1) > dayNumber) return false;
    return true;
  });
  if (eligible.length === 0) return null;

  const scored = eligible.map((game) => {
    const last = [...recentDays]
      .reverse()
      .find((day) => day.gameId === game.id)?.dayNumber;
    const daysSince = last === undefined ? Number.POSITIVE_INFINITY : dayNumber - last;
    const cooldown = game.cooldownDays ?? 4;
    const cooldownPenalty = daysSince <= cooldown ? 1000 - daysSince : 0;
    const deterministicTie = Math.abs(hashCode(`${game.id}:${dayNumber}`)) % 100;
    return { game, score: cooldownPenalty + deterministicTie };
  });

  scored.sort((a, b) => a.score - b.score || a.game.id.localeCompare(b.game.id));
  return scored[0]?.game ?? eligible[0] ?? null;
}

function hashCode(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function titleForNode(nodeType: AdventureNodeType, level: LevelDefinition, day: number) {
  switch (nodeType) {
    case 'lesson': return level.title;
    case 'activity': return `Práctica: ${level.concept}`;
    case 'decision': return `Decisión: ${level.concept}`;
    case 'review': return `Repaso: ${level.concept}`;
    case 'challenge': return `Reto del día ${day}`;
    case 'game': return 'Minijuego';
  }
}

export function buildInitialAdventureDays(
  levels: LevelDefinition[],
  games: GameManifest[],
  ageBand: AgeBand,
  progress: LevelProgress[],
  rewardFor: (rewardId: string) => number,
): AdventureDaySeed[] {
  const route = compatibleLevels(levels, ageBand);
  const progressMap = new Map(progress.map((item) => [item.levelId, item]));
  const seeds: AdventureDaySeed[] = [];
  let levelCursor = 0;

  // The first seven days are a curated onboarding week. It follows the same
  // rhythm as the infinite director, but keeps content deterministic and
  // introduces the first minigame in the campaign before it can appear in Arcade.
  for (let dayNumber = 1; dayNumber <= 7; dayNumber += 1) {
    let nodeType = CYCLE[(dayNumber - 1) % CYCLE.length] ?? 'lesson';
    const level = route[levelCursor % route.length] ?? route[0]!;
    let game = nodeType === 'game' ? chooseGame(games, dayNumber, seeds.map(seedToTempDay), ageBand) : null;

    if (nodeType === 'game' && !game) nodeType = 'review';
    game = nodeType === 'game' ? game : null;

    if (game) {
      seeds.push({
        dayNumber,
        nodeType: 'game',
        contentId: null,
        gameId: game.id,
        concept: game.financialConcept,
        title: game.title,
        rewardCents: 0,
      });
      continue;
    }

    seeds.push({
      dayNumber,
      nodeType,
      contentId: level.id,
      gameId: null,
      concept: level.concept,
      title: titleForNode(nodeType, level, dayNumber),
      rewardCents: rewardFor(level.rewardId),
      completed: progressMap.get(level.id)?.status === 'completed',
    });
    levelCursor += 1;
  }

  return seeds;
}

export function generateAdventureDays({
  fromDay,
  throughDay,
  levels,
  games,
  ageBand,
  existingDays,
  rewardFor,
}: {
  fromDay: number;
  throughDay: number;
  levels: LevelDefinition[];
  games: GameManifest[];
  ageBand: AgeBand;
  existingDays: AdventureDay[];
  rewardFor: (rewardId: string) => number;
}): AdventureDaySeed[] {
  if (throughDay < fromDay) return [];
  const route = compatibleLevels(levels, ageBand);
  const seeds: AdventureDaySeed[] = [];
  const recent = [...existingDays].sort((a, b) => a.dayNumber - b.dayNumber);
  const firstGeneratedDay = Math.max(1, fromDay);

  for (let dayNumber = firstGeneratedDay; dayNumber <= throughDay; dayNumber += 1) {
    if (recent.some((day) => day.dayNumber === dayNumber)) continue;

    const cycleIndex = Math.max(0, dayNumber - 1) % CYCLE.length;
    let nodeType = CYCLE[cycleIndex] ?? 'lesson';
    const curriculumIndex = Math.floor(Math.max(0, dayNumber - 1) / 2) % route.length;
    const level = route[curriculumIndex] ?? route[0]!;
    let game = nodeType === 'game' ? chooseGame(games, dayNumber, [...recent, ...seeds.map(seedToTempDay)], ageBand) : null;

    if (nodeType === 'game' && !game) nodeType = 'review';
    game = nodeType === 'game' ? game : null;

    const seed: AdventureDaySeed = {
      dayNumber,
      nodeType,
      contentId: game ? null : level.id,
      gameId: game?.id ?? null,
      concept: game?.financialConcept ?? level.concept,
      title: game?.title ?? titleForNode(nodeType, level, dayNumber),
      rewardCents: game ? 0 : rewardFor(level.rewardId),
    };
    seeds.push(seed);
  }

  return seeds;
}

function seedToTempDay(seed: AdventureDaySeed): AdventureDay {
  return {
    profileId: '',
    ...seed,
    completed: seed.completed ?? false,
    generatedAt: '',
    completedAt: null,
  };
}

export const progressionDirectorPolicy = {
  cycle: CYCLE,
  randomSelection: false,
  description: 'Learn -> practice -> play -> decide -> play -> review -> challenge',
} as const;
