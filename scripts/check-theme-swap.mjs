import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const ok = (condition, message) => {
  if (!condition) { console.error(`[FAIL] ${message}`); process.exitCode = 1; }
  else console.log(`[OK] ${message}`);
};

const pack = read('src/core/theme/ThemePack.ts');
const registry = read('src/core/theme/themeRegistry.ts');
const dino = read('src/core/theme/dinoTheme.ts');
const swap = read('src/core/theme/swapTestTheme.ts');
const presentation = read('src/registry/gamePresentation.ts');
const shop = read('src/registry/shop.ts');
const gameRoute = read('src/app/game/[gameId].tsx');

ok(registry.includes("'swap-test': SWAP_TEST_THEME") && registry.includes("ACTIVE_THEME_ID = 'dino'"), 'MVP keeps Dino active while a second validation ThemePack exists.');
ok(pack.includes('currencyPlural: string') && pack.includes('escapeLocationLabel: string') && pack.includes('games: Readonly<Record<string, ThemeGameCopy>>'), 'ThemePack owns thematic resource/location/game copy.');
ok(pack.includes('lesson: ImageSourcePropType') && pack.includes('finance: ImageSourcePropType') && pack.includes('parents: ImageSourcePropType'), 'World backgrounds are requested by semantic screen role, not cave-specific names.');
ok(!shop.match(/Huevo|f[oó]sil|Dino|dinosaur/i), 'Shop registry contains no dinosaur/fossil presentation copy.');
ok(shop.includes('ACTIVE_THEME.shop.items'), 'Shop presentation comes from the active ThemePack.');
ok(presentation.includes('description: themeCopy?.description ?? game.description'), 'Game title/description/instruction can be overridden by ThemePack from one source.');
ok(gameRoute.includes('description={presentation.description}') && gameRoute.includes('title={presentation.title}') && !gameRoute.includes('description={game.description}'), 'Game intro uses theme-aware presentation copy without bypassing ThemePack.');
ok(dino.includes("currencyPlural: 'fósiles'") && swap.includes("currencyPlural: 'fichas'"), 'Validation theme proves resource terminology can swap.');
ok(dino.includes("escapeLocationLabel: 'Cueva'") && swap.includes("escapeLocationLabel: 'Templo'"), 'Validation theme proves world terminology can swap.');
ok(dino.includes("shelfTitle: 'Elige un huevo'") && swap.includes("shelfTitle: 'Elige una reliquia'"), 'Validation theme proves shop identity can swap.');

const sourceRoots = ['src/app', 'src/features'];
const files = [];
for (const base of sourceRoots) {
  const walk = (dir) => {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(rel);
      else if (/\.(ts|tsx)$/.test(entry.name)) files.push(rel);
    }
  };
  walk(base);
}
const caveRefs = files.filter((file) => read(file).includes('ACTIVE_THEME.world.cave'));
ok(caveRefs.length === 0, `No feature asks the theme for a hard-coded cave role${caveRefs.length ? `: ${caveRefs.join(', ')}` : ''}.`);

const directAssetRefs = files.filter((file) => /ASSETS\.(characters|world|decor|shop)/.test(read(file)));
ok(directAssetRefs.length === 0, `Feature/app code has zero direct thematic ASSETS references${directAssetRefs.length ? `: ${directAssetRefs.join(', ')}` : ''}.`);

if (!process.exitCode) console.log('[OK] BLOQUE 2 — interchangeable design system control passed.');
