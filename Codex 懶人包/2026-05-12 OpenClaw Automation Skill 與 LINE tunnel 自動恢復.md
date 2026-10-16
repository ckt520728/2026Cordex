---
title: 2026-05-12 OpenClaw Automation Skill 與 LINE tunnel 自動恢復
date: 2026-05-12
topic: OpenClaw LINE automation
type: learning-log
source: Codex session
tags:
  - Codex
  - OpenClaw
  - LINE
  - automation
  - skill
---

# 2026-05-12 OpenClaw Automation Skill 與 LINE tunnel 自動恢復

## 背景

今天處理兩個連在一起但根因不同的問題：

1. Codex automation 顯示 `cannot resume running thread ... stale path`，原因是 heartbeat automation 綁在舊 thread/session。
2. OpenClaw 與 LINE 斷線，原因是本機 `/line/webhook` proxy 與 Cloudflare quick tunnel 沒有持續運作；quick tunnel 重開後網址會更換，LINE webhook endpoint 必須同步更新。

## 實測修復

- 本機 OpenClaw Gateway：`http://127.0.0.1:18789/` 回 `200`。
- 本機 LINE proxy：`http://127.0.0.1:18790/line/webhook` 回 `200 OK`。
- Cloudflare quick tunnel 重新建立後，取得新的 `trycloudflare.com` URL。
- 使用 Node `fetch` 更新 LINE webhook endpoint，因為 PowerShell `Invoke-RestMethod` 在此環境出現 TLS/receive error。
- LINE 官方 webhook test 回傳 `success=true`、`statusCode=200`。

## 打包成 Skill

新增 skill：`openclaw-automation`

位置：

- 本機 Codex skill：`C:\Users\User\.codex\skills\openclaw-automation`
- GitHub repo：`C:\Users\User\github\claude-skills\openclaw-automation`
- 可搬移封裝：`openclaw-automation.skill`
- GitHub remote：`https://github.com/ckt520728/claude-skills`

Skill 內容：

- `SKILL.md`：OpenClaw + LINE automation 的判斷流程、啟動流程、常見錯誤。
- `scripts/line-webhook-proxy.mjs`：只暴露 `/line/webhook`，將 POST 轉送到 OpenClaw Gateway。
- `scripts/ensure-openclaw-line.ps1`：重啟 proxy/tunnel、解析 tunnel URL、更新 LINE endpoint、執行 LINE 官方 webhook test。
- `scripts/run-openclaw-line-ensure.cmd`：給 Windows Startup 或 schtasks 使用的穩定 wrapper。

## 這次踩過的坑

- PowerShell execution policy 會擋 `.ps1`，需要使用 `-ExecutionPolicy Bypass` 做單次執行。
- `Start-Process` 在此環境可能因 `Path/PATH` 重複鍵出錯。
- 背景 process 可能跟著 Codex shell 結束而消失，必須使用 Windows task 或 Startup 捷徑。
- `Register-ScheduledTask` 可以建立部分任務，但 `ONLOGON` 在此執行身分被拒絕；最後用 Startup 捷徑補足開機登入自動執行。
- `schtasks.exe` 對含空白的路徑很敏感，因此本機安裝 skill 到沒有空白的 `C:\Users\User\.codex\skills\openclaw-automation`。
- Node 腳本初版把 `process.argv` 索引寫錯，驗證時才發現；修正後 LINE endpoint update 與 webhook test 通過。
- GitHub push 時遠端已有新 commit，需要 `pull --rebase --autostash`，並避免把既有 `lecture-notes` 未提交修改混入這次 commit。

## 開機/每日自動恢復

目前已建立：

- Windows Startup 捷徑：`OpenClaw LINE Ensure.lnk`
- Windows 每日任務：`OpenClawLineEnsureDaily`，每天 `07:05` 執行
- Codex heartbeat automation 已重新綁定目前 thread，排程為每天 `07:00` 與 `20:00`

用途：

- 電腦重開後自動恢復 LINE webhook proxy。
- quick tunnel 停掉或網址換掉時，重新建立 tunnel 並更新 LINE endpoint。
- LINE 官方 webhook test 作為最終驗證，不只依賴手動傳訊息。

## 後續建議

若之後要更穩定，應把 Cloudflare quick tunnel 換成 named tunnel，避免每次 tunnel 重啟都換網址。quick tunnel 適合快速恢復與低風險測試，但不適合作為長期生產入口。
