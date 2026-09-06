# Pequeñas Finanzas — Auditoría UX / navegación / sistema

Fecha: 2026-09-06
Rama de trabajo: `audit/ux-navigation-system-bars-v1`
Base auditada: `main` @ `df23902f0e967243a5a84966ba3028f02400a5b6`

## Regla de ejecución

Los cambios se aplican por bloques cerrados. Un bloque no se considera aprobado solo porque compile: debe conservar invariantes funcionales y quedar preparado para validación on-device.

Orden:

1. P0 navegación y retorno.
2. P0 modo inmersivo Android / barras del sistema.
3. P1 legibilidad global.
4. P1 audio / game feel.
5. P1 huevos / poderes.
6. P1 integridad financiera visible.
7. P1/P2 persistencia y sync.
8. Regresión de los 7 juegos.

No generar AAB ni publicar en Google Play dentro de este trabajo.

## Hallazgos P0

### P0-1 — Retorno Campamento → Arcade → Minijuego rompe el historial

Flujo reproducible por código:

`/play?camp=1` → `navigateFromMenu('/arcade')` → `/arcade?from=camp` → `router.push('/game/...')` → al salir del juego `router.replace('/arcade')`.

El último `replace` pierde `from=camp`. El stack puede quedar con una instancia anterior de Arcade debajo de otra instancia de Arcade, por lo que volver puede exigir varios taps o regresar a una pantalla inesperada.

Causa raíz: el origen de navegación se representa como query param local y no se propaga al entrar/salir de un minijuego.

Criterio de aceptación:

- Un toque para salir del minijuego vuelve al hub correcto.
- Desde Arcade abierto desde Campamento, un toque en volver regresa a `/play?camp=1`.
- Nunca debe reaparecer el minijuego al intentar volver al mapa.
- Arcade abierto directamente sigue regresando según el historial normal.

### P0-2 — No existe control real de barra inferior Android

El root layout no monta control de `expo-navigation-bar` ni oculta la barra de estado. `WorldScene` consume `safe-area` y reserva espacio cuando Android reporta insets; por eso la interfaz se comprime/adapta alrededor de la barra en lugar de comportarse como juego inmersivo.

Benchmark oficial 2026:

- Android recomienda immersive mode para juegos y contenido full-screen.
- Las barras deben poder reaparecer temporalmente mediante gesto del sistema.
- Android 15+ es edge-to-edge por defecto; el layout debe reaccionar a insets sin colocar controles críticos bajo UI del sistema.
- Expo SDK 57 ofrece `expo-navigation-bar` ~57.0.2 para ocultar la navigation bar y `expo-status-bar` para la status bar.

Referencias:

- https://developer.android.com/develop/ui/views/layout/immersive
- https://developer.android.com/design/ui/mobile/guides/foundations/system-bars
- https://docs.expo.dev/versions/latest/sdk/navigation-bar/
- https://docs.expo.dev/develop/user-interface/system-bars/

Criterio de aceptación:

- Landscape aprovecha toda el área disponible.
- La barra inferior no reserva una franja permanente.
- El usuario puede revelar barras mediante gesto del sistema.
- Al volver la app a foreground se restaura la política inmersiva.
- Los controles críticos conservan margen mínimo respecto de cutouts/gestures cuando corresponda.

### P0-3 — Resultado de juego puede quedar en estado incompleto si falla persistencia

La ruta común de juego ejecuta `setResult(nextResult)` antes de que `submitGameResult()` termine. Si la persistencia/recompensa falla, `result` queda seteado, `reward` queda `null`, el overlay de fin no aparece y futuros `finish()` quedan bloqueados por `if (submitting || result) return`.

Criterio de aceptación:

- El resultado solo se marca como final cuando la persistencia termina.
- Un error debe producir estado recuperable/reintentable, nunca un juego congelado sin salida.
- No duplicar recompensa por doble tap/reintento.

## Hallazgos P1

### P1-1 — Tipografía funcional por debajo de un mínimo razonable

Se encontraron tamaños de 4.8, 5.5, 5.7, 6, 6.5, 7, 7.2, 7.5 y 8.5 en elementos funcionales, ayudas, botones, badges y descripciones. En teléfono landscape esto explica directamente el feedback “la letra está un poco pequeña”.

No se corregirá pantalla por pantalla a ojo. Debe existir una escala mínima coherente por roles y después migrar componentes comunes primero (`CompactHeader`, `HudPill`, `GameTile`, `ActionPill`, `GameChrome`).

### P1-2 — Ajuste de Sonido existe, pero no hay SFX reales conectados

`expo-audio` ya está instalado y configurado. El repo define nombres de cues (`tap`, `success`, `error`, `coin`, `celebrate`) pero `assets/audio/sfx` no contiene sonidos reproducibles y no existe un servicio de reproducción integrado a esos cues.

Se implementará infraestructura SFX original; no se copiará el audio de Pou. El objetivo es un feedback corto, juguetón y reconocible con personalidad propia.

### P1-3 — Huevos funcionan, pero la UI no comunica la función suficientemente bien

Los cuatro huevos son mejoras permanentes de `coin-catcher`:

- Bosque: +5 segundos.
- Atardecer: +28 de ancho de canasta.
- Océano: radio de imán 72.
- Volcán: bonus cada 4 monedas.

La lógica sí existe en `deriveGameModifiers`; el fallo es de affordance/comunicación. En Colección solo se ve nombre + TUYO/BLOQUEADO y en Tienda el beneficio se concentra en un panel inferior con texto pequeño.

Criterio de aceptación:

- Cada huevo comunica visualmente su poder antes de comprar.
- Después de comprar queda claro que está ACTIVO.
- Al entrar a Atrapa Monedas se muestran brevemente las mejoras activas.
- No se cambia la economía ni se convierten en dinosaurios/eclosión si esa mecánica no existe.

### P1-4 — Historial financiero no expresa dirección del movimiento

`wallet.tsx` renderiza `formatMoney(transaction.amountCents)` sin usar `transaction.kind` para signo/dirección. Gasto, ahorro, retiro, inversión y retorno pueden verse como importes positivos aunque conceptualmente sean entradas/salidas o transferencias internas.

Criterio de aceptación: distinguir ingreso, salida y transferencia sin enseñar contabilidad incorrecta.

### P1-5 — `sync_outbox` tiene productor pero no consumidor visible

Las operaciones insertan filas `pending` en `sync_outbox`, pero el repositorio expuesto por `useAppRepository` no presenta consumidor/flush. Si no existe sincronización remota en MVP, esta cola crece sin entregar valor.

Decisión requerida en implementación: o se implementa consumidor real, o se convierte explícitamente en outbox local acotado/limpiable. No debe fingir sincronización.

## Hallazgos de calidad / testing

- `tests/e2e/mvp-flow.todo.md` sigue siendo una lista TODO, no una suite E2E ejecutable.
- `tests/integration/sqlite.test.todo.md` reconoce que migraciones, rollback, wallet, idempotencia, compras y sesiones requieren pruebas antes de beta pública.
- `VERIFY.ps1` cubre TypeScript, Expo Doctor, exports y checks estáticos, pero no reproduce navegación real ni legibilidad on-device.
- Los puntajes visuales internos no sustituyen screenshots/pruebas físicas; el propio control existente lo reconoce.

## Fortalezas que deben preservarse

- SQLite con WAL + foreign keys.
- Compras dentro de transacción exclusiva.
- ThemePack como SSOT visual.
- 7/7 juegos registrados en un host común.
- Arcade sin bloqueo por progreso.
- Invariantes de economía de inversión D+4 / +50%.
- Haptics ya integrados en varios juegos.

## No regresiones obligatorias

- No cambiar IDs ni días de los 7 juegos.
- No cambiar reward policy ni fórmula de inversiones.
- No cambiar schema salvo necesidad demostrada.
- No bloquear juegos en Arcade.
- No generar AAB.
- No publicar en Google Play.
- No copiar assets/audio/código de terceros protegidos.
