$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$project = $PSScriptRoot
$problems = @()

function Check-File($rel) {
  if (-not (Test-Path -LiteralPath (Join-Path $project $rel) -PathType Leaf)) {
    $script:problems += "Missing file: $rel"
    return $false
  }
  Write-Host "[GREEN] $rel" -ForegroundColor Green
  return $true
}

function Check-Contains($rel, $pattern, $label) {
  $path = Join-Path $project $rel
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    $script:problems += "Missing file for check: $rel"
    return
  }
  $text = Get-Content -LiteralPath $path -Raw
  if ($text -notmatch $pattern) {
    $script:problems += $label
  } else {
    Write-Host "[GREEN] $label" -ForegroundColor Green
  }
}

Write-Host ''
Write-Host '[VERIFY] Plan 2.1C camp menu/navigation audit' -ForegroundColor Cyan

$targets = @(
  'src\features\adventure\AdventureMapScreen.tsx',
  'src\features\shell\navigation\useCampBack.ts',
  'src\app\wallet.tsx',
  'src\app\investments.tsx',
  'src\app\arcade.tsx',
  'src\app\progress.tsx',
  'src\app\collection.tsx',
  'src\app\parents.tsx',
  'src\app\settings.tsx'
)
foreach ($rel in $targets) { [void](Check-File $rel) }

Check-Contains 'src\features\adventure\AdventureMapScreen.tsx' 'menuGrid' 'Camp menu uses compact grid layout'
Check-Contains 'src\features\adventure\AdventureMapScreen.tsx' 'const path = `\$\{route\}\?from=camp`;[\s\S]*router\.push\(path as any\)' 'Camp child routes carry origin=camp through typed-route bridge'
Check-Contains 'src\features\adventure\AdventureMapScreen.tsx' "width:\s*'48\.8%'" 'Camp buttons use two-column width'
Check-Contains 'src\features\adventure\AdventureMapScreen.tsx' "campRequested" 'Map can reopen camp after child return'
Check-Contains 'src\features\shell\navigation\useCampBack.ts' "pathname:\s*'/play'.*camp:\s*'1'" 'Camp back helper returns to map with camp reopened'

foreach ($rel in @(
  'src\app\wallet.tsx',
  'src\app\investments.tsx',
  'src\app\arcade.tsx',
  'src\app\progress.tsx',
  'src\app\collection.tsx',
  'src\app\parents.tsx',
  'src\app\settings.tsx'
)) {
  Check-Contains $rel 'useCampBack' "Camp-aware back wired: $rel"
}

if ($problems.Count -gt 0) {
  Write-Host ''
  Write-Host "PLAN 2.1C SUMMARY: $($problems.Count) blocker(s)" -ForegroundColor Red
  $problems | ForEach-Object { Write-Host "[RED] $_" -ForegroundColor Red }
  exit 1
}

Write-Host ''
Write-Host 'PLAN 2.1C SUMMARY: 0 blocker(s)' -ForegroundColor Green
Write-Host 'STATUS: CORRECT (static audit)' -ForegroundColor Green
exit 0
