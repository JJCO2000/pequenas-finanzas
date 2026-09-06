# Visual v5 — estrategia de assets ligera

## Regla de producción
Los mockups aprobados son **referencias**, no pantallas rasterizadas que se empaquetan completas.

La implementación usa:
- fondos landscape compartidos ya existentes en el proyecto;
- `ScenicBackdrop` centralizado con `expo-image`, `contentFit="cover"` y `cachePolicy="memory-disk"`;
- cards, botones, HUD y layout dibujados con React Native;
- sprites de personajes ya existentes;
- ThemePack como fuente de identidad visual.

## Reducción del grafo de assets
Se dejan de requerir desde `src/registry/assets.ts` las variantes portrait y la lámina de referencia que no forman parte del runtime landscape. Los archivos pueden permanecer en el repositorio, pero al no estar requeridos no entran en el grafo estático de Metro.

Medición sobre el registry auditado:
- v4: 37 assets requeridos, 8,088,167 bytes.
- v5: 30 assets requeridos, 2,442,646 bytes.
- reducción: 5,645,521 bytes (~5.38 MiB) en el grafo explícito del registry.
- nuevos mockups raster de pantalla completa: 0.

## Objetivo
Conservar el aspecto ilustrado de las referencias sin convertir cada pantalla en una imagen pesada e inflexible.
