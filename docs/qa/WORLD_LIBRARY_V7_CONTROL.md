# WORLD LIBRARY v7 — control de implementación

## Cambio
Rediseño visual sistémico. Conserva contratos funcionales y economía; sustituye la gramática visual de listas/dashboard por mundo + biblioteca ilustrada + objetos de juego tangibles.

## Benchmark interno
La pantalla Arcade `Elige un reto` aprobada por el usuario: dinosaurios ilustrados, fondo cartoon, crema + verde oscuro + amarillo, bordes gruesos y jerarquía de videojuego móvil.

## Gates
- Arcade: 7/7, grid responsive de 2–4 columnas, sin gating.
- Campamento: grid visual de módulos; no lista/dashboard de 6 filas.
- Start/Wallet/Investments/Shop/Progress/Collection/Settings/Parents: `WorldScene` + grammar compartida.
- Map: fondo cartoon semántico + game thumbnails para nodos de juego + misión actual ilustrada.
- Balloon: `BalloonObject`.
- Treasure: `TreasureChest` + `CoinPile`.
- Fossil Escape: `FossilObject`.
- Money Memory: `MemoryObject`.
- King Greedy: `CoinPile` para dinero seguro/en riesgo.
- Market: sprites reales de productos.
- Coin Catcher: sprites reales y constantes mecánicas v6 intactas.
- Sin nueva sub-app/router fork.
- ThemePack/SSOT preservados.
