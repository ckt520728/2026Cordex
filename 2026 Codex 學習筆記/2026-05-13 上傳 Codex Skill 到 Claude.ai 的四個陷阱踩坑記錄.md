---
date: 2026-05-13
tags:
  - skill
  - claude-code
  - anthropic
  - codex
  - 踩坑
  - troubleshooting
source: 與 Claude (Opus 4.7) 對話
related:
  - "[[2026-05-10 個人醫學網站建站踩坑與AI協作歷程]]"
repo: https://github.com/ckt520728/perio-board-exam-resources
---

# 上傳 Codex 產生的 Skill 到 Claude.ai 的四個陷阱

## 背景

我請 Codex 幫我建立了一個牙周病專科考試分析的 Skill (`perio-exam-analysis`),想透過 claude.ai 的 **Settings → Personal skills → Upload skill** 介面上傳。原始檔是從 GitHub repo 下載的 `perio-board-exam-resources-main.zip`。結果**連續失敗 4 次**才成功,每次的錯誤訊息都不一樣,而且第 3、4 次的訊息文字甚至完全相同,但實際根因卻是不同的東西 — 非常具有誤導性。

這份筆記把整個踩坑過程紀錄下來,將來無論是自己重做、教學生、或者再用 Codex / 其他工具產 Skill 時都能直接對照。

---

## 四次錯誤的對照表

| 次數 | 錯誤訊息 (原文) | 表面意思 | 真正含意 | 解法 |
|------|-----------------|----------|----------|------|
| 1 | "SKILL.md file must be in the top-level folder, not nested deeper. Currently at perio-board-exam-resources-main/skills/perio-exam-analysis/SKILL.md" | SKILL.md 巢狀太深 | 預期 zip 內結構是 `<root>/SKILL.md`,而不是三層巢狀 | 把 `skills/perio-exam-analysis/` 這個資料夾的內容單獨抽出來重新打包 |
| 2 | "Zip file contains path with invalid characters" | zip 路徑含非法字元 | Windows PowerShell 的 `Compress-Archive` 會把 zip entry 的路徑分隔符寫成 `\`,但 ZIP 標準 (APPNOTE 4.4.17.1) 規定必須用 `/` | 改用 `System.IO.Compression.ZipArchive` 直接寫,並手動 `.Replace('\','/')` |
| 3 | "root directory name must contain only alphanumeric characters, underscores, and hyphens" | 根目錄名稱只能英數+底線+連字號 | **真的就是字面意思** — 把整包檔案放在一個合規名稱的資料夾裡(例如 `perio-exam-analysis/`) | 重新打包時加上一層根目錄包住所有檔案,根目錄名只用 ASCII |
| 4 | (錯誤訊息**與第 3 次完全相同**) | 看起來一樣 | **完全不同的問題** — 抱怨的其實是 SKILL.md 裡 YAML frontmatter 的 `name:` 欄位是中文 (`牙周病專科考試試題分析技能`)。Anthropic 把這個值當作安裝後的目錄名稱 (`~/.claude/skills/<name>/`),所以也叫它「root directory」 | 修改 SKILL.md 第 2 行 `name:` 為 ASCII (例如 `perio-exam-analysis`)。H1 標題、description、正文中文都可保留 |

---

## 最關鍵的洞察

**第 3 次和第 4 次的錯誤訊息文字一模一樣**,但分別在抱怨兩個完全不同的東西:

- 第 3 次的「root directory」= zip 內的根目錄
- 第 4 次的「root directory」= SKILL.md `name:` 欄位(因為它會變成安裝後的目錄)

如果不知道這件事,看到第 4 次失敗會覺得「我不是已經修好了嗎?」然後陷入無限迴圈。

---

## 給未來自己的檢查清單

下次製作 Skill (.zip) 前,請逐項檢查:

- [ ] zip 結構是 `<root>/SKILL.md`,**不是**:
  - ❌ 純粹 `SKILL.md` 裸放在最外層
  - ❌ `A/B/C/SKILL.md` 三層巢狀
- [ ] 路徑分隔符是 `/`,不是 `\`(用 .NET API 而非 PowerShell `Compress-Archive`)
- [ ] zip 根目錄名稱只含 `[A-Za-z0-9_-]`
- [ ] SKILL.md frontmatter `name:` 欄位也只含 `[A-Za-z0-9_-]`,**而且建議跟 zip 根目錄同名**
- [ ] H1 標題、description、正文 → 中文 OK
- [ ] SKILL.md 用 UTF-8 (no BOM) 編碼,不要用 PowerShell `Set-Content` 或 `Out-File`(會寫 UTF-16 LE BOM)

---

## 給 Codex / 其他 Skill 產生器的提示詞補充

下次叫 Codex 產 Skill 時,加上這段需求,可以一次到位避免踩坑:

> SKILL.md 的 YAML frontmatter `name:` 欄位必須是純 ASCII (英數、底線、連字號),例如 `perio-exam-analysis`。不要用中文。zip 根目錄名稱必須與 `name:` 完全相同。H1 標題、description、正文可以是中文。zip 內路徑分隔符請使用 `/`。

---

## 完整的修復腳本(PowerShell)

把任何 Codex / 第三方產的 skill zip 一次修好的腳本範本:

```powershell
$src = "原始zip路徑"
$tmp = "暫存解壓目錄"
$out = "輸出zip路徑"
$rootName = "skill-name-here"  # 必須跟 SKILL.md 的 name: 同名

if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
if (Test-Path $out) { Remove-Item $out -Force }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($src, $tmp)

$skillDir = "解壓後 SKILL.md 所在的資料夾完整路徑"

# 修改 SKILL.md 的 name: 欄位
$skillMd = Join-Path $skillDir "SKILL.md"
$content = [System.IO.File]::ReadAllText($skillMd, [System.Text.Encoding]::UTF8)
$newContent = $content -replace '(?m)^name:\s*.+$', "name: $rootName"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($skillMd, $newContent, $utf8NoBom)

# 用 .NET API 重新打包,強制 / 分隔符
$zipStream = [System.IO.File]::Open($out, [System.IO.FileMode]::Create)
$archive = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)

Get-ChildItem -Path $skillDir -Recurse -File | ForEach-Object {
  $rel = $_.FullName.Substring($skillDir.Length + 1).Replace('\','/')
  $entryPath = "$rootName/$rel"
  $entry = $archive.CreateEntry($entryPath, [System.IO.Compression.CompressionLevel]::Optimal)
  $entryStream = $entry.Open()
  $fs = [System.IO.File]::OpenRead($_.FullName)
  $fs.CopyTo($entryStream); $fs.Close(); $entryStream.Close()
}
$archive.Dispose(); $zipStream.Close()
Remove-Item $tmp -Recurse -Force
```

---

## 這次踩坑的後續處理

1. ✅ **GitHub repo 已更新** — `perio-board-exam-resources` repo 內的 `skills/perio-exam-analysis/SKILL.md` 已透過 GitHub Contents API 推送修正,commit [`12b45f4`](https://github.com/ckt520728/perio-board-exam-resources/commit/12b45f40aa03b5c12e673259c3d3ffb07cda72a4)。下次任何人從 repo clone 都會直接拿到合規版本。
2. ✅ **Claude Code 記憶系統已寫入** — 同樣的教訓寫入了 `~/.claude/projects/.../memory/skill_upload_pitfalls.md`,以後在 Claude Code 內製作或修改 Skill 時會自動套用。
3. ✅ **Obsidian 知識庫已紀錄** — 即本篇。

---

## 反思

- **錯誤訊息的命名很重要**。Anthropic 用「root directory」同時指 zip 結構和 frontmatter `name:`,在使用者眼中是兩件事,但在系統實作中是同一件事(因為 `name:` 就是安裝後的根目錄)。下次自己設計 API 時,訊息要區分「your zip structure 的 root directory」vs「your skill's installed directory name (from `name:` field)」。
- **跨平台工具的隱形差異**。PowerShell `Compress-Archive` 在 Windows 上產生的 zip 是 Windows 風格(`\` 分隔符),這在 Windows 內部解壓沒問題,但被 Linux / macOS / 標準 ZIP 解析器讀取時會被當成非法字元。這種「跨平台陷阱」會偽裝成各種看似無關的錯誤。
- **AI 產生器的預設文化偏好**。Codex 預設用使用者輸入語言(中文)當識別碼,但實作層面需要 ASCII。這是 LLM 工具鏈普遍的問題 — 它們不一定知道哪些欄位有「機器可讀」的硬性限制。
