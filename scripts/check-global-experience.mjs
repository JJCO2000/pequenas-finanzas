import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [];
const check = (ok, message) => checks.push({ ok: Boolean(ok), message });

const start = read('src/app/start.tsx');
const map = read('src/features/adventure/AdventureMapScreen.tsx');
const game = read('src/app/game/[gameId].tsx');
const lesson = read('src/app/lesson/[id].tsx');
const overlay = read('src/features/adventure/components/MissionCompleteOverlay.tsx');
const mapNode = read('src/features/adventure/components/AdventureMapNode.tsx');
const currentCard = read('src/features/adventure/components/AdventureCurrentMissionCard.tsx');
const returnToast = read('src/features/adventure/components/AdventureReturnToast.tsx');
const stage = read('src/features/adventure/components/AdventureStageProgress.tsx');
const packageJson = JSON.parse(read('package.json'));

check(start.includes('Tu siguiente misión ya está lista') && start.includes('AdventureStageProgress'), 'Start foregrounds the current mission and stage progress.');
check(start.includes('GAMES.length') && !start.includes('gameUnlocks.length}/7'), 'Discovered-game total comes from the games registry, not a duplicated hardcoded 7.');
check(map.includes('AdventureMapNode') && mapNode.includes('Animated.loop') && mapNode.includes('ACTIVE_THEME.characters.primary'), 'Current map node has themed companion + pulse game-feel.');
check(map.includes('AdventureStageProgress') && map.includes('AdventureCurrentMissionCard'), 'Map exposes stage progress and a first-class current mission card.');
check(returnToast.includes('MISIÓN COMPLETADA') && map.includes('AdventureReturnToast'), 'Returning from campaign produces in-world completion/unlock feedback.');
check(game.includes('MissionCompleteOverlay') && !game.includes('Alert.alert'), 'Game success uses in-world completion overlay, not a native Alert.');
check(lesson.includes('MissionCompleteOverlay') && !lesson.includes("Alert.alert(\n          result") && !lesson.includes("Alert.alert(\n          '¡Correcto!'"), 'Lesson success uses the shared in-world completion overlay.');
check(overlay.includes('Haptics.notificationAsync') && overlay.includes('Animated.spring') && overlay.includes('ACTIVE_THEME'), 'Completion overlay includes haptics, animation and themed assets.');
check(currentCard.includes('getAdventureNodeLabel') && currentCard.includes('RECOMPENSA'), 'Current mission card communicates mission type and reward before entry.');
check(stage.includes('Array.from({ length: stage.totalSlots }') && stage.includes('segmentCurrent'), 'Stage progress has discrete, visible current-position feedback.');
check(![start, map, game, lesson, overlay, mapNode, currentCard, returnToast, stage].some((text) => text.includes('ASSETS.')), 'Global experience UI consumes ThemePack instead of raw asset registry.');
check(packageJson.scripts?.['audit:experience'] === 'node scripts/check-global-experience.mjs', 'Global experience control is available as npm run audit:experience.');

for (const item of checks) console.log(`${item.ok ? '[OK]' : '[FAIL]'} ${item.message}`);
const failed = checks.filter((item) => !item.ok);
if (failed.length) {
  console.error(`\nGlobal experience control failed: ${failed.length}/${checks.length}.`);
  process.exit(1);
}
console.log('[OK] PLAN 7 JUEGOS — Bloque 3 global experience control passed.');
