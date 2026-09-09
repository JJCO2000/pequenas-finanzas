# Offline + Game Feel v2 — Control de cambio

## Clasificación

- Prioridad: P0/P1 transversal.
- P0: el mapa no puede abrir incompleto; el juego debe cerrar con resultado; gameplay no debe depender de internet.
- P1: Globos, Memoria, Reparte el Tesoro y huevos reciben rediseño de game feel/lectura.
- No incluye: AAB, Google Play, backend obligatorio, anuncios, monetización.

## Benchmark / referencias

### Offline

- Expo Updates: una build incluye un update embebido y puede usar el update compatible descargado más reciente; el update embebido queda como fallback.
- Expo SQLite: la base persiste entre reinicios.
- Expo Assets: assets locales se pueden empaquetar/servir desde disco en producción; no hay que depender de imágenes HTTP para gameplay.

### Animación / cartas

- React Native Animated: `Animated` está diseñado para relaciones declarativas entre valores, transforms y animaciones temporizadas; `rotateY` + `perspective` es apropiado para una carta 3D.
- Repositorio `mjay88/bartender-flashcard-app`: referencia RN/Expo de baraja que se puede barajar y voltear para memorizar.
- Repositorios de memory games: patrón común de carta con anverso/reverso, no contenido que simplemente desaparece y reaparece.

### Globos

- `Davidls22/balloon-blitz`: referencia RN de globo como objeto móvil/táctil.
- La adaptación PF no copia assets: toma el principio de objetivo que viaja y puede escapar, frente al tablero anterior de seis botones que sólo flotaban ligeramente.

## Antes vs v2

| Área | Antes | v2 | Gate |
|---|---|---|---|
| Offline | Arquitectura local pero sin contrato automático | auditor `audit:offline` + documento + SQLite/assets locales | PASS si no hay dependencia runtime obligatoria de red |
| Mapa | podía mostrar sólo el fondo mientras hidrataba | estado de preparación hasta tener perfil + adventure state + días | PASS si no existe mapa vacío interactivo |
| Mapa visual | textura acuática repetitiva | world art de bosque + transición de expedición | revisión visual requerida |
| Resultado juego | overlay esperaba `result && reward` | aparece con `result` y guarda recompensa dentro del overlay | PASS si el usuario siempre ve cierre inmediato |
| Estadísticas | sólo score/recompensa | hasta 4 métricas específicas del juego | PASS |
| Globos | seis globos casi estáticos simultáneos | un globo sube, escapa, se revienta o se deja pasar | PASS si existe consecuencia por escape |
| Tesoro | resultado comprimido a la derecha | popup central con evento, lección y comparación | PASS |
| Memoria | fade entre listas | cartas con back/front, flip 3D, shuffle, +1 carta, reveal | PASS |
| Huevos | misma tarjeta clara + huevo pálido | portal temático, rareza, icono, contraste y wobble | revisión visual requerida |

## Métricas de aceptación

- Offline manual: 7/7 minijuegos y 7 módulos principales accesibles en modo avión después de una instalación/OTA ya descargado.
- Mapa: 0 renders de "fondo sin días" como estado jugable.
- Resultado: 7/7 juegos deben abrir resultado en <= 250 ms desde `onFinish` (el guardado puede seguir dentro del overlay).
- Memoria: 4 beats visibles obligatorios: memorizar → boca abajo → mezclar → aparece +1 → elegir.
- Globos: 100% de los objetos viajan de entrada a zona de escape; no existe tablero estático de seis opciones.
- Tesoro: explicación de resultado no se renderiza en el panel lateral estrecho.
- Huevos: 4/4 tienen motivo/rareza/color de mundo diferente.

## Decisión

No mover a Preview hasta que pasen:

1. typecheck
2. Expo dependency check + Doctor
3. source hygiene
4. offline-first
5. offline-gamefeel-v2
6. RN 0.86/imports/strict
7. layout de juegos
8. navegación + estados
9. npm audit sin high/critical

Después de CI, la última puerta sigue siendo visual en Android landscape.
