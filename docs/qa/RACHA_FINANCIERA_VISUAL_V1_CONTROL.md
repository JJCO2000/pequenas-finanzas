# Pequeñas Finanzas — Control Racha Financiera + Visual v1

## Clasificación del cambio

- Prioridad: P1 transversal.
- Tipo: retención/hábito + UX educativa + persistencia local + corrección de layout + game feel.
- Alcance: mapa/campamento, ejecución de juegos, SQLite, UI compartida de los 7 minijuegos.
- No incluye: notificaciones push, AAB/APK, publicación en Google Play, monetización de la racha.

## Regla de producto

La racha significa: **“Llevo X días entrenando mis finanzas.”**

No cuenta abrir la app, cobrar monedas, entrar al campamento ni repetir una transacción artificial. Solo se extiende al completar el **Reto Financiero Diario**, que rota determinísticamente entre los 7 juegos.

## Benchmark aplicado

1. Duolingo: racha diaria ligada a una actividad real y protección limitada mediante Streak Freeze.
2. `Davidls22/balloon-blitz`: objeto de globo tratado como sprite reconocible y con movimiento, no como botón geométrico.
3. `gididaf/sprite-forge`: referencia de cofre con animación de apertura y lectura visual inmediata de “tesoro”.
4. `encore-ai-labs/react-native-confetti-explosion`: física/rotación breve para feedback de éxito sin bloquear interacción.
5. `salman-ibrahim/react-native-prize-wheel`: feedback de rueda con movimiento continuo y separación clara entre estado activo y resultado.

No se copiaron assets externos ni se añadieron dependencias nuevas en esta iteración.

## Comparación contra estado anterior

| Área | Antes | v1 | Decisión |
|---|---|---|---|
| Racha | No existía | Persistente en SQLite | PASS |
| Acción válida | Cualquier sesión podía imaginarse como progreso | Solo el juego diario completado | PASS |
| Seguro | No existía | Máx. 2; 1 cada 7 días; consumo automático | PASS |
| Urgencia | No existía | Progresiva según hora; cuenta regresiva final | PASS |
| Campamento | Sin estado de hábito | Fogata/racha + seguro + CTA al reto | PASS |
| Mapa | Solo misión del día | Misión + racha visible | PASS |
| Safe area | Controles podían invadir barras laterales | Viewport y controles respetan insets | PASS estático |
| Globos | Formas planas | Volumen, brillo, etiqueta y explosión POP | PASS |
| Tesoro | Cofre plano | Madera, herrajes, brillo y apertura idle | PASS |
| Fósiles | Imagen estática | Halo/pulso y piedra visual | PASS |
| Memoria | Icono simple | Medallón con profundidad/brillo | PASS |
| Runtime físico | Sin validación en este control | Requiere dispositivo/emulador | PENDIENTE |

## Reglas SSOT de racha

- Fecha: día calendario local del dispositivo (`YYYY-MM-DD`).
- Reto diario: uno de los 7 juegos, rotación determinista.
- Calificación: `result.completed === true` y `result.gameId === challengeGameId`.
- Repetir el reto el mismo día no suma otra vez.
- Faltar 1–2 días se puede cubrir solo si hay suficientes seguros para cubrir el hueco completo.
- Si los seguros no alcanzan, la racha se reinicia a 0 y los seguros no se desperdician parcialmente.
- Máximo 2 seguros.
- Se intenta otorgar 1 seguro cada múltiplo de 7 días; nunca supera 2.
- Mejor racha se conserva aunque la racha actual se rompa.

## Persistencia y auditoría

Tablas nuevas:

- `streak_state`
- `streak_events`

Eventos mínimos:

- `STREAK_EXTENDED`
- `STREAK_FREEZE_USED`
- `STREAK_BROKEN`

## Métricas para decidir si v1 funciona

No se consideran logradas hasta medir usuarios reales.

- Inicio del reto diario / vistas de racha: objetivo >= 50%.
- Finalización del reto diario / inicios: objetivo >= 40%.
- D7 retention vs. baseline: objetivo +10% relativo o mayor.
- Usuarios con racha >= 7 días: objetivo inicial >= 20% de usuarios D7 activos.
- Rechazo de urgencia: no usar popups intrusivos durante gameplay; 0 interrupciones forzadas por racha.
- Duración del reto diario: objetivo 60–180 s.

## Control técnico

1. Integridad/manifest: no se cambian IDs de los 7 juegos, ThemePack ni contratos de GameResult.
2. Aplicación/controles: el cambio entra por `AppDataProvider`, repositorio SQLite y componentes UI compartidos; el CTA abre directamente el juego diario.
3. Rollback/idempotencia: todo vive en `feature/racha-financiera-v1`; migración usa `CREATE TABLE IF NOT EXISTS` e `INSERT OR IGNORE`; calificar dos veces el mismo día no incrementa la racha.

## Gate de cierre

- PASS para revisión de código: persistencia, reglas, integración y UI presentes.
- NO PASS para merge final hasta ejecutar typecheck/auditorías y una revisión visual real en al menos un Android landscape con barra lateral/gestual.
