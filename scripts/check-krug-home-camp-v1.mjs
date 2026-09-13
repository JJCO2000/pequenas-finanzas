import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const home = read('src/app/start.tsx');
const camp = read('src/features/adventure/components/AdventureCampMenu.tsx');
const streak = read('src/features/streak/StreakCard.tsx');

// Home: keep the accepted structure, but make the next action unmistakable.
assert.equal((home.match(/<SceneHotspot/g) ?? []).length, 6, 'Home must keep exactly six secondary destinations');
assert.equal((home.match(/<ActionPill/g) ?? []).length, 1, 'Home must have exactly one primary ActionPill');
assert.match(home, /label="IR A MI MISIÓN →"/, 'Home primary CTA must describe where it goes');
assert.match(home, /accessibilityLabel="Ir a mi misión actual"/, 'Home primary CTA needs an explicit accessible action');
assert.match(home, /router\.replace\('\/play'/, 'Home mission CTA must lead to the adventure map');
assert.match(home, /OTROS LUGARES|Otros lugares/, 'Secondary destinations must be clearly labelled as secondary');
assert.match(home, /Toca una tarjeta\./, 'Secondary navigation needs a short direct instruction');
assert.match(home, /SIGUIENTE PASO/, 'Home must identify the next step without requiring interpretation');
assert.match(home, /Tu misión está lista/, 'Home center cue must point to the mission');
assert.match(home, /tracksA/, 'Home scene needs environmental detail instead of an empty field');
assert.match(home, /worldFriend/, 'Home scene needs supporting kid-friendly character detail');
assert.doesNotMatch(home, /label="CONTINUAR →"/, 'Ambiguous home CTA CONTINUAR is not allowed');

// Camp: daily streak first, destinations second, map exit secondary.
assert.equal((camp.match(/<SceneHotspot/g) ?? []).length, 1, 'Camp destinations are data-driven through one SceneHotspot template');
assert.equal((camp.match(/route: '\//g) ?? []).length, 6, 'Camp must keep six secondary destinations');
assert.match(camp, /Elige tu siguiente paso/, 'Camp title must explain the decision');
assert.match(camp, /SIGUIENTE ACCIÓN/, 'Pending streak must be framed as the next action');
assert.match(camp, /OTROS LUGARES/, 'Camp secondary destinations need a clear heading');
assert.match(camp, /SEGUIR EN EL MAPA →/, 'Camp exit must describe the destination');
assert.match(camp, /tone="light"/, 'Camp map exit must remain visually secondary to the streak action');
assert.ok(camp.indexOf('<StreakCard') < camp.indexOf('<View style={styles.destinations}>'), 'Streak must appear before secondary destinations');
assert.doesNotMatch(camp, /¿A dónde vas\?/, 'Ambiguous camp heading is not allowed');

// Streak: state, challenge, consequence and action all visible without decoding icons.
for (const token of ['RETO DE HOY', 'RACHA', 'SEGUROS', 'MEJOR', 'JUGAR →', 'RACHA COMPLETADA', 'LISTO ✓']) {
  assert.ok(streak.includes(token), `Streak card missing explicit cue: ${token}`);
}
assert.match(streak, /Completa el reto para empezar tu racha\./, 'Zero-day streak needs an explicit first action');
assert.match(streak, /Tu racha está a salvo por hoy\./, 'Completed streak needs explicit success feedback');
assert.match(streak, /accessibilityLabel={`Racha de hoy\./, 'Streak action must be self-describing to accessibility services');
assert.doesNotMatch(streak, /<Text style={styles\.ctaText}>{safe \? '✓' : '→'}<\/Text>/, 'Icon-only streak CTA is not allowed');

console.log('PASS check-krug-home-camp-v1: one obvious next action, explicit labels, six secondary destinations, and readable streak states are locked.');
