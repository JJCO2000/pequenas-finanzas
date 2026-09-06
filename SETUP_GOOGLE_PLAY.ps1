$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host '======================================================' -ForegroundColor DarkGreen
Write-Host ' GOOGLE PLAY - PREPARE EAS SUBMIT' -ForegroundColor Green
Write-Host '======================================================' -ForegroundColor DarkGreen
Write-Host 'This script cannot create your developer account or complete Play Console declarations.' -ForegroundColor Yellow
Write-Host 'Before continuing:' -ForegroundColor Cyan
Write-Host '  1) Have a Google Play Developer account.'
Write-Host '  2) Create Pequenas Finanzas in Play Console with package com.pequenasfinanzas.app.'
Write-Host '  3) Have a Google Service Account JSON with Play Console permissions.'
Write-Host ''
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\SETUP_EAS.ps1'
if ($LASTEXITCODE -ne 0) { exit 1 }
Write-Host ''
Write-Host '[INFO] Opening EAS Android credential manager.' -ForegroundColor Cyan
Write-Host '[INFO] Choose production -> Google Service Account -> Upload a Google Service Account Key.' -ForegroundColor Cyan
Write-Host '[SECURITY] Do not store that JSON inside the repository or ZIP.' -ForegroundColor Yellow

npx.cmd eas-cli@latest credentials --platform android
if ($LASTEXITCODE -ne 0) { exit 1 }
exit 0
