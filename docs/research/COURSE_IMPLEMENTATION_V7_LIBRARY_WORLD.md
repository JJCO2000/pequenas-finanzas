# Pequeñas Finanzas v7 — Library World: formación aplicada a código

Este documento registra las fuentes usadas para convertir el lenguaje visual aprobado en Arcade en un sistema reutilizable para toda la app. No es una lista de inspiración: cada referencia tiene una consecuencia concreta en React Native/Expo.

## 1) Cursos completos

### Grafit Studio — UI Design for Games
https://www.udemy.com/course/game-ui-design/

Aplicado: referencias → bloques adaptables → UI kit → cards/ventanas/props → exportación para desarrollo. En v7 esto se traduce en `WorldLibraryCard`, `WorldScene` y `GameObjects`: el arte no contiene estado; los datos y botones permanecen en código.

### Nima Tahami — The Complete Figma Course
https://www.udemy.com/course/the-complete-figma-course/

Aplicado: componentes reutilizables, variantes y constraints. En v7 las tarjetas, botones, headers, stats y portadas reutilizan una sola gramática y los grids responden al ancho disponible, en lugar de copiar posiciones absolutas entre pantallas.

### Mobile App Design in Figma: From Concept to Prototype
https://www.udemy.com/course/mobile-app-design-in-figma-from-concept-to-prototype/

Aplicado: moodboard + estructura de app + design system + wireframe + prototipo. El benchmark interno es la pantalla Arcade aprobada; ese lenguaje se propaga a inicio, campamento, mapa, dinero, inversión, tienda, colección, progreso, ajustes, adultos y juegos.

## 2) Cursos / masterclasses de YouTube

### Malewicz — Full App Design Course, High Fidelity UI/UX in Figma
https://www.youtube.com/watch?v=FBDVzr0peO4

Aplicado: jerarquía visual, cards, mapas, navegación, modales y decoración. v7 reduce listas administrativas y convierte módulos en portadas visuales con una acción dominante.

### PedroTech — React Native Full Course 2025
https://www.youtube.com/watch?v=J50gwzwLvAk

Aplicado: integración dentro del proyecto Expo/React Native y Expo Router existente. v7 no crea una sub-app ni un router paralelo; reemplaza únicamente la capa de presentación.

### Coco Code — Master Unity UI
https://www.youtube.com/watch?v=Unnd0cOSiLU

Aplicado como principio de game UI, no como dependencia de Unity: canvas, anchors, scaling, background, moneda virtual y level-selection grid. v7 usa biblioteca/grid y conserva el canvas lógico uniforme ya introducido en v6.

## 3) Estudios / empresas de videojuegos

### Riot Games — User Interface Design
https://www.riotgames.com/es/artedu/user-interface-design

Aplicado: información visible cuando se necesita y UI que no expulsa al jugador del mundo. Los minijuegos conservan HUD compacto y feedback dentro de la escena.

### Supercell — Senior UI Artist / Clash Royale
https://supercell.com/en/careers/senior-ui-artist/66476c5d-30b6-4772-aa41-94d251e3d73c/

Aplicado: lenguaje visual consistente, UI responsive, colaboración arte-código y componentes reutilizables. `WorldLibraryCard` y `GameObjects` son componentes de producción compartidos, no diseños one-off.

### Ubisoft Montréal — UI Technical Artist
https://montreal.ubisoft.com/en/jobs/ui-technical-artist-march-of-giants/

Aplicado: descomponer mockups en widgets, estructura y lógica funcional; controlar memoria, texturas y consistencia. v7 reutiliza los thumbnails aprobados como arte, mientras títulos, precios, estado, desbloqueos y mecánicas siguen siendo reales en código.

## Decisiones obligatorias v7

1. `Elige un reto` es el benchmark visual interno.
2. Arcade deja de ser lista y se vuelve biblioteca/grid de portadas.
3. Campamento, Inicio, Mi Dinero, Inversiones, Tienda, Progreso, Colección, Ajustes y Adultos usan la misma gramática de biblioteca/mundo.
4. El mapa muestra nodos visuales y portadas reales de los juegos; no vuelve al océano fotográfico como identidad principal.
5. Globos se renderizan como globos; dinero como monedas; tesoro con cofre/monedas; fósiles como fósiles; memoria con objetos semánticos; riesgo del Rey con monedas reales.
6. Los 7 IDs, GameResult, economía, N+4, +50%, compra $10/$20/$50 y constantes de Coin Catcher no cambian.
7. No se hornean precios, progreso, texto dinámico, botones, bloqueos o cantidades dentro del arte.
8. No se crea una segunda app ni un segundo sistema de navegación.
9. Todo cambio visual debe pasar TypeScript real, los audits funcionales y el audit visual v7 antes de considerarse implementado.
