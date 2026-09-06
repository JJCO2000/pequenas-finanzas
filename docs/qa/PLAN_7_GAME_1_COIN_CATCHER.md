# PLAN 7 JUEGOS — Juego 1: Coin Catcher

## Clasificación
Gameplay + diseño visual + game feel. No cambia DB, economía global, progresión, IDs ni reward policy.

## Problema original
La versión anterior era funcional pero visualmente mínima: fondo plano, una moneda circular, rectángulo como canasta, HUD de texto y un único haptic. La interacción principal era arrastrar y esperar una sola caída.

## Benchmark
- **Cornucobia:** referencia de mundo/escenario, personaje integrado y lectura arcade inmediata.
- **FLONK:** referencia de presión creciente, coleccionables, obstáculos y power-ups.

No se copia código ni assets de esos proyectos; se reimplementan patrones compatibles con Pequeñas Finanzas y con sus assets/theme actuales.

## Cambio
- Escenario temático real en lugar de color plano.
- Personaje dentro del escenario.
- Dos monedas simultáneas.
- Recurso temático de mayor valor (+2).
- Meteorito/obstáculo que rompe racha sin quitar dinero.
- Sistema de racha y mejor racha.
- Aumento progresivo de velocidad.
- HUD visual con tiempo, score, racha y mejora activa.
- Countdown/tutorial breve antes de comenzar.
- Bounce de receptor, shake por impacto, feedback flotante y haptics graduados.
- Métricas nuevas para poder medir el gameplay sin alterar el contrato Game -> GameResult.

## Control cuantitativo
Escala Plan 7 Juegos: Visual 30, Gameplay 25, Juice 20, Profundidad 15, Adaptación 10.

| Criterio | Antes | Después (implementación) |
|---|---:|---:|
| Atractivo visual | 13/30 | 26/30 |
| Jugabilidad / game feel | 17/25 | 22/25 |
| Animación + feedback | 7/20 | 18/20 |
| Profundidad / rejugabilidad | 8/15 | 12/15 |
| Adaptación PF | 10/10 | 10/10 |
| **TOTAL** | **55/100** | **88/100** |

El 88/100 es control de implementación. La aprobación visual final requiere ver el juego ejecutándose en el dispositivo real para comprobar escala, legibilidad, ritmo y densidad de objetos.

## Regresiones prohibidas
- Cambiar `coin-catcher` o su día de desbloqueo.
- Cambiar `Game -> GameResult`.
- Cambiar reward policy.
- Romper egg upgrades existentes.
- Introducir assets directos fuera del ThemePack/registry.
- Quitar compatibilidad con haptics disabled.

## Veredicto de implementación
**PASA si** TypeScript + controles existentes + `npm run audit:coin-catcher` pasan. La calificación visual definitiva permanece provisional hasta prueba real en pantalla.


## RN 0.86 typing compatibility
- Uses `StyleSheet.absoluteFill`, not `absoluteFillObject`.
- `pointerEvents` lives on View/Animated.View wrappers, not Image/Animated.Image.
- Dynamic speed shared value is explicitly typed as `number`.
