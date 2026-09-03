param([ValidateSet('development','preview','production')][string]$Profile='preview')
$ErrorActionPreference='Stop'
Set-Location $PSScriptRoot

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\SETUP_EAS.ps1'
if($LASTEXITCODE -ne 0){exit 1}

if($Profile -eq 'production'){
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\VERIFY_RELEASE.ps1'
}else{
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\AUDIT_PLAN_1_1.ps1'
  if($LASTEXITCODE -ne 0){exit 1}
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\VERIFY.ps1'
}
if($LASTEXITCODE -ne 0){exit 1}

Write-Host "[INFO] EAS Build Android - perfil: $Profile" -ForegroundColor Cyan
switch($Profile){
  'development'{Write-Host '[INFO] Development Client: debug instalable para desarrollo real.' -ForegroundColor Yellow}
  'preview'{Write-Host '[INFO] Preview: APK instalable directamente en Android.' -ForegroundColor Yellow}
  'production'{Write-Host '[INFO] Production: AAB firmado para Google Play, con versionCode remoto autoIncrement.' -ForegroundColor Yellow}
}

npx eas-cli@latest build --platform android --profile $Profile
if($LASTEXITCODE -ne 0){exit 1}

if($Profile -eq 'production'){
  Write-Host "`n[OK] Build de producción solicitado." -ForegroundColor Green
  Write-Host '[SIGUIENTE] Cuando termine, sube la última AAB a prueba interna con:' -ForegroundColor Yellow
  Write-Host '  .\SUBMIT_ANDROID.ps1 -Track internal' -ForegroundColor Yellow
}
