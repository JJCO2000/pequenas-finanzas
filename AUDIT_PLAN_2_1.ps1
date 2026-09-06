$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$errors = 0
function Good($message) { Write-Host "[GREEN] $message" -ForegroundColor Green }
function Bad($message) { $script:errors++; Write-Host "[RED] $message" -ForegroundColor Red }

$required = @(
  'docs\product\PLAN_PEQUENAS_FINANZAS_2_1.md',
  'docs\architecture\PLAN_1_1_2_1_INTEGRATION.md',
  'src\core\progression\ProgressionDirector.ts',
  'src\core\economy\investmentPlan.ts',
  'src\core\economy\arcadeRewardPolicy.ts',
  'src\core\economy\gameUpgradePolicy.ts',
  'src\features\adventure\AdventureMapScreen.tsx',
  'src\features\wallet\components\InvestmentPortfolio.tsx',
  'src\app\start.tsx',
  'src\app\play.tsx',
  'src\app\arcade.tsx',
  'src\app\wallet.tsx',
  'src\app\investments.tsx',
  'src\app\progress.tsx',
  'src\app\collection.tsx',
  'src\app\parents.tsx',
  'src\app\settings.tsx',
  'assets\world\forest\forest-landscape.jpg',
  'assets\world\map\water-landscape.jpg',
  'assets\world\cave\cave-landscape.jpg',
  'assets\world\activity\grass-landscape.jpg',
  'assets\world\shop\terracotta-landscape.jpg'
)
foreach ($path in $required) {
  if (Test-Path -LiteralPath $path) { Good $path } else { Bad "Missing: $path" }
}

try {
  $app = Get-Content -LiteralPath 'app.json' -Raw | ConvertFrom-Json
  if ($app.expo.orientation -eq 'landscape') { Good 'Landscape orientation' } else { Bad 'expo.orientation must be landscape' }
  if ($app.expo.android.package -eq 'com.pequenasfinanzas.app') { Good 'Android package preserved' } else { Bad 'Android package changed' }
} catch { Bad "Could not read app.json: $($_.Exception.Message)" }

$director = Get-Content -LiteralPath 'src\core\progression\ProgressionDirector.ts' -Raw
if ($director -match 'Math\.random\s*\(') { Bad 'ProgressionDirector uses Math.random().' } else { Good 'ProgressionDirector is deterministic' }
if ($director -match 'lesson.+activity.+game.+decision' -or $director -match "'lesson'[\s\S]*'activity'[\s\S]*'game'[\s\S]*'decision'") { Good 'Structured progression cycle present' } else { Bad 'Structured progression cycle missing' }
if ($director -match 'buildInitialAdventureDays' -and $director -match 'games: GameManifest\[\]' -and $director -match 'dayNumber <= 7') { Good 'Curated first week can discover campaign games' } else { Bad 'First week campaign/game integration missing' }

$investment = Get-Content -LiteralPath 'src\core\economy\investmentPlan.ts' -Raw
if ($investment -match 'INVESTMENT_TERM_LEVELS\s*=\s*4') { Good 'Investment term N+4' } else { Bad 'Investment term is not 4 days' }
if ($investment -match 'INVESTMENT_RETURN_PERCENT\s*=\s*50') { Good 'Investment return +50%' } else { Bad 'Investment return is not 50%' }

$migrations = Get-Content -LiteralPath 'src\core\data\database\migrations.ts' -Raw
foreach ($table in @('adventure_state','adventure_days','game_unlocks','app_settings','sync_outbox')) {
  if ($migrations -match [regex]::Escape($table)) { Good "DB $table" } else { Bad "DB table missing: $table" }
}
if ($migrations -match 'DROP INDEX IF EXISTS investments_one_active_per_profile') { Good 'Multiple active investments enabled' } else { Bad 'Legacy single-investment index not removed' }

$arcade = Get-Content -LiteralPath 'src\core\economy\arcadeRewardPolicy.ts' -Raw
if ($arcade -match '\[1,\s*0\.5,\s*0\.25,\s*0\]') { Good 'Arcade anti-farming policy 100/50/25/0' } else { Bad 'Arcade anti-farming policy changed' }

$map = Get-Content -LiteralPath 'src\features\adventure\AdventureMapScreen.tsx' -Raw
if ($map -match 'horizontal' -and $map -match 'saveMapPosition' -and $map -match 'ensureAdventureThrough') { Good 'Infinite horizontal map + position persistence hooks' } else { Bad 'Infinite map/persistence hooks incomplete' }
if ($map -match 'mapInvestments\.map' -and $map -match 'investments\.filter') { Good 'Multiple investment dinosaur markers' } else { Bad 'Map does not render multiple investments' }
if ($map -match 'router\.push\(path as any\)') { Good 'Expo Router typed-route bridge for Plan 2.1 menu' } else { Bad 'Plan 2.1 dynamic menu routes are not bridged for stale Expo typed-route declarations' }

$tabs = Get-Content -LiteralPath 'src\app\(tabs)\_layout.tsx' -Raw
if ($tabs -match '<Tabs') { Bad 'Legacy bottom tabs are still active' } else { Good 'Legacy bottom tab shell disabled' }

$gameFiles = @(Get-ChildItem -LiteralPath 'src\features\games' -Recurse -Include '*.ts','*.tsx' -File -ErrorAction SilentlyContinue)
$badGame = @($gameFiles | Select-String -Pattern 'core/data|repositories|expo-sqlite|useAppData')
if ($badGame.Count -gt 0) { Bad 'Plan 2.1 game module bypasses Plan 1.1 boundaries' } else { Good 'Plan 1.1 game boundaries preserved' }

Write-Host ''
Write-Host "PLAN 2.1 SUMMARY: $errors blocker(s)" -ForegroundColor Cyan
if ($errors -gt 0) { Write-Host 'STATUS: BLOCKED' -ForegroundColor Red; exit 1 }
Write-Host 'STATUS: CORRECT (static audit)' -ForegroundColor Green
exit 0
