import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`[OK] ${message}`);
}

const arcade = read('src/app/arcade.tsx');
const gameRoute = read('src/app/game/[gameId].tsx');
const campBack = read('src/features/shell/navigation/useCampBack.ts');

assert(
  arcade.includes('const { goBack, fromCamp } = useCampBack();'),
  'Arcade reads whether it was opened from Campamento',
);
assert(
  arcade.includes("...(fromCamp ? { from: 'camp' } : {})"),
  'Arcade propagates Campamento origin into minigames',
);
assert(
  gameRoute.includes("const fromCamp = params.from === 'camp';"),
  'Game route restores Campamento origin',
);
assert(
  gameRoute.includes('router.dismissTo(arcadeHref as any);'),
  'Arcade games dismiss back to the existing hub instead of stacking a duplicate',
);
assert(
  !gameRoute.includes("router.replace('/arcade'"),
  'Game route no longer blindly replaces with a new Arcade route',
);
assert(
  campBack.includes("router.replace({ pathname: '/play', params: { camp: '1' } } as any);"),
  'Arcade opened from Campamento returns to the Campamento overlay in one action',
);

console.log('[OK] Navigation return regression guard passed.');
