# 墨頁 Codex Book Reader — 專案封存 (Artifact Snapshot)

離線優先（Offline-First）跨裝置個人電子書 PWA，支援 EPUB / PDF / TXT。
本資料夾是 2026-08-30 的完整原始碼快照（不含 `node_modules` 與建置產物）。

- **線上正式站點**：<https://codex-book-reader.web.app>
- **實作總結與踩坑紀錄**：[`docs/2026_codex_book_reader_wrapup_and_pitfalls.md`](docs/2026_codex_book_reader_wrapup_and_pitfalls.md)
- **原始需求逐項稽核**：[`docs/testing/original-goal-verification.md`](docs/testing/original-goal-verification.md)
- **交接狀態與環境注意事項**：[`handoff.md`](handoff.md)
- **不可逆決策紀錄（ADR）**：[`docs/adr/`](docs/adr/)
- **領域共同語言**：[`CONTEXT.md`](CONTEXT.md)

## 快速開始

```bash
npm install
npm run dev          # 本機開發（需 http://，不可用 file://）
npm run test:run     # Vitest 單元／整合／security fixtures
npm run build        # 產出 PWA bundle 至 dist/
npm run test:e2e     # Playwright 跨裝置 E2E（務必先 build）
npm run verify:deploy # 比對 dist 與 production 全部檔案的 SHA-256
```

## 驗證基準（2026-08-30）

| 項目 | 結果 |
| :--- | :--- |
| Vitest | 60 / 60 passed（13 files） |
| Playwright E2E | 29 passed、3 skipped（4 projects） |
| TypeScript | 0 errors（strict） |
| Production build | 成功（PWA bundle） |
| Live deployment | 10 / 10 檔案 SHA-256 一致 |

## 尚未關閉的 gate

iPhone／iPad Safari standalone 實機驗證（加入主畫面、原生 OPFS、飛航模式重啟、
Dynamic Type、safe area、長按選取與長時間儲存）依
[`docs/testing/real-device-safari-checklist.md`](docs/testing/real-device-safari-checklist.md) 執行，
未取得裝置證據前不宣稱完成。
