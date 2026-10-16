param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')]
    [string]$NotebookId,

    [Parameter(Mandatory = $true)]
    [string]$OutputDirectory,

    [string]$NlmPath,

    [switch]$Force
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$utf8 = New-Object System.Text.UTF8Encoding($false)
$exportedAt = Get-Date

function Resolve-NlmPath {
    if (-not [string]::IsNullOrWhiteSpace($NlmPath)) {
        if (-not (Test-Path -LiteralPath $NlmPath -PathType Leaf)) {
            throw "nlm executable not found: $NlmPath"
        }
        return (Get-Item -LiteralPath $NlmPath).FullName
    }

    $command = Get-Command nlm -ErrorAction SilentlyContinue
    if ($null -ne $command) { return $command.Source }

    $fallback = 'C:\Users\User\.local\bin\nlm.exe'
    if (Test-Path -LiteralPath $fallback -PathType Leaf) { return $fallback }

    throw 'nlm was not found in PATH or C:\Users\User\.local\bin\nlm.exe.'
}

function Invoke-NlmJson {
    param([string[]]$Arguments)

    $raw = & $script:nlm @Arguments
    if ($LASTEXITCODE -ne 0) { throw "nlm command failed: $($Arguments -join ' ')" }
    return (($raw -join "`n") | ConvertFrom-Json)
}

function ConvertTo-SafeName {
    param([string]$Title, [string]$Id)

    $name = $Title
    foreach ($character in [IO.Path]::GetInvalidFileNameChars()) {
        $name = $name.Replace([string]$character, '_')
    }
    $name = ($name -replace '\s+', ' ').Trim().TrimEnd('.')
    if ([string]::IsNullOrWhiteSpace($name)) { $name = 'untitled' }
    if ($name.Length -gt 100) { $name = $name.Substring(0, 100).Trim() }
    return "$name--$($Id.Substring(0, 8)).md"
}

function ConvertTo-YamlScalar {
    param([AllowEmptyString()][string]$Value)

    return '"' + $Value.Replace('\', '\\').Replace('"', '\"').Replace("`r", ' ').Replace("`n", ' ') + '"'
}

function New-FrontMatter {
    param(
        [string]$Title,
        [string]$Date,
        [string]$ArtifactId,
        [string]$ArtifactType,
        [string]$NotebookTitle
    )

    return (@(
        '---'
        "title: $(ConvertTo-YamlScalar $Title)"
        "date: $(ConvertTo-YamlScalar $Date)"
        'tags:'
        '  - NotebookLM'
        "  - $ArtifactType"
        'category: NotebookLM Export'
        "notebook_id: $NotebookId"
        "artifact_id: $ArtifactId"
        "artifact_type: $ArtifactType"
        "source_notebook: $(ConvertTo-YamlScalar $NotebookTitle)"
        '---'
        ''
    ) -join "`n")
}

function Write-Utf8 {
    param([string]$Path, [string]$Content)
    [IO.File]::WriteAllText($Path, $Content, $utf8)
}

function ConvertTo-MarkdownTable {
    param([string]$CsvPath)

    $rows = @(Import-Csv -LiteralPath $CsvPath)
    if ($rows.Count -eq 0) { return '_Empty data table._' }

    $columns = @($rows[0].PSObject.Properties.Name)
    $lines = [Collections.Generic.List[string]]::new()
    $lines.Add('| ' + (($columns | ForEach-Object { ([string]$_).Replace('|', '\|') }) -join ' | ') + ' |')
    $lines.Add('| ' + (($columns | ForEach-Object { '---' }) -join ' | ') + ' |')

    foreach ($row in $rows) {
        $cells = foreach ($column in $columns) {
            ([string]$row.$column).Replace('|', '\|').Replace("`r", ' ').Replace("`n", '<br>')
        }
        $lines.Add('| ' + ($cells -join ' | ') + ' |')
    }
    return ($lines -join "`n")
}

$script:nlm = Resolve-NlmPath
$outputPath = [IO.Path]::GetFullPath($OutputDirectory)

if (Test-Path -LiteralPath $outputPath) {
    $existing = @(Get-ChildItem -LiteralPath $outputPath -Force)
    if ($existing.Count -gt 0 -and -not $Force) {
        throw "Output directory is not empty. Use -Force only after explicit approval: $outputPath"
    }
} else {
    New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
}

& $script:nlm login --check | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'NotebookLM authentication is invalid. Run: nlm login' }

$notebooks = @(Invoke-NlmJson @('notebook', 'list', '--json', '--full'))
$notebook = $notebooks | Where-Object { $_.id -eq $NotebookId } | Select-Object -First 1
if ($null -eq $notebook) { throw "Notebook is not accessible with the active profile: $NotebookId" }

$artifacts = @(Invoke-NlmJson @('studio', 'status', $NotebookId, '--json', '--full'))
$notesResult = Invoke-NlmJson @('note', 'list', $NotebookId, '--json')
$completedArtifacts = @($artifacts | Where-Object { $_.status -eq 'completed' })
$artifactById = @{}
foreach ($artifact in $completedArtifacts) { $artifactById[$artifact.id] = $artifact }

$exported = [Collections.Generic.List[object]]::new()

foreach ($note in @($notesResult.notes)) {
    $artifact = $null
    if ($artifactById.ContainsKey($note.id)) { $artifact = $artifactById[$note.id] }
    $type = if ($null -ne $artifact -and $artifact.type -eq 'mind_map') { 'mind-map' } else { 'note' }
    $folderName = if ($type -eq 'mind-map') { 'mind-maps' } else { 'notes' }
    $date = if ($null -ne $artifact) { [string]$artifact.created_at } else { $exportedAt.ToString('o') }
    $folder = Join-Path $outputPath $folderName
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    $path = Join-Path $folder (ConvertTo-SafeName $note.title $note.id)
    Write-Utf8 $path ((New-FrontMatter $note.title $date $note.id $type $notebook.title) + [string]$note.content)
    $exported.Add([pscustomobject]@{ Type = $type; Id = $note.id; Title = $note.title; Path = $path })
}

$nativeMarkdownTypes = @{ report = 'report'; flashcards = 'flashcards'; quiz = 'quiz' }
foreach ($artifact in $completedArtifacts) {
    if (-not $nativeMarkdownTypes.ContainsKey([string]$artifact.type)) { continue }

    $type = [string]$artifact.type
    $folder = Join-Path $outputPath $type
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    $path = Join-Path $folder (ConvertTo-SafeName $artifact.title $artifact.id)
    $arguments = @('download', $nativeMarkdownTypes[$type], $NotebookId, '--id', $artifact.id, '--output', $path)
    if ($type -in @('flashcards', 'quiz')) { $arguments += @('--format', 'markdown') }

    & $script:nlm @arguments
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $path)) {
        throw "Artifact export failed: $($artifact.id)"
    }

    $body = [IO.File]::ReadAllText($path)
    Write-Utf8 $path ((New-FrontMatter $artifact.title $artifact.created_at $artifact.id $type $notebook.title) + $body.TrimStart())
    $exported.Add([pscustomobject]@{ Type = $type; Id = $artifact.id; Title = $artifact.title; Path = $path })
}

foreach ($artifact in @($completedArtifacts | Where-Object { $_.type -eq 'data_table' })) {
    $folder = Join-Path $outputPath 'data-tables'
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    $path = Join-Path $folder (ConvertTo-SafeName $artifact.title $artifact.id)
    $temporaryCsv = [IO.Path]::GetTempFileName()
    try {
        & $script:nlm download data-table $NotebookId --id $artifact.id --output $temporaryCsv
        if ($LASTEXITCODE -ne 0) { throw "Data table export failed: $($artifact.id)" }
        $table = ConvertTo-MarkdownTable $temporaryCsv
        Write-Utf8 $path ((New-FrontMatter $artifact.title $artifact.created_at $artifact.id 'data-table' $notebook.title) + $table)
    } finally {
        if (Test-Path -LiteralPath $temporaryCsv) { Remove-Item -LiteralPath $temporaryCsv -Force }
    }
    $exported.Add([pscustomobject]@{ Type = 'data-table'; Id = $artifact.id; Title = $artifact.title; Path = $path })
}

$handledTypes = @('mind_map', 'report', 'flashcards', 'quiz', 'data_table')
$unsupported = @($artifacts | Where-Object { $_.status -ne 'completed' -or $_.type -notin $handledTypes })
$limitationsPath = Join-Path $outputPath 'unsupported-artifacts.md'
$limitations = [Collections.Generic.List[string]]::new()
$limitations.Add('---')
$limitations.Add('title: "NotebookLM Markdown 匯出限制"')
$limitations.Add('date: "' + $exportedAt.ToString('o') + '"')
$limitations.Add('tags:')
$limitations.Add('  - NotebookLM')
$limitations.Add('  - export-limitations')
$limitations.Add('category: NotebookLM Export')
$limitations.Add("notebook_id: $NotebookId")
$limitations.Add('---')
$limitations.Add('')
$limitations.Add('# 無法直接轉為 Markdown 的 artifacts')
$limitations.Add('')
$limitations.Add('以下項目未被偽造為文字內容。Chat history 需使用 NotebookLM Export Tool 的 Chrome UI 另行匯出。')
$limitations.Add('')
$limitations.Add('| Status | Type | Title | Artifact ID | Created at |')
$limitations.Add('|---|---|---|---|---|')
foreach ($artifact in $unsupported) {
    $safeTitle = ([string]$artifact.title).Replace('|', '\|')
    $limitations.Add("| $($artifact.status) | $($artifact.type) | $safeTitle | $($artifact.id) | $($artifact.created_at) |")
}
Write-Utf8 $limitationsPath ($limitations -join "`n")

$deliverables = @($exported) + @([pscustomobject]@{
    Type = 'limitations'; Id = ''; Title = 'NotebookLM Markdown 匯出限制'; Path = $limitationsPath
})
$manifestPath = Join-Path $outputPath 'manifest.md'
$manifest = [Collections.Generic.List[string]]::new()
$manifest.Add('---')
$manifest.Add("title: $(ConvertTo-YamlScalar ($notebook.title + ' Markdown 匯出清單'))")
$manifest.Add('date: "' + $exportedAt.ToString('o') + '"')
$manifest.Add('tags:')
$manifest.Add('  - NotebookLM')
$manifest.Add('  - Markdown')
$manifest.Add('category: NotebookLM Export')
$manifest.Add("notebook_id: $NotebookId")
$manifest.Add('---')
$manifest.Add('')
$manifest.Add('# NotebookLM Markdown 匯出清單')
$manifest.Add('')
$manifest.Add("- Notebook：$($notebook.title)")
$manifest.Add("- Notebook ID：$NotebookId")
$manifest.Add("- 可文字化 artifacts／notes：$($exported.Count)")
$manifest.Add("- 未轉文字或未完成 artifacts：$($unsupported.Count)")
$manifest.Add('')
$manifest.Add('| Type | Title | Relative path | Bytes | SHA-256 |')
$manifest.Add('|---|---|---|---:|---|')

foreach ($item in @($deliverables | Sort-Object Type, Title)) {
    $file = Get-Item -LiteralPath $item.Path
    $hash = (Get-FileHash -LiteralPath $item.Path -Algorithm SHA256).Hash
    $relative = $item.Path.Substring($outputPath.Length).TrimStart('\').Replace('\', '/')
    $safeTitle = ([string]$item.Title).Replace('|', '\|')
    $manifest.Add("| $($item.Type) | $safeTitle | $relative | $($file.Length) | $hash |")
}
Write-Utf8 $manifestPath ($manifest -join "`n")

$markdownFiles = @(Get-ChildItem -LiteralPath $outputPath -Recurse -File -Filter '*.md')
$strictUtf8 = New-Object System.Text.UTF8Encoding($false, $true)
$invalidUtf8 = [Collections.Generic.List[string]]::new()
foreach ($file in $markdownFiles) {
    try { [void]$strictUtf8.GetString([IO.File]::ReadAllBytes($file.FullName)) }
    catch { $invalidUtf8.Add($file.FullName) }
}

$zeroByteFiles = @($markdownFiles | Where-Object { $_.Length -eq 0 })
if ($invalidUtf8.Count -gt 0 -or $zeroByteFiles.Count -gt 0) {
    throw "Validation failed. Invalid UTF-8: $($invalidUtf8.Count); zero-byte files: $($zeroByteFiles.Count)"
}

[pscustomobject]@{
    NotebookId = $NotebookId
    NotebookTitle = $notebook.title
    OutputDirectory = $outputPath
    ExportedContentCount = $exported.Count
    UnsupportedCount = $unsupported.Count
    MarkdownFileCount = $markdownFiles.Count
    TotalBytes = ($markdownFiles | Measure-Object Length -Sum).Sum
    ZeroByteFiles = $zeroByteFiles.Count
    InvalidUtf8Files = $invalidUtf8.Count
    ManifestPath = $manifestPath
    ManifestSHA256 = (Get-FileHash -LiteralPath $manifestPath -Algorithm SHA256).Hash
} | ConvertTo-Json