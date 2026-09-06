$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
Write-Host '[INFO] Pequenas Finanzas - Development Build through tunnel' -ForegroundColor Cyan
Write-Host '[INFO] Use this if the phone cannot reach Metro over LAN.' -ForegroundColor DarkGray
npx.cmd expo start --dev-client --clear --tunnel
if ($LASTEXITCODE -ne 0) { exit 1 }
