# PLAN 7 JUEGOS — CONTROL DE CAMBIO
## Bloque 3: Experiencia Global PF — misión, progreso y recompensa

### Clasificación
UX global / game feel / progresión / feedback / cohesión del mundo.

### Objetivo
Que el shell de Pequeñas Finanzas se sienta como una aventura continua y no como una colección de pantallas educativas: **Inicio -> mapa -> misión -> actividad/juego -> celebración -> siguiente misión**.

Este score evalúa el **shell global**. No sustituye el benchmark individual de los siete minijuegos.

### Benchmark usado
- **Prodigy Math:** mundo explorable, quests, recompensa y mascota/personaje como parte del loop.
- **Duolingo:** camino visible, objetivo actual y progreso legible de un vistazo.
- **Finch:** compañero presente, quests claras y recompensa emocional/visual al completar.

No se copian assets ni código. Se reutilizan patrones de producto y game feel.

### Estado anterior (post Bloque 2)
- Existía mapa horizontal, días y nodos, pero el objetivo actual no dominaba la entrada.
- La pantalla Start era principalmente portada + botón Continuar.
- El progreso de la etapa no era visible de forma persistente.
- Los nodos se diferenciaban principalmente por número; sólo minijuegos tenían badge especial.
- El personaje no estaba ligado visualmente al nodo actual.
- Éxito de lecciones/juegos terminaba en `Alert.alert`, fuera del lenguaje visual del juego.
- Al volver al mapa no existía feedback de “día completado / siguiente día desbloqueado”.

### Cambio aplicado
1. Start ahora presenta la **misión actual**, recompensa, etapa, dinero disponible y juegos descubiertos.
2. El mapa muestra **etapa 1..N y posición 1/9..9/9**.
3. Cada nodo tiene iconografía semántica de su tipo.
4. El nodo actual tiene personaje + pulso visual.
5. La tarjeta de misión actual muestra tipo, objetivo, recompensa, progreso y CTA.
6. Juego y lección usan `MissionCompleteOverlay`, una celebración in-world con animación, personaje, recompensa, puntaje y haptics.
7. Al regresar al mapa aparece `AdventureReturnToast`: misión completada y nuevo día disponible.
8. El menú Campamento también muestra progreso de etapa.
9. El denominador de juegos descubiertos usa `GAMES.length`, no un `7` duplicado.
10. UI grande del mapa se dividió en componentes reutilizables sin cambiar economía, DB, progresión ni GameResult.

### Score cuantitativo — experiencia global
| Criterio | Peso | Antes | Después | Evidencia del cambio |
|---|---:|---:|---:|---|
| Sensación de videojuego | 25 | 15 | 22 | misión protagonista, nodo vivo, celebración in-world |
| Progresión y anticipación | 20 | 15 | 19 | etapa 1–N, 1/9–9/9, misión actual, retorno con desbloqueo |
| Mundo, personajes e identidad | 20 | 14 | 18 | compañero en Start, mapa y resultados; todo desde ThemePack |
| Recompensas / economía visible | 15 | 12 | 14 | premio antes/después, dinero visible, CTA a wallet |
| Feedback y celebración | 10 | 4 | 9 | animación, partículas, haptics, toast de retorno, pulso |
| Cohesión y navegación | 10 | 8 | 10 | loop continuo Inicio -> misión -> resultado -> mapa |
| **TOTAL SHELL GLOBAL** | **100** | **68** | **92** | objetivo >=88 superado |

### Impacto sobre el Plan 7 Juegos
- No cambia ninguna mecánica interna de los siete juegos.
- Mejora el envoltorio común que todos usan antes/después de una partida.
- Plan 7 Juegos individual sigue pendiente: cada juego conservará su benchmark propio de diseño/gameplay.

### Regresiones no permitidas
- Cambiar IDs/días de desbloqueo.
- Cambiar reward policy.
- Cambiar DB o progreso por razones visuales.
- Introducir assets fuera de ThemePack.
- Reintroducir Alert del sistema como celebración de éxito.
- Hardcodear el total de juegos.

### Veredicto esperado
**PASA** sólo si pasan:
1. `scripts/check-global-experience.mjs`
2. `scripts/check-theme-swap.mjs`
3. `scripts/check-plan7-block0.mjs`
4. controles existentes de juegos e inversiones
5. TypeScript real del proyecto durante instalación.
