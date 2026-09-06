# PLAN 7 JUEGOS — GitHub donor code audit

Fecha de control: 2026-09-05

## Método

Cada donor se revisó en dos capas: (1) estructura y código público relevante del juego/UI/engine y (2) licencia y riesgo de copia. No se copia código ni arte de los donors: Pequeñas Finanzas reimplementa los patrones dentro de su propio runtime, ThemePack, contenido y contratos. Dependencias ajenas (Unity, Godot, WebSocket, browser canvas, etc.) no se incorporan.

Puntuación donor (0–100): Visual 30 + Gameplay 25 + Juice 20 + Profundidad 15 + Adaptación PF 10.

> "Código revisado" significa el árbol y la implementación de gameplay/UI/engine relevante para el patrón donado. No incluye vendor/build/generated/assets binarios que no participan en la mecánica.

## 1. Coin Catcher — Cornucobia

- Repo: https://github.com/etherealxx/cornucobia
- Stack: Godot 4 / GDScript, Android arcade.
- Licencia: código/escenas/resources principales Apache-2.0; arte y terceros tienen licencias separadas. Por eso no se copian assets.
- Estructura revisada: `scripts/`, `scenes/`, `resources/`, `shaders/`, proyecto Godot y README/licensing.
- Loop observado: personaje dentro de mundo → movimiento → coleccionables → amenazas → feedback → repetición arcade.
- Patrón llevado a PF: playfield dominante, múltiples objetos simultáneos, bonus, hazard, racha, velocidad creciente y feedback inmediato.
- No llevado: código Godot, shaders, arte, enemigos ni movimiento del personaje.
- Riesgo técnico de integración: bajo, porque el patrón se reimplementa con Skia/Reanimated/Gesture Handler ya presentes.
- Score donor: V27 + G22 + J17 + D11 + A9 = **86/100**.

## 2. Balloon Answer — Bubble Pop II / AI Game Collection

- Repo: https://github.com/jeremehancock/AI-Game-Collection
- Stack: browser HTML/CSS/JS; Bubble Pop II está implementado de forma monolítica en una pantalla/archivo.
- Licencia: MIT del proyecto.
- Código revisado: implementación Bubble Pop II + README de mecánicas y estados.
- Loop observado: objetivos flotantes → pop → combo/multiplicador → amenazas/especiales → vidas → dificultad creciente.
- Patrón llevado a PF: respuestas sobre globos en movimiento, pop animado, vidas, combo, límite de tiempo, avance por rondas.
- No llevado: DOM/browser code, especiales exactos, diseño/arte del donor.
- Riesgo: bajo; `Animated` de RN cubre el movimiento sin nuevas dependencias.
- Score donor: V27 + G24 + J20 + D11 + A10 = **92/100**.

## 3. Treasure Split — Lemonade Tycoon

- Repo: https://github.com/Nezz/lemonade-tycoon
- Stack: Expo 54 / RN 0.81 / TypeScript strict / Expo Router / Zustand + módulo Unity para 3D.
- Licencia: MIT.
- Código revisado: engine (`simulation`, `customers`, `events`, `weather`, `upgrades`, `achievements`, types/constants), pantallas de día/receta/simulación/resultados y componentes de supply/recipe/weather/results.
- Loop observado: **plan → simulate → review → upgrade**, con evento conocido/oculto y consecuencias visibles.
- Patrón llevado a PF: repartir antes de conocer el evento, simular, revelar consecuencia, puntuar resiliencia y avanzar.
- No llevado: Unity, negocio de limonada, Zustand, inventario/spoilage o código del engine.
- Riesgo: bajo; se conserva el contenido actual de gasto/ahorro/inversión.
- Score donor: V28 + G25 + J18 + D15 + A8 = **94/100**.

## 4. Dino Market — ProperShopper

- Repo: https://github.com/mscheutz/propershopper
- Stack: Python simulation/game environment.
- Licencia: no quedó claramente expuesta durante la auditoría; se trata como **reference-only**.
- Código revisado/arquitectura: `env.py`, `game.py`, `player.py`, `objects.py`, `shelves.py`, `shoppingcarts.py`, `render_game.py`, helpers/agents. El modelo separa lista de compra, estantes, carrito/capacidad, contenidos y compra.
- Loop observado: lista → buscar/seleccionar producto → carrito → verificar → checkout.
- Patrón llevado a PF: estantes visuales, categorías requeridas, carrito, comparación de precios, límite y caja.
- No llevado: Python, agentes/RL, mapas, networking, código o assets.
- Decisión importante: **Dino Market sigue siendo supermercado/presupuesto; no se convierte en trading**.
- Score donor para el patrón PF: V20 + G24 + J14 + D14 + A10 = **82/100** como donor de mecánica; el diseño visual se eleva con el sistema visual PF, no con su renderer.

## 5. Fossil Escape — EscapeRoom + Mind Puzzle

### EscapeRoom
- Repo: https://github.com/realUjanSen/EscapeRoom
- Stack: JS frontend + custom 2D engine + WebSocket backend.
- Licencia: MIT.
- Código revisado: `frontend/js/game.js` (core game/collision/interactions), `ui.js`, networking/websocket, server structure and room/puzzle flow.
- Patrón: habitaciones/escena → hotspots/interacción → puzzles → progresión → puerta final.
- No llevado: multiplayer, WebSocket, collision engine, WASD/joystick or source/assets.

### Mind Puzzle
- Repo: https://github.com/simpleneeraj/mind-game
- Stack: Expo/RN/TS/Expo Router.
- Licencia: MIT.
- Código/estructura revisada: route tree, puzzle/result/progress UI and feedback behavior documented in source/README.
- Patrón: shake al fallar, pop/acierto, estrellas/trofeo/confetti como feedback.

- PF combinado: escena explorable con hotspots + inventario de llaves + puerta final + shake/haptics para error.
- Score combinado donor: V27 + G23 + J18 + D13 + A9 = **90/100**.

## 6. King Greedy — Zenox Roulette

- Repo: https://github.com/ZenoxZX/roulette
- Stack: Unity/C#, LitMotion, UniTask, MessagePipe, VContainer; configuración por ScriptableObjects.
- Licencia: **demonstration purposes**. Se usa únicamente como referencia; no se copia código/arte.
- Código/arquitectura revisada: reward/wheel configuration, zone progression, UI conventions, collect/leave, bomb/revive flow, responsive canvas architecture.
- Loop observado: spin → premio crece → dinero expuesto → decidir collect & leave → bomb borra lo no protegido.
- Patrón llevado a PF: selector móvil, STOP, protegido vs en riesgo, CODICIA borra exposición, asegurar/cash-out.
- No llevado: Unity code, revive/ads, ScriptableObjects/assets.
- Score donor: V27 + G25 + J19 + D13 + A8 = **92/100**.

## 7. Money Memory — Lusus

- Repo: https://github.com/collinsadi/lusus
- Stack: Expo/RN/TS.
- Licencia: MIT.
- Arquitectura revisada: puzzle registry, generators/evaluators, puzzle factory, seeded RNG, `difficulty-controller`, `streak-speed-controller`, `reverse-memory-generator`, renderer and puzzle components.
- Loop observado: memorizar → escena cambia → identificar lo que antes no estaba → racha → dificultad/velocidad dinámica.
- Patrón llevado a PF: reverse-memory con conceptos financieros, más elementos, menos reveal time, menos decision time, streak.
- No llevado: multiplayer, registry completo ni otros tipos de puzzle/código fuente.
- Score donor: V26 + G25 + J19 + D15 + A10 = **95/100**.

## Cross-game visual benchmark

- Mind Puzzle: microfeedback de error/acierto y cierre satisfactorio.
- Duolingo: el contenido se presenta como un camino guiado, no como una lista de módulos; progreso y siguiente acción permanecen claros.
- Finch: quests llevan a explorar funciones y sus recompensas alimentan una relación/colección.
- Zogo: benchmark competitivo de educación financiera gamificada, pero PF evita el patrón de “módulo + tarjeta + botón” como experiencia dominante.

## Resultado de licencia

- Permisivos encontrados: Cornucobia code (Apache-2.0), Bubble Pop II collection (MIT), Lemonade Tycoon (MIT), EscapeRoom (MIT), Mind Puzzle (MIT), Lusus (MIT).
- Reference-only: ProperShopper por licencia no confirmada; Zenox Roulette por licencia de demostración.
- **Regla aplicada en todos:** se reimplementan patrones; el patch no contiene código ni assets de terceros.

## Control v2 — alcance de revisión de código antes de integración

Para el FULL PATCH v2 se volvió a revisar el árbol público de cada donor antes de mantener su patrón. El objetivo no es traer su stack, sino saber dónde vive realmente la mecánica y qué dependencias no deben cruzar a PF.

| PF | Donor | Árbol/arquitectura pública revisada | Decisión de integración |
|---|---|---|---|
| Coin Catcher | Cornucobia | `scripts/autoloads`, `enemies`, `gameplay_scripts`, `menus_and_levels`, `resources`, escenas/shaders/licencias | Solo loop de coleccionable + peligro + ritmo. Cero Godot/addons/assets. |
| Balloon Answer | Bubble Pop II | colección completa + implementación/estados del minijuego y especiales | Reimplementación RN de movimiento/pop/combo/lives; cero DOM/assets. |
| Treasure Split | Lemonade Tycoon | engine de simulation/customers/events/weather/upgrades + pantallas plan/sim/results | Se conserva exclusivamente `plan -> simulate -> consequence`; cero Zustand/Unity. |
| Dino Market | ProperShopper | entorno de supermercado, movimiento/interacción, lista, shelves, cart/basket, checkout/render | Se toma modelo lista-estantes-carrito-caja; cero Python/Gym/agents. |
| Fossil Escape | EscapeRoom + Mind Puzzle | core 2D/interactions/UI + room flow; feedback puzzle/result | Hotspots/puzzle/door + shake/haptics; cero WebSocket/server/collision engine. |
| King Greedy | Zenox Roulette | Unity `Assets`, configs/wheel DB, zone progression, collect/leave/bomb flow | Reference-only: patrón riesgo/asegurar; cero C#/ScriptableObjects/assets. |
| Money Memory | Lusus | types → registry → generators/evaluators → engine → renderer; difficulty/streak controllers | Reverse memory + dificultad progresiva; cero multiplayer/registry copiado. |

### Licencia aplicada

- Cornucobia: código/escenas/resources principales Apache-2.0; arte/terceros con licencias separadas.
- Bubble Pop II collection: MIT reportado en el proyecto usado para referencia.
- Lemonade Tycoon: MIT.
- EscapeRoom: MIT.
- Mind Puzzle: MIT.
- Lusus: MIT.
- ProperShopper: se mantiene **reference-only** al no usarlo como fuente copiada.
- Zenox Roulette: explícitamente demonstration purposes → **reference-only**.

**Resultado:** el payload de PF no contiene código ni assets de terceros. El análisis de GitHub decide patrones; la implementación final se escribe dentro de los contratos, ThemePack y dependencias existentes de Pequeñas Finanzas.
