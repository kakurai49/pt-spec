param(
    [Parameter(Mandatory = $true)]
    [string]$AppExe,
    [int]$EventMinutes = 30,
    [string]$OutputDir = "automation/artifacts"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $AppExe)) {
    throw "APP_EXE does not exist: $AppExe"
}

$resolvedAppExe = (Resolve-Path -LiteralPath $AppExe).Path
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$sessionDir = Join-Path $OutputDir "diag_$timestamp"
New-Item -ItemType Directory -Path $sessionDir -Force | Out-Null

$envInfo = Join-Path $sessionDir "env.txt"
$eventInfo = Join-Path $sessionDir "eventlog.txt"
$appRunInfo = Join-Path $sessionDir "app_run.txt"

"APP_EXE=$resolvedAppExe" | Out-File -FilePath $envInfo -Encoding utf8
"Python: $(Get-Command python | Select-Object -ExpandProperty Source)" | Out-File -FilePath $envInfo -Append -Encoding utf8
"PowerShell: $($PSVersionTable.PSVersion)" | Out-File -FilePath $envInfo -Append -Encoding utf8
"Windows: $([System.Environment]::OSVersion.VersionString)" | Out-File -FilePath $envInfo -Append -Encoding utf8

"=== App launch (no --e2e) ===" | Out-File -FilePath $appRunInfo -Encoding utf8
$proc = Start-Process -FilePath $resolvedAppExe -PassThru
Start-Sleep -Seconds 5
if (-not $proc.HasExited) {
    Stop-Process -Id $proc.Id -Force
    "Exit: forced termination after 5s (no --e2e)" | Out-File -FilePath $appRunInfo -Append -Encoding utf8
} else {
    "Exit code (no --e2e): $($proc.ExitCode)" | Out-File -FilePath $appRunInfo -Append -Encoding utf8
}

"=== App launch (--e2e) ===" | Out-File -FilePath $appRunInfo -Append -Encoding utf8
$procE2e = Start-Process -FilePath $resolvedAppExe -ArgumentList "--e2e" -PassThru
Start-Sleep -Seconds 5
if (-not $procE2e.HasExited) {
    Stop-Process -Id $procE2e.Id -Force
    "Exit: forced termination after 5s (--e2e)" | Out-File -FilePath $appRunInfo -Append -Encoding utf8
} else {
    "Exit code (--e2e): $($procE2e.ExitCode)" | Out-File -FilePath $appRunInfo -Append -Encoding utf8
}

$startTime = (Get-Date).AddMinutes(-1 * $EventMinutes)
"=== Application error events (last $EventMinutes minutes) ===" | Out-File -FilePath $eventInfo -Encoding utf8
$events = Get-WinEvent -FilterHashtable @{ LogName = "Application"; StartTime = $startTime } -ErrorAction SilentlyContinue |
    Where-Object { $_.Id -in 1000, 1001 }
if (-not $events) {
    "No matching events found." | Out-File -FilePath $eventInfo -Append -Encoding utf8
} else {
    $events |
        Select-Object TimeCreated, Id, LevelDisplayName, ProviderName, Message |
        Format-List | Out-File -FilePath $eventInfo -Append -Encoding utf8
}

"Output directory: $sessionDir" | Write-Output
