$ErrorActionPreference='Stop'
Set-Location $PSScriptRoot

function Fail($m){Write-Host "[ERROR] $m" -ForegroundColor Red;exit 1}
function Ok($m){Write-Host "[OK] $m" -ForegroundColor Green}
function Info($m){Write-Host "[INFO] $m" -ForegroundColor Cyan}

Info 'Comprobando sesión Expo/EAS...'
npx eas-cli@latest whoami
if($LASTEXITCODE -ne 0){
  Info 'No hay sesión EAS. Abriendo login...'
  npx eas-cli@latest login
  if($LASTEXITCODE -ne 0){Fail 'No se pudo iniciar sesión en Expo/EAS.'}
}

$app = Get-Content '.\app.json' -Raw | ConvertFrom-Json
$projectId = $null
try{$projectId = $app.expo.extra.eas.projectId}catch{}
if([string]::IsNullOrWhiteSpace([string]$projectId)){
  Info 'El proyecto aún no está vinculado a EAS. Ejecutando eas init...'
  npx eas-cli@latest init
  if($LASTEXITCODE -ne 0){Fail 'eas init falló.'}
}else{
  Ok "Proyecto EAS ya vinculado: $projectId"
}

npx eas-cli@latest project:info
if($LASTEXITCODE -ne 0){Fail 'No pude consultar el proyecto EAS.'}
Ok 'EAS listo para development/preview/production.'
