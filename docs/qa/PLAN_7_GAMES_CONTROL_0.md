# PLAN 7 JUEGOS — CONTROL 0
## Bloque 0: Limpieza + Single Source of Truth

### Clasificación
Arquitectura / SSOT / mantenibilidad / diseño intercambiable.

### Problema original
El proyecto ya centralizaba `require()` y colores, pero la identidad dinosaurio seguía filtrándose a UI, dominio de inversión y persistencia. `appRepository.ts` concentraba 980 líneas y `gamePresentation.ts` duplicaba metadata de manifests.

### Baseline auditado
- Raw `require()` fuera de `registry/assets.ts`: 0.
- HEX UI fuera de `core/theme/tokens.ts`: 0.
- `appRepository.ts`: 980 líneas.
- API de inversión temática: `InvestmentDinosaurKey`, `dinosaurKey`, `investmentDinosaurs.ts`.
- Presentación de juegos: mapa paralelo con badge/instrucción además del manifest.
- `.pf-backups`: incluido dentro del proyecto entregado.

### Cambio
- Añadido `ThemePack`, `dinoTheme`, `themeRegistry` y `ACTIVE_THEME`.
- Pantallas consumen roles semánticos del theme, no `ASSETS.characters.*` / `ASSETS.world.*` directamente.
- Inversión usa `InvestmentCompanionKey` y `companionKey`.
- Compatibilidad con filas SQLite históricas `stegosaurus/trex/longneck/raptorGreen` aislada en `repositorySupport.ts`.
- Repository monolítico dividido por responsabilidades; barrel público conservado.
- Badge/instrucción se movieron a manifests; hero/título visual se resuelven por theme.
- `.pf-backups` eliminado y añadido a `.gitignore`.

### Métricas antes -> después
| Métrica | Antes | Después | Objetivo |
|---|---:|---:|---:|
| Raw assets consumidos por UI fuera del theme | >30 referencias | 0 | 0 |
| `require()` fuera de asset registry | 0 | 0 | 0 |
| HEX UI fuera de tokens | 0 | 0 | 0 |
| Líneas `appRepository.ts` | 980 | 9 | <30 |
| Mayor repository por concern | 980 | <=320 | <=320 |
| API inversión dependiente de dinosaurio | Sí | No | No |
| Metadata corta de juego duplicada | Sí | No | No |
| Backups históricos en paquete | Sí | No | No |
| IDs/días de los 7 juegos alterados | 0 | 0 | 0 |

### Score de control
| Criterio | Peso | Antes | Después |
|---|---:|---:|---:|
| SSOT real | 25 | 18 | 25 |
| Desacople de identidad visual | 25 | 8 | 23 |
| Modularidad/mantenibilidad | 20 | 10 | 17 |
| Compatibilidad y estabilidad | 15 | 15 | 15 |
| Auditabilidad/reversibilidad | 15 | 13 | 15 |
| **TOTAL** | **100** | **64** | **95** |

No llega a 100 porque `dinosaur_key` continúa como nombre de columna SQLite legado y aún existen dos componentes UI grandes (>350 líneas) que conviene dividir en una limpieza posterior, sin bloquear el Plan 7 Juegos.

### Regresiones permitidas
0 críticas. El Bloque 0 no debe cambiar reglas de gameplay, economía, desbloqueos ni rewards.

### Veredicto
Se aprueba sólo si pasan `scripts/check-plan7-block0.mjs` + checks existentes de Plan 1.1/2.1/juegos/worklets y el parseo TypeScript.
