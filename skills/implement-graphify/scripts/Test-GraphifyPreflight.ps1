[CmdletBinding()]
param(
    [string]$RepoPath = '.',
    [ValidateSet('CodeOnly', 'Semantic')]
    [string]$Mode = 'CodeOnly'
)

# 解析 repository root；Semantic 模式發現敏感候選時會中止。
$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path -LiteralPath $RepoPath).Path
$isGitRepo = $false
try {
    $gitResult = git -C $repoRoot rev-parse --is-inside-work-tree 2>$null
    $isGitRepo = ($LASTEXITCODE -eq 0 -and $gitResult -eq 'true')
} catch {
    $isGitRepo = $false
}

# Git repository 僅列出未被 ignore 的路徑；不讀取檔案內容。
$candidateFiles = @()
if ($isGitRepo) {
    $candidateFiles = @(git -C $repoRoot ls-files -co --exclude-standard 2>$null)
}

$sensitiveExtensions = @('.edf', '.bdf', '.fif', '.set', '.npy', '.npz', '.mat', '.csv', '.tsv', '.parquet')
$sensitiveCandidates = @()
foreach ($relativePath in $candidateFiles) {
    $extension = [System.IO.Path]::GetExtension($relativePath).ToLowerInvariant()
    if ($sensitiveExtensions -contains $extension) {
        $sensitiveCandidates += $extension
    }
}

$graphifyCommand = Get-Command graphify -ErrorAction SilentlyContinue
$graphifyVersion = $null
if ($null -ne $graphifyCommand) {
    $graphifyVersion = ((& graphify --version 2>&1) | Out-String).Trim()
}

$pythonVersion = $null
if ($null -ne (Get-Command python -ErrorAction SilentlyContinue)) {
    $pythonVersion = ((& python --version 2>&1) | Out-String).Trim()
}

$dirtyCount = $null
if ($isGitRepo) {
    $dirtyCount = @(git -C $repoRoot status --porcelain 2>$null).Count
}

$result = [PSCustomObject]@{
    Repository = $repoRoot
    Mode = $Mode
    IsGitRepository = $isGitRepo
    CandidateFileCount = $candidateFiles.Count
    SensitiveCandidateCount = $sensitiveCandidates.Count
    GraphifyInstalled = ($null -ne $graphifyCommand)
    GraphifyVersion = $graphifyVersion
    PythonVersion = $pythonVersion
    HasAgentsMd = (Test-Path -LiteralPath (Join-Path $repoRoot 'AGENTS.md'))
    HasGraphJson = (Test-Path -LiteralPath (Join-Path $repoRoot 'graphify-out\graph.json'))
    GitDirtyEntryCount = $dirtyCount
}

$result
if (($Mode -eq 'Semantic') -and ($sensitiveCandidates.Count -ne 0)) { exit 3 }
exit 0
