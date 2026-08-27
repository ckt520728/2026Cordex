param(
  [string]$SkillRoot = (Split-Path -Parent (Split-Path -Parent $PSCommandPath))
)

$ErrorActionPreference = 'Stop'

$skill = Join-Path $SkillRoot 'SKILL.md'
$required = @(
  $skill,
  (Join-Path $SkillRoot 'references\oak-loop.md'),
  (Join-Path $SkillRoot 'references\rollout.md'),
  (Join-Path $SkillRoot 'references\option-ledger.template.md')
)

foreach ($path in $required) {
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    throw "Missing required file: $path"
  }
}

$bytes = [IO.File]::ReadAllBytes($skill)
$nonAscii = @($bytes | Where-Object { $_ -gt 127 })
if ($nonAscii.Count -ne 0) {
  throw "SKILL.md must be ASCII-clean on this CP950 host; found $($nonAscii.Count) non-ASCII bytes"
}

$text = [IO.File]::ReadAllText($skill, [Text.Encoding]::UTF8)
$frontmatter = [regex]::Match(
  $text,
  '\A---\r?\n(?<yaml>.*?)\r?\n---\r?\n',
  [Text.RegularExpressions.RegexOptions]::Singleline
)
if (-not $frontmatter.Success) {
  throw 'Missing or malformed YAML frontmatter'
}

$topKeys = @(
  [regex]::Matches($frontmatter.Groups['yaml'].Value, '(?m)^([a-z_][a-z0-9_-]*):') |
    ForEach-Object { $_.Groups[1].Value }
)
$expected = @('name', 'description', 'user_invocable')
if ((Compare-Object $expected $topKeys).Count -ne 0) {
  throw "Frontmatter keys must be exactly: $($expected -join ', '); found: $($topKeys -join ', ')"
}

$checks = @{
  'skill name' = '(?m)^name:\s+oak-loop-engineering\s*$'
  'invocable flag' = '(?m)^user_invocable:\s+true\s*$'
  'FC-STOMP' = 'FC-STOMP'
  'continual learning' = 'Learn continually'
  'Feature stage' = '### F - construct a Feature'
  'SubTask stage' = '### ST - pose a reward-respecting SubTask'
  'Option stage' = '### O - learn and gate an Option'
  'Model stage' = '### M - learn an Option Model'
  'Planning stage' = '### P - plan with Option Models'
  'rollout reference' = 'references/rollout\.md'
  'ledger reference' = 'references/option-ledger\.template\.md'
}

foreach ($entry in $checks.GetEnumerator()) {
  if ($text -notmatch $entry.Value) {
    throw "Missing required contract: $($entry.Key)"
  }
}

$lineCount = ($text -split '\r?\n').Count
if ($lineCount -gt 500) {
  throw "SKILL.md exceeds 500 lines: $lineCount"
}

Write-Output "PASS: oak-loop-engineering target-format validation ($lineCount lines)"
