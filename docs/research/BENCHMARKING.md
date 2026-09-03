# Benchmarking técnico/producto
Investigado para Plan 1.1:
- GCompris: plataforma educativa con muchas actividades; benchmark de shell común + actividades independientes. https://github.com/KDE/gcompris
- Sugarizer: cada actividad vive en su subdirectorio y se registra centralmente. https://github.com/llaske/sugarizer
- React Native Game Engine: referencia conceptual ECS/sistemas; no dependencia obligatoria. https://github.com/bberak/react-native-game-engine
- Expo Router: file routing + JavaScript tabs estables; Custom Tabs sigue marcado experimental. https://docs.expo.dev/router/advanced/tabs/
- React Native Skia: canvas 2D para gameplay. https://shopify.github.io/react-native-skia/
- Reanimated useFrameCallback: loop por frame con delta time. https://docs.swmansion.com/react-native-reanimated/
- Expo SQLite: WAL recomendado y transacciones exclusivas. https://docs.expo.dev/versions/latest/sdk/sqlite/
- Greenlight Level Up, Prodigy, Khan Academy Kids, Pok Pok/Sago Mini: referencias de educación gamificada, progresión, UX infantil y equilibrio de estímulos.

Decisión: Expo SDK 57 + RN 0.86 + Router + Skia + Reanimated/Worklets + Gesture Handler + SQLite. No introducir motores completos hasta que una mecánica lo justifique.
