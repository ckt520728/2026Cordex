---
status: accepted
---

# 採用 React TypeScript PWA 與可替換 FormatAdapter

產品以 React、TypeScript、Vite 與 `vite-plugin-pwa` 建立 Offline-first PWA；Dexie 4 管理 IndexedDB metadata，原生 OPFS 保存書檔。閱讀核心以統一 `FormatAdapter` contract 隔離格式差異：EPUB 優先對 Readium TypeScript Toolkit 執行 compatibility/security spike，PDF 使用 Mozilla PDF.js，TXT 使用自建輕量 adapter；重型 import、index、hash 與 backup 工作放入 Web Workers。

## Consequences

- `FormatAdapter` 必須至少定義 metadata、outline、search、Logical Location、selection-to-anchor、resolve-anchor、next／previous 與 capability reporting，並有跨格式 contract tests。
- 若 Readium 無法在純 local PWA、OPFS 與 sandbox policy 下通過 spike，只替換 EPUB adapter，不得讓 UI 或 domain model 依賴特定 EPUB engine。
- 測試基線為 Vitest 與 Playwright WebKit；Playwright WebKit 不能取代 iPhone／iPad Safari standalone 實機驗證。
- dependency versions 只在 spike 與 install 後鎖定；不得把文件中的「latest」當成可重現版本。
