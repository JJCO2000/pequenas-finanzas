import type { AgeBand, GameRunMode } from '@/core/domain/types';

export type GameMetricValue = string | number | boolean | null;
export type GameResult = {
  gameId: string;
  sessionId: string;
  score: number;
  durationMs: number;
  completed: boolean;
  metrics: Record<string, GameMetricValue>;
};

export type GameModifierValue = string | number | boolean | null;
export type GameSession = {
  sessionId: string;
  gameId: string;
  profileId: string;
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  mode: GameRunMode;
  campaignDay: number | null;
  modifiers: Record<string, GameModifierValue>;
  startedAt: number;
};

export type GameManifest = {
  id: string;
  title: string;
  description: string;
  ageBands: AgeBand[];
  learningObjective: string;
  financialConcept: string;
  durationSeconds: number;
  controls: Array<'tap' | 'drag' | 'swipe' | 'choice'>;
  kit: 'arcade' | 'quiz' | 'simulation' | 'board' | 'narrative' | 'rpg';
  rewardRuleId: string;
  componentId: string;
  topics?: string[];
  minimumDay?: number;
  cooldownDays?: number;
  replayable?: boolean;
  arcadeRewards?: boolean;
  presentation: {
    badge: string;
    shortInstruction: string;
    introSteps: [string, string, string];
  };
};

export type GameComponentProps = {
  session: GameSession;
  onFinish: (result: GameResult) => void;
};
