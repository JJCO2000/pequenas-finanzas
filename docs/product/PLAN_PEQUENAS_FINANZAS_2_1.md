# Plan Pequeñas Finanzas 2.1

## Relación con Plan 1.1

Plan 1.1 es la columna vertebral técnica: fuente única de verdad, repositorios, SQLite encapsulado, economía y progreso centralizados, registros, game runtime, game kits, assets centralizados y juegos modulares preparados para crecer a 20+ experiencias.

Plan 2.1 NO sustituye Plan 1.1. Plan 2.1 define diseño, navegación, experiencia, persistencia adicional y mecánicas nuevas montadas sobre la arquitectura 1.1.

Regla de aceptación: una pantalla 2.1 no puede duplicar dinero, progreso, inversiones, inventario, juegos desbloqueados ni acceso directo a SQLite. Si se ve bien pero rompe 1.1, no pasa.

## Visión

Pequeñas Finanzas debe sentirse como videojuego infantil de aventura financiera, no como una app financiera con minijuegos pegados. El ciclo maestro es:

Portada -> Mapa / día actual -> aprender / actividad / minijuego / decisión / repaso / reto -> recompensa -> gastar / ahorrar / invertir -> siguiente día -> mismo punto del mapa -> infinito.

## 1. Modo infinito y días

- Prioridad absoluta: el mapa no termina.
- El progreso visible se expresa como Día 1, Día 2, Día 3... sin límite de producto.
- Los primeros días usan currículo diseñado; después el ProgressionDirector extiende la secuencia determinísticamente.
- Al terminar una actividad o juego y regresar, se restaura la misma posición horizontal del mapa.
- La posición se persiste en `adventure_state.map_offset_x`.
- Los días generados se guardan en `adventure_days`; cerrar y abrir la app no vuelve a sortear un día.
- El mapa genera más días por bloques al acercarse al borde derecho.

## 2. Flujo, no azar puro

`ProgressionDirector` es el único director de secuencia infinita. No usa `Math.random()`.

Ciclo base:
1. aprender;
2. practicar;
3. jugar;
4. decidir;
5. jugar/aplicar;
6. repasar;
7. reto.

El director considera edad, currículo compatible, día, días ya persistidos, juegos disponibles, `minimumDay` y `cooldownDays`. La arquitectura permite ampliar metadata (prerrequisitos, dificultad, temas, duración) sin mover lógica a la UI.

## 3. Primera semana y niveles 5, 6 y 7

Los días 5, 6 y 7 deben existir, ser jugables y persistentes. El registro de currículo conserva contenido por edad y los primeros días se siembran antes de extender el mapa infinito.

## 4. Mapa como home real

Flujo principal:

Splash -> Portada Pequeñas Finanzas -> JUGAR/CONTINUAR -> MAPA.

No existe un dashboard infantil previo al mapa. El mapa es el hub principal.

HUD del mapa:
- arriba izquierda: menú circular;
- arriba derecha: acceso circular a Arcade y acceso circular a Tienda/Canje;
- día actual visible;
- dinero disponible compacto;
- dinosaurios de inversión sobre días futuros;
- nodos de campaña, minijuego y reto integrados al recorrido.

Menú:
- Mi dinero;
- Inversiones;
- Arcade · Mis juegos;
- Progreso;
- Colección;
- Adultos;
- Ajustes.

## 5. Diseño horizontal y fuente visual

- Orientación principal: landscape/horizontal.
- Canva master: design ID `DAHUKFDnL5o` (“Copia de Pequeñas finanzas”), 8 páginas 1920x1080.
- PDF es referencia secundaria.
- Portada: mundo verde + dinosaurios + botón JUGAR/CONTINUAR.
- Mapa: agua, islas, volcán, camino, nodos y brújula.
- Tema: cueva/fósiles.
- Actividad: pasto/huellas/situación/opciones.
- Tienda: terracota/estantes/huevos/precios.
- Menos cards de dashboard; más escenarios y controles de videojuego.

## 6. Assets limpios

- Los dinosaurios de producción no deben tener halo blanco.
- Fuente preferente: elementos limpios derivados de Canva; PDF solo cuando no exista mejor fuente.
- Runtime en `assets/`; fuente maestra y procedencia en `design/`.
- Los `require()` de imágenes permanecen centralizados en `src/registry/assets.ts`.

## 7. Inversiones 2.1

Regla exacta:
- creación en Día N;
- vencimiento en Día N+4;
- rendimiento de juego fijo +50%;
- principal + ganancia solo vuelven a disponible al llegar al día de vencimiento;
- múltiples inversiones activas permitidas;
- cada inversión es independiente y solo puede cobrarse una vez.

Cada inversión guarda ID, principal, ganancia, payout, día inicial, día objetivo, dinosaurio, estado, fecha de creación y fecha de cobro.

Rotación visual de dinosaurios:
1. estegosaurio;
2. T-Rex;
3. cuello largo;
4. raptor;
5. repetir/extender catálogo.

El dinosaurio aparece físicamente sobre el día objetivo del mapa. Varias inversiones pueden coexistir incluso con el mismo vencimiento.

## 8. Gráfica interactiva de inversión

Pantalla Inversiones incluye una gráfica infantil inspirada en Yahoo Finanzas:
- selector Cartera total / inversión individual;
- puntos por día;
- tap para seleccionar;
- tooltip con día, ganancia proyectada, valor proyectado y cobro disponible;
- el valor proyectado no es dinero retirable;
- el cobro solo se habilita al llegar al día objetivo.

## 9. Arcade · Mis juegos

La campaña y Arcade se separan:
- el mapa es historia principal;
- un juego se descubre/desbloquea durante la campaña;
- después aparece en `ARCADE — Mis juegos`;
- Arcade permite rejugar;
- jugar en Arcade NO avanza días ni completa nodos;
- sí puede entregar recompensas balanceadas.

Anti-farming diario por juego:
- 1ª partida recompensada: 100%;
- 2ª: 50%;
- 3ª: 25%;
- siguientes: 0%.

Los juegos siguen viviendo en `features/games/*`; Arcade solo consulta registro/desbloqueos y abre el módulo. Esto conserva escalabilidad a 20, 40 o 100 juegos.

## 10. Game Registry

Cada manifest puede declarar:
- id/título/descripcion;
- edades;
- concepto/temas;
- kit;
- reward rule;
- componente;
- minimumDay;
- cooldownDays;
- replayable;
- arcadeRewards.

El mapa/ProgressionDirector elige módulos compatibles; no contiene la lógica interna de esos juegos.

## 11. Atrapa Monedas y tienda funcional

Atrapa Monedas usa el sistema central de recompensa. La tienda vende mejoras persistentes y explica su efecto antes de comprar:
- Huevo Bosque: +5 s;
- Huevo Atardecer: canasta más grande;
- Huevo Océano: imán;
- Huevo Volcán: bonus cada cuarta captura.

Las compras viven en inventario. El juego recibe modificadores desde `GameSession`; no lee SQLite ni wallet directamente.

## 12. Persistencia / “súper base”

SQLite local/offline-first persiste:
- perfil;
- wallet;
- movimientos;
- progreso legado;
- estado de aventura;
- días generados/completados;
- posición del mapa;
- inversiones;
- inventario;
- sesiones de juego;
- juegos desbloqueados;
- ajustes;
- eventos de aprendizaje.

`sync_outbox` deja una frontera para sincronización futura. No significa que exista nube real todavía. Una futura nube deberá sincronizar a través de repositorios/core y no desde pantallas/juegos.

## 13. Fuente única de verdad

- Wallet/repository: dinero.
- AdventureState/AdventureDays: día, mapa y campaña.
- Investments repository: inversiones y cobro.
- Inventory: mejoras/colección.
- GameUnlocks: Arcade.
- Game registry: catálogo de juegos.
- Assets registry: runtime images.

Ninguna pantalla mantiene una copia autoritativa de esos datos.

## 14. Contrato de juegos

Flujo obligatorio:

Game -> GameResult -> RewardSystem/Repository -> WalletTransaction/Progress -> Database.

Prohibido:
- Game -> SQLite;
- Game -> wallet += X;
- Game -> AppDataProvider.

`GameSession` lleva modo campaign/arcade, día de campaña y modificadores derivados del inventario/ajustes.

## 15. Adultos y ajustes

La Zona para adultos queda detrás de un gate matemático para evitar acceso accidental. No se presenta como autenticación de seguridad.

Ajustes de sonido/hápticos son persistentes. Haptics se pasan al juego como modificador; el juego no consulta el estado global.

## 16. Compatibilidad y release

- No cambiar `android.package` (`com.pequenasfinanzas.app`).
- No reemplazar `extra.eas.projectId`.
- No reemplazar `eas.json` al aplicar el parche.
- Producción sigue usando AAB/EAS.
- El instalador solo cambia `expo.orientation` a `landscape` y conserva el resto del app config.

## 17. Criterios de aceptación 2.1

Debe poderse:
1. abrir portada horizontal;
2. JUGAR/CONTINUAR al mapa;
3. completar días 1–7;
4. seguir al 8, 9, 10... y extender el mapa;
5. terminar actividad y volver a la misma zona;
6. invertir en Día N y ver dinosaurio en N+4;
7. tener varias inversiones;
8. cobrarlas una sola vez al llegar al vencimiento;
9. revisar gráfica interactiva;
10. descubrir un minijuego en campaña;
11. desbloquearlo en Arcade;
12. rejugarlo sin avanzar campaña;
13. recibir recompensa anti-farming;
14. comprar una mejora viendo su efecto;
15. notar el efecto dentro de Atrapa Monedas;
16. cerrar/reabrir y recuperar día, mapa, economía, inversiones, Arcade, inventario y días generados.

## Regla maestra

Pequeñas Finanzas es un videojuego infantil de aventura financiera con mapa infinito estructurado. Plan 1.1 protege su arquitectura; Plan 2.1 define cómo se ve y cómo se juega.
