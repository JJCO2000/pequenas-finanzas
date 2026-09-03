# Arquitectura
Dependencias: app routes → features/use cases → core + registry → repositories → SQLite.
Los juegos sólo emiten `GameResult`. La capa de sesión calcula rewards con la regla registrada y persiste mediante repository.
`registry/assets.ts` es el único lugar autorizado para `require()` de runtime assets.
`src/core/theme/tokens.ts` es el único lugar autorizado para hex de UI.
