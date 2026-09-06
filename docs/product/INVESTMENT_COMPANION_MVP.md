# Inversión con compañero - Plan 2.1

La mecánica de inversión conserva el comportamiento del MVP y desacopla la presentación de una especie concreta.

Regla canónica actual:
- Puede haber múltiples inversiones activas por perfil.
- Cada inversión madura exactamente 4 días después: `día objetivo = día actual + 4`.
- Rendimiento educativo fijo: +50%.
- Cada inversión recibe un `InvestmentCompanionKey` neutral desde `src/registry/investmentCompanions.ts`.
- El ThemePack activo decide qué personaje, nombre y asset representa cada companion key.
- El compañero aparece sobre el día de vencimiento del mapa.
- Al alcanzar ese día se cobra automáticamente principal + ganancia y la inversión pasa a `claimed`.
- Una inversión cobrada no puede volver a cobrar.
- Varias inversiones pueden vencer el mismo día sin duplicar dinero.

## Fuente única de verdad
- Plazo y rendimiento: `src/core/economy/investmentPlan.ts`.
- Persistencia/cobro: repositories por concern bajo `src/core/data/repositories/`.
- Compatibilidad de datos históricos: `repositorySupport.ts`.
- Presentación: ThemePack + `src/registry/investmentCompanions.ts`.
- Estado compartido: `src/features/session/AppDataProvider.tsx`.

La columna SQLite `dinosaur_key` se conserva únicamente como nombre legado de almacenamiento para evitar una migración destructiva. El dominio y la UI no dependen de ese nombre.
