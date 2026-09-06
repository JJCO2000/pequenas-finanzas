$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Fail($message) { Write-Host "[ERROR] $message" -ForegroundColor Red; exit 1 }
function Ok($message) { Write-Host "[OK] $message" -ForegroundColor Green }
function Info($message) { Write-Host "[INFO] $message" -ForegroundColor Cyan }

Info 'Checking Expo/EAS session...'
npx.cmd eas-cli@latest whoami
if ($LASTEXITCODE -ne 0) {
  Info 'No EAS session. Opening login...'
  npx.cmd eas-cli@latest login
  if ($LASTEXITCODE -ne 0) { Fail 'Could not log in to Expo/EAS.' }
}

$app = Get-Content '.\app.json' -Raw | ConvertFrom-Json
$projectId = $null
try { $projectId = $app.expo.extra.eas.projectId } catch {}
if ([string]::IsNullOrWhiteSpace([string]$projectId)) {
  Info 'Project is not linked to EAS yet. Running eas init...'
  npx.cmd eas-cli@latest init
  if ($LASTEXITCODE -ne 0) { Fail 'eas init failed.' }
} else {
  Ok "EAS project already linked: $projectId"
}

npx.cmd eas-cli@latest project:info
if ($LASTEXITCODE -ne 0) { Fail 'Could not query the EAS project.' }
Ok 'EAS ready for development/preview/production.'
exit 0
