$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$parseErrors = @()
$files = @(Get-ChildItem -Path $PSScriptRoot -Filter '*.ps1' -File)
$files += @(Get-ChildItem -Path (Join-Path $PSScriptRoot 'scripts') -Filter '*.ps1' -File -Recurse -ErrorAction SilentlyContinue)
$files = @($files | Sort-Object FullName -Unique)

foreach ($file in $files) {
  $tokens = $null
  $errors = $null
  [void][System.Management.Automation.Language.Parser]::ParseFile($file.FullName, [ref]$tokens, [ref]$errors)
  if ($errors -and $errors.Count -gt 0) {
    foreach ($err in $errors) {
      $parseErrors += [pscustomobject]@{
        File = $file.FullName
        Line = $err.Extent.StartLineNumber
        Column = $err.Extent.StartColumnNumber
        Message = $err.Message
      }
    }
  }
}

if ($parseErrors.Count -gt 0) {
  Write-Host '[FAIL] PowerShell parser found errors:' -ForegroundColor Red
  foreach ($err in $parseErrors) {
    Write-Host ("  {0}:{1}:{2} - {3}" -f $err.File, $err.Line, $err.Column, $err.Message) -ForegroundColor Red
  }
  exit 1
}

Write-Host ("[OK] PowerShell syntax: {0} script(s) parsed without errors." -f $files.Count) -ForegroundColor Green
exit 0
