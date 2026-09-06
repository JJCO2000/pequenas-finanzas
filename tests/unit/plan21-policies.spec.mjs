import fs from 'node:fs';
import assert from 'node:assert/strict';

const investment = fs.readFileSync('src/core/economy/investmentPlan.ts', 'utf8');
const arcade = fs.readFileSync('src/core/economy/arcadeRewardPolicy.ts', 'utf8');
const director = fs.readFileSync('src/core/progression/ProgressionDirector.ts', 'utf8');
assert.match(investment, /INVESTMENT_TERM_LEVELS\s*=\s*4/);
assert.match(investment, /INVESTMENT_RETURN_PERCENT\s*=\s*50/);
assert.match(arcade, /\[1,\s*0\.5,\s*0\.25,\s*0\]/);
assert.doesNotMatch(director, /Math\.random\s*\(/);
assert.match(director, /buildInitialAdventureDays[\s\S]*games: GameManifest\[\][\s\S]*dayNumber <= 7/);
console.log('[OK] Plan 2.1 policy source assertions passed.');
