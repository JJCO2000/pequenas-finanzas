# Nuevo juego
1. Crear `src/features/games/<id>/manifest.ts`.
2. Crear Game.native.tsx/Game.web.tsx o Game.tsx con GameComponentProps.
3. Añadir systems/ui/config/tests sólo si son propios del juego.
4. Si una mecánica es reutilizable, moverla a core/game-runtime o game-kits; no copiar.
5. Registrar manifest en registry/games.ts y componente en GameHost.
6. Añadir assets mediante registry/assets.ts.
7. Ejecutar AUDIT_PLAN_1_1 + VERIFY.
