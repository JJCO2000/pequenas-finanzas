# Pequeñas Finanzas — Validación final del plan de remediación

Fecha: 2026-09-06
Rama: `audit/ux-navigation-system-bars-v1`
PR: #1

## Estado

La implementación de los bloques 2–9 está completa en código y cuenta con guards estáticos conectados a `VERIFY.ps1`.

La aprobación final sigue requiriendo dos capas que no pueden sustituirse con revisión estática:

1. Ejecutar `VERIFY.ps1` en el checkout de desarrollo para validar dependencias Expo, Expo Doctor, TypeScript strict y export Android Metro/Hermes.
2. Probar en un dispositivo Android real el comportamiento visual, táctil y de audio.

## Matriz obligatoria de dispositivo

### Navegación
- Mapa → Campamento → Arcade → minijuego → volver: un toque debe regresar al destino correcto.
- Repetir al menos 5 veces sin crear una pila de Arcade/minijuego.
- Probar Arcade abierto directamente y Arcade abierto desde Campamento.

### Android modo juego
- Verificar navegación por gestos y, si está disponible, navegación de 3 botones.
- Barra inferior y status bar deben permanecer ocultas durante gameplay.
- Revelar temporalmente barras del sistema y confirmar que controles críticos no quedan inutilizables.
- Background/foreground no debe reactivar gameplay mientras la app está fuera de foco.

### Tipografía
- Revisar las 7 introducciones y los 7 juegos en landscape.
- Ningún texto funcional debe verse microscópico, cortado o superpuesto.
- Revisar Tienda, Colección, Dinero, Inversiones, Ajustes y Parent Gate.

### Audio
- Con Sonido ON: taps y feedback de éxito/error deben escucharse.
- Con Sonido OFF: no debe reproducirse ningún SFX.
- Volver a ON y confirmar que el audio se recupera sin reiniciar la app.

### Huevos / poderes
- Cada huevo debe mostrar beneficio antes de comprarlo.
- Comprado debe verse como ACTIVO en Tienda/Colección.
- Atrapa Monedas debe mostrar los poderes activos antes de iniciar.
- Confirmar mecánicas: +5 s, +28 ancho, radio 72, bonus cada 4.

### Finanzas
- `earn` = ENTRA +.
- `spend` = SALE −.
- ahorro/inversión/retiros = MUEVE ↔.
- Cobro de inversión no debe presentarse como si todo el principal fuera ingreso nuevo.

### Regresión 7 juegos
Para cada juego: entrada → partida → resultado → recompensa → retorno.

1. Atrapa Monedas: countdown/background, poderes, fin único.
2. Globos del presupuesto: background, cambio de ronda, vidas, fin único.
3. Reparte el tesoro: doble tap de simulación y background durante simulación.
4. Mercado Dino: doble tap en caja y transición de misión.
5. Escape Fósil: doble respuesta rápida en una pista.
6. Rey Codicioso: doble tap en girar, background durante giro y detener.
7. Memoria financiera: doble selección y timers en background.

### Persistencia
- Forzar un fallo de guardado si el entorno de prueba lo permite.
- Debe aparecer reintento de guardado sin perder la partida.
- Reintentar no debe duplicar recompensa.
- Reiniciar app y comprobar que saldo, inventario, inversiones y progreso persisten.

## Criterio de aprobación

El PR no debe dejar de ser draft ni fusionarse hasta que:

- `VERIFY.ps1` termine con exit code 0.
- No haya regresiones en la matriz de dispositivo.
- Android immersive, tipografía y SFX pasen en hardware real.

No se requiere ni se autoriza generar AAB o publicar en Google Play como parte de esta validación.
