# Pequeñas Finanzas — MVP Plan 1.1 Play Ready

MVP infantil de educación financiera basado en el PDF original: nombre → mapa → tema → actividad → recompensa → gastar/ahorrar/invertir → canje.

## Ubicación
`C:\Users\Omen\Documents\Proyectos\pequenas-finanzas`

Misma raíz de proyectos que `ucapsa-app` y `solo-leveling`.

## Desarrollo
- `.\START.ps1` — Expo Go + cache limpia.
- `.\START_TUNNEL.ps1` — Expo Go por tunnel.
- `.\BUILD_ANDROID.ps1 -Profile development` — development APK.
- `.\START_DEV.ps1` — Metro para development client.

## QA
- `.\VERIFY.ps1` — dependencias + Expo Doctor + TypeScript + config + bundle Android.
- `.\AUDIT_PLAN_1_1.ps1` — arquitectura/SSOT/anti-duplicados.
- `.\VERIFY_RELEASE.ps1` — preflight de release siguiendo el patrón robusto usado en UCAPSA.

## Distribución
- `.\BUILD_ANDROID.ps1 -Profile preview` — APK instalable.
- `.\BUILD_ANDROID.ps1 -Profile production` — AAB Google Play.
- `.\SETUP_GOOGLE_PLAY.ps1` — prepara Service Account en EAS.
- `.\SUBMIT_ANDROID.ps1 -Track internal` — prueba interna.
- `.\SUBMIT_ANDROID.ps1 -Track production` — producción (con confirmación explícita; release queda draft).

## Arquitectura
`src/core` infraestructura/políticas reutilizables · `src/features` producto/juegos · `src/game-kits` mecánicas · `src/registry` fuentes únicas · `content` fuentes pedagógicas · `design` masters · `assets` runtime.

Lee primero:
- `docs/product/PLAN_PEQUENAS_FINANZAS_1_1.md`
- `docs/build/EXPO_GO_EAS_GOOGLE_PLAY.md`
