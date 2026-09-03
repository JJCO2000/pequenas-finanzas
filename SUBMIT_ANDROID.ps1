param([ValidateSet('internal','production')][string]$Track='internal')
$ErrorActionPreference='Stop'
Set-Location $PSScriptRoot

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\SETUP_EAS.ps1'
if($LASTEXITCODE -ne 0){exit 1}
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\VERIFY_RELEASE.ps1'
if($LASTEXITCODE -ne 0){exit 1}

if($Track -eq 'production'){
  Write-Host '[ADVERTENCIA] Esto selecciona el track PRODUCTION de Google Play.' -ForegroundColor Red
  $confirmation=Read-Host 'Escribe PRODUCCION para continuar'
  if($confirmation -ne 'PRODUCCION'){
    Write-Host '[CANCELADO] No se subió nada a producción.' -ForegroundColor Yellow
    exit 0
  }
}else{
  Write-Host '[INFO] Se subirá la última AAB al track INTERNAL de Google Play.' -ForegroundColor Cyan
}

Write-Host '[INFO] Si EAS todavía no tiene la Google Service Account Key, ejecuta primero .\SETUP_GOOGLE_PLAY.ps1.' -ForegroundColor Yellow
npx eas-cli@latest submit --platform android --profile $Track --latest
if($LASTEXITCODE -ne 0){
  Write-Host '[ERROR] Submit falló. Revisa que la app exista en Play Console y que EAS tenga la Service Account Key.' -ForegroundColor Red
  exit 1
}
Write-Host "[OK] Submission enviada a Google Play ($Track)." -ForegroundColor Green
