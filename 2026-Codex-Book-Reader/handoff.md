# Handoff

## 目標

建立可由 Safari 加入主畫面、在 iPhone 12 Pro Max 與 iPad 離線使用的個人電子書 PWA。完整核准範圍見 `docs/design/v1-scope.md`。

## 目前狀態

- 2026-08-30：電子書閱讀器「墨頁」核心功能、閱讀介面、備份系統、PWA 更新恢復與 iOS 安裝指引已完成自動化驗證；實機 Safari standalone gate 尚未完成。
- 2026-08-30（最新）：修復 iPhone／iPad 無法從 Google Drive／Dropbox 匯入書籍的問題；修復 EPUB 內嵌圖片（Figure）不顯示的問題。重新部署並完成 production 全檔核對（10／10 SHA-256 一致）。
  - EPUB Figure 已由使用者更新 PWA 後在實際書籍（Avoiding the 'Thucydides Trap'）第 7 章複驗顯示正常。
- 2026-08-30（iPhone／iPad PDF 開啟失敗修復）：
  - PDF.js 6 的 **modern build 需要 Safari 尚未提供的引擎能力**，造成兩種實機錯誤：iPhone 為 `undefined is not a function`（`for await (const value of readableStream)`；Safari 未實作 `ReadableStream.prototype[Symbol.asyncIterator]`），iPad 為 `Can't find variable: Iterator`（Iterator helpers）。
  - 改用 `pdfjs-dist/legacy/build`（內含 Iterator helpers 等 core-js polyfill），並自行補上 `ReadableStream` async iteration polyfill；主執行緒與 PDF worker 各安裝一次。
  - 新增 E2E：以 `addInitScript` 刪除 `globalThis.Iterator` 與 `ReadableStream.prototype[Symbol.asyncIterator]` 模擬 Safari，確認 PDF 仍可開啟並產生 Text Layer；已驗證此測試在修復前為 red。
  - Service Worker 不可用時的訊息改為可行動：說明 Safari 私密瀏覽會停用 Service Worker，離線與更新都無法使用。

- 2026-08-30（iPhone／iPad 實機錯誤修復）：
  - **匯入失敗（`createWritable is not a function`）**：iOS Safari 17.4 以前的 OPFS 沒有 `FileSystemFileHandle.createWritable()`，所有書檔寫入都會失敗。新增 `ResilientBookFileStore`：OPFS 寫入失敗時自動改用 IndexedDB（`IndexedDbBookFileStore`，以 ArrayBuffer 保存），讀取同時涵蓋兩邊；QuotaExceeded 仍照實回報，不會默默換儲存區。
  - **PDF 無法開啟（`undefined is not a function`）**：PDF.js 6 直接呼叫 `Promise.withResolvers`，iOS Safari 17.4 以前沒有。主執行緒與 PDF worker 各自安裝 polyfill；PDF worker 改為自建 entry（`src/formats/pdf/pdf-worker.ts`），先裝 polyfill 再載入 PDF.js worker，`vite.config.ts` 設 `worker.format: "es"`。
  - **找不到更新按鈕**：新增固定顯示於書庫標題列的「更新 App」按鈕（不再只藏在可橫向捲動的備份列）；「檢查更新」會直接啟用等待中的新版 Service Worker 並自動重新載入；另加「強制更新」清除 Service Worker 與 App 快取後重載（不動 Device Library 的書檔與閱讀資料）。
  - PWA precache 加入 `.mjs`／PDF worker，PDF 離線可開。
  - iPad 直向版面：`.library-main` 補上 `min-width: 0`，修正新增按鈕後 grid 撐出水平捲動。

- 2026-08-30（EPUB 閱讀體驗回報修復）：
  - 書內插圖改為不透明淺色底，透明背景的線稿／callout 在 dark mode 不再看不見。
  - 目錄（Outline）顯示頁碼：優先使用書中自帶的印刷頁碼 anchor（例如 `id="pvii"`、`id="p23"`），沒有 anchor 的 Book 才回退為目前排版下的 Rendered Page 序號；PDF 使用實際頁次。
  - 書中 Contents 頁的章節連結可點擊導覽；文字抽取現在保留 link 與 id anchor 的 offset，並在清理文字時同步對位。
- 完整功能涵蓋：
  - 書庫管理：批次匯入（EPUB / TXT / PDF）、全書庫搜尋、已讀／必讀／最愛／閱讀中分類視圖。
  - 閱讀核心：水平分頁閱讀、章節目錄（EPUB TOC / PDF Outline / TXT 章節標題）、書內全文搜尋與定位、書籤（Bookmark）同位去重與清單、文字高亮（4 色 Highlight）、字型排版（System Serif / Sans、字級 14-32px、行距 1.4-2.0）、外部 Google AI Mode / Web Search 隱私最小化選詞查詢。
  - 儲存與備份：IndexedDB（Dexie 4）＋OPFS 離線儲存、Reading Data JSON 備份、Full Library ZIP 原始書檔備份、SHA-256 去重預覽、ID 衝突 skip／replace 明確決策。
  - PWA 體驗：PWA Service Worker 更新恢復橫幅與手動檢查、iOS Safari「加入主畫面」安裝提示與收合記錄、儲存空間使用量（Usage/Quota）即時估算與 80% 高容量預警。
  - 批次匯入：逐本顯示進度；部分失敗時保留並立即顯示已成功匯入的書籍，同時列出失敗檔名與失敗原因。
  - iOS 檔案來源：匯入與還原 Backup 的 file input 不再設 `accept` filter，讓 iOS Files 面板中 Google Drive／Dropbox／Email 附件等 File Provider 項目維持可選取；格式仍由 `detectFormat` 以副檔名／MIME 驗證，不支援時明確回報「只支援 EPUB、TXT、PDF。」。書庫空狀態提供「在 iPhone／iPad 要怎麼匯入書？」步驟說明。
- 驗證成果：
  - Vitest：60 / 60 單元、整合與 security fixture 測試綠燈。
  - Playwright E2E：25 passed、3 skipped；iPhone 12 Pro Max、iPad 直向／橫向使用 WebKit，Desktop 使用 Chromium。3 個 WebKit skip 僅限 offline reload，原因是 Playwright engine internal error；同一流程已由 Chromium 通過。
  - TypeScript：`npm run typecheck` 零錯誤。
  - Production Build：`npm run build` 成功輸出 PWA Service Worker 與靜態 Bundle。
  - Live Deployment：`npm run verify:deploy` 逐檔比對 `dist` 與 `https://codex-book-reader.web.app`，10 個 production 檔案（index.html、main bundle、PDF chunk、PDF worker、CSS、workbox-window、sw.js、workbox runtime、manifest、icon）SHA-256 全數一致。

## 已確認的核心決策

- Offline-first PWA；DRM-free EPUB／TXT／PDF。
- React 19／TypeScript／Vite，Dexie＋OPFS，Web Workers，Vitest＋Playwright。
- 統一 `FormatAdapter`；EPUB adapter、PDF.js、custom TXT adapter。
- Device-local library；無帳號／cloud sync；兩層 manual backup。
- imported EPUB sandbox；Google AI Mode 僅 external handoff。
- iPhone bottom sheets；iPad sidebar／reader side panel。

## 環境注意事項

- Node：`v25.9.0`。
- PowerShell execution policy 會攔截 `npm.ps1`；使用 `npm.cmd`。
- Playwright `webServer` 走 `vite preview`，服務的是 `dist`；**改完 source 必須先 `npm run build` 再跑 `npm run test:e2e`**，否則測到的是舊 bundle。
- Git 可能回報 dubious ownership；使用：

  `git -c safe.directory='D:/2026 Codex Book Reader' <command>`

## 實機注意事項

- Playwright WebKit 已驗證 iPhone 12 Pro Max 與 iPad viewport 的 Layout、無水平溢位與功能流程，但不能取代實機 Safari standalone。
- Playwright WebKit 未提供本專案可用的 OPFS，E2E 使用測試專用的持久化 storage boundary double；原生 OPFS 與離線重啟需在 iPhone／iPad 實機驗證。
- 字型／行高／PDF zoom 尚未持久化至 Reading Data Backup；這是 storage schema 決策，不應在未確認 migration 與 conflict semantics 前直接加入。
- EPUB Render Surface 保證安全結構化文字、Highlight、**書內嵌圖片（Figure）** 與 **book 內部連結**；圖片只取自 EPUB 封裝內的 PNG／JPEG／GIF／WebP／AVIF／SVG，remote 與 `data:` src 一律不載入。仍不保證原始 CSS／table fidelity 或可點擊外部連結。
- 原始需求與錯誤報告的逐項證據見 `docs/testing/original-goal-verification.md`。
- 實機 gate 依 `docs/testing/real-device-safari-checklist.md` 執行，未取得裝置證據前不得宣稱 Safari standalone 完成。
