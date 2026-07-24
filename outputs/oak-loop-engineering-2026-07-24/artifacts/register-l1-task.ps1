<#
.SYNOPSIS
  Register (or remove) a Windows Scheduled Task that runs one L1 OaK loop cycle daily.

.EXAMPLE
  # Register a daily 09:00 run (runs only while you're logged on, as you):
  powershell -NoProfile -ExecutionPolicy Bypass -File .\register-l1-task.ps1

  # Different time / model:
  .\register-l1-task.ps1 -Time 08:30 -Model opus

  # Remove it:
  .\register-l1-task.ps1 -Action Unregister

.NOTES
  - LogonType = Interactive: the task runs as the logged-on user so the Claude CLI's
    auth (stored in your user profile) is present. It will NOT run when you're logged off.
    That's deliberate — a background/system context won't have your Claude login
    (see the environment split note in project memory). For true logged-off runs you'd
    need stored credentials + a service-context login, which is out of scope here.
  - The task self-limits to one cycle/day and honors the ledger kill switch.
#>
param(
  [ValidateSet('Register','Unregister')]
  [string]$Action = 'Register',
  [string]$Time   = '09:00',
  [string]$Model  = 'sonnet',
  [string]$TaskName = 'OaK-L1-LoopEngineering'
)

$ErrorActionPreference = "Stop"
$RunDir = "C:\Users\YangminRoom1\2026 Claude Practice\l1-run"
$Script = Join-Path $RunDir "run-l1-cycle.ps1"

if ($Action -eq 'Unregister') {
  if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Output "Removed scheduled task '$TaskName'."
  } else {
    Write-Output "No scheduled task named '$TaskName' found."
  }
  return
}

if (-not (Test-Path $Script)) { throw "Cannot find $Script" }

# NOTE: do NOT name these $action/$Action — that collides with the [ValidateSet] param
# above (PowerShell variables are case-insensitive) and fails validation.
$psArgs = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$Script`" -Model $Model"
$taskAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $psArgs -WorkingDirectory $RunDir
$taskTrigger = New-ScheduledTaskTrigger -Daily -At $Time
$taskPrincipal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
$taskSettings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 30) -MultipleInstances IgnoreNew

# Replace if it already exists
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Register-ScheduledTask -TaskName $TaskName -Action $taskAction -Trigger $taskTrigger `
  -Principal $taskPrincipal -Settings $taskSettings `
  -Description "OaK loop-engineering L1 report-only cycle (daily). Honors ledger kill switch." | Out-Null

Write-Output "Registered '$TaskName': daily at $Time, model=$Model, runs as $env:USERNAME when logged on."
Write-Output "Run once now to test:  Start-ScheduledTask -TaskName '$TaskName'"
Write-Output "Watch logs in:         $RunDir\logs\"
Write-Output "Pause without removing: set 'loop-pause-all: true' in option-ledger.md"
