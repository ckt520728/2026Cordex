---
title: "Medical Exam System v7.3 — 開發與部署收工紀錄"
date: "2026-08-15"
tags:
  - daily-wrap
  - google-apps-script
  - clinical-safety
  - finding-unknown
category: "Medical-exam-system-revision"
app_version: "v7.3"
deployment_version: 35
---

# Medical Exam System v7.3 — 開發與部署收工紀錄

## 今日結論

v7.3 已部署到原 Google Apps Script URL，沒有建立第二個網址。歷史紀錄區已由「住院／檢查分頁」改成單一 unified records workspace；本地四組 tests 全綠，獨立 verifier 判定 `ACCEPT`，production HTTP 200，post-deploy pull 與已測 production source SHA-256 相同。

公開 repo 內的 `Code.gs` 是安全化副本：production Spreadsheet ID、fallback passcode 與嵌入式 deployment ID 已替換為 placeholder，並在 passcode 未設定時 fail closed。

## 今日完成

- [x] 找出 v7.2 Dashboard 顯示「後端未回傳可用資料」的可重現根因。
- [x] 將 Sheets `Date` 欄位在 RPC boundary 轉成 `yyyy-MM-dd`／`HH:mm` 字串。
- [x] 將住院病歷與檢查報告整合到單一歷史表。
- [x] 增加七種 record facets、累計／目前條件雙層統計、filter chips、結果筆數與資料時間。
- [x] 修正腹超空白欄位自動宣稱 Normal 的臨床安全問題。
- [x] 修正去識別 Excel 保存姓名／MRN 搜尋內容的隱私問題。
- [x] 增加 Excel preview、`expectedCount` 與 stale-data gate。
- [x] 更新原 deployment ID 到 version 35，並以 HTTP 與 pull-back hash 驗證。
- [x] 將 source、tests、deployment evidence 與本文件整理成公開產品包。

## 產品設計結果

### 歷史紀錄工作區

- 單一表格顯示住院病歷與心超、腹超、UGI、LGI。
- 統計卡同時顯示 cumulative count 與 current-filter count，點擊即可切換 facet。
- 醫師、inclusive 起訖日、紀錄類型及補充關鍵字使用同一 filter model。
- loading、empty、error、stale 狀態持久顯示；refresh 失敗時保留舊資料但停用匯出。
- 每筆資料以 `recordKind` 選擇既有 detail／regenerate endpoint，避免重寫文件架構。

### 腹超 Normal gate

只有肝實質、局部肝病灶、IHD、膽囊、胰脾、左右腎及腹水八項全部精確符合 Normal template，才自動產生 Normal diagnosis／impression。任一欄空白一律為 `Not assessed`，不能由空白推論正常。

### 去識別 Excel

- 明細不含姓名、MRN／病歷號、身分證號。
- 搜尋欄只記錄「已套用」，不回寫使用者輸入內容。
- 以 `= + - @` 開頭的 cell 先中和，降低 formula injection。
- 預覽筆數與 backend 重新查詢筆數不同時，在建立 Drive 檔案前停止。

## 遇到的踩坑與處理

### 1. G 槽版本更新不等於公開網站已更新

- 現象：G 槽 source 已是 v7.2，公開 `/exec` 仍顯示 v7.1。
- 根因：Apps Script deployment 指向 immutable project version；Drive 檔案不會自動 `push` 或更新 deployment。
- 處理：先 remote drift pull，再只 push `appsscript.json`、`Code.gs`、`index.html`，最後更新原 deployment ID。
- 預防：每次發版記錄 project HEAD、deployment ID、version、`open-web-app --json` URL 與 post-deploy hashes。

### 2. Backend 能完成，不代表 `google.script.run` 能傳回 payload

- 現象：Dashboard 顯示 transport empty response，server-side collection logic 看似正常。
- 根因：Sheets 的生日與 time-formatted cell 回傳 JavaScript `Date`；Apps Script HTML-service RPC response 不接受含 `Date` 的 object。
- 處理：row mapper 統一序列化，並新增 synthetic public-endpoint test 遞迴拒絕 `Date`、`undefined` 與非 plain object。
- 預防：所有 server-to-client contracts 都要有 RPC-safe serialization test，不能只測 helper function。

### 3. 空白欄位被錯誤推論為 Normal

- 現象：腹超八欄全部空白仍產生 `Normal abdominal sonogram`。
- 根因：舊邏輯用「未命中異常分支」作為 Normal fallback。
- 處理：Normal 改為八項 explicit allow-list 的 exact-match gate；空白顯示 `Not assessed`。
- 預防：臨床表單不得採 normal-by-default；normal 必須由完整正向證據產生。

### 4. 去識別明細安全，但摘要仍可能洩漏識別字串

- 現象：Excel 明細排除姓名／MRN，但摘要曾原樣寫入 Dashboard query。
- 根因：只檢查輸出 columns，沒有追蹤 filter value 的 data flow。
- 處理：摘要只記錄 query 是否套用，不保存內容；加入 identifier-like query regression。
- 預防：de-identification audit 必須涵蓋標題、摘要、檔名、filter metadata 與 error message，不只明細列。

### 5. 篩選器增加了，但工作模型仍被分頁切斷

- 現象：使用者仍無法在同一視圖回答指定期間的住院與各類檢查總量。
- 根因：v7.2 保留 admission／exam tabs，統計與 table context 不一致。
- 處理：依 finding_unknown 的多方案比較，選擇 common-task unified workspace，僅保留必要 audit protections。
- 預防：驗收 UI 時要用臨床工作問題測試，不以「元件已存在」作完成判準。

### 6. UI 與 Excel 使用相同資料，但 metadata key 不一致

- 現象：畫面依 `recordType` 篩選正確，Excel 摘要仍讀過時的 `examType`，因此顯示「全部」。
- 根因：legacy filter compatibility 掩蓋了 metadata mismatch。
- 處理：輸出與畫面都改用 unified `recordType`，加上禁止 obsolete key 的 regression test。
- 預防：除了 rows，也要測 export metadata 與 preview 文案。

### 7. 預覽成功後資料可能已改變

- 現象：stale snapshot 可顯示舊筆數，但 confirm endpoint 重新查詢後可能輸出不同筆數。
- 根因：preview 與 create 之間沒有一致性 contract。
- 處理：前端傳 `expectedCount`；backend 在 `SpreadsheetApp.create` 前重新查詢並比對，不一致即回 `status: stale`。
- 預防：不可把 UI button disabled 當 transaction；重要產物要由 backend 驗證使用者確認的 snapshot expectation。

### 8. `clasp run` 不是 Web App deployment 的通用自我測試入口

- 現象：`clasp run runSelfTest --nondev` 在執行函式前回覆 function／API executable 相關錯誤。
- 根因：既有 Web App deployment 不是 Apps Script API executable。
- 處理：不為了測試另建高權限 deployment；改用 local contract tests、HTTP 200、version markers 與 post-deploy pull hash。
- 預防：預先區分 source validation、Web App validation 與 Apps Script Execution API validation。

### 9. Windows sandbox 1344 不是 app bug

- 現象：部分讀寫命令出現 `SetTokenInformation(TokenDefaultDacl) failed: 1344`。
- 根因：Windows sandbox process-token limitation，與 Apps Script 或 app authentication 無關。
- 處理：對必要且已核准的精確命令使用 permitted execution；source 修改仍走可稽核 patch workflow。
- 預防：錯誤分類先看 process 是否成功啟動，避免把 host sandbox failure 誤判成產品 failure。

### 10. 可部署 source 不必然適合直接公開

- 現象：production `Code.gs` 含 Spreadsheet ID 與 fallback passcode；HTML 含 production deployment fallback。
- 根因：runtime configuration 與 portable source 沒有完全分離。
- 處理：GitHub 產品包採 sanitized copy；production source 保持原部署位元，public copy 以 placeholder 及 fail-closed guard 取代敏感設定。
- 預防：下一版將 deployment-specific configuration 全部移到 Script Properties，repo 只保留 example config。

## 驗證證據

- `tests/check_dashboard_rpc.js`：RPC-safe unified response、雙層統計、`HH:mm` 與 stale export gate。
- `tests/check_revision.js`：Dashboard／Excel／歷史日期／ROC 年齡／S/O／腹超安全。
- `tests/check_note_output.js`：住院病歷輸出格式與未評估欄位不誤寫。
- `tests/check_static.js`：JavaScript syntax、DOM wiring、UTF-8 與 v7.3 marker。
- 獨立 verifier：`ACCEPT`，無本地交付 blocker。
- Production：deployment version 35、HTTP 200、post-deploy pull hashes match。

## 卡住／未完成

- [ ] 由授權使用者登入 passcode，使用 synthetic record 驗證真實 `google.script.run`。
- [ ] 驗證 Sheets 寫入、Doc／PDF／DOCX 產出、Dashboard reload 與 XLSX 下載。
- [ ] `expectedCount` 只能偵測筆數改變；內容改變但筆數相同的理論 race 尚未加入 fingerprint contract。
- [ ] CBD、腎臟長度與 Other 欄目前不在八項 Normal gate；若要納入，需先由臨床 owner 定義可驗證規則。

## 明日待辦

- [ ] 第一優先：以 synthetic data 完成 passcode-authenticated end-to-end smoke test，禁止輸入真實病人資料。
- [ ] 將 smoke-test 結果、時間與失敗步驟追加到 deployment evidence。
- [ ] 決定是否把 Spreadsheet ID、hospital name 與 deployment URL 全部移至 Script Properties／HTML boot config。
- [ ] 由臨床 owner 確認腹超 quantitative fields 與 `Other` 對 Normal gate 的政策。

## 證據界線

目前可以確認 source、tests、HTTP response 與遠端 source bytes；尚不能把這些證據延伸成「真實 Sheets／Drive 操作已成功」或「所有臨床內容已完成正式驗收」。
