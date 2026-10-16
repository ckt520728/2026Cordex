# 原始目標完成稽核

日期：2026-08-30

本文件把使用者原始目標與 Word 錯誤報告逐項對應到目前可執行證據。`Playwright WebKit` 是自動化瀏覽器證據，不等同 iPhone／iPad Safari standalone 實機證據。

## 原始需求

| 需求 | 目前狀態 | 權威證據 |
| --- | --- | --- |
| 可部署的 Offline-first PWA | 自動化通過；已部署 | Firebase Hosting `https://codex-book-reader.web.app`；10 個 production 檔案與本機 `dist` SHA-256 全數一致；Chromium offline reload E2E 通過 |
| iPhone 12 Pro Max | WebKit viewport 通過；實機待驗 | `iphone-12-pro-max` project 驗證 428×926、touch、bottom sheet、無水平溢位與閱讀流程 |
| iPad portrait／landscape | WebKit viewport 通過；實機待驗 | `ipad-portrait`、`ipad-landscape` projects 驗證書庫、reader、side panel 與持久化流程 |
| Bookmark | 通過 | 建立、清單、跨 reload 恢復與定位 E2E |
| Reader Search／Library Search | 通過 | 書內全文命中與跳轉、title／author／檔名篩選 E2E |
| 字型、字級與行距 | 當次 session 通過；跨 session 待決策 | E2E 直接驗證 `system-sans` computed font family、24px font size、48px line height |
| PDF zoom | 通過 | E2E 將 100% 改為 150%，直接驗證 PDF Render Surface width 增加至少 45% |
| Highlight | 通過 | EPUB／TXT exact-offset selection、PDF Text Layer selection、4 色 decoration、清單與跨 reload 恢復 |
| Outline | 通過 | EPUB TOC、TXT heading、PDF embedded／heading／page fallback；E2E 驗證章節跳轉 |
| Previous／Next | 通過 | 可見按鈕與 Logical Location persistence；E2E 驗證前後翻頁，keyboard／touch handlers 仍由實機 checklist 覆核 |
| Already Read list | 通過 | 手動標記 Finished 並在「已讀」view 找回的跨裝置 E2E |
| Must-read list | 通過 | 標記 Must-read 並在「必讀」view 找回的跨裝置 E2E |
| Beloved list | 通過 | 標記 Beloved 並在「最愛」view 找回的跨裝置 E2E |
| 多書批次匯入一致性 | 通過 | 部分失敗時成功書籍立即顯示、逐本進度與失敗檔名及原因；unit red→green |
| iPhone／iPad 從 Google Drive／Dropbox 匯入 | 修復並部署；實機待驗 | 移除 file input `accept` filter（iOS Files 面板會以 UTI 過濾，第三方 File Provider 的 `.epub` 會變灰無法點選）；unit red→green 驗證兩個 input 均無 `accept`，且不支援格式回報明確原因 |

## Word 錯誤報告

| 問題 | 修復與證據 |
| --- | --- |
| PDF 圖形未顯示 | PDF.js canvas 保留原始頁面 geometry；Figure fixture E2E 與人工視覺稽核通過 |
| EPUB 圖形未顯示 | 文字串流以 Private Use Area 單一 code unit 作 image token，Render Surface 將 token 換成 `<img>`（blob URL；無 `URL.createObjectURL` 時退回 data URL），token 字元以 visually hidden 節點保留，Highlight／Bookmark offset 不位移；unit red→green＋WebKit／Chromium E2E 驗證 `naturalWidth > 0` |
| EPUB 圖形未顯示（使用者複驗） | 使用者更新 PWA 後於實際書籍第 7 章確認 Figure 7.1／7.2 正常顯示（2026-08-30） |
| EPUB 插圖在 dark mode 過暗 | `.reader-figure-image` 改為不透明淺色底；透明背景的 callout／線稿不再與深色頁面同化 |
| 目錄沒有頁碼 | Outline item 新增 `pageLabel`：EPUB 取書中印刷頁碼 anchor（實測該書 169 個 anchor，Contents → 第 vii 頁），無 anchor 時回退 Rendered Page；PDF 用實際頁次；unit＋WebKit／Chromium E2E |
| 書中 Contents 頁無法點擊章節 | 文字抽取保留 `<a href>` 與 id anchor 的 offset 並隨清理同步對位；Render Surface 產生 `a.reader-link`，點擊經 `onInternalLink` 導覽（實測該書解析出 2064 個內部連結） |
| iPhone／iPad 匯入失敗：createWritable is not a function | OPFS 在 iOS 17.4 以前沒有 `createWritable()`；改為 OPFS 失敗即自動改用 IndexedDB 的 `ResilientBookFileStore`，unit red→green（含 Quota 仍需回報、兩邊讀取涵蓋） |
| iPhone PDF 無法開啟：undefined is not a function | PDF.js 6 需要 `Promise.withResolvers`；主執行緒與自建 PDF worker 各安裝 polyfill，WebKit／Chromium E2E PDF 流程通過 |
| iPhone PDF：undefined is not a function（`for await ... of readableStream`） | Safari 未實作 `ReadableStream.prototype[Symbol.asyncIterator]`；自行安裝 polyfill（主執行緒＋PDF worker），unit 4 項 red→green |
| iPad PDF：Can't find variable: Iterator | PDF.js modern build 需要 Iterator helpers；改用 `pdfjs-dist/legacy/build`（含 core-js polyfill） |
| 上述兩者的回歸保護 | E2E 以 `addInitScript` 刪除 `Iterator` 與 stream async iterator 模擬 Safari；已確認該測試在修復前 red、修復後 4 個 project 全綠 |
| 找不到更新 App 的按鈕 | 書庫標題列固定顯示「更新 App」；「檢查更新」直接啟用等待中的 Service Worker 並重新載入；「強制更新」清除 SW 與 App 快取後重載；E2E 驗證兩個按鈕可見 |
| PDF 文字／行距異常 | 不再以抽取文字重建 PDF 可見頁面；改用 canvas＋Text Layer |
| PDF 選取／Highlight 後畫面失效 | selection token 由 Text Layer 產生；green Highlight overlay、清單與無 stale-reference error E2E 通過 |
| EPUB Highlight 偶發無法定位 | selection offset 由實際 Render Surface text nodes 計算；重複文字 exact-offset unit test 通過 |
| EPUB heading 對比不足 | dark mode heading contrast E2E ≥ 4.5 |
| EPUB Index page numbers 各佔一行 | short Roman／numeric page labels 壓為單行；unit 與 E2E 通過 |
| 找不到版本更新按鈕 | live UI 顯示「檢查更新」；PWA update flow unit／E2E 通過 |

## 本次最終自動化結果

- Vitest：60／60 passed，13 files。
- Playwright：25 passed、3 skipped，4 projects。
- TypeScript：零錯誤。
- Production build：成功；PWA precache 8 entries。
- Security fixtures：EPUB active content、remote resources、nested frames 與 ZIP path traversal 通過。
- Live deployment：10／10 檔案 SHA-256 一致（`npm run verify:deploy`，逐一列印本機與 production hash）。

三個 skipped case 都是 Playwright WebKit 的 offline reload engine internal error；同一 case 已由 Desktop Chromium 通過。WebKit storage 流程使用測試專用、可跨 reload 的 boundary double，不能當作原生 OPFS 實機證據。

## 尚未完成的 goal gates

1. iPhone 與 iPad Safari standalone 實機：加入主畫面、原生 OPFS、飛航模式重啟、Dynamic Type、safe area、文字長按選取與長時間儲存。
2. 閱讀外觀設定的 storage schema：目前只在 Reader session 生效；若要跨 session／backup，需先確認 per-book 或 global semantics。
3. EPUB rich-content fidelity：已支援書內嵌圖片（Figure）；仍不保證原始 CSS、table fidelity 或 external link interaction。
