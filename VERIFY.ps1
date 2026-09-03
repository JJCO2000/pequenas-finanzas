$ErrorActionPreference='Stop'; Set-Location $PSScriptRoot
function Step($name,[scriptblock]$cmd){Write-Host "`n[VERIFY] $name" -ForegroundColor Cyan;& $cmd;if($LASTEXITCODE -ne 0){Write-Host "[FAIL] $name" -ForegroundColor Red;exit 1};Write-Host "[OK] $name" -ForegroundColor Green}
Step 'Expo dependency check' { npx expo install --check }
Step 'Expo Doctor' { npx expo-doctor@latest }
Step 'TypeScript strict' { npx tsc --noEmit }
Step 'Expo public config' { npx expo config --type public }
if(Test-Path '.expo-verify-dist'){Remove-Item '.expo-verify-dist' -Recurse -Force}
Step 'Metro/Hermes Android export' { npx expo export --platform android --output-dir .expo-verify-dist }
Remove-Item '.expo-verify-dist' -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "`n[OK] VERIFY completo. Esto valida código/config/bundle; el APK real se valida con BUILD_ANDROID.ps1." -ForegroundColor Green
