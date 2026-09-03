$ErrorActionPreference='Stop'
Set-Location $PSScriptRoot
Write-Host '[INFO] Pequeñas Finanzas - Expo Go + cache limpia' -ForegroundColor Cyan
Write-Host '[INFO] Equivalente al flujo npx expo start -c usado en UCAPSA, forzando --go porque este proyecto también instala expo-dev-client.' -ForegroundColor DarkGray
npx expo start --go --clear
if($LASTEXITCODE -ne 0){exit 1}
