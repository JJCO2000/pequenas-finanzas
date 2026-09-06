# Plan Pequeñas Finanzas 1.2 — Plan 7 Juegos / limpieza y diseño intercambiable

Extiende Plan 1.1 sin reemplazar su flujo de producto, PDF, mapa, economía, progresión ni contrato de juegos.

## Bloque 0 — Limpieza + Single Source of Truth
1. Conservar comportamiento del MVP antes de rediseñar gameplay.
2. `registry/assets.ts` sigue siendo la única fuente de `require()` runtime.
3. `core/theme/ThemePack.ts` define roles visuales semánticos.
4. `core/theme/dinoTheme.ts` es la primera identidad visual concreta.
5. Features y pantallas consumen `ACTIVE_THEME`, nunca especies/assets concretos.
6. Metadata de cada juego vive en su manifest; `gamePresentation.ts` sólo combina manifest + theme.
7. Dominio de inversiones usa `InvestmentCompanionKey`; nombres históricos de dinosaurios sólo sobreviven en el adaptador de compatibilidad SQLite.
8. Repositories se separan por responsabilidad; `appRepository.ts` queda como barrel compatible.
9. Backups históricos no se distribuyen con el proyecto.
10. Todo cambio importante requiere Control de Cambio cuantitativo antes/después.

## Bloque 2 — Sistema de diseño intercambiable (MVP)
Incluye contrato de ThemePack, registry de themes y un switch central del theme activo.
No incluye UI de edición, selector de tema, uploads ni personalización por usuario.

### Proyecto futuro
`Ajustes > Diseño` podrá seleccionar/persistir un ThemePack cuando sea prioritario. No es requisito del MVP.

## Compatibilidad
- IDs de los siete juegos no cambian.
- Días de descubrimiento no cambian.
- `Game -> GameResult` no cambia.
- Reward policy no cambia.
- SQLite no recibe migración destructiva: `dinosaur_key` queda como nombre de columna legado encapsulado y acepta nuevas keys neutrales.

## Bloque 3 — Experiencia Global PF (MVP)
Convierte el shell actual en un loop de aventura coherente sin reemplazar mapa/PDF ni lógica existente:

1. Inicio muestra misión actual, recompensa y progreso de etapa.
2. Mapa conserva su estructura pero comunica tipo de nodo, misión actual y progreso.
3. Personaje/compañero acompaña el punto actual y la celebración.
4. Éxitos usan feedback in-world, no Alert del sistema.
5. Regreso de una misión confirma día completado y siguiente punto disponible.
6. Toda presentación sigue consumiendo ThemePack.
7. No cambia gameplay de los siete juegos, economía, DB, días ni reward policy.

Control cuantitativo: `docs/qa/PLAN_GLOBAL_EXPERIENCE_CONTROL_1.md`.
