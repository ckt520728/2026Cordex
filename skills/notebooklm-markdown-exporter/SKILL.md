---
name: notebooklm-markdown-exporter
description: 將指定 Google NotebookLM notebook 的 notes 與 Studio 文字型 artifacts 批次匯出為結構化 Markdown，加入 metadata、manifest、檔案大小及 SHA-256，並驗證 UTF-8 與完整性。使用於「匯出 NotebookLM／Gemini notebook」、「把 mind maps、reports、flashcards、quizzes、data tables 轉成 .md」、「備份 notebook artifacts」或指定 NotebookLM notebook URL／ID 與輸出資料夾的工作。
---

# NotebookLM Markdown Exporter

## 成功標準

完成前確認：

1. Notebook ID 與使用者指定目標一致。
2. 匯出所有可文字化的 completed artifacts。
3. 每個 `.md` 都含 `title`、`date`、`tags`、`category` 與 artifact metadata。
4. `manifest.md` 列出相對路徑、bytes 與 SHA-256。
5. 所有 Markdown 均非零位元且通過嚴格 UTF-8 解碼。
6. 非文字 artifacts 只記錄限制，不偽造逐字稿或內容。

## 執行流程

### 1. 解析輸入

- 從 `https://notebook.google.com/notebook/<UUID>` 或 `https://notebooklm.google.com/notebook/<UUID>` 擷取 Notebook ID。
- 要求或沿用使用者明確指定的輸出資料夾。
- 未指定輸出資料夾時，使用目前工作目錄下的 `NotebookLM-Exports/<Notebook-ID>`。
- 不推測 notebook 作者、內容來源或 artifact provenance。

### 2. 檢查環境

依序執行：

```powershell
nlm --version
nlm login --check
nlm notebook list --json --full
```

- 若 `nlm` 不在 `PATH`，檢查 `C:\Users\User\.local\bin\nlm.exe`。
- `nlm login --check` 失敗時，執行 `nlm login`；需要瀏覽器互動時請使用者完成登入。
- `nlm` 與 NotebookLM Export Tool 都是非 Google 官方工具；不得讀取、輸出或提交 cookies、tokens 或登入憑證。
- 不建立測試 notebook，不修改或刪除遠端 notebook、notes、sources 或 artifacts。

### 3. 選擇匯出介面

指定 repository `cced3000/NotebookLM-Export-Tool` 是 Chrome extension，不是 CLI。

- 使用者明確要求該 extension，且 Chrome 控制可用時：在已登入的 NotebookLM 頁面使用 extension 的 Markdown export。
- extension 無法自動化或 Chrome 連線失敗時：清楚說明原因，改用本 skill 的 deterministic CLI script。
- 不宣稱 CLI fallback 是實際點擊 extension。
- Chat history 僅能由 extension UI 匯出；CLI script 不偽造 chat history。

### 4. 執行 deterministic 匯出

使用 bundled script：

```powershell
& "<skill-dir>\scripts\export_notebooklm_markdown.ps1" `
  -NotebookId "<UUID>" `
  -OutputDirectory "<exact-output-folder>"
```

目標資料夾若非空，script 預設停止。只有使用者明確允許更新同一批輸出時才加：

```powershell
-Force
```

支援：

- saved notes → Markdown
- mind maps → Markdown note content
- reports → Markdown
- flashcards → Markdown
- quizzes → Markdown
- data tables → CSV 暫存後轉 Markdown table

僅記錄限制：

- audio
- video
- slide decks
- infographics
- 其他非文字或未完成 artifacts

### 5. 驗證交付

讀取 script 的 JSON summary，並再次確認：

```powershell
Get-ChildItem -LiteralPath "<output>" -Recurse -File -Filter *.md
Get-Content -LiteralPath "<output>\manifest.md" -Encoding UTF8 -TotalCount 1
Get-FileHash -LiteralPath "<output>\manifest.md" -Algorithm SHA256
```

回報：

- 完整輸出路徑
- 各 artifact 類型數量
- `.md` 總數、總 bytes、零位元檔數與 UTF-8 錯誤數
- `manifest.md` SHA-256
- 未能轉為 Markdown 的 artifact 類型與原因

## Windows 相容性

- 以 Windows PowerShell 5 執行含繁體中文的 `.ps1` 時，保留 UTF-8 BOM。
- 不使用 `.NET Core` 才有的 `[IO.Path]::GetRelativePath()`。
- Windows sandbox 出現 `SetTokenInformation(TokenDefaultDacl) failed: 1344` 時，依權限規則在核准後重試；不得把此錯誤誤判為 NotebookLM 登入失敗。
- 對 D:、Google Drive 或其他 workspace 外路徑寫入前取得必要核准。