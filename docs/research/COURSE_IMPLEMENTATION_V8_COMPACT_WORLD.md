# Pequeñas Finanzas v8 — Compact World: cursos -> código

## Fuentes de formación aplicadas

1. **Nima Tahami — The Complete Figma Course**
   - Componentes y variantes reutilizables.
   - Constraints para no escalar UI sin límite.
   - Navegación/tabs consistentes.
   - Aplicación v8: `WorldMiniTile`, `WorldLibraryCard`, `WorldUI`, grids compactos y navegación consistente.

2. **Dmitry Nikolaienko — The Complete Mobile App UX/UI Design Course**
   - Jerarquía móvil, densidad, patrones de tabs/menús y tamaños de pantalla.
   - Aplicación v8: separación `WorldScale`/densidad UI, headers menores, límites máximos de cards/paneles y menos texto.

3. **React Native Fundamentals & UI Design (Coursera/Packt)**
   - Stack/tabs, grids/listas dinámicas y componentes personalizados en React Native.
   - Aplicación v8: Arcade responsive 2–4 columnas; catálogo/campamento/colección/tienda como grids y rutas Expo existentes.

4. **Grafit Studio — UI Design for Games**
   - Referencia -> bloques -> UI kit -> props -> handoff.
   - Aplicación v8: el lenguaje aprobado de “Elige un reto” se descompone en componentes y objetos reutilizables en toda la app.

5. **Malewicz — UI Design / high-fidelity composition**
   - Jerarquía, cards, mapas, navegación, modales.
   - Aplicación v8: escenario dominante, paneles contextuales menores, títulos y CTAs acotados.

6. **PedroTech — Expo/React Native app architecture**
   - Integración dentro de Expo/React Native y navegación real.
   - Aplicación v8: no se crea sub-app ni router paralelo; se preserva Expo Router y contratos existentes.

7. **Coco Code — Game UI / level grids / anchors**
   - Selección por grid, anchors y UI de juego separada del gameplay.
   - Aplicación v8: Arcade 4x2 aprox., mapa más alejado, HUD compacto, objetos del juego independientes.

## Referencias de empresas de videojuegos aplicadas

- **Riot Games**: UI contextual; gameplay/mundo primero, información cuando se necesita.
- **Supercell**: lenguaje visual consistente, responsive y reusable.
- **Ubisoft**: transformar mockups en widgets/lógica reales, optimizar texturas/memoria y no hornear estado interactivo.

## Reglas v8 derivadas

- El mundo ocupa la mayor parte de la pantalla.
- UI permanente compacta; los paneles grandes solo existen como modales temporales.
- Arcade/campamento/colección/tienda muestran múltiples opciones simultáneamente.
- Texto corto y con límites; no hay frases largas sobrepuestas a arte.
- Objetos de gameplay son visuales reales: globo, moneda, cofre, fósil, producto, carta/objeto.
- Ninguna mecánica económica o de colisión aceptada se cambia como parte del rediseño.
