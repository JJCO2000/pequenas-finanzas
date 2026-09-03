$ErrorActionPreference='Stop'
Set-Location $PSScriptRoot
Write-Host '[INFO] Pequeñas Finanzas - Development Build + cache limpia' -ForegroundColor Cyan
Write-Host '[INFO] Requiere haber instalado antes un development build con BUILD_ANDROID.ps1 -Profile development.' -ForegroundColor DarkGray
npx expo start --dev-client --clear
if($LASTEXITCODE -ne 0){exit 1}
