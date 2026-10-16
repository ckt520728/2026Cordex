---
title: 安裝 gstack Skills（OpenCode 環境）
date: 2026-05-17
tags:
  - OpenCode
  - gstack
  - Garry-Tan
  - Bun
  - OpenCode-Skill
  - 環境建置
type: 實作記錄
---

# 安裝 gstack Skills（OpenCode 環境）

> 日期：2026-05-17
> 操作環境：Windows 11 + OpenCode CLI

---

## 今日工作清單

### 1. 環境檢查（懶人包 #00）
- OS：Windows 11 (NT 10.0.26200)
- 網路：正常
- Git：✅ 2.53.0
- GitHub CLI (gh)：✅ 2.89.0，已登入 (ckt520728)
- uv：✅ 0.10.9
- Node.js：✅ v25.9.0
- npx：✅ 11.12.1（已修正 PowerShell 執行原則）

### 2. NotebookLM MCP 確認
- nlm CLI：✅ v0.6.4
- notebooklm-mcp：✅ 已安裝
- 認證：✅ kwotachu@gmail.com，151 個 notebooks
- Claude Code settings.json：✅ 已設定

### 3. Obsidian MCP 連接（懶人包 #02.5 / #03）
- Vault：`G:\我的雲端硬碟\Second Brain`
- mcpvault：✅ v0.11.0 已安裝 + 測試通過（15 個工具）
- Codex config.toml：✅ 已寫入

### 4. 第二大腦結構確認（懶人包 #04）
- 三層資料夾 (Clippings / 知識庫 / 創作庫)：✅ 已存在
- Templates：✅ 每日筆記.md、週計畫.md、知識庫頁面.md
- CLAUDE.md：✅ 已存在
- 知識庫 index.md / log.md：✅ 已存在
- 歡迎筆記：✅ 已存在
- 每週知識重整排程：✅ 已建立 (每週日 09:17)
- Web Clipper 設定：待使用者手動設定

### 5. Firebase 資料庫連接（懶人包 #04.5）
- Firebase CLI：✅ 已登入，2 個專案
- Firestore：✅ 已啟用，規則已部署
- Codex MCP：✅ 已寫入 config.toml

### 6. David Sussillo NotebookLM 摘要
- 知識庫筆記：`David Sussillo NotebookLM 摘要.md`
- 主題：FORCE 演算法、Computation Through Dynamics、神經群體動力學

### 7. gstack 安裝（本日重點）
- 來源：https://github.com/garrytan/gstack
- Bun：✅ v1.3.14 已安裝
- gstack repo：已下載至 `C:\Users\User\gstack`
- 安裝的 3 個 skills：

| Skill | 路徑 | 行數 | 用途 |
|-------|------|------|------|
| gstack-office-hours | `~/.config/opencode/skills/gstack-office-hours/` | 2055 | YC Office Hours 思考框架 — 6 個強迫性問題重新定義問題 |
| gstack-retro | `~/.config/opencode/skills/gstack-retro/` | 1695 | 每週回顧 — 盤點本週進度、學習、調整方向 |
| gstack-investigate | `~/.config/opencode/skills/gstack-investigate/` | 994 | 根因分析 — 有系統地追根究柢除錯 |

---

## gstack 分析

gstack 是 Y Combinator CEO Garry Tan 的開源 AI 軟體工廠（98K+ GitHub stars），包含 23 個斜線指令 skill，將 Claude Code / OpenCode 變成虛擬工程團隊。

### 對臨床醫師/研究者的價值

大部分 skill（`/review`、`/ship`、`/qa`、`/design-html`）是軟體開發專用，以下 3 個 skill 可直接用於日常生活與研究工作：

| Skill | 臨床/研究應用情境 |
|-------|------------------|
| `/office-hours` | 決定研究方向、規劃實驗設計、評估新治療方案 |
| `/retro` | 每週臨床案例回顧、研究進度檢討、下週優先級調整 |
| `/investigate` | 診斷困難病例、分析研究數據異常、系統性 root cause 分析 |

---

## 相關連結

- [gstack GitHub](https://github.com/garrytan/gstack)
- [Garry Tan (@garrytan)](https://x.com/garrytan)
- [Bun 官網](https://bun.sh/)
- [[David Sussillo NotebookLM 摘要]]
- [[FORCE_algorithm_Sussillo]]
