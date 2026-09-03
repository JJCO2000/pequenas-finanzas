$ErrorActionPreference='Stop'
Set-Location $PSScriptRoot

Write-Host '======================================================' -ForegroundColor DarkGreen
Write-Host ' GOOGLE PLAY - PREPARAR EAS SUBMIT' -ForegroundColor Green
Write-Host '======================================================' -ForegroundColor DarkGreen
Write-Host 'Este script NO puede crear tu cuenta de desarrollador ni completar por ti las declaraciones de Play Console.' -ForegroundColor Yellow
Write-Host 'Antes de continuar debes:' -ForegroundColor Cyan
Write-Host '  1) Tener cuenta de Google Play Developer.'
Write-Host '  2) Crear la app Pequeñas Finanzas en Play Console con package com.pequenasfinanzas.app.'
Write-Host '  3) Tener un Google Service Account JSON con permisos de Play Console.'
Write-Host ''
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\SETUP_EAS.ps1'
if($LASTEXITCODE -ne 0){exit 1}
Write-Host ''
Write-Host '[INFO] Abriendo gestor de credenciales EAS Android.' -ForegroundColor Cyan
Write-Host '[INFO] Elige: production -> Google Service Account -> Upload a Google Service Account Key.' -ForegroundColor Cyan
Write-Host '[SECURITY] No guardes el JSON dentro del repositorio ni del ZIP.' -ForegroundColor Yellow

npx eas-cli@latest credentials --platform android
if($LASTEXITCODE -ne 0){exit 1}
