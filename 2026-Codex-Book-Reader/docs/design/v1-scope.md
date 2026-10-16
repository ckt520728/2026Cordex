---
status: accepted
reviewed: 2026-08-29
---

# Ebook Reader v1 scope

## Product outcome

建立可由 Safari 加入主畫面、在 iPhone 12 Pro Max 與 iPad 離線使用的個人電子書 PWA。Book、閱讀資料與設定預設只存在 Device Library，不需帳號或 server。

## Required capabilities

### Library

- 由 iOS Files picker 批次匯入 DRM-free EPUB、TXT、PDF。
- 顯示 All、Reading、Must-read、Beloved、Finished views；Must-read／Beloved 可重疊。
- 依 title、author、檔名執行 Library Search。
- 顯示 storage usage、匯入進度、錯誤及容量不足處理。
- Reading Data Backup 與 Full Library Backup；restore preview、SHA-256 去重、衝突明示處理。

### Reader

- EPUB/TXT 水平動態分頁；PDF 原始頁面導覽。
- 可見 Previous／Next controls、左右 swipe、方向鍵、進度保存與 resume。
- EPUB TOC、PDF outline 或頁碼 fallback、TXT 保守章節辨識。
- EPUB/TXT：System Sans／Serif、14–32 px、line height 1.4–2.0；PDF zoom。
- Reader Search：目前書籍全文；PDF 只在具 Text Layer 時提供。
- Bookmark：目前 Logical Location toggle、清單、跳轉、刪除與同位置去重。
- Highlight：四種顏色、精確定位、清單、跳轉、刪除；無文字註記。
- Keyword Lookup：選取詞可明示交給 Web Search 或 Google AI Mode，不外送周邊內容，回應不回存。

### Offline, security and portability

- app shell 與已匯入書籍可離線使用；外部 Keyword Lookup 除外。
- 書檔保存於 OPFS，metadata／reading data 保存於 IndexedDB。
- imported EPUB 視為 untrusted static content；停用 active content、remote fetch 與未確認 external navigation。
- Trusted App Shell／Book Renderer boundary、staged import transaction、可取消的 single-heavy-job worker pipeline。
- PWA manifest、service worker、install guidance 與 update recovery flow。

### Responsive and accessible UI

- iPhone：分類 chips、全螢幕 Reader、feature bottom sheets。
- iPad：Library sidebar＋grid、Reader 可收合 side panel。
- 44×44 touch targets、safe area、portrait／landscape、keyboard、screen reader、contrast、Dynamic Type、reduced motion。
- visible UI 使用自然繁體中文，technical identifiers 與必要術語保留 English。

## Technical baseline and gate

- React、TypeScript、Vite、`vite-plugin-pwa`、Dexie 4、OPFS、Web Workers、Vitest、Playwright WebKit。
- Readium TypeScript Toolkit compatibility gate 未通過純 local packaged EPUB／no-server constraints；依 `docs/design/readium-spike.md` 改用相同 `FormatAdapter` contract 的受限 local EPUB adapter。
- PDF 使用 Mozilla PDF.js；TXT 使用自建 adapter。

## Explicit v1 non-goals

- DRM-protected books、OCR、MOBI／AZW、CBZ／CBR。
- 帳號、cloud sync、server-side library 或多人共享。
- 跨全書庫全文搜尋。
- Highlight 文字註記或獨立 annotation export；Highlight 仍包含於 backup。
- 內嵌或擷取 Google AI Mode 回應、背景 AI 關鍵字偵測。
- TTS、audiobook、3D page-curl、Electron wrapper、Native App Store package。

## Verifiable success criteria

1. Production build、unit、integration、FormatAdapter contracts、security fixtures 與 Playwright WebKit tests 全部通過。
2. 在 iPhone 12 Pro Max 與代表性 iPad portrait／landscape viewports 驗證所有 required capabilities，無水平溢位且 controls 可操作。
3. 安裝後離線重新啟動，可開啟已匯入的 EPUB、TXT、PDF 並保留進度、Bookmark、Highlight 與分類。
4. 字級／方向改變後仍返回相同 Logical Location；PDF capability degradation 清楚可見。
5. malicious EPUB fixtures 無法執行 script、remote fetch、form、nested frame 或越界存取。
6. backup round trip 及衝突預覽通過，SHA-256 與 manifest 可驗證。
7. `AGENTS.md`、`handoff.md`、README、ADR、CONTEXT 與 unknown ledger 與實作一致。
