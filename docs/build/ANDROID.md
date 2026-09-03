# Android — Pequeñas Finanzas

Carpeta: `C:\Users\Omen\Documents\Proyectos\pequenas-finanzas`

- Expo Go: `.\START.ps1`
- Development client: `.\BUILD_ANDROID.ps1 -Profile development` y luego `.\START_DEV.ps1`
- Preview: `.\BUILD_ANDROID.ps1 -Profile preview` → APK instalable.
- Production: `.\BUILD_ANDROID.ps1 -Profile production` → AAB para Google Play.
- Submit interno: `.\SUBMIT_ANDROID.ps1 -Track internal`
- Submit producción: `.\SUBMIT_ANDROID.ps1 -Track production`

Package definitivo previsto: `com.pequenasfinanzas.app`.
Cambiarlo después de la primera subida a Play crea otra identidad de app.

Expo SDK 57 usa Android compileSdk/targetSdk 36. El release preflight valida que la app siga en SDK 57 y que producción siga siendo AAB con versionCode remoto/autoIncrement.
