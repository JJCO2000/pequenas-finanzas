$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$blockers = 0

function Check-File($rel) {
  $path = Join-Path $root $rel
  if (Test-Path -LiteralPath $path) {
    Write-Host "[GREEN] $rel" -ForegroundColor Green
  } else {
    Write-Host "[RED] Missing: $rel" -ForegroundColor Red
    $script:blockers += 1
  }
}

function Check-Contains($rel, $needle, $label) {
  $path = Join-Path $root $rel
  if (-not (Test-Path -LiteralPath $path)) {
    Write-Host "[RED] $label - missing file: $rel" -ForegroundColor Red
    $script:blockers += 1
    return
  }
  $text = Get-Content -LiteralPath $path -Raw
  if ($text.Contains($needle)) {
    Write-Host "[GREEN] $label" -ForegroundColor Green
  } else {
    Write-Host "[RED] $label" -ForegroundColor Red
    $script:blockers += 1
  }
}

function Check-NotContains($rel, $needle, $label) {
  $path = Join-Path $root $rel
  if (-not (Test-Path -LiteralPath $path)) {
    Write-Host "[RED] $label - missing file: $rel" -ForegroundColor Red
    $script:blockers += 1
    return
  }
  $text = Get-Content -LiteralPath $path -Raw
  if (-not $text.Contains($needle)) {
    Write-Host "[GREEN] $label" -ForegroundColor Green
  } else {
    Write-Host "[RED] $label" -ForegroundColor Red
    $script:blockers += 1
  }
}

Write-Host ''
Write-Host '[VERIFY] Plan 2.1B landscape reflow audit' -ForegroundColor Cyan

$required = @(
  'src\features\shell\components\LandscapeHeader.tsx',
  'src\features\adventure\AdventureMapScreen.tsx',
  'src\app\wallet.tsx',
  'src\app\investments.tsx',
  'src\features\wallet\components\InvestmentPortfolio.tsx',
  'src\app\shop.tsx',
  'src\app\lesson\[id].tsx',
  'src\game-kits\quiz\DecisionQuiz.tsx',
  'src\app\game\[gameId].tsx',
  'src\features\games\coin-catcher\Game.native.tsx',
  'src\features\parents\ParentGate.tsx',
  'src\app\parents.tsx',
  'src\app\settings.tsx',
  'src\app\collection.tsx',
  'docs\design\PLAN_2_1B_LANDSCAPE_REFLOW.md'
)
foreach ($rel in $required) { Check-File $rel }

Check-Contains 'src\features\adventure\AdventureMapScreen.tsx' 'DAYS_PER_SCENE = 9' 'Canvas-like 9-day map scene pattern'
Check-Contains 'src\features\adventure\AdventureMapScreen.tsx' 'mapCompass' 'Map compass preserved'
Check-Contains 'src\features\adventure\AdventureMapScreen.tsx' 'ensureAdventureThrough(highestDay + 18)' 'Infinite map generation hook'
Check-Contains 'src\features\adventure\AdventureMapScreen.tsx' 'mapOffsetX' 'Map position restore preserved'
Check-Contains 'src\features\adventure\AdventureMapScreen.tsx' 'saveMapPosition' 'Map position persistence preserved'
Check-NotContains 'src\features\adventure\AdventureMapScreen.tsx' 'nodeLabel:' 'Per-node white cards removed from map'
Check-NotContains 'src\features\adventure\AdventureMapScreen.tsx' '<Image pointerEvents=' 'React Native Image props remain TypeScript-compatible'

Check-Contains 'src\app\wallet.tsx' "type WalletMode = 'save' | 'invest' | 'history'" 'Wallet master-detail modes'
Check-NotContains 'src\app\wallet.tsx' '<ScrollView' 'Wallet fits landscape without page scroll'
Check-Contains 'src\features\wallet\components\InvestmentPortfolio.tsx' 'chartPane' 'Investment chart primary pane'
Check-Contains 'src\features\wallet\components\InvestmentPortfolio.tsx' 'sidePane' 'Investment supporting pane'
Check-Contains 'src\features\wallet\components\InvestmentPortfolio.tsx' 'onResponderMove' 'Investment chart remains interactive'
Check-NotContains 'src\app\investments.tsx' '<ScrollView' 'Investment screen has no full-page vertical scroll'

Check-Contains 'src\app\shop.tsx' 'selectedId' 'Shop product selection state'
Check-Contains 'src\app\shop.tsx' 'detailPane' 'Shop detail pane'
Check-NotContains 'src\app\lesson\[id].tsx' '<ScrollView' 'Lesson/activity fit landscape without page scroll'
Check-Contains 'src\game-kits\quiz\DecisionQuiz.tsx' "flexBasis: '31%'" 'Activity options use 3-column landscape grid'
Check-NotContains 'src\app\game\[gameId].tsx' '<ScrollView' 'Game route uses fixed landscape panes'

Check-Contains 'src\app\arcade.tsx' 'Mis juegos' 'Arcade preserved'
Check-Contains 'src\app\progress.tsx' 'Tu expedicion financiera' 'Progress screen preserved'

Write-Host ''
Write-Host "PLAN 2.1B SUMMARY: $blockers blocker(s)"
if ($blockers -gt 0) {
  Write-Host 'STATUS: BLOCKED' -ForegroundColor Red
  exit 1
}
Write-Host 'STATUS: CORRECT (static audit)' -ForegroundColor Green
exit 0
