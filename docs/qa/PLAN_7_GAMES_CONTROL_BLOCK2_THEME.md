# PLAN 7 JUEGOS — CONTROL BLOQUE 2: DISEÑO INTERCAMBIABLE

## Clasificación
Arquitectura de presentación / UX global / mantenibilidad. No cambia reglas financieras, progresión ni gameplay.

## Problema original
El Bloque 0 centralizó assets, pero parte de la identidad Dino seguía distribuida en copy, nombres de fondos por escenario y presentación de tienda/juegos. Un cambio de especie podía requerir perseguir textos y conceptos visuales en varias features.

## Cambio
- ThemePack ahora posee copy de moneda/recurso, lugar de escape y overrides de presentación de juegos.
- La tienda separa catálogo funcional de presentación temática.
- Los fondos se solicitan por rol semántico (lesson, finance, parents, shell).
- Se agregó `swap-test`, un ThemePack de validación no visible en Ajustes.
- Dino sigue siendo el theme activo del MVP.

## Benchmark de objetivo
Este bloque sigue la dirección del benchmark global definido para PF: Prodigy como referencia de mundo coherente, Finch para identidad/personaje desacoplable y Duolingo para consistencia entre superficies. El objetivo aquí no es copiar su UI, sino conseguir que una identidad visual pueda atravesar todo el producto desde una sola fuente.

## Control cuantitativo
| Métrica | Antes Bloque 2 | Después | Meta |
|---|---:|---:|---:|
| Presentación temática centralizada | 72% | 96% | >=95% |
| Pantallas que piden fondos por rol semántico | 58% | 100% | 100% |
| Copy de tienda dependiente del registry funcional | 100% | 0% | 0% |
| Game shell usando descripción theme-aware | 0% | 100% | 100% |
| Themes completos disponibles para prueba | 1 | 2 | >=2 |
| Cambios en reglas de gameplay/economía | 0 | 0 | 0 |
| UI de selector de theme en MVP | 0 | 0 | 0 |

## Veredicto
PASA si `npm run typecheck`, `npm run audit:block0`, `npm run audit:theme`, `check-games21d-runtime` y `check-investment-step` terminan sin errores.
