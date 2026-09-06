$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Run-Step($name, [scriptblock]$command) {
  Write-Host ''
  Write-Host "[VERIFY] $name" -ForegroundColor Cyan
  & $command
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] $name" -ForegroundColor Red
    exit 1
  }
  Write-Host "[OK] $name" -ForegroundColor Green
}

function Assert-ConfigSanity {
  $app = Get-Content '.\app.json' -Raw | ConvertFrom-Json
  if ($app.expo.PSObject.Properties.Name -contains 'newArchEnabled') {
    Write-Host '[FAIL] app.json contains unsupported newArchEnabled.' -ForegroundColor Red
    exit 1
  }
  if (-not $app.expo.android.package) {
    Write-Host '[FAIL] app.json is missing expo.android.package.' -ForegroundColor Red
    exit 1
  }
  Write-Host '[OK] Expo config sanity' -ForegroundColor Green
}

Run-Step 'PowerShell syntax' { powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\CHECK_POWERSHELL.ps1' }
Run-Step 'Plan 1.1 architecture audit' { powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\AUDIT_PLAN_1_1.ps1' }
Run-Step 'Plan 1.1 runtime config' { node '.\scripts\check-plan-runtime.mjs' }
Run-Step 'Plan 7 Games Block 0 SSOT' { node '.\scripts\check-plan7-block0.mjs' }
Run-Step 'Investment companion compatibility' { node '.\scripts\check-investment-step.mjs' }
Run-Step 'Plan 2.1 design/gameplay audit' { powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\AUDIT_PLAN_2_1.ps1' }
Run-Step 'Plan 2.1 runtime invariants' { node '.\scripts\check-plan21-runtime.mjs' }
Run-Step 'Plan 2.1 policy tests' { node '.\tests\unit\plan21-policies.spec.mjs' }
Run-Step 'Plan 2.1D playable game catalog' { node '.\scripts\check-games21d-runtime.mjs' }
Run-Step 'Coin Catcher UI-runtime worklets' { node '.\scripts\check-coin-catcher-worklets.mjs' }
Run-Step 'Navigation return regression guard' { node '.\scripts\check-navigation-return.mjs' }
Run-Step 'Android immersive system bars guard' { node '.\scripts\check-immersive-system-bars.mjs' }
Run-Step 'Readable typography floor guard' { node '.\scripts\check-readable-type.mjs' }
Run-Step 'SFX runtime wiring guard' { node '.\scripts\check-sfx-runtime.mjs' }
Run-Step 'Egg power clarity and invariant guard' { node '.\scripts\check-egg-power-clarity.mjs' }
Run-Step 'Game result resilience guard' { node '.\scripts\check-game-result-resilience.mjs' }
Run-Step 'Financial movement direction guard' { node '.\scripts\check-financial-direction.mjs' }
Run-Step 'Bounded local change journal guard' { node '.\scripts\check-local-journal.mjs' }

Write-Host ''
Write-Host '[VERIFY] Expo config sanity' -ForegroundColor Cyan
Assert-ConfigSanity

Run-Step 'Required direct peer: expo-asset' { npm.cmd ls expo-asset --depth=0 }
Run-Step 'Expo dependency check' { npx.cmd expo install --check }
Run-Step 'Expo Doctor' { npx.cmd --yes expo-doctor@latest }
Run-Step 'TypeScript strict' { npx.cmd tsc --noEmit }
Run-Step 'Expo public config' { npx.cmd expo config --type public }

if (Test-Path '.expo-verify-dist') {
  Remove-Item '.expo-verify-dist' -Recurse -Force
}
Run-Step 'Metro/Hermes Android export' { npx.cmd expo export --platform android --output-dir '.expo-verify-dist' }
Remove-Item '.expo-verify-dist' -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ''
Write-Host '[OK] VERIFY complete. No blocking errors found.' -ForegroundColor Green
exit 0
