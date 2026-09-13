# Offline-first contract — Pequeñas Finanzas

## Objective

After the app has been installed, normal gameplay must not require an internet connection. A child must be able to open the app, continue the adventure, play all seven minigames, earn local rewards, use the shop and review progress without network access.

## Official Expo basis

- `expo-sqlite` persists the local database across app restarts.
- Static assets imported from the project are bundled/served locally in production rather than depending on a remote image URL.
- `expo-updates` keeps an embedded update in the native build and can run the newest downloaded compatible update, falling back to the embedded build update when necessary.

The only operation that inherently needs connectivity is **downloading a newer OTA update**. Gameplay itself must not wait for that download.

## Project rules

1. Game content and rules live in the repository, never in a runtime web request.
2. Player/profile/wallet/progression/game sessions/adventure/streak state live in SQLite.
3. Gameplay images and UI art use local bundled assets.
4. No `fetch`, Axios, Supabase runtime client, WebSocket, or remote image URI may be introduced under `src/` without explicitly revisiting this architecture.
5. EAS Update remains allowed to check/download newer JS/assets when internet exists; lack of network must not block the current installed/cached experience.
6. Sync/outbox tables may exist for future optional synchronization, but local gameplay must never depend on a successful sync.

## Automated gate

Run:

```bash
npm run audit:offline
```

The audit scans runtime source for mandatory network dependencies and verifies SQLite persistence plus embedded-update fallback configuration.

## Manual offline acceptance test

On an installed Preview/release build:

1. Launch once normally so the intended Preview update is already installed.
2. Kill the app.
3. Enable airplane mode and disable Wi-Fi.
4. Cold launch.
5. Open Map, Camp, Arcade, Wallet, Investments, Shop, Collection and Progress.
6. Play all seven minigames through completion.
7. Confirm rewards/progress persist after another cold restart while still offline.
8. Re-enable connectivity and confirm the same local state remains intact.

Target: **0 required-network errors and 0 blocked primary flows.**
