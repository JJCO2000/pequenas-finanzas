# AGENTS — Pequeñas Finanzas
Antes de modificar código leer `docs/product/PLAN_PEQUENAS_FINANZAS_1_1.md` y `docs/product/PLAN_PEQUENAS_FINANZAS_1_2.md`.
Reglas duras:
1) PDF + Canvas prioridad 1 son fuente de producto/diseño.
2) No duplicar. Referenciar registries/core.
3) Juegos no importan `expo-sqlite`, repositories, wallet ni progression.
4) Hex sólo en `src/core/theme/tokens.ts` (config/app.json puede tener colores nativos).
5) `require()` de assets runtime sólo en `src/registry/assets.ts`.
6) SQL sólo en `src/core/data/database` y `src/core/data/repositories`.
7) Contenido educativo fuera de gameplay.
8) Todo cambio de plan se documenta; no convertir 1.1 en otra arquitectura silenciosamente.
9) Antes de declarar listo: AUDIT_PLAN_1_1.ps1 + VERIFY.ps1.
