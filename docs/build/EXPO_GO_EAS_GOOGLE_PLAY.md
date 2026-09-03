# Pequeñas Finanzas — Expo Go, Development Build, EAS y Google Play

## Carpeta canónica
`C:\Users\Omen\Documents\Proyectos\pequenas-finanzas`

Está intencionalmente al mismo nivel que los proyectos existentes `ucapsa-app` y `solo-leveling`.

## Desarrollo rápido: Expo Go
El proyecto instala `expo-dev-client`, por lo que `npx expo start` por sí solo intentaría abrir un development build. Para mantener el flujo tipo UCAPSA en Expo Go se fuerza explícitamente:

```powershell
.\START.ps1
# equivalente a:
npx expo start --go --clear
```

Si la LAN falla:

```powershell
.\START_TUNNEL.ps1
```

> Expo Go sirve para el MVP y pruebas rápidas. Antes de publicar se debe probar también un Development Build y un APK/AAB real.

## Development Build
```powershell
.\SETUP_EAS.ps1
.\BUILD_ANDROID.ps1 -Profile development
.\START_DEV.ps1
```

## Verificación normal
```powershell
.\AUDIT_PLAN_1_1.ps1
.\VERIFY.ps1
```

## Verificación de release
```powershell
.\VERIFY_RELEASE.ps1
```

Comprueba Plan 1.1, TypeScript, Expo Doctor, dependencias, bundle Metro/Hermes, package Android, configuración EAS, AAB, versionado remoto y estado EAS.

## APK instalable
```powershell
.\BUILD_ANDROID.ps1 -Profile preview
```

## AAB Google Play
```powershell
.\BUILD_ANDROID.ps1 -Profile production
```

Producción usa:
- `appVersionSource: remote`
- `autoIncrement: versionCode`
- environment `production`
- `android.buildType: app-bundle`

## Target API
El proyecto usa Expo SDK 57. SDK 57 compila y apunta a Android API 36, que es el requisito de Google Play para apps nuevas y actualizaciones desde el 31 de agosto de 2026.

## Primera subida a Google Play
1. Crear cuenta de Google Play Developer.
2. Crear la app en Play Console usando exactamente `com.pequenasfinanzas.app`.
3. Completar datos básicos y tareas que Play Console solicite.
4. Crear Google Service Account Key y cargarla en EAS:

```powershell
.\SETUP_GOOGLE_PLAY.ps1
```

5. Crear AAB:

```powershell
.\BUILD_ANDROID.ps1 -Profile production
```

6. Subir a prueba interna:

```powershell
.\SUBMIT_ANDROID.ps1 -Track internal
```

7. Solo después de QA real, usar producción:

```powershell
.\SUBMIT_ANDROID.ps1 -Track production
```

El perfil de producción se deja en `draft` deliberadamente para evitar una publicación accidental.

## App infantil
Antes de producción deben completarse en Play Console, según corresponda:
- público objetivo/edades;
- Families/Designed for Families si aplica;
- Data safety;
- política de privacidad;
- clasificación de contenido;
- ficha de Play Store;
- screenshots/iconos/feature graphic;
- declaraciones de anuncios/SDKs;
- testers y pruebas requeridas por el tipo de cuenta.

Esas declaraciones son de cuenta/producto y no se pueden automatizar de forma segura desde el repositorio.
