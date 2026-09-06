param([switch]$NonInteractive)
$ErrorActionPreference = 'Continue'
Write-Host 'Optional data tools. pandas is NOT the application database.' -ForegroundColor Cyan
if (Get-Command code -ErrorAction SilentlyContinue) {
  foreach ($extension in @('expo.vscode-expo-tools','ms-python.python','ms-toolsai.jupyter','google.colab')) {
    code --install-extension $extension --force
  }
} else {
  Write-Host '[WARN] VS Code CLI is not in PATH.' -ForegroundColor Yellow
}
if (Get-Command python -ErrorAction SilentlyContinue) {
  python -m pip install --upgrade pandas jupyter
} else {
  Write-Host '[WARN] Python is not installed. Google Colab can still run the notebook remotely.' -ForegroundColor Yellow
}
exit 0
