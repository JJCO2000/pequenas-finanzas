$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
Write-Host '[INFO] Pequenas Finanzas - Development Build with clean cache' -ForegroundColor Cyan
Write-Host '[INFO] SDK 57 project: development build is the canonical device runtime.' -ForegroundColor DarkGray
Write-Host '[INFO] First install a development APK with: .\BUILD_ANDROID.ps1 -Profile development' -ForegroundColor Yellow
npx.cmd expo start --dev-client --clear
if ($LASTEXITCODE -ne 0) { exit 1 }
