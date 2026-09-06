param([switch]$SkipRemoteVersion)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$errors = 0
function Good($message) { Write-Host "[OK] $message" -ForegroundColor Green }
function Warn($message) { Write-Host "[WARN] $message" -ForegroundColor Yellow }
function Bad($message) { $script:errors++; Write-Host "[ERROR] $message" -ForegroundColor Red }

Write-Host '======================================================' -ForegroundColor DarkGreen
Write-Host ' PEQUENAS FINANZAS - RELEASE PREFLIGHT' -ForegroundColor Green
Write-Host '======================================================' -ForegroundColor DarkGreen

$nodeText = (node -v).TrimStart('v')
try { $nodeVersion = [version]$nodeText } catch { Bad "Invalid Node version: $nodeText" }
if ($nodeVersion -lt [version]'22.13.0') { Bad "Node $nodeText < 22.13" } else { Good "Node $nodeText" }

$app = Get-Content '.\app.json' -Raw | ConvertFrom-Json
$eas = Get-Content '.\eas.json' -Raw | ConvertFrom-Json
$pkg = Get-Content '.\package.json' -Raw | ConvertFrom-Json

if ($app.expo.android.package -ne 'com.pequenasfinanzas.app') { Bad "Unexpected android.package: $($app.expo.android.package)" } else { Good 'Android package: com.pequenasfinanzas.app' }
if (-not $app.expo.android.versionCode -or [int]$app.expo.android.versionCode -lt 1) { Bad 'Missing android.versionCode >= 1' } else { Good "Local versionCode: $($app.expo.android.versionCode)" }
$expoVersion = [string]$pkg.dependencies.expo
if ($expoVersion -notmatch '57') { Bad "Expo does not look like SDK 57: $expoVersion" } else { Good "Expo SDK 57 declared: $expoVersion" }

if ($eas.cli.appVersionSource -ne 'remote') { Bad 'cli.appVersionSource must be remote' } else { Good 'EAS appVersionSource=remote' }
if (-not $eas.build.production) {
  Bad 'Missing build.production'
} else {
  $auto = $eas.build.production.autoIncrement
  if (($auto -ne $true) -and ($auto -ne 'versionCode')) { Bad 'production.autoIncrement must increment versionCode' } else { Good 'production.autoIncrement active' }
  if ($eas.build.production.environment -ne 'production') { Bad 'production.environment must be production' } else { Good 'production.environment=production' }
  if ($eas.build.production.android.buildType -ne 'app-bundle') { Bad 'production must generate app-bundle/AAB' } else { Good 'production.android.buildType=app-bundle' }
}
if (-not $eas.submit.internal -or $eas.submit.internal.android.track -ne 'internal') { Bad 'Missing submit.internal -> internal track' } else { Good 'Internal submit configured' }
if (-not $eas.submit.production -or $eas.submit.production.android.track -ne 'production') { Bad 'Missing submit.production -> production track' } else { Good 'Production submit configured' }

if ($errors -gt 0) {
  Write-Host ''
  Write-Host '[FAIL] Invalid release configuration.' -ForegroundColor Red
  exit 1
}

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\VERIFY.ps1'
if ($LASTEXITCODE -ne 0) { exit 1 }

if (Get-Command git -ErrorAction SilentlyContinue) {
  git diff --check
  if ($LASTEXITCODE -ne 0) { Bad 'git diff --check failed' } else { Good 'git diff --check' }
  git rev-parse --verify HEAD *> $null
  if ($LASTEXITCODE -eq 0) {
    $dirty = @(git status --porcelain)
    if ($dirty.Count -gt 0) { Warn 'Git has uncommitted changes. Build is possible, but release is not fully reproducible.' } else { Good 'Git clean' }
  } else {
    Warn 'Repository has no first commit.'
  }
}

npx.cmd eas-cli@latest whoami
if ($LASTEXITCODE -ne 0) { Bad 'No EAS session. Run .\SETUP_EAS.ps1' } else { Good 'EAS session active' }
$app = Get-Content '.\app.json' -Raw | ConvertFrom-Json
$projectId = $null
try { $projectId = $app.expo.extra.eas.projectId } catch {}
if ([string]::IsNullOrWhiteSpace([string]$projectId)) { Bad 'Missing expo.extra.eas.projectId. Run .\SETUP_EAS.ps1' } else { Good "EAS projectId: $projectId" }

if (-not $SkipRemoteVersion -and $errors -eq 0) {
  $versionRaw = npx.cmd eas-cli@latest build:version:get -p android -e production --json 2>$null
  if ($LASTEXITCODE -eq 0) {
    try {
      $versionInfo = $versionRaw | ConvertFrom-Json
      $current = [int]$versionInfo.versionCode
      Good "Remote EAS versionCode: $current; next expected: $($current + 1)"
    } catch {
      Warn 'EAS answered but remote versionCode could not be parsed.'
    }
  } else {
    Warn 'Remote versionCode is not available yet. This is normal before the first build.'
  }
}

if ($errors -gt 0) {
  Write-Host ''
  Write-Host "[FAIL] $errors release blocker(s)." -ForegroundColor Red
  exit 1
}
Write-Host ''
Write-Host '[OK] RELEASE PREFLIGHT PASSED. Production is configured as Android AAB.' -ForegroundColor Green
exit 0
