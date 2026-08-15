---
title: "Medical Exam System v7.3 — Deployment Evidence"
date: "2026-08-15"
tags:
  - deployment
  - sha256
  - google-apps-script
category: "Medical-exam-system-revision"
---

# Deployment Evidence

## Production

- App version：v7.3
- Apps Script deployment version：35
- Description：`v7.3 — 統一歷史總表、雙層統計與安全匯出預覽`
- URL：<https://script.google.com/macros/s/AKfycbyucGUOYz9eS9IrLWohMtYJ8Hm-oZmhgyhmKXZJjE1gf8DZj_Ra9r9_lzuUHgVVf2zL5g/exec>
- Public HTTP：200
- HTML markers：包含 `v7.3`、`getRecordDashboard`、`exportRecordSummaryXlsx`、`TRANSPORT_EMPTY_RESPONSE`；不含 `v7.2`。

## 已測 production source SHA-256

| File | SHA-256 | Post-deploy pull |
|---|---|---|
| `Code.gs` | `5701D72C4F34C1D57B23B2941C63551CD6C3C84B99BEB7BC7C40CFD7AC2AC4AC` | match |
| `index.html` | `C59E11BC10A347E3D691868D4A7A5479E2A2A9CD5CD25175C5A324DF9CEEBF77` | match |

## GitHub 公開副本

公開副本刻意不與 production `Code.gs` 位元相同：以下設定已替換或加上 fail-closed guard。

- `SPREADSHEET_ID`
- `DEFAULT_PASSCODE`
- `NEW_PASSCODE`
- HTML production deployment fallback
- 未設定 passcode 時的 `PASSCODE_NOT_CONFIGURED`

公開產品包 SHA-256 由 GitHub commit 與 Blob API 驗證；最終 commit 請見當日 end-of-day 文件與 GitHub history。

## 尚未完成的 runtime evidence

- passcode-authenticated `google.script.run`
- 真實 Sheets／Drive 寫入
- Google Doc、PDF、DOCX 產出
- XLSX 實際下載與內容檢查

上述項目必須使用 synthetic data，由具權限的 owner 執行；本文件不把 HTTP 200 或 source parity 誤寫成 runtime 成功。
