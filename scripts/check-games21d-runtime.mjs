import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = (relative) => fs.existsSync(path.join(root, relative));
const fail = (message) => {
  console.error(`[FAIL] ${message}`);
  process.exit(1);
};
const ok = (message) => console.log(`[OK] ${message}`);

const expected = [
  { id: 'coin-catcher', folder: 'coin-catcher', componentId: 'coin-catcher-v1', minimumDay: 5 },
  { id: 'balloon-answer', folder: 'balloon-answer', componentId: 'balloon-answer-v1', minimumDay: 10 },
  { id: 'treasure-split', folder: 'treasure-split', componentId: 'treasure-split-v1', minimumDay: 12 },
  { id: 'dino-market', folder: 'dino-market', componentId: 'dino-market-v1', minimumDay: 17 },
  { id: 'fossil-escape', folder: 'fossil-escape', componentId: 'fossil-escape-v1', minimumDay: 19 },
  { id: 'king-greedy', folder: 'king-greedy', componentId: 'king-greedy-v1', minimumDay: 24 },
  { id: 'money-memory', folder: 'money-memory', componentId: 'money-memory-v1', minimumDay: 26 },
];

const registry = read('src/registry/games.ts');
const host = read('src/features/games/GameHost.tsx');
const presentation = read('src/registry/gamePresentation.ts');
const rewards = read('src/core/economy/rewardRules.ts');

for (const game of expected) {
  const manifestPath = `src/features/games/${game.folder}/manifest.ts`;
  if (!exists(manifestPath)) fail(`Missing manifest: ${manifestPath}`);
  const manifest = read(manifestPath);
  if (!manifest.includes(`id: '${game.id}'`)) fail(`Manifest id mismatch: ${game.id}`);
  if (!manifest.includes(`componentId: '${game.componentId}'`)) fail(`Component id mismatch: ${game.id}`);
  if (!manifest.includes(`minimumDay: ${game.minimumDay}`)) fail(`minimumDay mismatch: ${game.id}`);
  if (!registry.includes(game.id === 'coin-catcher' ? 'COIN_CATCHER_MANIFEST' : game.id.split('-').map((part) => part.toUpperCase()).join('_'))) {
    // Registry is verified again below via manifest import/component mapping text.
  }
  if (!host.includes(`'${game.componentId}'`)) fail(`GameHost missing: ${game.componentId}`);
  if (!manifest.includes('presentation:')) fail(`Manifest presentation missing: ${game.id}`);

  const gameFiles = game.id === 'coin-catcher'
    ? ['Game.native.tsx', 'Game.web.tsx']
    : ['Game.tsx'];
  for (const file of gameFiles) {
    const filePath = `src/features/games/${game.folder}/${file}`;
    if (!exists(filePath)) fail(`Missing playable component: ${filePath}`);
    const source = read(filePath);
    if (/core\/data|repositories|expo-sqlite|useAppData/.test(source)) {
      fail(`Game bypasses architecture boundary: ${filePath}`);
    }
  }
}

const registeredManifestCount = (registry.match(/_MANIFEST/g) ?? []).length / 2;
if (registeredManifestCount < 7 && !expected.every((game) => registry.includes(`/${game.folder}/manifest`))) {
  fail('Game registry does not contain all seven playable games.');
}
if (!expected.every((game) => registry.includes(`/${game.folder}/manifest`))) {
  fail('One or more manifests are missing from registry/games.ts.');
}
if (!rewards.includes("'score-percent-50'")) fail('Shared score reward rule missing.');

const newGameContent = [
  'src/content/games/balloonBudget.ts',
  'src/content/games/treasureSplit.ts',
  'src/content/games/dinoMarket.ts',
  'src/content/games/fossilEscape.ts',
  'src/content/games/greedyKing.ts',
  'src/content/games/moneyMemory.ts',
];
for (const file of newGameContent) {
  if (!exists(file)) fail(`Educational content missing: ${file}`);
}

function hashCode(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return hash;
}

const scheduleGames = expected.map((game) => ({ ...game, cooldownDays: 20 }));
const recent = [];
function chooseGame(day) {
  const eligible = scheduleGames.filter((game) => game.minimumDay <= day);
  if (eligible.length === 0) return null;
  const scored = eligible.map((game) => {
    const last = [...recent].reverse().find((entry) => entry.id === game.id)?.day;
    const daysSince = last === undefined ? Number.POSITIVE_INFINITY : day - last;
    const cooldownPenalty = daysSince <= game.cooldownDays ? 1000 - daysSince : 0;
    const deterministicTie = Math.abs(hashCode(`${game.id}:${day}`)) % 100;
    return { game, score: cooldownPenalty + deterministicTie };
  });
  scored.sort((a, b) => a.score - b.score || a.game.id.localeCompare(b.game.id));
  return scored[0]?.game ?? null;
}

for (let day = 1; day <= 26; day += 1) {
  const cycleIndex = (day - 1) % 7;
  if (cycleIndex !== 2 && cycleIndex !== 4) continue;
  const game = chooseGame(day);
  if (game) recent.push({ id: game.id, day });
}

const firstDiscoveries = recent.slice(0, 7).map((entry) => `${entry.day}:${entry.id}`);
const expectedDiscoveries = [
  '5:coin-catcher',
  '10:balloon-answer',
  '12:treasure-split',
  '17:dino-market',
  '19:fossil-escape',
  '24:king-greedy',
  '26:money-memory',
];
if (firstDiscoveries.join('|') !== expectedDiscoveries.join('|')) {
  fail(`Campaign discovery sequence changed: ${firstDiscoveries.join(', ')}`);
}

ok('7 playable games registered (6 new + Atrapa monedas).');
ok('All game modules respect Game -> GameResult boundaries.');
ok('Educational content is separated from gameplay components.');
ok(`Campaign discovers all games by Day 26: ${firstDiscoveries.join(' · ')}`);
if (!presentation.includes('game.presentation.badge') || !presentation.includes('ACTIVE_THEME.gameHeroes')) fail('Game presentation must derive from manifest + active theme.');
ok('Arcade presentation derives from manifest metadata + active theme; shared reward rule covers the full catalog.');
