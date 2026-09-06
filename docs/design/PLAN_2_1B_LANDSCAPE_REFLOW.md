# Plan Pequeñas Finanzas 2.1B — Landscape Game Reflow

Este ajuste NO cambia la arquitectura del Plan 1.1 ni las reglas económicas del Plan 2.1.

## Regla de diseño
Landscape no significa estirar una pantalla vertical. Cada pantalla se redistribuye para usar el ancho disponible:

- mapa: mundo full-screen, HUD mínimo y contexto solo del día actual;
- información: dos paneles horizontales dentro del escenario;
- actividad: situación + opciones compactas sin scroll vertical;
- dinero: master-detail, saldos a la izquierda y una acción a la vez a la derecha;
- inversiones: gráfica principal + cartera lateral;
- tienda: estante de huevos + detalle del producto seleccionado;
- minijuegos: misión lateral + escenario principal;
- adultos, ajustes y colección: panes o estantes horizontales.

## Mapa infinito inspirado en Canva
El mapa conserva el agua, volcanes, islas, brújula, ruta punteada y nodos circulares del diseño de Canva. El patrón visual se extiende por escenas de 9 días y genera nuevos días cuando el jugador se acerca al final. La posición horizontal sigue persistida en adventure_state.mapOffsetX.

## Límites técnicos
- Wallet, inversiones, Arcade y juegos siguen usando AppDataProvider/repositorios; ninguna pantalla escribe SQL.
- GameResult sigue siendo la frontera de recompensas de minijuegos.
- No se duplican saldos, progreso ni inversiones en UI.
- Arcade y Progreso no se rediseñan en 2.1B porque ya funcionan correctamente en horizontal.
