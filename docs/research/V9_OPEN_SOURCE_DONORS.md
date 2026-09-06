# Pequeñas Finanzas v9 — open-source UI/game donors

v9 replaces the v8 dashboard/card-first presentation with a game-scene-first presentation. The financial domain, progression, rewards, investment rules and game contracts remain project-owned.

## MIT references reviewed

1. **anwersolangi/rn-interface-kit** — https://github.com/anwersolangi/rn-interface-kit
   - MIT.
   - Expo-ready, TypeScript-first, independently runnable screens.
   - Patterns adapted: animated landscape / `kids-scenery`, compact product selection / `food-ordering`, gesture-first learning / `duolingo-drag-drop`, minimal HUD + full-scene gameplay / `flappy-bird`.

2. **simpleneeraj/mind-game** — https://github.com/simpleneeraj/mind-game
   - MIT.
   - React Native + Expo Router + TypeScript.
   - Patterns adapted: compact custom header, level-grid selection, progress/result separation, small reusable level tiles.

3. **bberak/react-native-game-engine-handbook** — https://github.com/bberak/react-native-game-engine-handbook
   - MIT.
   - Patterns adapted conceptually: scene/entity/system separation and minimal game HUD.

4. **DevmanushRaky/tagdafun** — https://github.com/DevmanushRaky/tagdafun
   - MIT.
   - Patterns adapted conceptually: keep coins/XP/progress state separate from each minigame's scene.

5. **aleqsio/screenmap** — https://github.com/aleqsio/screenmap
   - Used as QA-process reference: route coverage and screenshots are a human visual gate. Static checks must never declare aesthetic PASS.

## What is and is not copied

- No third-party art, logos, character assets, fonts or trademarks are shipped by this patch.
- v9 ports **layout and interaction patterns** into Pequeñas Finanzas' existing components and theme system.
- Existing Pequeñas Finanzas business logic and all seven game contracts remain intact.
- This patch deliberately avoids importing extra runtime dependencies merely to imitate a donor screen.

## v9 visual rule

`SCENE -> ENTITIES -> SMALL UI`

not

`BACKGROUND -> GIANT PANEL -> CARD -> CARD -> TEXT`.

A screen can pass code checks and still fail aesthetics. Device screenshots remain mandatory before aesthetic PASS.
