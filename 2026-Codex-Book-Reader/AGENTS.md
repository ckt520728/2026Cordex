# AGENTS.md

## 身分與語言

- 協作者預設具臨床醫師（腎臟病、糖尿病、複雜內科急症）與認知神經科學博士的問題意識，但本專案不是醫療軟體。
- 對話、文件、可見 UI、commit message 一律使用自然繁體中文；technical terms、identifier、API 名稱保留 English。
- 先給結論，再提供必要證據。

## 核心準則

1. 先思考再寫程式：明說假設，重大且不可逆的未知不得自行猜測。
2. 簡潔優先：採最少足夠程式碼，不過度設計。
3. 外科手術式變更：只修改當前目標需要的檔案，不順手重構。
4. 目標驅動：每項工作先定義可執行驗證，迴圈直到通過。

## 必用設計流程

### `/grill-with-docs`

- 產品、domain、security、storage、deployment 或 hard-to-reverse architecture 改變前，逐一提出決策問題並附建議答案。
- 一次只處理一個決策；未達共享理解前不實作該變更。
- 已確認 vocabulary 立即更新 `CONTEXT.md`；符合 ADR 門檻的決策立即寫入 `docs/adr/`。
- 目前核准的 v1 boundary 以 `docs/design/v1-scope.md` 為準。

### `/Thariq_finding_unknown`

本機未安裝同名 skill，因此專案以 `docs/design/unknowns.md` 實作等價治理層：

- `map-vs-territory`：已確認事實與尚待決策分離。
- `blindspot-pass`：每次 milestone 前檢查格式降級、iOS/WebKit、offline、storage、security、accessibility。
- `reference-anchor`：來源參考與可借鑑／不可沿用之處可追溯。
- `decision-first-plan`：不可逆選擇先 ADR，後實作。
- `deviation-log`：偏離來源專案或核准 scope 時記錄原因。
- `verify-with-rubric`：只以測試、build、rendered behavior 與裝置證據宣稱完成。

## Architecture boundaries

- 部署：Offline-first PWA；目標為 iPhone 12 Pro Max 與 iPad Safari／standalone mode。
- 書檔：OPFS；metadata 與 reading data：IndexedDB（Dexie）。
- 格式：DRM-free EPUB、TXT、PDF；不含 OCR、MOBI/AZW、CBZ/CBR。
- imported EPUB 是 untrusted static content，必須 sandbox、sanitize、阻止 active content 與 remote fetch。
- UI/domain 只依賴 `FormatAdapter` contract，不直接依賴 Readium、PDF.js 或特定 renderer。
- Electron 只作 architecture consultation，不加入 runtime 或 packaging。
- Google AI Mode 只採 privacy-minimized external handoff；不得擷取回應或外送選取範圍外內容。

## TDD 與驗證

- 先讀 `CONTEXT.md`、相關 ADR 與 `docs/testing/test-seams.md`。
- 嚴格 red → green；每次只做一個 vertical slice。
- 測試 public behavior，不測 private method，不 mock 自有 modules。
- regularly 執行單檔測試與 typecheck；結束前執行 full tests、production build、Playwright WebKit 與 security fixtures。
- Playwright WebKit 不等同實機 Safari；handoff 必須清楚標示實機驗證是否完成。

## Git 與資料安全

- branch 使用 `main`；commit message 使用繁體中文。
- 不提交 user-owned books、runtime library、backup、credential、token 或 `.env`。
- 只 stage 本任務檔案；不刪除或覆寫來源不明的使用者檔案。
- 此環境若出現 dubious ownership，Git command 使用 repo-scoped `-c safe.directory='D:/2026 Codex Book Reader'`，不要修改全域設定。

