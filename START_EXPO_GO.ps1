$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
Write-Host '[WARN] This project uses Expo SDK 57.' -ForegroundColor Yellow
Write-Host '[WARN] The store version of Expo Go may target a different SDK. Use this only if a compatible Expo Go build is installed.' -ForegroundColor Yellow
Write-Host '[INFO] Canonical runtime for this project is START.ps1 (development build).' -ForegroundColor Cyan
npx.cmd expo start --go --clear
if ($LASTEXITCODE -ne 0) { exit 1 }
