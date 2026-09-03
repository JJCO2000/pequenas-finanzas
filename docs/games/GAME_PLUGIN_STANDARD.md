# Estándar plugin de juego
Un juego activado necesita manifest.ts, Game.native/web o Game.tsx, subcarpetas de systems/ui/config/tests según necesidad, registro en registry/games.ts y component mapping en GameHost.
Regla: Game recibe GameSession y sólo devuelve GameResult. No importa repositories, SQLite, wallet o progression.
