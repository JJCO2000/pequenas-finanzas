param([switch]$NonInteractive)
$ErrorActionPreference='Continue'
Write-Host 'Herramientas opcionales de datos — pandas NO es la DB de la app.' -ForegroundColor Cyan
if(Get-Command code -ErrorAction SilentlyContinue){foreach($e in @('expo.vscode-expo-tools','ms-python.python','ms-toolsai.jupyter','google.colab')){code --install-extension $e --force}}else{Write-Host '[WARN] VS Code CLI no está en PATH.' -ForegroundColor Yellow}
if(Get-Command python -ErrorAction SilentlyContinue){python -m pip install --upgrade pandas jupyter}else{Write-Host '[WARN] Python no está instalado; Colab puede ejecutar el notebook sin Python local.' -ForegroundColor Yellow}
