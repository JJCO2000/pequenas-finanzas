# Plan Pequeñas Finanzas 1.1 — CANÓNICO

Este documento es la referencia permanente. Cuando se diga **“checa el Plan Pequeñas Finanzas 1.1”**, ejecutar las tres pasadas del final y revisar todas estas fases.

## Principios no negociables
1. El PDF original es la base visual y de flujo.
2. El Modelo Canvas de prioridad 1 define usuario/cliente/propuesta de valor.
3. Una sola fuente de verdad para cada dato y asset.
4. Ningún minijuego escribe directamente en wallet, progreso o SQLite.
5. Cada juego es módulo autocontenido y devuelve `GameResult`.
6. Sistemas reutilizables se implementan una sola vez.
7. `design/` contiene fuentes maestras; `assets/` sólo runtime optimizado.
8. Contenido pedagógico se separa de gameplay/UI.
9. Todo debe escalar 1 → 20+ juegos sin reescribir el núcleo.
10. MVP debe verificarse, instalarse como APK y poder producir AAB.
11. Cada cambio importante debe ser testeable, auditable y reversible con Git/backups.

## Flujo base del PDF
Portada → Nombre/perfil → Mapa de aventuras → Tema/Información → Actividad/Minijuego → Resultado/Recompensa → Gastar/Ahorrar/Invertir → Canje/Progreso → siguiente misión.

## Fases 1–36
### 1. Identidad del producto
Revisar PDF, Canvas prioritario, edades 6–12, padres/tutores, escuelas, historia+minijuegos, decisiones financieras.
### 2. Arquitectura de carpetas
`src/app`, `src/core`, `src/features`, `src/game-kits`, `src/registry`, `content`, `assets`, `design`, `docs`, `tests`, `scripts`, `analysis`.
### 3. Núcleo compartido / economía
Wallet única: disponible, ahorro, inversión; transacciones en centavos enteros; juegos no mutan saldo.
### 4. Progresión
Niveles, desbloqueos, recompensas, logros; progresión decide qué sigue según edad.
### 5. Registries centrales
Games, assets, characters, levels, rewards, audio, shop. Un registro, muchas vistas.
### 6. Runtime universal
GameContract, GameSession, GameResult, GameEvents y sistemas comunes.
### 7. Game kits
Quiz y arcade primero. Tap/pop, drag/drop, simulation, board, narrative, RPG sólo cuando un juego lo necesite.
### 8. Estructura de cada juego
`manifest`, `Game`, `entities/systems/ui/config/tests`; no mezclar juegos.
### 9. Manifest
ID, nombre, edades, objetivo, concepto, duración, controles, kit, reward rule, component ID.
### 10. Movimiento
Delta time, no “píxeles por frame”; sistema compartido.
### 11. Animación
UI=Reanimated; gameplay=Skia/Reanimated; assets animados=WebP/sprites; cinematics=Lottie/Skottie/Rive sólo si justifica dependencia.
### 12. Personajes
static/sprites/animations/sounds y fuentes maestras en design/characters.
### 13. Canva
Links, screenshots, exports, originals; aprobados pasan a assets; procedencia/licencias obligatorias.
### 14. Contenido educativo
Separado de componentes; editable sin tocar motor.
### 15. Edad
6–8 y 9–12; adaptar lectura, vocabulario, matemáticas, ritmo e instrucciones.
### 16. Mapa
Dinámico desde Level Registry; estados locked/available/started/completed.
### 17. Tema/lección
Componente reutilizable con texto, ilustración, audio/animación futura.
### 18. Actividad
DecisionQuiz reutilizable para situación/opciones/consecuencia.
### 19. Economía educativa
Gastar=recompensa inmediata; ahorrar=meta futura; invertir=riesgo/recompensa simulada.
### 20. Área de canje
Reward/Shop registry, no precios hardcodeados en UI.
### 21. Base de datos
SQLite local-first; UI/juegos no ejecutan SQL; repository layer y migraciones.
### 22. Eventos
GAME_STARTED/FINISHED, LEVEL_COMPLETED, REWARD_GRANTED, MONEY_*, ITEM_PURCHASED.
### 23. Analytics
Primero local. Pandas/Colab sólo para análisis anonimizado, nunca base de datos.
### 24. Zona padres
Fuera del flujo infantil, parental gate, progreso/config/privacidad.
### 25. UX infantil
Objetivo claro, botones grandes, texto mínimo, feedback, repetición, no sobreestimulación, sonido opcional.
### 26. Accesibilidad
Contraste, tamaño, screen reader/labels, audio/subtítulos futuros, daltonismo, touch targets, tablet.
### 27. Rendimiento
Gama baja/moderna, 60/90/120Hz, memoria, background, interrupciones, audio, tamaño assets.
### 28. QA triple
Producto/diseño; arquitectura/SSOT; ejecución/build.
### 29. Builds
Development, Preview APK, Production AAB. Expo Go no prueba producción completa.
### 30. Git
Steps claros, backups y rollback.
### 31. Benchmarking permanente
GCompris/Sugarizer, Prodigy, Greenlight, Khan Kids, Pok Pok/Sago, RN Game Engine/ECS, Skia/Reanimated, Expo Router.
### 32. Banco de ideas
Cada idea con concepto, objetivo, kit, edad, dificultad, dependencias, riesgo y prioridad.
### 33. Documentación
Qué hace, quién lo usa, quién no lo modifica, fuente de datos, salida.
### 34. Anti-duplicados
Buscar colores/nombres/rutas/assets/rewards/reglas/SQL/movimiento/contenido duplicado. Referenciar, no copiar.
### 35. Prohibido
Archivo gigante de juegos; SQL en UI; wallet mutada por juegos; assets dispersos; colores/nombres hardcodeados; contenido pedagógico dentro de game logic; motores duplicados.
### 36. Objetivo técnico Step 2
Arquitectura modular + SSOT, conservar MVP, core/registry/runtime/kits/design-assets separados, Atrapa Monedas primer plugin, pruebas y build Android.

## Protocolo “Checa Plan 1.1”
### PASADA 1 — Producto y diseño
PDF, Canvas, flujo, UX infantil, contenido, personajes, mapa, identidad visual.
### PASADA 2 — Arquitectura
Carpetas, SSOT, dependencias, plugins de juegos, kits, assets, animaciones, datos, economía, progreso, duplicados.
### PASADA 3 — Calidad técnica
TypeScript, Expo Doctor, Metro bundle, SQLite/migraciones, tests, rendimiento, Android APK/AAB, privacidad, stores.

Clasificación: 🟢 correcto · 🟡 mejorable · 🟠 riesgo · 🔴 bloqueante. Nunca llamar “listo” con 🔴.

## Versionado del plan
Cambios de arquitectura o reglas no se incorporan silenciosamente. Documentar y elevar a Plan 1.2 con motivo y migración.
