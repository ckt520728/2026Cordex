# Gmail MCP 設定記錄 (2026-05-18)

## 目標
為 OpenCode 設定 Email Assistant 所需的 Gmail MCP server，並完成五項自動化任務。

## 今日嘗試的五項任務

1. **Email Assistant** → Review Gmail 信件並做摘要
2. **NotebookLM MCP** → 複習最近使用的 Notebook
3. **每日早上 /office-hours** → Windows 排程
4. **搜尋 AI/金融市場資訊 + Dashboard**
5. **每日晚上 /retro** → Windows 排程

## 已完成的項目

### opencode.jsonc 設定
已加入兩個 MCP server：
```json
{
  "mcp": {
    "notebooklm": {
      "command": ["C:\\Users\\User\\.local\\bin\\notebooklm-mcp.exe"],
      "enabled": true
    },
    "gmail": {
      "command": ["npx.cmd", "-y", "@shinzolabs/gmail-mcp"],
      "enabled": false  // OAuth 尚未完成授權
    }
  }
}
```

### NotebookLM MCP
- `notebooklm-mcp.exe` 已存在於 `C:\Users\User\.local\bin\`
- 已在 opencode.jsonc 啟用
- 等待 OpenCode Desktop 重啟後生效

## Gmail OAuth 踩坑記錄

### 嘗試 1：@anthropic/mcp-gmail
- npm 查無此套件（404 Not Found）

### 嘗試 2：@shinzolabs/gmail-mcp（OAuth 授權流程）
1. 從 Google Cloud Console 下載 OAuth Client ID（Desktop app 類型）
2. 複製憑證到 `~/.config/opencode/gmail-credentials.json`
3. 複製到 `~/.gmail-mcp/gcp-oauth.keys.json`
4. 執行 `gmail-mcp auth`
5. **問題 1**：npm tarball 損毀警告（merge-stream, is-docker），第一次安裝失敗
6. 清除 npm cache 後全局安裝成功
7. **問題 2**：Auth server 跑在 localhost:3000，需要使用者瀏覽器完成 OAuth 授權
8. 使用者回報「Cannot read image.png」錯誤（OpenCode 模型不支援圖片輸入，無法讀取使用者截圖）
9. 改用 Device Code Flow → 回傳 401（可能 OAuth consent screen 未正確設定或 refresh token 未發放）

### OAuth 設定已知問題
- Desktop app 類型沒有「Authorized redirect URIs」欄位（Google 會自動允許 localhost loopback redirect）
- 可能是 OAuth consent screen 未正確設定（Testing 狀態測試使用者未加入？）
- 使用者一直遇到「Cannot read image.png」錯誤阻礙溝通

### 最終方案：改用 Gmail 應用程式密碼（App Passwords）
- 不需要 Google Cloud Console
- 不需要 OAuth 流程
- 使用 IMAP/SMTP MCP server（如 `gmail-mcp-server` by Ralstonvaz）
- 使用者尚未完成應用程式密碼產生

## 設定現狀

| 項目 | 狀態 |
|------|------|
| opencode.jsonc NotebookLM MCP | 已設定，待生效 |
| opencode.jsonc Gmail MCP | 已設定但 disabled，OAuth 未完成 |
| Gmail OAuth 憑證 | 已存在於 `~/.config/opencode/gmail-credentials.json` |
| Gmail 應用程式密碼 | 尚未產生 |
| 每日 /office-hours 排程 | 尚未建立 |
| 每日 /retro 排程 | 尚未建立 |
| AI/金融 Dashboard | 尚未製作 |

## 下次建議
1. 重新嘗試 Gmail MCP 設定 — 建議改用 IMAP/SMTP + App Password 方式
2. 完成後設定 Windows Task Scheduler 每日自動執行
3. 上傳本記錄到 Obsidian 知識庫
