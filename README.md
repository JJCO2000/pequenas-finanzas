# Pequenas Finanzas - Plan 1.1 + Plan 2.1

Videojuego infantil de educacion financiera con arquitectura Plan 1.1 y experiencia Plan 2.1.

## Regla maestra

- **Plan 1.1 = estructura tecnica:** SSOT, repositorios, SQLite encapsulado, economia/progreso centrales, registries, game runtime y modulos preparados para 20+ videojuegos.
- **Plan 2.1 = diseno y gameplay:** landscape, portada de juego, mapa infinito por dias, flujo estructurado, inversiones N+4, Arcade - Mis juegos, tienda y persistencia de posicion/progreso.

Plan 2.1 se monta sobre Plan 1.1; no lo reemplaza.

## Desarrollo

- `.\START.ps1` - Expo Go con cache limpia.
- `.\START_TUNNEL.ps1` - Expo Go por tunnel.
- `.\START_DEV.ps1` - Metro para development client cuando sea necesario.

## QA

- `.\VERIFY.ps1` - gates completos Plan 1.1 + Plan 2.1 + Expo Doctor + TypeScript + bundle Android.
- `.\AUDIT_PLAN_1_1.ps1` - arquitectura/SSOT/limites.
- `.\AUDIT_PLAN_2_1.ps1` - experiencia/mecanicas/persistencia Plan 2.1.
- `.\VERIFY_RELEASE.ps1` - preflight de release Android.

## Distribucion

- `.\BUILD_ANDROID.ps1 -Profile preview` - APK instalable.
- `.\BUILD_ANDROID.ps1 -Profile production` - AAB Google Play.
- `.\SUBMIT_ANDROID.ps1 -Track internal` - prueba interna.

## Documentos principales

- `docs/product/PLAN_PEQUENAS_FINANZAS_1_1.md`
- `docs/product/PLAN_PEQUENAS_FINANZAS_2_1.md`
- `docs/architecture/PLAN_1_1_2_1_INTEGRATION.md`
- `docs/build/EXPO_GO_EAS_GOOGLE_PLAY.md`
