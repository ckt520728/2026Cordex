---
title: "Medical Exam System v7.3 — 公開產品包"
date: "2026-08-15"
tags:
  - google-apps-script
  - clinical-documentation
  - patient-safety
  - dashboard
category: "2026Cordex/products"
status: "deployed-with-runtime-smoke-test-pending"
---

# Medical Exam System v7.3

這是「住院病歷＋臨床檢查報告系統」v7.3 的可重現公開產品包。版本重點是把割裂的住院／檢查歷史改成 unified records workspace，修復 Apps Script RPC 的 `Date` serialization failure，並加上腹超 false-normal、去識別 Excel 與 stale export 防護。

正式部署：<https://script.google.com/macros/s/AKfycbyucGUOYz9eS9IrLWohMtYJ8Hm-oZmhgyhmKXZJjE1gf8DZj_Ra9r9_lzuUHgVVf2zL5g/exec>

## 產品內容

- `src/Code.gs`：Google Apps Script backend，已移除 production Spreadsheet ID 與 passcode。
- `src/index.html`：單頁 frontend，production deployment fallback 已改成 placeholder。
- `appsscript.json`：V8、Asia/Taipei 與必要 OAuth scopes。
- `tests/`：Dashboard RPC、revision、clinical note output 與 static wiring 四組 regression tests。
- `WRAP-UP.md`：本輪成果、pitfalls、證據界線與後續工作。
- `docs/DEPLOYMENT-EVIDENCE.md`：production version、hash 與驗證紀錄。

## 本機驗證

需要 Node.js；不連線真實 Sheets，也不使用真實病患資料。

```powershell
node tests\check_dashboard_rpc.js
node tests\check_revision.js
node tests\check_note_output.js
node tests\check_static.js
```

四組命令必須全部 exit 0。

## 自行部署前的必要設定

1. 在 `src/Code.gs` 設定自己的 `SPREADSHEET_ID`。
2. 建立或確認 Apps Script project 與 `appsscript.json` scopes。
3. 將 `NEW_PASSCODE` 改成至少六字元的獨立密碼，從 Apps Script editor 手動執行一次 `setAppPasscode()`，再把 source 內的值改回 placeholder。
4. 更新 `src/index.html` 的 `REPLACE_WITH_DEPLOYMENT_ID`。
5. 不得把 passcode、Script Properties、真實姓名、MRN、身分證號或 production Spreadsheet ID commit 到 Git。

公開版在 passcode 尚未設定時會拋出 `PASSCODE_NOT_CONFIGURED`，避免以已知 placeholder 開放系統。

## 安全界線

- 此產品是臨床文件工作流工具，不是醫療決策系統。
- 腹超 Normal 是嚴格 template gate；未評估欄位不得被推論為正常。
- 去識別 Excel 預設排除姓名、MRN／病歷號與身分證號，也不保存搜尋字串。
- production HTTP、source pull-back 與本地 regression tests 已驗證；passcode-authenticated Sheets／Drive／XLSX runtime smoke test 仍需由授權使用者完成。

詳細過程見 [WRAP-UP.md](WRAP-UP.md)。
