# PLAN 7 JUEGOS — Control Visual Correctivo v3

Fecha: 2026-09-05

## Motivo

El FULL PATCH v2 pasó controles técnicos pero **no pasó el control visual real** a partir de capturas 1600×650. Los problemas observados fueron clipping/densidad en Arcade, portada de juego recortada, demasiado chrome alrededor del gameplay, Inversiones sobrecargada y Campamento con demasiado espacio/jerarquía débil.

La regla de este correctivo es: **la captura real manda sobre el score técnico**.

## Baseline visual observado (v2)

| Área | Score visual real v2 | Problema dominante |
|---|---:|---|
| Campamento | 62/100 | panel demasiado ancho, navegación plana y espacio muerto |
| Arcade | 56/100 | posters demasiado altos/estrechos, texto cortado, 5º card truncado |
| Inversiones | 61/100 | panel de compra permanente compite con cartera y provoca saturación |
| Entrada de juego | 43/100 | header + portada compiten por altura; título/CTA pierden jerarquía |
| Shell durante gameplay | 58/100 | header/borde/padding consumen área que debería pertenecer al juego |

## Objetivo v3

| Área | Objetivo control v3 | Regla verificable |
|---|---:|---|
| Campamento | 88/100 | panel ≤36% de ancho, avatar/día/ruta, menú compacto, CTA de regreso |
| Arcade | 90/100 | grid 4/3/2 responsive, cards compactas, sin poster de 350px ni clipping |
| Inversiones | 90/100 | recuperar gráfica + lista lateral; solo botón INVERTIR visible; compra en modal |
| Entrada de juego | 92/100 | pantalla dedicada sin header externo, 3 pasos, CTA visible, sin clipping |
| Viewport gameplay | 97/100 | GameHost directo al viewport; solo volver + ? flotantes |

## Benchmark aplicado

- **Duolingo**: una ruta/acción clara y jerarquía que indica qué sigue; no multiplicar decisiones en la pantalla principal.
- **Prodigy**: el mundo/juego debe ser protagonista y las herramientas de navegación deben sentirse accesorias.
- **Finch**: menú/hub corto, personaje con presencia y recompensas/acciones comprensibles sin convertir el hub en dashboard.
- **Donors Plan 7**: no se cambia el loop ya auditado de cada juego; este bloque corrige shell, densidad y composición.

## Decisiones de implementación

1. **Campamento sí se modifica**, pero sigue siendo un menú rápido sobre el mapa.
2. **Arcade conserva 7/7 libres** y pasa de posters horizontales altos a grid responsive.
3. **Inversiones vuelve al layout previo** que ya funcionaba visualmente; el único control permanente nuevo es `INVERTIR`.
4. `INVERTIR` abre un modal $10/$20/$50 y no ocupa espacio cuando está cerrado.
5. Cada juego tiene **portada separada**.
6. Tras `JUGAR AHORA`, desaparecen portada y header global.
7. El aprendizaje durante gameplay vive en `?` flotante y nunca reduce el área del juego.
8. Las mecánicas 1–7 no se modifican en este correctivo.

## Gate de aprobación

El correctivo no se cierra con checks estáticos. Después de instalar debe volver a fotografiarse, como mínimo:

- Campamento
- Arcade
- Inversiones cerrada y modal Invertir
- entrada de un juego
- gameplay de los 7 juegos

Los scores anteriores son targets de código/layout; el **score visual definitivo** se recalcula con esas capturas.
