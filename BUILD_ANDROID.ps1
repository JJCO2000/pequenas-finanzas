param([ValidateSet('development','preview','production')][string]$Profile = 'preview')
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\SETUP_EAS.ps1'
if ($LASTEXITCODE -ne 0) { exit 1 }

if ($Profile -eq 'production') {
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\VERIFY_RELEASE.ps1'
} else {
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\VERIFY.ps1'
}
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "[INFO] EAS Build Android - profile: $Profile" -ForegroundColor Cyan
switch ($Profile) {
  'development' { Write-Host '[INFO] Development Client: installable development APK.' -ForegroundColor Yellow }
  'preview' { Write-Host '[INFO] Preview: directly installable Android APK.' -ForegroundColor Yellow }
  'production' { Write-Host '[INFO] Production: signed AAB for Google Play with remote auto-incremented versionCode.' -ForegroundColor Yellow }
}

npx.cmd eas-cli@latest build --platform android --profile $Profile
if ($LASTEXITCODE -ne 0) { exit 1 }

if ($Profile -eq 'production') {
  Write-Host ''
  Write-Host '[OK] Production build requested.' -ForegroundColor Green
  Write-Host '[NEXT] When it finishes, submit the latest AAB to internal testing with:' -ForegroundColor Yellow
  Write-Host '  .\SUBMIT_ANDROID.ps1 -Track internal' -ForegroundColor Yellow
}
exit 0
