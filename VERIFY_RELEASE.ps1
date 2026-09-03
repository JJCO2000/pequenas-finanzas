param([switch]$SkipRemoteVersion)
$ErrorActionPreference='Stop'
Set-Location $PSScriptRoot
$errors=0
function Good($m){Write-Host "[OK] $m" -ForegroundColor Green}
function Warn($m){Write-Host "[WARN] $m" -ForegroundColor Yellow}
function Bad($m){$script:errors++;Write-Host "[ERROR] $m" -ForegroundColor Red}

Write-Host '======================================================' -ForegroundColor DarkGreen
Write-Host ' PEQUEÑAS FINANZAS - RELEASE PREFLIGHT' -ForegroundColor Green
Write-Host '======================================================' -ForegroundColor DarkGreen

# Base técnica: misma familia que UCAPSA, pero proyecto independiente.
$nodeText=(node -v).TrimStart('v')
try{$nodeVersion=[version]$nodeText}catch{Bad "Node inválido: $nodeText"}
if($nodeVersion -lt [version]'22.13.0'){Bad "Node $nodeText < 22.13"}else{Good "Node $nodeText"}

$app=Get-Content '.\app.json' -Raw | ConvertFrom-Json
$eas=Get-Content '.\eas.json' -Raw | ConvertFrom-Json
$pkg=Get-Content '.\package.json' -Raw | ConvertFrom-Json

if($app.expo.android.package -ne 'com.pequenasfinanzas.app'){Bad "android.package inesperado: $($app.expo.android.package)"}else{Good 'Package Android fijo: com.pequenasfinanzas.app'}
if(-not $app.expo.android.versionCode -or [int]$app.expo.android.versionCode -lt 1){Bad 'Falta android.versionCode inicial >= 1'}else{Good "versionCode local inicial: $($app.expo.android.versionCode)"}
$expoVersion=[string]$pkg.dependencies.expo
if($expoVersion -notmatch '57'){Bad "Expo no parece SDK 57: $expoVersion"}else{Good "Expo SDK 57 declarado: $expoVersion"}

if($eas.cli.appVersionSource -ne 'remote'){Bad "cli.appVersionSource debe ser remote"}else{Good 'EAS appVersionSource=remote'}
if(-not $eas.build.production){Bad 'Falta build.production'}
else{
  $auto=$eas.build.production.autoIncrement
  if(($auto -ne $true) -and ($auto -ne 'versionCode')){Bad 'production.autoIncrement debe incrementar versionCode'}else{Good 'production.autoIncrement activo'}
  if($eas.build.production.environment -ne 'production'){Bad 'production.environment debe ser production'}else{Good 'production.environment=production'}
  if($eas.build.production.android.buildType -ne 'app-bundle'){Bad 'production debe generar app-bundle/AAB'}else{Good 'production.android.buildType=app-bundle'}
}
if(-not $eas.submit.internal -or $eas.submit.internal.android.track -ne 'internal'){Bad 'Falta submit.internal -> track internal'}else{Good 'Submit interno configurado'}
if(-not $eas.submit.production -or $eas.submit.production.android.track -ne 'production'){Bad 'Falta submit.production -> track production'}else{Good 'Submit producción configurado'}

if($errors -gt 0){Write-Host "`n[FAIL] Configuración release inválida." -ForegroundColor Red;exit 1}

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\AUDIT_PLAN_1_1.ps1'
if($LASTEXITCODE -ne 0){exit 1}
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\VERIFY.ps1'
if($LASTEXITCODE -ne 0){exit 1}

if(Get-Command git -ErrorAction SilentlyContinue){
  git diff --check
  if($LASTEXITCODE -ne 0){Bad 'git diff --check falló'}else{Good 'git diff --check'}
  git rev-parse --verify HEAD *> $null
  if($LASTEXITCODE -eq 0){
    $dirty=@(git status --porcelain)
    if($dirty.Count -gt 0){Warn 'Git tiene cambios sin commit. No rompe el build, pero para una release reproducible conviene commit/tag.'}else{Good 'Git limpio'}
  }else{Warn 'Repositorio sin primer commit. No bloquea el primer build.'}
}

# EAS/login/project link.
npx eas-cli@latest whoami
if($LASTEXITCODE -ne 0){Bad 'No hay sesión EAS. Ejecuta .\SETUP_EAS.ps1'}else{Good 'Sesión EAS activa'}
$app=Get-Content '.\app.json' -Raw | ConvertFrom-Json
$projectId=$null
try{$projectId=$app.expo.extra.eas.projectId}catch{}
if([string]::IsNullOrWhiteSpace([string]$projectId)){Bad 'Falta expo.extra.eas.projectId. Ejecuta .\SETUP_EAS.ps1'}else{Good "EAS projectId: $projectId"}

if(-not $SkipRemoteVersion -and $errors -eq 0){
  $versionRaw = npx eas-cli@latest build:version:get -p android -e production --json 2>$null
  if($LASTEXITCODE -eq 0){
    try{
      $versionInfo=$versionRaw | ConvertFrom-Json
      $current=[int]$versionInfo.versionCode
      Good "VersionCode remoto EAS actual: $current; próximo esperado: $($current+1)"
    }catch{Warn 'EAS respondió, pero no pude interpretar versionCode remoto.'}
  }else{
    Warn 'Todavía no hay versionCode remoto consultable. Es normal antes del primer build; EAS lo inicializará desde la configuración local.'
  }
}

if($errors -gt 0){Write-Host "`n[FAIL] $errors bloqueo(s) de release." -ForegroundColor Red;exit 1}
Write-Host "`n[OK] RELEASE PREFLIGHT PASÓ. SDK 57 implica targetSdk/compileSdk 36; producción está configurada como AAB." -ForegroundColor Green
