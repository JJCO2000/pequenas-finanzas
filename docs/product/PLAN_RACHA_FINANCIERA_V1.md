# Pequeñas Finanzas — Plan Racha Financiera v1

**Repositorio:** `JJCO2000/pequenas-finanzas`  
**Base:** Plan 1.1 + Plan 2.1 + Plan 7 Juegos  
**Estado:** propuesta ejecutable, pendiente de implementación  
**Objetivo:** aumentar la frecuencia de práctica financiera significativa sin duplicar progreso, contaminar la economía ni meter lógica de racha dentro de los juegos.

---

## 1. Decisión de producto

La **Racha Financiera** será una capa transversal de hábito y engagement montada sobre la arquitectura existente.

No será:

- un minijuego adicional;
- una segunda campaña;
- un contador ligado al `current_day` del mapa;
- una segunda economía;
- lógica copiada dentro de los 7 juegos;
- una pantalla principal nueva;
- una excusa para premiar cualquier sesión trivial de Arcade.

La racha mide **días reales consecutivos con al menos una actividad educativa válida**.

El Día de Aventura y la Racha son conceptos independientes.

Ejemplo:

| Métrica | Ejemplo |
| --- | ---: |
| Día de aventura | 31 |
| Racha actual | 8 |
| Mejor racha | 17 |
| Actividad válida hoy | Sí |
| Seguros | 1 |

Un usuario puede completar varios días de aventura en una sola fecha y eso solo cuenta como **un día de racha**.

---

## 2. Regla maestra

> Una actividad educativa válida por día salva la racha. Más actividad mejora progreso y recompensas, pero no multiplica días de racha.

La campaña normal debe poder salvar la racha sin exigir una tarea extra.

También existirá un **Reto Financiero de Hoy** como alternativa corta para conservar el hábito sin avanzar la campaña.

---

## 3. Qué acciones califican

### 3.1 Califica

1. Completar correctamente el nodo actual de campaña.
2. Completar un juego de campaña válido.
3. Completar el **Reto Financiero de Hoy** seleccionado por `DailyChallengeDirector`.

### 3.2 No califica por defecto

- abrir la app;
- entrar al mapa;
- comprar en tienda;
- ahorrar o invertir sin completar contenido educativo;
- repetir cualquier juego libre de Arcade solo para farmear racha;
- una sesión marcada `completed=false`;
- repetir varias veces la misma actividad el mismo día.

### 3.3 Arcade

El Arcade normal **no salva la racha**.

Un juego de Arcade sí puede salvarla cuando fue seleccionado explícitamente como **Reto Financiero de Hoy**.

Motivo: evitar que el usuario encuentre el juego más corto y repita siempre la misma acción durante semanas.

---

## 4. Invariantes arquitectónicas

La implementación debe conservar las reglas de Single Source of Truth ya existentes.

### Debe mantenerse

- dinero: wallet/repository;
- aventura: `adventure_state` + `adventure_days`;
- juegos: manifests + game runtime + game registry;
- desbloqueos: `game_unlocks`;
- inventario: inventory repository;
- ajustes: settings repository;
- racha: **nuevo `streakRepository` como único dueño autoritativo**.

### Prohibido

- guardar `currentStreak` manualmente en varias pantallas;
- modificar directamente SQLite desde un juego;
- hacer `wallet += X` desde lógica de racha;
- duplicar actividad diaria en `AppDataProvider` como fuente de verdad;
- meter reglas de racha en `coin-catcher`, `dino-market`, etc.;
- usar el Día de Aventura como sustituto del día calendario;
- otorgar días múltiples de racha por varias partidas en una misma fecha.

---

## 5. Arquitectura propuesta

```text
src/
├── core/
│   ├── engagement/
│   │   ├── StreakDirector.ts
│   │   ├── StreakPolicy.ts
│   │   ├── DailyChallengeDirector.ts
│   │   └── types.ts
│   │
│   └── data/
│       └── repositories/
│           └── streakRepository.ts
│
├── features/
│   └── streak/
│       ├── StreakPill.tsx
│       ├── StreakSheet.tsx
│       ├── StreakCelebration.tsx
│       ├── StreakHistory.tsx
│       └── DailyChallengeCard.tsx
│
└── registry/
    └── streakRewards.ts
```

También se modifican:

```text
src/core/data/database/migrations.ts
src/core/data/repositories/appRepository.ts
src/core/domain/types.ts
src/features/session/AppDataProvider.tsx
src/features/adventure/screens/AdventureMapScreen.tsx
src/features/adventure/components/AdventureCampMenu.tsx
src/app/progress.tsx
src/app/parents.tsx
src/app/settings.tsx   # solo si después se agrega configuración de recordatorios
```

---

## 6. Modelo de datos

### 6.1 Migración SQLite nueva

Subir `PRAGMA user_version` de 4 a 5.

Crear tabla autoritativa de actividad diaria:

```sql
CREATE TABLE streak_days(
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  local_date TEXT NOT NULL,
  status TEXT NOT NULL,
  source_type TEXT,
  source_id TEXT,
  completed_at TEXT,
  PRIMARY KEY(profile_id, local_date)
);
```

Valores iniciales de `status`:

```text
completed
protected
```

No guardar `current_streak` como verdad primaria. Debe derivarse del ledger.

### 6.2 Estado derivado

`StreakDirector` debe exponer al menos:

```ts
type StreakState = {
  current: number;
  best: number;
  completedToday: boolean;
  todayStatus: 'new' | 'pending' | 'completed' | 'at-risk' | 'protected' | 'broken';
  protectionsAvailable: number;
  lastQualifiedDate: string | null;
};
```

### 6.3 Fuente de fecha

La racha usa **fecha local del dispositivo**, no UTC directo y no `adventure_state.current_day`.

La normalización de fecha debe vivir en una sola utilidad dentro de `core/engagement` para evitar discrepancias entre repositorios/UI.

---

## 7. Registro de acciones válidas

La racha debe engancharse después de una acción educativa ya validada por repositorio.

### Campaña

Flujo:

```text
Game/Lesson
→ resultado válido
→ repository completa campaña
→ registra learning event
→ StreakDirector.qualifyToday(...)
→ streak_days upsert idempotente
```

### Reto diario

```text
DailyChallengeDirector selecciona juego
→ GameSession mode='arcade'
→ metadata identifica daily challenge
→ GameResult completed=true
→ recordGameResult
→ StreakDirector.qualifyToday(source='daily-challenge')
```

La operación debe ser idempotente: múltiples acciones válidas en la misma fecha no crean múltiples días.

---

## 8. DailyChallengeDirector

El Reto Financiero de Hoy reutiliza juegos existentes.

Debe seleccionar entre `GAMES` usando metadata ya disponible en cada `GameManifest`:

- `ageBands`;
- `learningObjective`;
- `financialConcept`;
- `durationSeconds`;
- `minimumDay`;
- `cooldownDays`;
- `replayable`;
- juegos desbloqueados del perfil.

### Reglas v1

1. Solo juegos desbloqueados.
2. Compatible con edad.
3. Priorizar duración corta: objetivo 60–180 s.
4. No repetir el mismo juego si otro elegible cumple condiciones.
5. Respetar `cooldownDays` cuando sea posible.
6. Selección determinista por `profile_id + local_date`.
7. El reto del día no cambia al cerrar/reabrir la app.
8. No usar `Math.random()` como fuente autoritativa.

### Persistencia

Añadir tabla o metadata suficiente para asegurar que el reto elegido para una fecha sea estable.

Opción recomendada:

```sql
CREATE TABLE daily_challenges(
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  local_date TEXT NOT NULL,
  game_id TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  PRIMARY KEY(profile_id, local_date)
);
```

---

## 9. Seguro de Racha

El Seguro de Racha usa el inventario existente.

ID propuesto:

```text
streak-protection
```

Reglas v1:

- máximo 2 unidades;
- se obtiene por hitos, no por imprimir dinero;
- si falta exactamente el día anterior y hay seguro disponible, se consume 1 automáticamente;
- la fecha omitida se registra como `protected`;
- el consumo y el registro deben ocurrir en una sola transacción;
- nunca consumir más de un seguro por la misma fecha;
- no proteger varios días consecutivos por defecto en v1.

### Primer esquema de recompensa

| Hito | Recompensa |
| ---: | --- |
| 3 días | celebración |
| 7 días | +1 Seguro |
| 14 días | coleccionable |
| 30 días | cosmético/decoración |
| 60 días | cosmético raro |
| 100 días | pieza especial |

No otorgar grandes cantidades de dinero por hitos de racha en v1.

---

## 10. Integración visual

### 10.1 Mapa

El mapa sigue siendo el home principal.

Añadir `StreakPill` al HUD:

```text
🔥 12
```

Estados:

- `🔥 12` pendiente;
- `🔥 12 ✓` completada hoy;
- `🔥 12 !` en riesgo;
- `🛡️ 12` protegida.

Tap abre `StreakSheet`, no una pantalla principal nueva.

### 10.2 Tarjeta de misión actual

Antes de completar:

```text
🔥 RACHA PENDIENTE
Día 28 · El mercado jurásico
CONTINUAR
Reto rápido de hoy · 2 min →
```

Después:

```text
🔥 RACHA DE 17 DÍAS A SALVO
Día 28 · El mercado jurásico
CONTINUAR
```

### 10.3 Campamento

Mostrar:

```text
DÍA 28 | 🔥 RACHA 17
```

La fogata del Campamento representa el estado de racha:

- fuerte: completada hoy;
- normal: pendiente;
- brasas: riesgo;
- escudo visual: protegida;
- apagada: rota;
- reencendido al completar una nueva actividad.

No crear una UI con estética ajena al mundo de dinosaurios.

### 10.4 Progreso

Añadir:

- racha actual;
- mejor racha;
- seguros disponibles;
- tira visual de últimos 14 días;
- distinguir `completed` de `protected`.

Ejemplo:

```text
L  M  M  J  V  S  D
🔥 🔥 🔥 🛡️ 🔥 🔥 🔥
```

### 10.5 Zona Adultos

Añadir:

- racha actual;
- mejor racha;
- días con práctica en últimos 7 días;
- días con práctica en últimos 30 días;
- opcional: conceptos practicados recientemente.

Priorizar métrica educativa sobre gamificación.

---

## 11. Urgencia y tono

No usar presión excesiva desde temprano.

Estados sugeridos:

| Estado | Mensaje |
| --- | --- |
| Completado | `Tu fogata está fuerte hoy.` |
| Pendiente | `Haz una actividad hoy.` |
| Más tarde | `Mantén viva tu racha.` |
| En riesgo | `No dejes apagar tu fogata.` |
| Protegido | `Tu seguro protegió tu racha.` |
| Rota | `La fogata se apagó. Enciéndela otra vez hoy.` |

No mostrar lenguaje de fracaso, pérdida agresiva o culpa.

No diseñar el sistema para obligar a niños a entrar cerca de medianoche.

---

## 12. Notificaciones

**Fuera de Racha v1.**

Actualmente el proyecto no incluye `expo-notifications`.

Primero validar:

- cálculo de racha;
- reto diario;
- indicador;
- seguro;
- celebraciones;
- integración Campamento/Progreso/Adultos.

Racha v2 podrá evaluar recordatorios locales opcionales, preferentemente controlados desde Zona Adultos y compatibles con privacidad infantil.

---

## 13. AppDataProvider

`AppDataProvider` puede exponer estado derivado para UI, pero no convertirse en dueño de las reglas.

Añadir como mínimo:

```ts
streak: StreakState | null;
todayChallenge: DailyChallenge | null;
refreshStreak(): Promise<void>;
```

La lógica vive en `StreakDirector`/repositories.

---

## 14. Hitos y celebraciones

Celebrar hitos sin bloquear el flujo.

Objetivo de duración: 2–3 segundos.

Usar:

- haptic existente;
- animación de fogata;
- personaje/dinosaurio;
- número de racha;
- recompensa obtenida cuando aplique.

No encadenar múltiples modales.

---

## 15. Métricas

### Primarias

- D1 retention;
- D7 retention;
- D14 retention;
- D30 retention;
- % de perfiles que alcanzan 3 días;
- % que alcanzan 7 días;
- días activos por semana;
- actividades educativas válidas por semana.

### Guardrails

- progreso curricular no disminuye;
- repetición de un solo juego no se dispara;
- economía no se infla;
- duración de sesión no crece artificialmente;
- tasa de abandono después de perder racha no aumenta;
- errores de persistencia = 0;
- duplicados de día de racha = 0.

No optimizar `racha promedio` como métrica aislada.

Métrica norte:

> más días reales con práctica financiera significativa.

---

## 16. Instrumentación local

Reutilizar `learning_events` para registrar:

```text
STREAK_DAY_QUALIFIED
STREAK_PROTECTED
STREAK_BROKEN
STREAK_MILESTONE
DAILY_CHALLENGE_ASSIGNED
DAILY_CHALLENGE_COMPLETED
```

Guardar solo lo necesario para análisis local y futura sincronización.

No añadir analytics remoto por defecto.

---

## 17. Plan de implementación por bloques

### R0 — Dominio y persistencia

**Objetivo:** construir ledger diario y cálculo sin UI.

Cambios:

- `migrations.ts` v5;
- `streakRepository.ts`;
- `core/engagement/types.ts`;
- `StreakPolicy.ts`;
- `StreakDirector.ts`;
- export en `appRepository.ts`;
- tipos públicos.

Aceptación:

- racha actual correcta;
- mejor racha correcta;
- dos actividades mismo día cuentan una sola vez;
- fecha protegida conserva continuidad;
- datos sobreviven cierre/reapertura.

**Riesgo:** bajo.

---

### R1 — Campaña salva racha

**Objetivo:** la experiencia normal ya genera hábito.

Cambios:

- integrar calificación después de completar campaña;
- exponer `streak` en `AppDataProvider`;
- registrar `STREAK_DAY_QUALIFIED`.

Aceptación:

- lección válida salva racha;
- juego de campaña válido salva racha;
- reintentos el mismo día no duplican;
- `completed=false` no califica.

**Riesgo:** bajo.

---

### R2 — Reto Financiero de Hoy

**Objetivo:** alternativa corta sin avanzar campaña.

Cambios:

- `DailyChallengeDirector.ts`;
- `daily_challenges`;
- metadata de sesión para reto diario;
- `DailyChallengeCard.tsx`;
- navegación a juego existente.

Aceptación:

- reto estable por fecha;
- solo juegos compatibles/desbloqueados;
- Arcade libre no califica;
- Daily Challenge sí califica;
- no avanza `current_day` de campaña.

**Riesgo:** medio.

---

### R3 — HUD y celebración

**Objetivo:** hacer visible la continuidad sin crear dashboard.

Cambios:

- `StreakPill.tsx`;
- `StreakSheet.tsx`;
- `StreakCelebration.tsx`;
- mapa;
- tarjeta de misión actual.

Aceptación:

- estado visible en mapa;
- tap muestra detalle;
- milestone máximo 2–3 s;
- no bloquea navegación;
- landscape sin desbordes.

**Riesgo:** bajo.

---

### R4 — Seguro de Racha

**Objetivo:** añadir tolerancia sin volver irrelevante la constancia.

Cambios:

- `streak-protection` en inventario/registry;
- consumo transaccional;
- reglas de máximo 2;
- hitos iniciales.

Aceptación:

- solo protege un día perdido;
- consume exactamente una unidad;
- no produce doble consumo;
- no regala dinero;
- persistencia correcta.

**Riesgo:** medio.

---

### R5 — Campamento reactivo

**Objetivo:** integrar la racha al mundo de PF.

Cambios:

- encabezado del Campamento;
- estado visual de fogata;
- assets/theme mapping si hace falta;
- sin lógica de negocio dentro de componente visual.

Aceptación:

- cinco estados visuales claros;
- sin romper layout actual;
- assets centralizados;
- compatible con ThemePack.

**Riesgo:** visual.

---

### R6 — Progreso y Adultos

**Objetivo:** mostrar historial y valor educativo.

Cambios:

- `StreakHistory.tsx`;
- `progress.tsx`;
- `parents.tsx`.

Aceptación:

- 14 días visibles en Progreso;
- protected ≠ completed;
- Adultos muestra 7/30 días activos;
- no expone controles infantiles indebidos.

**Riesgo:** bajo.

---

### R7 — Recordatorios opcionales (v2)

**No implementar dentro de v1 sin revisión separada.**

Requiere:

- evaluación `expo-notifications`;
- permisos;
- configuración Zona Adultos;
- revisión privacidad/Google Families/Apple Kids;
- métricas de utilidad vs molestia.

**Riesgo:** alto comparado con v1.

---

## 18. Orden obligatorio de implementación

```text
R0 → R1 → R2 → R3 → R4 → R5 → R6
```

No avanzar si el bloque anterior rompe verificación.

Después de cada bloque:

```bash
npm run typecheck
npm run verify
npm run audit:plan7-full
npm run audit:plan7-strict
```

Si alguna verificación existente no es compatible con el entorno, documentar la causa exacta y no fingir que pasó.

---

## 19. Auditoría específica de racha

Crear script futuro:

```text
scripts/check-streak-v1.mjs
```

Debe revisar como mínimo:

1. `streakRepository` exportado desde `appRepository`;
2. migración v5 presente;
3. ningún juego importa `streakRepository`;
4. ningún juego toca SQLite;
5. Arcade libre no califica racha;
6. Daily Challenge no avanza campaña;
7. seguros usan inventario;
8. assets de racha respetan registry/theme;
9. `AppDataProvider` no contiene cálculo autoritativo de racha;
10. no se añadió `expo-notifications` dentro de v1.

Añadir script npm cuando se implemente:

```json
"audit:streak:v1": "node scripts/check-streak-v1.mjs"
```

---

## 20. Casos de prueba obligatorios

### Calendario

1. Primera actividad de la historia → racha 1.
2. Dos actividades mismo día → sigue en 1.
3. Actividad al día siguiente → 2.
4. Un día omitido sin seguro → racha reinicia.
5. Un día omitido con seguro → continuidad preservada.
6. Dos días omitidos → v1 no debe ocultarlo con un solo seguro.
7. Cerrar/abrir app → mismo estado.

### Campaña

8. Juego de campaña completado → califica.
9. Juego de campaña fallido/incompleto → no califica.
10. Repetir día ya completado → no crea otro streak day.

### Arcade

11. Juego Arcade libre → no califica.
12. Mismo juego como Daily Challenge → sí califica.
13. Daily Challenge completado → no avanza `current_day`.

### Daily Challenge

14. Reiniciar app → mismo reto del día.
15. Cambiar de perfil → reto independiente.
16. Juego bloqueado → nunca asignado.
17. Juego incompatible con edad → nunca asignado.

### Seguro

18. Máximo 2.
19. Consumo único y atómico.
20. `protected` visible distinto de `completed`.

### UI

21. HUD landscape sin clipping.
22. Campamento conserva navegación actual.
23. Progreso sigue usable horizontalmente.
24. Zona Adultos conserva ParentGate.

---

## 21. No-regresiones

La racha no puede romper:

- modo infinito del mapa;
- restauración de `map_offset_x`;
- inversiones N+4;
- múltiples inversiones;
- anti-farming Arcade 100/50/25/0;
- desbloqueo de juegos;
- economía wallet/save/invest;
- tienda e inventario;
- ThemePack;
- soporte landscape;
- offline-first;
- `sync_outbox`;
- privacidad infantil;
- package Android existente;
- configuración EAS existente.

---

## 22. Regla AAB / Google Play

Este plan **no autoriza** crear un AAB ni subir nada a Google Play.

Durante implementación se permiten cambios de código, verificaciones y builds de prueba según instrucciones posteriores, pero no generar/publicar AAB salvo solicitud explícita del usuario.

---

## 23. Criterios de aceptación global v1

Racha Financiera v1 pasa únicamente si puede demostrarse:

1. Día de Aventura y día de racha son independientes.
2. Una acción válida por fecha es suficiente.
3. Varias acciones en una fecha no multiplican la racha.
4. Campaña normal salva racha.
5. Arcade libre no salva racha.
6. Reto diario sí salva racha sin avanzar campaña.
7. Reto diario es estable por fecha y perfil.
8. Seguro usa inventario y es transaccional.
9. Racha sobrevive reinicios.
10. Mapa muestra estado sin convertirse en dashboard.
11. Campamento integra la fogata como representación del hábito.
12. Progreso muestra historial.
13. Adultos muestra constancia educativa.
14. Economía no se infla.
15. Los 7 juegos no contienen lógica de racha.
16. No hay duplicación de fuente de verdad.
17. Offline-first se mantiene.
18. Verificaciones existentes siguen pasando.

---

## 24. Decisión final

**PASA como dirección de producto y arquitectura.**

La Racha Financiera debe integrarse como sistema central de hábito, pero aislado del runtime interno de los juegos y de la economía.

La implementación correcta convierte la continuidad diaria en parte del mundo de Pequeñas Finanzas —mapa, fogata, reto corto, progreso y acompañamiento adulto— sin copiar mecánicas de otra app de forma superficial.

La secuencia de trabajo será:

```text
Persistencia
→ campaña califica
→ reto diario
→ HUD/celebración
→ seguro
→ Campamento
→ Progreso/Adultos
```

No implementar notificaciones dentro de v1.
