# Plan 2.1D — Catálogo jugable

Este incremento agrega seis minijuegos reales al plugin system de Plan 1.1, además de Atrapa Monedas. No cambia SQLite, wallet, repositorios ni el contrato GameResult.

## Catálogo

1. **Atrapa monedas** — arrastrar canasta; ingreso y administración. Descubrimiento inicial: Día 5.
2. **Globos del presupuesto** — tap/pop; clasificar necesidad, deseo y ahorro. Día 10.
3. **Reparte el tesoro** — simulación; distribuir 10 fichas entre gastar, ahorrar e invertir. Día 12.
4. **Mercado Dino** — compra con presupuesto; seleccionar artículos y conservar saldo. Día 17.
5. **Escape Fósil** — escape room de cuatro cerraduras con pistas financieras. Día 19.
6. **El Rey Codicioso** — aventura de decisiones; proteger una meta frente a tentaciones y oportunidades. Día 24.
7. **Memoria financiera** — memoria de parejas entre concepto y significado. Día 26.

## Reglas

- Los seis juegos nuevos reciben `GameSession` y sólo emiten `GameResult`.
- Ningún juego importa SQLite, repositories, wallet o AppDataProvider.
- Todos son jugables en campaign y, después de completarse, quedan disponibles en Arcade.
- Arcade conserva 100% / 50% / 25% / 0% de recompensa diaria por juego.
- El contenido educativo está en `src/content/games/`, separado de los componentes de gameplay.
- Los seis juegos nuevos usan una regla central de puntuación 0–100 con recompensa máxima de $50.
- El `ProgressionDirector` no se modifica; `minimumDay` + `cooldownDays` hacen que el catálogo se descubra de forma determinista.

## Objetivo de UX

No son seis quizzes con otra piel. El catálogo mezcla tap/pop, reparto de recursos, simulación de compra, escape room, decisiones narrativas y memoria. Todos están diseñados para landscape y sesiones cortas.
