<#
.SYNOPSIS
  Runs ONE L1 report-only OaK loop cycle over loop-engineering-upstream, headless.
  Two permission models:
    -Permission allowlist  (DEFAULT, safe)  : explicit --allowedTools / --disallowedTools,
                                               no bypass. Safe to point at a real repo.
    -Permission bypass     (opt-in, fast)   : --permission-mode bypassPermissions.
                                               Only for a throwaway target you don't care about.

.NOTES
  Empirically verified on Claude Code 2.1.218 (headless):
   - A settings.json `allow` list is NOT honored as pre-approval in -p mode; only
     --allowedTools pre-approves. Non-allowed tools are DENIED (not hung), run continues.
   - File-scope rules must use Edit(path) (covers all file-editing tools), not Write(path),
     AND the external state dir must be granted with --add-dir.
   - Deny always wins over allow.
  So the allow/deny policy below lives as CLI flags (effective + reviewable), not settings.
#>
param(
  [ValidateSet('allowlist','bypass')]
  [string]$Permission = 'allowlist',   # safe by default
  [string]$Model = "sonnet",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# --- Paths ---
$Practice  = "C:\Users\YangminRoom1\2026 Claude Practice"
$Target    = Join-Path $Practice "loop-engineering-upstream"   # cwd for the cycle
$RunDir    = Join-Path $Practice "l1-run"
$Ledger    = Join-Path $RunDir  "option-ledger.md"
$RunPrompt = Join-Path $RunDir  "run-prompt.md"
$LogDir    = Join-Path $RunDir  "logs"
$ClaudeCmd = "C:\Users\YangminRoom1\AppData\Roaming\npm\claude.cmd"

# --- Allow/deny policy (allowlist mode). Read-only probes + writes confined to l1-run. ---
# Bash rules are cwd-relative to $Target; git runs in $Target (the repo).
$AllowedTools = @(
  "Bash(node tools/loop-audit/dist/cli.js:*)",
  "Bash(node scripts/validate-registry.mjs:*)",
  "Bash(node scripts/check-loop-init-sync.mjs:*)",
  "Bash(node ../l1-run/verify-committed-tools-runtime.mjs:*)",
  "Bash(git log:*)",
  "Bash(git status:*)",
  "Bash(git diff:*)",
  "Read($RunDir\**)",
  "Read($Target\**)",
  "Edit($RunDir\**)"          # Edit(...) covers Write/Edit/etc.; scoped to l1-run only
)
$DisallowedTools = @(
  "Bash(git push:*)",
  "Bash(git commit:*)",
  "Bash(git add:*)",
  "Bash(npm:*)",
  "Bash(npx:*)",
  "Bash(rm:*)",
  "Bash(del:*)",
  "Edit($Target\**)"          # never edit the watched repo
)

$Stamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
$Log = Join-Path $LogDir "cycle-$Stamp.log"

function Write-Log($msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format "s"), $msg
  Write-Output $line
  Add-Content -Path $Log -Value $line -Encoding utf8
}

Write-Log "=== OaK L1 cycle start (permission=$Permission, model=$Model, dryrun=$DryRun) ==="

foreach ($p in @($Ledger, $RunPrompt)) {
  if (-not (Test-Path $p)) { Write-Log "ABORT: missing $p"; exit 2 }
}
if (-not (Test-Path $ClaudeCmd)) { Write-Log "ABORT: claude.cmd not found at $ClaudeCmd"; exit 2 }

# --- Kill switch ---
if (Select-String -Path $Ledger -Pattern '^\s*loop-pause-all:\s*true' -Quiet) {
  Write-Log "PAUSED: loop-pause-all is true in the ledger. Skipping cycle."; exit 0
}

# --- Build args by permission model ---
# NOTE: single-quote the spaced paths inside the prompt. Embedding double-quotes here
# breaks tokenization when the arg passes through claude.cmd (batch re-parses at spaces).
$Prompt = "Follow the instructions in the file '$RunPrompt' and execute exactly ONE L1 report-only cycle. Report-only: do not mutate the target repo, do not push, do not install; only update files under '$RunDir'. End with the 2-3 line human digest."

if ($Permission -eq 'bypass') {
  $Args = @("-p", $Prompt, "--permission-mode", "bypassPermissions", "--model", $Model)
} else {
  $Args = @("-p", $Prompt, "--permission-mode", "default", "--model", $Model,
            "--add-dir", $RunDir,
            "--allowedTools") + $AllowedTools + @("--disallowedTools") + $DisallowedTools
}

if ($DryRun) {
  Write-Log ("DRYRUN: {0} {1}" -f $ClaudeCmd, ($Args -join ' '))
  Write-Log "=== OaK L1 cycle end (dryrun) ==="; exit 0
}

Push-Location $Target
try {
  Write-Log "Invoking Claude headless (cwd=$Target)..."
  # Capture then append as utf8. Using `*>> $Log` writes UTF-16 into a utf8 file,
  # which renders as "C y c l e  3" mojibake. $LASTEXITCODE stays reliable here.
  $out = & $ClaudeCmd @Args 2>&1
  $code = $LASTEXITCODE
  if ($out) { Add-Content -Path $Log -Value ($out | Out-String).TrimEnd() -Encoding utf8 }
  Write-Log "Claude exited with code $code"
} finally {
  Pop-Location
}

Write-Log "=== OaK L1 cycle end ==="
exit $code
