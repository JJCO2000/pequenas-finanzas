# Control v8 — Compact World

Benchmark interno: estilo visual aprobado de “Elige un reto”, con densidad corregida según el PDF original.

## Pantallas obligatorias revisadas
- Inicio
- Onboarding
- Mapa
- Campamento
- Mi dinero
- Inversiones
- Arcade
- Tienda
- Progreso
- Colección
- Adultos
- Ajustes
- Lecciones/Quiz
- Intro compartido
- Resultado
- 7 minijuegos

## Triple revisión por pantalla
1. Integridad estructural: archivo presente, sin conflictos ni placeholders rotos.
2. Densidad: límites de tipografía/componentes, sin gigantismo permanente.
3. Contrato visual: grid/objetos/navegación correspondiente a la pantalla.

El control automatizado está en `scripts/check-compact-world-v8.mjs`.
El instalador agrega una cuarta barrera: TypeScript 6.0.x real (`tsc --noEmit`) y rollback byte por byte ante fallo.
