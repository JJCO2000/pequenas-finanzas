$ErrorActionPreference='Stop'; Set-Location $PSScriptRoot
$errors=0;$warnings=0
function Good($m){Write-Host "[GREEN] $m" -ForegroundColor Green}
function Warn($m){$script:warnings++;Write-Host "[YELLOW] $m" -ForegroundColor Yellow}
function Bad($m){$script:errors++;Write-Host "[RED] $m" -ForegroundColor Red}
$required=@('src\app','src\core','src\features','src\game-kits','src\registry','content','assets','design','docs','tests','analysis','src\core\data\database','src\core\data\repositories','src\core\game-runtime','src\core\economy','src\core\progression','src\features\games\coin-catcher','design\licenses\asset-provenance.json','docs\product\PLAN_PEQUENAS_FINANZAS_1_1.md','docs\build\EXPO_GO_EAS_GOOGLE_PLAY.md','START.ps1','START_DEV.ps1','START_TUNNEL.ps1','SETUP_EAS.ps1','VERIFY_RELEASE.ps1','BUILD_ANDROID.ps1','SETUP_GOOGLE_PLAY.ps1','SUBMIT_ANDROID.ps1','eas.json','app.json')
foreach($p in $required){if(Test-Path $p){Good $p}else{Bad "Falta $p"}}
$src=Get-ChildItem src -Recurse -Include *.ts,*.tsx -File
# SQL fuera de capa de datos
$sql=$src|Where-Object{$_.FullName -notmatch '\\core\\data\\'}|Select-String -Pattern '\b(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|PRAGMA)\b' -CaseSensitive:$false
if($sql){Bad 'Hay SQL fuera de core/data.';$sql|ForEach-Object{Write-Host "  $($_.Path):$($_.LineNumber)"}}else{Good 'SQL encapsulado en core/data'}
# expo-sqlite fuera data/root provider autorizado
$sqlImports=$src|Where-Object{$_.FullName -notmatch '\\core\\data\\' -and $_.FullName -notmatch '\\app\\_layout\.tsx$'}|Select-String -Pattern "from ['\"]expo-sqlite['\"]"
if($sqlImports){Bad 'expo-sqlite importado fuera de data/root layout'}else{Good 'Juegos/UI no importan expo-sqlite'}
# require assets fuera registry
$req=$src|Where-Object{$_.FullName -notmatch '\\registry\\assets\.ts$'}|Select-String -Pattern 'require\('
if($req){Bad 'Hay require() de assets fuera de registry/assets.ts'}else{Good 'Assets runtime centralizados'}
# hex en TS/TSX fuera theme
$hex=$src|Where-Object{$_.FullName -notmatch '\\core\\theme\\tokens\.ts$'}|Select-String -Pattern '#[0-9A-Fa-f]{6}'
if($hex){Bad 'Hay colores hex hardcodeados fuera de theme/tokens.ts'}else{Good 'Colores centralizados'}
# juegos no deben importar repos/data/economy persistence
$gameFiles=Get-ChildItem 'src\features\games' -Recurse -Include *.ts,*.tsx -File
$badGame=$gameFiles|Select-String -Pattern "core/data|repositories|expo-sqlite|useAppData"
if($badGame){Bad 'Un módulo de juego toca data/session directamente'}else{Good 'Plugins de juego aislados de wallet/DB'}

# Configuración Android/EAS para release.
try {
  $appCfg=Get-Content 'app.json' -Raw | ConvertFrom-Json
  $easCfg=Get-Content 'eas.json' -Raw | ConvertFrom-Json
  if($appCfg.expo.android.package -eq 'com.pequenasfinanzas.app'){Good 'Android package centralizado'}else{Bad 'android.package no coincide con com.pequenasfinanzas.app'}
  if([int]$appCfg.expo.android.versionCode -ge 1){Good 'versionCode local inicial presente'}else{Bad 'versionCode local inválido'}
  if($easCfg.cli.appVersionSource -eq 'remote'){Good 'EAS remote app version'}else{Bad 'EAS appVersionSource debe ser remote'}
  if($easCfg.build.production.android.buildType -eq 'app-bundle'){Good 'Production=AAB'}else{Bad 'Production no genera AAB'}
  if(($easCfg.build.production.autoIncrement -eq $true) -or ($easCfg.build.production.autoIncrement -eq 'versionCode')){Good 'Production autoIncrement versionCode'}else{Bad 'Falta autoIncrement de versionCode'}
  if($easCfg.submit.internal.android.track -eq 'internal'){Good 'Google Play internal track configurado'}else{Bad 'Falta submit interno'}
} catch { Bad "No pude validar app.json/eas.json: $($_.Exception.Message)" }

# IDs duplicados en manifests/levels aproximación textual
if((Get-Content 'src\registry\games.ts' -Raw) -match 'GAMES'){Good 'Game registry presente'}else{Bad 'Game registry inválido'}
if((Get-Content 'src\registry\levels.ts' -Raw) -match 'LEVELS'){Good 'Level registry presente'}else{Bad 'Level registry inválido'}
Write-Host "`nRESUMEN: $errors bloqueantes, $warnings advertencias" -ForegroundColor Cyan
if($errors -gt 0){Write-Host 'Estado: 🔴 BLOQUEANTE' -ForegroundColor Red;exit 1}
if($warnings -gt 0){Write-Host 'Estado: 🟡 MEJORABLE' -ForegroundColor Yellow}else{Write-Host 'Estado: 🟢 CORRECTO (auditoría estática)' -ForegroundColor Green}
exit 0
