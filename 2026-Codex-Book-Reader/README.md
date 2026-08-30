# 2026 Codex Book Reader

可安裝至 iPhone 12 Pro Max 與 iPad 的 Offline-first 個人電子書 PWA。

## 狀態

核心閱讀流程已實作；目前以 Playwright WebKit／Chromium 自動化驗證，實機 Safari standalone 與部分 v1 收尾項目仍待驗證。核准範圍與驗證條件請見：

- [`docs/design/v1-scope.md`](docs/design/v1-scope.md)
- [`CONTEXT.md`](CONTEXT.md)
- [`docs/adr/`](docs/adr/)
- [`handoff.md`](handoff.md)

## 特色與架構

- **格式支援**：DRM-free EPUB、TXT、PDF（具 Text Layer 時支援搜尋與高亮）。
- **閱讀體驗**：水平動態分頁、章節目錄（EPUB TOC / PDF Outline / TXT 章節）、書內全文搜尋、書籤定位與同位去重、4 色文字高亮、字型與字級設定（14–32px、行距 1.4–2.0、Serif/Sans）、隱私最小化外部 Google AI Mode / Web Search handoff。
- **書庫分類**：全部、閱讀中、必讀（Must-read）、最愛（Beloved）、已讀（Finished）。
- **私密與離線**：純前端 Offline-first PWA，IndexedDB（Dexie 4）保存閱讀紀錄，OPFS 保存原始書檔，無需帳號或外部伺服器。
- **雙層備份**：Reading Data JSON 備份與包含原始書檔的 Full Library ZIP 備份；SHA-256 去重預覽、ID 衝突 skip／replace 決策。
- **PWA 完善度**：Service Worker 更新提示與快取恢復機制、iOS Safari「加入主畫面」提示、儲存容量監控與高使用量預警。
- **行動優先**：專為 iPhone 12 Pro Max 與 iPad 精心調校之響應式版面，44×44 touch targets、無水平溢位。

## 已知驗證邊界

- Playwright WebKit 不等同 iPhone／iPad Safari standalone 實機；加入主畫面、原生 OPFS、離線重啟、Dynamic Type 與長時間儲存仍需實機 gate。
- Playwright WebKit 尚無本專案可用的 OPFS，因此 E2E 以測試專用、可跨 reload 的 storage boundary double 驗證功能；Chromium 已通過真正的 offline reload。
- 字型、字級、行距與 PDF zoom 目前只在當次 Reader session 生效，尚未寫入 Reading Data Backup。
- EPUB 目前以安全的結構化純文字 Render Surface 顯示；書內圖片、原始 CSS／table fidelity 與可點擊外部連結尚未納入本版保證。

## 指令與驗證

```bash
# 安裝相依套件
npm install

# 執行單元與整合測試（Vitest）
npm run test:run

# 執行 TypeScript 靜態檢查
npm run typecheck

# 執行跨裝置 E2E 瀏覽器測試（Playwright）
npm run test:e2e

# 建置 PWA 生產版本
npm run build

# 預覽生產版本
npm run preview
```

