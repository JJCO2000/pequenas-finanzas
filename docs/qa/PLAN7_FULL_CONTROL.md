# PLAN 7 JUEGOS — FULL CONTROL v2

Fecha: 2026-09-05

## Escala fija

- Visual: 30
- Gameplay / game feel: 25
- Juice / animación / feedback: 20
- Profundidad / rejugabilidad: 15
- Adaptación a Pequeñas Finanzas: 10

Objetivo de implementación: **>=85/100**. Un juego que pueda resumirse como “lee una pregunta y toca una respuesta estática” falla aunque compile.

> Los puntajes “después” son controles cuantitativos de diseño/implementación verificables en código. La aceptación visual final exige screenshots reales on-device después de instalar; no se declara gusto visual como hecho a partir del compilador.

## Control cuantitativo por juego

| Juego | Baseline | Visual | Gameplay | Juice | Prof. | PF | Control nuevo | Veredicto |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Coin Catcher | 66 | 26 | 23 | 18 | 13 | 10 | **90** | PASS técnico |
| Balloon Answer | 54 | 27 | 23 | 19 | 12 | 10 | **91** | PASS técnico |
| Treasure Split | 58 | 26 | 24 | 17 | 15 | 10 | **92** | PASS técnico |
| Dino Market | 57 | 26 | 23 | 17 | 14 | 10 | **90** | PASS técnico |
| Fossil Escape | 55 | 27 | 23 | 18 | 13 | 9 | **90** | PASS técnico |
| King Greedy | 49 | 27 | 24 | 19 | 13 | 9 | **92** | PASS técnico |
| Money Memory | 52 | 27 | 25 | 19 | 14 | 10 | **95** | PASS técnico |

**Promedio 7 juegos:** 55.9 → **91.4/100**.

## Arcade Hub — regla v2

Baseline mostrado por usuario: **48/100**.

- atractivo visual: 28/30
- jerarquía/claridad: 19/20
- deseo de rejugar: 19/20
- cohesión mundo: 14/15
- navegación/acción: 14/15
- **total control: 94/100 — PASS técnico**

Regla funcional obligatoria:

- **7/7 juegos siempre disponibles en Arcade.**
- `gameUnlocks` no decide si una card se puede tocar.
- los `minimumDay` permanecen como información de campaña, no como candado de Arcade.
- la campaña mantiene su secuencia original 5/10/12/17/19/24/26.

## Investments Hub 2.0

Baseline mostrado por usuario: **52/100**.

- claridad del valor 19/20
- acción principal 23/25
- compra dentro del módulo 25/25
- cartera/visualización 13/15
- motivación/game feel 13/15
- **total control: 93/100 — PASS técnico**

Regla crítica: se puede elegir $10/$20/$50 e invertir directamente desde Inversiones usando el `invest()` existente. No cambia DB ni fórmula: D+4 y +50% permanecen en el core económico.

## Game shell v2 — entrada → juego limpio

Baseline visual de la captura del usuario: **54/100**.

Objetivo/resultado de control: **95/100 técnico**.

Flujo obligatorio:

1. cada juego entra primero a una pantalla propia de preparación;
2. la pantalla de entrada obtiene sus 3 pasos desde el `manifest` del juego (SSOT);
3. al tocar `JUGAR AHORA`, desaparece la explicación del layout;
4. durante gameplay solo queda un botón `?` pequeño;
5. aprendizaje se abre como overlay flotante y se puede volver a minimizar;
6. el overlay **no reduce el ancho ni alto del game pane**;
7. el resultado continúa usando `MissionCompleteOverlay`.

Control de área: debajo del header, el `gamePane` usa **100% del layout disponible**; aprendizaje no reserva columna/franja permanente.

## Incidente v1 y corrección obligatoria

El FULL PATCH v1 fue rechazado correctamente por el TypeScript real del usuario con 12 errores bajo `strict + noUncheckedIndexedAccess`:

- Treasure Split: 2 accesos a `round` posiblemente undefined.
- Fossil Escape: 5 accesos a hotspot/índice posiblemente undefined.
- King Greedy: 5 accesos a outcome posiblemente undefined.

v2 exige guards explícitos:

- Treasure Split: fallback tipado para ronda actual.
- Fossil Escape: fallback de hotspot + `activeClue`/`activeSpot` guardados.
- King Greedy: `if (!outcome) return` antes de consumir el resultado.

El control automático falla si cualquiera de estas protecciones desaparece.

## Regresiones que deben permanecer en cero

- IDs/días de los 7 juegos: 0 cambios.
- `Game -> GameResult`: 0 cambios.
- Reward policy: 0 cambios.
- DB/schema: 0 cambios.
- Economía de inversión: 0 cambios.
- ThemePack/SSOT: no bypass.
- `Alert.alert` dentro de juegos: 0.
- `StyleSheet.absoluteFillObject` en los juegos: 0.
- `pointerEvents` directo en `Image/Animated.Image`: 0.
- juegos bloqueados en Arcade: 0.
- learning panel ocupando layout durante gameplay: 0.
- instrucciones de entrada duplicadas fuera de manifests: 0.
