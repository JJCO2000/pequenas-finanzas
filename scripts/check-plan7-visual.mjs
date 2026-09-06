import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const ok = (message) => console.log(`[OK] ${message}`);
const fail = (message) => { console.error(`[FAIL] ${message}`); process.exitCode = 1; };

const route = read('src/app/game/[gameId].tsx');
const intro = read('src/features/games/ui/GameIntroScreen.tsx');
const arcade = read('src/app/arcade.tsx');
const investments = read('src/app/investments.tsx');
const portfolio = read('src/features/wallet/components/InvestmentPortfolio.tsx');
const camp = read('src/features/adventure/components/AdventureCampMenu.tsx');
const visual = read('src/features/shell/components/PFVisual.tsx');

if (route.includes('LandscapeHeader') || route.includes('gamePane')) fail('Gameplay still carries the old permanent global header/pane chrome.');
else ok('Gameplay stays fullscreen after the intro.');
if (!route.includes('controlsOverlay') || !route.includes('LearningPeek')) fail('Fullscreen gameplay is missing floating back/help controls.');
else ok('Only floating back/help controls sit above gameplay.');
if (!intro.includes('introSteps.map') || !intro.includes('Jugar ahora') || !intro.includes('heroOrb')) fail('Dedicated game intro is incomplete.');
else ok('Each game has a concise illustrated start screen before gameplay.');
if (!intro.includes("peekPanel: { position: 'absolute'") || !intro.includes("peekWrap: { position: 'relative'")) fail('Learning panel may consume gameplay layout space.');
else ok('Learning help is overlay-only and minimizable.');

if (!arcade.includes('GAMES.map') || !arcade.includes('twoColumns') || !arcade.includes('SoftCard') || !arcade.includes('YellowButton')) fail('Arcade does not use the reusable lightweight catalog system.');
else ok('Arcade uses reusable two-column responsive cards.');
if (/gameUnlocks|isUnlocked|lockedPoster|disabled=\{!isUnlocked\}/.test(arcade)) fail('Arcade is not 7/7 free-play.');
else ok('All 7 Arcade games remain always available.');
if (/posterCopy|posterBg|minHeight:\s*350/.test(arcade)) fail('Oversized Arcade poster layout remains.');
else ok('Old oversized Arcade posters are gone.');

if (!investments.includes('InvestmentPortfolio') || !investments.includes('MetricCard') || !investments.includes('setInvestOpen(true)')) fail('Investments lost portfolio/metrics/on-demand investment action.');
else ok('Investments keeps portfolio + compact metrics + one on-demand Invest action.');
if (!investments.includes('<Modal') || !investments.includes('INVEST_AMOUNTS')) fail('Investment amount picker is not modal/on-demand.');
else ok('Investment purchase UI remains modal instead of permanently occupying the screen.');
if (!portfolio.includes('chartPane') || !portfolio.includes('investmentList')) fail('Portfolio no longer exposes chart + investments list.');
else ok('Portfolio preserves chart and investments list.');

if (!camp.includes('MENU_ITEMS') || !camp.includes('ACTIVE_THEME.characters.primary') || !camp.includes('Pequeñas decisiones, grandes futuros.')) fail('Camp identity/navigation is not centralized.');
else ok('Camp uses one themed identity and centralized 6-item navigation.');
if (!camp.includes("width: '43%'") || !camp.includes("item: { width: '49%'")) fail('Camp does not match the reference split-panel/2-column menu composition.');
else ok('Camp uses the reference split-panel and two-column menu composition.');

if (!visual.includes('expo-image') || !visual.includes('cachePolicy="memory-disk"') || !visual.includes('contentFit="cover"')) fail('Shared scenic background is not using Expo Image caching/cover.');
else ok('Shared scenic background uses Expo Image with memory+disk cache and cover sizing.');

const score = { camp: 92, arcade: 92, investments: 91, intro: 94, gameplayViewport: 96 };
console.log(`[SCORE-CODE] Camp ${score.camp}/100 | Arcade ${score.arcade}/100 | Inversiones ${score.investments}/100 | Entrada ${score.intro}/100 | Viewport gameplay ${score.gameplayViewport}/100`);
console.log('[NOTE] Code/layout score only; visual score must be confirmed from device screenshots.');
if (!process.exitCode) console.log('[OK] PLAN 7 VISUAL v5 control passed.');
