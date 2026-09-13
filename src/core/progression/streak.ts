export const DAILY_CHALLENGE_GAME_IDS = [
  'coin-catcher',
  'balloon-answer',
  'treasure-split',
  'dino-market',
  'fossil-escape',
  'king-greedy',
  'money-memory',
] as const;

export type DailyChallengeGameId = (typeof DAILY_CHALLENGE_GAME_IDS)[number];

export type StreakSnapshot = {
  profileId: string;
  currentStreak: number;
  bestStreak: number;
  lastQualifiedDate: string | null;
  freezesAvailable: number;
  lastFreezeAwardStreak: number;
  updatedAt: string;
  today: string;
  challengeGameId: DailyChallengeGameId;
  completedToday: boolean;
};

export type StreakQualification = {
  snapshot: StreakSnapshot;
  qualified: boolean;
  extended: boolean;
  freezeAwarded: boolean;
};

const DAY_MS = 86_400_000;

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function dateKeyToUtcMs(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  if (!year || !month || !day) throw new Error(`Fecha local inválida: ${key}`);
  return Date.UTC(year, month - 1, day);
}

export function calendarDayDiff(from: string, to: string) {
  return Math.round((dateKeyToUtcMs(to) - dateKeyToUtcMs(from)) / DAY_MS);
}

export function shiftDateKey(key: string, days: number) {
  const date = new Date(dateKeyToUtcMs(key) + days * DAY_MS);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function getDailyChallengeGameId(dateKey: string): DailyChallengeGameId {
  const dayIndex = Math.floor(dateKeyToUtcMs(dateKey) / DAY_MS);
  const normalized = ((dayIndex % DAILY_CHALLENGE_GAME_IDS.length) + DAILY_CHALLENGE_GAME_IDS.length) % DAILY_CHALLENGE_GAME_IDS.length;
  return DAILY_CHALLENGE_GAME_IDS[normalized] ?? 'coin-catcher';
}

export type StreakUrgency = 'safe' | 'new' | 'morning' | 'pending' | 'danger' | 'critical';

export function getStreakUrgency(snapshot: StreakSnapshot, now = new Date()): StreakUrgency {
  if (snapshot.completedToday) return 'safe';
  if (snapshot.currentStreak <= 0) return 'new';
  const hour = now.getHours();
  if (hour < 12) return 'morning';
  if (hour < 20) return 'pending';
  if (hour < 22) return 'danger';
  return 'critical';
}

export function minutesUntilLocalMidnight(now = new Date()) {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, Math.ceil((midnight.getTime() - now.getTime()) / 60_000));
}
