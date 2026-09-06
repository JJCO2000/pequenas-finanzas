# Single Source of Truth

- Raw runtime assets / `require()`: `src/registry/assets.ts`
- Visual identity contract: `src/core/theme/ThemePack.ts`
- Active visual identity: `src/core/theme/themeRegistry.ts` + `src/core/theme/activeTheme.ts`
- Dino visual implementation: `src/core/theme/dinoTheme.ts`
- Theme character roles: `src/registry/characters.ts` (derived from active theme)
- Levels: `src/content/curriculum/levels.ts` + `src/registry/levels.ts`
- Games: manifests + `src/registry/games.ts`
- Game display presentation: manifest metadata + active ThemePack through `src/registry/gamePresentation.ts`
- Rewards: `src/registry/rewards.ts` + `src/core/economy/rewardRules.ts`
- Shop metadata: `src/registry/shop.ts`; shop art comes from active ThemePack
- Investment companion presentation: active ThemePack through `src/registry/investmentCompanions.ts`
- Money persistence: SQLite wallets + transactions
- Progress persistence: SQLite level_progress / adventure tables
- Repository public surface: `src/core/data/repositories/appRepository.ts`; implementation split by concern

Nunca copiar una definición para “hacerlo rápido”. Un dato puede tener varias vistas, pero un solo dueño.
