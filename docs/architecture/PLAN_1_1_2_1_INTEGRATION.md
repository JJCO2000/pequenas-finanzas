# Integración Plan 1.1 + Plan 2.1

## Contrato

Plan 1.1 = arquitectura. Plan 2.1 = diseño/UX/mecánicas.

La UI 2.1 solo consume APIs de core/repositories/session. Los sistemas centrales siguen siendo dueños de los datos.

## Flujo de dependencias

UI / Map / Arcade / Shop
  -> AppDataProvider (orquestación UI)
  -> repositories + core economy/progression/game-runtime
  -> SQLite

Games
  -> GameResult
  -> host/provider/repository
  -> Reward/Wallet/Adventure

Nunca Games -> SQLite/Repository/Provider.

## Propiedad de estado

- `wallets`: saldo.
- `wallet_transactions`: historial financiero.
- `adventure_state`: día y offset.
- `adventure_days`: campaña persistida/infinita.
- `investments`: cartera.
- `game_unlocks`: biblioteca Arcade.
- `game_sessions`: partidas y anti-farming.
- `inventory`: mejoras.
- `app_settings`: preferencias.
- `sync_outbox`: futura sincronización, no cloud actual.

## Escalabilidad de juegos

Agregar un juego no exige modificar el mapa ni Arcade. Se implementa un módulo bajo `features/games`, se registra su manifest y se añade el component mapping del host. El ProgressionDirector puede seleccionarlo con metadata.
