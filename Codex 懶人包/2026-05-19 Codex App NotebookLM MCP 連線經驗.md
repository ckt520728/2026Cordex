# 2026-05-19 Codex App 連接 NotebookLM MCP 經驗紀錄

tags: #Codex #NotebookLM #MCP #KwotaDailyStack #SecondBrain

## 摘要

今天完成 NotebookLM MCP 在本機的登入、驗證與 Codex App 設定串接，並修正 `Kwota Daily Stack` skill，讓每日 Gmail 整理、讀書計畫與行政安排可以把 NotebookLM 當成正式資料來源。

## 最終狀態

- NotebookLM CLI 已登入 `kwotachu@gmail.com`。
- `nlm doctor` 通過。
- `nlm notebook list --json --full` 可以列出 notebooks。
- Codex App 設定檔已加入 NotebookLM MCP。
- `kwota-daily-stack` skill 已補上 NotebookLM MCP 連線、驗證、錯誤處理與 fallback。
- 修正後 skill 驗證結果為 `Skill is valid!`。

## Codex App 設定

Codex App 的設定檔是：

```text
C:\Users\User\.codex\config.toml
```

NotebookLM MCP 區塊：

```toml
[mcp_servers.notebooklm]
command = "C:\\Users\\User\\.local\\bin\\notebooklm-mcp.exe"
args = []
startup_timeout_sec = 20
tool_timeout_sec = 180
```

修改後要重啟 Codex App 或開新 session，MCP server 才會載入。

## 與 Claude Desktop 的差異

Claude Desktop 設定檔：

```text
C:\Users\User\AppData\Roaming\Claude\claude_desktop_config.json
```

Claude Desktop 使用 JSON。Codex App 使用 TOML。兩者互不等同，把 NotebookLM MCP 加進 Claude Desktop JSON 不會自動讓 Codex App 看見 NotebookLM tools。

## 驗證方式

```powershell
& "$env:USERPROFILE\.local\bin\nlm.exe" doctor
& "$env:USERPROFILE\.local\bin\nlm.exe" notebook list --json --full
```

健康狀態應包含：

- `notebooklm-mcp-cli` 已安裝。
- `nlm.exe` 和 `notebooklm-mcp.exe` 位於 `C:\Users\User\.local\bin\`。
- cookies 存在。
- CSRF token 存在。
- notebook 清單可列出。

## 今天踩到的坑

### Authentication expired

這代表 NotebookLM cookies 過期，不是 MCP 沒裝好。

修復：

```powershell
& "$env:USERPROFILE\.local\bin\nlm.exe" login
```

### PowerShell CommandNotFoundException

把設定檔路徑直接貼到 PowerShell 會被當成指令執行。

正確打開方式：

```powershell
notepad "$env:USERPROFILE\.codex\config.toml"
notepad "$env:APPDATA\Claude\claude_desktop_config.json"
```

### TOML 裡的 Windows 路徑

不要寫：

```toml
command = "C:\Users\User\.local\bin\notebooklm-mcp.exe"
```

要寫：

```toml
command = "C:\\Users\\User\\.local\\bin\\notebooklm-mcp.exe"
```

### Codex sandbox 假性失敗

在 Codex sandbox 裡曾遇到：

```text
uv trampoline failed to canonicalize script path
```

如果在普通 PowerShell 或 Codex local permission 下 `nlm doctor` 正常，這不代表 NotebookLM MCP 壞掉，而是權限環境造成的假性失敗。

## Codex 裡如何呼叫 NotebookLM

不要手打底層 MCP tool 名稱。重啟 Codex 並載入 NotebookLM MCP 後，直接用自然語言：

```text
請用 NotebookLM 列出我的 notebooks
請查詢 NotebookLM 裡 Neuro_David_Sussillo 那本 notebook，整理今天的讀書重點
```

若當前 Codex session 還沒有 NotebookLM MCP tools，可用 `nlm.exe` CLI 作為 fallback，並在每日報告中註明這是 fallback。

## 今天的 NotebookLM 查詢成果

查詢 notebook：

```text
Neuro_David_Sussillo_大腦皮層動力學：高維神經計算的解析
```

今日讀書主軸：

- `Computation Through Dynamics`
- neural population state space trajectories
- FORCE learning / RLS
- fixed point analysis
- dynamical motifs
- null space vs potent space

90 分鐘安排：

1. 0-15 分鐘：Sussillo 的 emergence 與研究脈絡。
2. 15-45 分鐘：FORCE learning 與 RLS。
3. 45-75 分鐘：fixed point、attractor 與 RNN reverse engineering。
4. 75-90 分鐘：回到 NeuroAI，整理 biological plausibility 與 Transformer 對照。

今日應產出：

- `mechanism vs statistics` 對照表。
- 五個 attractor/function map。
- 三個問題：causal/mechanistic equivalence、biological plausibility、language/reasoning scaling。

## 對 Kwota Daily Stack 的修正

`C:\Users\User\.codex\skills\kwota-daily-stack\SKILL.md` 已新增 NotebookLM MCP 連線段落，要求每日流程：

1. 先確認 NotebookLM MCP 或 `nlm.exe` fallback 可用。
2. 列出 notebooks。
3. 查詢今日最相關 notebook。
4. 把讀書重點納入 daily stack report。
5. 如果 NotebookLM 不可用，記錄精確錯誤與恢復步驟，不要編造資料。

