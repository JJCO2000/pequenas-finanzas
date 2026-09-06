$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$errors = 0
$warnings = 0

function Good($message) {
  Write-Host "[GREEN] $message" -ForegroundColor Green
}
function Warn($message) {
  $script:warnings++
  Write-Host "[YELLOW] $message" -ForegroundColor Yellow
}
function Bad($message) {
  $script:errors++
  Write-Host "[RED] $message" -ForegroundColor Red
}

$required = @(
  'src\app',
  'src\core',
  'src\features',
  'src\game-kits',
  'src\registry',
  'content',
  'assets',
  'design',
  'docs',
  'tests',
  'analysis',
  'src\core\data\database',
  'src\core\data\repositories',
  'src\core\game-runtime',
  'src\core\economy',
  'src\core\progression',
  'src\features\games\coin-catcher',
  'design\licenses\asset-provenance.json',
  'docs\product\PLAN_PEQUENAS_FINANZAS_1_1.md',
  'docs\product\PLAN_PEQUENAS_FINANZAS_1_2.md',
  'docs\build\EXPO_GO_EAS_GOOGLE_PLAY.md',
  'CHECK_POWERSHELL.ps1',
  'START.ps1',
  'START_DEV.ps1',
  'START_TUNNEL.ps1',
  'SETUP_EAS.ps1',
  'VERIFY_RELEASE.ps1',
  'BUILD_ANDROID.ps1',
  'SETUP_GOOGLE_PLAY.ps1',
  'SUBMIT_ANDROID.ps1',
  'eas.json',
  'app.json'
)

foreach ($path in $required) {
  if (Test-Path $path) { Good $path } else { Bad "Missing: $path" }
}

$src = @(Get-ChildItem 'src' -Recurse -Include '*.ts','*.tsx' -File -ErrorAction SilentlyContinue)

# SQL must remain inside core/data.
$sql = @(
  $src |
    Where-Object { $_.FullName -notmatch '\\core\\data\\' } |
    Select-String -Pattern '\b(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|PRAGMA)\b' -CaseSensitive:$false
)
if ($sql.Count -gt 0) {
  Bad 'SQL found outside core/data.'
  $sql | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" }
} else {
  Good 'SQL encapsulated in core/data'
}

# expo-sqlite imports are only allowed inside data and the root provider/layout.
$sqlImports = @(
  $src |
    Where-Object { $_.FullName -notmatch '\\core\\data\\' -and $_.FullName -notmatch '\\app\\_layout\.tsx$' } |
    Select-String -Pattern 'expo-sqlite'
)
if ($sqlImports.Count -gt 0) {
  Bad 'expo-sqlite imported outside data/root layout.'
  $sqlImports | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" }
} else {
  Good 'Games/UI do not import expo-sqlite'
}

# Runtime image requires must be centralized.
$assetRequires = @(
  $src |
    Where-Object { $_.FullName -notmatch '\\registry\\assets\.ts$' } |
    Select-String -Pattern 'require\('
)
if ($assetRequires.Count -gt 0) {
  Bad 'require() found outside registry/assets.ts.'
  $assetRequires | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" }
} else {
  Good 'Runtime assets centralized'
}

# Colors must remain in theme tokens.
$hex = @(
  $src |
    Where-Object { $_.FullName -notmatch '\\core\\theme\\tokens\.ts$' } |
    Select-String -Pattern '#[0-9A-Fa-f]{6}'
)
if ($hex.Count -gt 0) {
  Bad 'Hardcoded 6-digit HEX colors found outside core/theme/tokens.ts.'
  $hex | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" }
} else {
  Good 'Colors centralized'
}

# Game plugins may emit results/events but must not persist wallet/data directly.
$gameFiles = @(Get-ChildItem 'src\features\games' -Recurse -Include '*.ts','*.tsx' -File -ErrorAction SilentlyContinue)
$badGame = @($gameFiles | Select-String -Pattern 'core/data|repositories|expo-sqlite|useAppData')
if ($badGame.Count -gt 0) {
  Bad 'A game module touches persistence/session data directly.'
  $badGame | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" }
} else {
  Good 'Game plugins isolated from wallet/DB'
}

# Android/EAS release configuration.
try {
  $appCfg = Get-Content 'app.json' -Raw | ConvertFrom-Json
  $easCfg = Get-Content 'eas.json' -Raw | ConvertFrom-Json

  if ($appCfg.expo.android.package -eq 'com.pequenasfinanzas.app') { Good 'Android package centralized' } else { Bad 'android.package does not match com.pequenasfinanzas.app' }
  if ([int]$appCfg.expo.android.versionCode -ge 1) { Good 'Local initial versionCode present' } else { Bad 'Invalid local versionCode' }
  if ($easCfg.cli.appVersionSource -eq 'remote') { Good 'EAS remote app version' } else { Bad 'EAS appVersionSource must be remote' }
  if ($easCfg.build.production.android.buildType -eq 'app-bundle') { Good 'Production=AAB' } else { Bad 'Production does not generate AAB' }

  $auto = $easCfg.build.production.autoIncrement
  if (($auto -eq $true) -or ($auto -eq 'versionCode')) { Good 'Production autoIncrement versionCode' } else { Bad 'Missing versionCode autoIncrement' }

  if ($easCfg.submit.internal.android.track -eq 'internal') { Good 'Google Play internal track configured' } else { Bad 'Missing internal submit track' }
} catch {
  Bad "Could not validate app.json/eas.json: $($_.Exception.Message)"
}

# Registry sanity checks.
if ((Get-Content 'src\registry\games.ts' -Raw) -match 'GAMES') { Good 'Game registry present' } else { Bad 'Invalid game registry' }
if ((Get-Content 'src\registry\levels.ts' -Raw) -match 'LEVELS') { Good 'Level registry present' } else { Bad 'Invalid level registry' }

Write-Host ''
Write-Host "SUMMARY: $errors blocker(s), $warnings warning(s)" -ForegroundColor Cyan
if ($errors -gt 0) {
  Write-Host 'STATUS: BLOCKED' -ForegroundColor Red
  exit 1
}
if ($warnings -gt 0) {
  Write-Host 'STATUS: IMPROVABLE' -ForegroundColor Yellow
} else {
  Write-Host 'STATUS: CORRECT (static audit)' -ForegroundColor Green
}
exit 0
