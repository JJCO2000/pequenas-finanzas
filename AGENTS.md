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

## Política obligatoria GitHub / Expo EAS

Flujo normal de desarrollo:
`editar -> verificar -> commit -> push -> GitHub Actions -> fin`

Un push, PR o merge normal debe producir:
- 0 EAS Workflows
- 0 EAS Build
- 0 EAS Update / OTA
- 0 AAB
- 0 Google Play submit

Reglas:
1) No crear ni mantener `.eas/workflows/*` con triggers automáticos (`push`, `pull_request`, `workflow_run`, `repository_dispatch`, `schedule`).
2) Las validaciones normales viven en `.github/workflows/` y pueden ejecutarse con push/PR.
3) EAS Update se conserva. Publicar Preview es una acción deliberada mediante `.github/workflows/publish-preview.yml` (`workflow_dispatch` únicamente) o CLI manual.
4) Antes de OTA comprobar compatibilidad de runtime/binario. Ser OTA-compatible no autoriza publicarlo automáticamente.
5) EAS Build sólo cuando un nuevo binario sea necesario y exista autorización explícita.
6) Nunca generar AAB ni subir/publicar en Google Play sin solicitud explícita.
7) `BUILD_ANDROID.ps1`, `SUBMIT_ANDROID.ps1` y `SETUP_GOOGLE_PLAY.ps1` son herramientas manuales sensibles; ningún workflow automático, hook o script indirecto puede invocarlas.
8) Mantener `npm run check:ci-policy` en verde. No resolver fallos con whitelists amplias que oculten ejecuciones reales.
