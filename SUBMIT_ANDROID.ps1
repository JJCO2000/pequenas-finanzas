param([ValidateSet('internal','production')][string]$Track = 'internal')
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\SETUP_EAS.ps1'
if ($LASTEXITCODE -ne 0) { exit 1 }
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\VERIFY_RELEASE.ps1'
if ($LASTEXITCODE -ne 0) { exit 1 }

if ($Track -eq 'production') {
  Write-Host '[WARNING] This selects the PRODUCTION track in Google Play.' -ForegroundColor Red
  $confirmation = Read-Host 'Type PRODUCCION to continue'
  if ($confirmation -ne 'PRODUCCION') {
    Write-Host '[CANCELLED] Nothing was submitted to production.' -ForegroundColor Yellow
    exit 0
  }
} else {
  Write-Host '[INFO] The latest AAB will be submitted to Google Play INTERNAL testing.' -ForegroundColor Cyan
}

Write-Host '[INFO] If EAS does not have the Google Service Account Key yet, run .\SETUP_GOOGLE_PLAY.ps1 first.' -ForegroundColor Yellow
npx.cmd eas-cli@latest submit --platform android --profile $Track --latest
if ($LASTEXITCODE -ne 0) {
  Write-Host '[ERROR] Submit failed. Verify the Play Console app and EAS Service Account Key.' -ForegroundColor Red
  exit 1
}
Write-Host "[OK] Submission sent to Google Play ($Track)." -ForegroundColor Green
exit 0
