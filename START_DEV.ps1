$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
Write-Host '[INFO] Pequenas Finanzas - Development Build with clean cache' -ForegroundColor Cyan
Write-Host '[INFO] Requires a development build installed from BUILD_ANDROID.ps1 -Profile development.' -ForegroundColor DarkGray
npx.cmd expo start --dev-client --clear
if ($LASTEXITCODE -ne 0) { exit 1 }
