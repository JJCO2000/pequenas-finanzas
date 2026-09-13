import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const checks = [
  {
    label: 'ActionPill shared disabled contract',
    file: 'src/features/shell/gameui/GameSurface.tsx',
    patterns: [/export function ActionPill/, /accessibilityState=\{\{ disabled \}\}/, /disabled=\{disabled\}/],
  },
  {
    label: 'World buttons expose disabled state',
    file: 'src/features/shell/world/WorldUI.tsx',
    patterns: [/export function WorldButton/, /accessibilityState=\{\{ disabled \}\}/, /disabled=\{disabled\}/],
  },
  {
    label: 'Game buttons expose disabled state',
    file: 'src/features/games/ui/GameChrome.tsx',
    patterns: [/export function PrimaryGameButton/, /export function SecondaryGameButton/, /accessibilityState=\{\{ disabled \}\}/, /disabled=\{disabled\}/],
  },
  {
    label: 'Shop cannot buy owned or unaffordable eggs',
    file: 'src/app/shop.tsx',
    patterns: [/selectedCanBuy/, /disabled=\{selectedOwned \|\| !selectedCanBuy\}/],
  },
  {
    label: 'Investments block unaffordable and in-flight actions',
    file: 'src/app/investments.tsx',
    patterns: [/const canInvest = Boolean\(wallet && wallet\.availableCents >= amountCents && !working\)/, /disabled=\{disabled\}/, /disabled=\{!canInvest\}/],
  },
  {
    label: 'Wallet blocks impossible save, withdraw and investment actions',
    file: 'src/app/wallet.tsx',
    patterns: [/const canSaveTen = availableCents >= pesos\(10\)/, /const canUnsaveTen = savingsCents >= pesos\(10\)/, /disabled=\{!canSaveTen\}/, /disabled=\{!canUnsaveTen\}/, /disabled=\{!canInvestAmount\}/],
  },
  {
    label: 'Onboarding requires a name and blocks duplicate submit',
    file: 'src/app/onboarding.tsx',
    patterns: [/const canContinue = Boolean\(name\.trim\(\)\) && !busy/, /disabled=\{!canContinue\}/],
  },
  {
    label: 'Adult gate blocks empty submissions',
    file: 'src/features/parents/ParentGate.tsx',
    patterns: [/const canSubmit = input\.trim\(\)\.length > 0/, /disabled=\{!canSubmit\}/],
  },
  {
    label: 'Cave solved hotspots cannot be pressed again',
    file: 'src/features/games/fossil-escape/Game.tsx',
    patterns: [/accessibilityState=\{\{ disabled: isSolved \}\}/, /disabled=\{isSolved\}/],
  },
  {
    label: 'Treasure allocation locks outside planning and at numeric bounds',
    file: 'src/features/games/treasure-split/Game.tsx',
    patterns: [/const planning = phase === 'plan'/, /const minusDisabled = !planning \|\| value <= 0/, /const plusDisabled = !planning \|\| available <= 0/, /disabled=\{minusDisabled\}/, /disabled=\{plusDisabled\}/],
  },
  {
    label: 'Quiz blocks checking without a selection and while busy',
    file: 'src/game-kits/quiz/DecisionQuiz.tsx',
    patterns: [/const checkDisabled = !selected \|\| busy/, /disabled=\{busy\}/, /disabled=\{checkDisabled\}/],
  },
  {
    label: 'Completion overlay locks after first navigation action without trapping save errors',
    file: 'src/features/adventure/components/MissionCompleteOverlay.tsx',
    patterns: [/const \[actionLocked, setActionLocked\] = useState\(false\)/, /if \(actionLocked\) return/, /setActionLocked\(true\)/, /disabled=\{actionLocked\}/, /Puedes salir ahora/],
  },
  {
    label: 'Settings expose switch checked state',
    file: 'src/app/settings.tsx',
    patterns: [/accessibilityRole="switch"/, /accessibilityState=\{\{ checked: value \}\}/],
  },
  {
    label: 'Money Memory cards are selectable only during choose phase',
    file: 'src/features/games/money-memory/Game.tsx',
    patterns: [/selectable=\{phase === 'choose'\}/, /disabled=\{!selectable\}/, /if \(phase !== 'choose'\) return/],
  },
  {
    label: 'Balloon game prevents re-popping resolved or already-pressed objects',
    file: 'src/features/games/balloon-answer/Game.tsx',
    patterns: [/disabled=\{resolved\}/, /if \(resolved \|\| pressedRef\.current\) return/, /pressedRef\.current = true/, /resolvedIds\.includes\(item\.id\)/],
  },
  {
    label: 'Greedy King blocks spin and secure in invalid states',
    file: 'src/features/games/king-greedy/Game.tsx',
    patterns: [/disabled=\{spinning \|\| spins >= MAX_SPINS\}/, /disabled=\{spinning \|\| exposed <= 0\}/],
  },
  {
    label: 'Dino Market checkout cannot fire from an empty cart',
    file: 'src/features/games/dino-market/Game.tsx',
    patterns: [/disabled=\{selectedItems\.length === 0\}/],
  },
];

for (const check of checks) {
  const source = read(check.file);
  for (const pattern of check.patterns) assert.match(source, pattern, `${check.label}: missing ${pattern}`);
  console.log(`[PASS] ${check.label}`);
}

console.log(`PASS audit-control-states-v1: ${checks.length} invalid/transient state contracts are guarded.`);
