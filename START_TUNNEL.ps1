$ErrorActionPreference='Stop'
Set-Location $PSScriptRoot
Write-Host '[INFO] Expo Go por tunnel. Úsalo si el teléfono no ve Metro por LAN.' -ForegroundColor Cyan
npx expo start --go --clear --tunnel
if($LASTEXITCODE -ne 0){exit 1}
