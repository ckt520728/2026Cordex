---
status: consultation
reviewed: 2026-08-29
---

# Electron architecture consultation

## 結論

Electron 不能部署至 iPhone 或 iPad，也不取代已接受的 Offline-first PWA。可借鑑的是 security boundary、責任分離與 background work patterns，不是 Electron desktop runtime。

## 可轉用的 patterns

1. **Trusted App Shell / Untrusted Book Renderer**：只有受信任的 app services 可修改 OPFS／IndexedDB、建立 backup 或產生外部查詢；Book content 只取得閱讀所需的最小能力。
2. **Narrow typed interfaces**：以小型、可驗證的 commands／DTO 溝通，不把 storage 或外部 navigation 能力直接暴露給 rendering layer。
3. **Sandbox imported content**：EPUB XHTML 視為不受信任內容，以 sandboxed iframe、CSP 與 active-content sanitization 隔離。
4. **Worker pipeline**：EPUB 解壓、搜尋、PDF text extraction、SHA-256 與 backup 打包移出 UI main thread，支援取消、進度與 bounded concurrency。
5. **Mediated resource access**：Book content 透過受控 resource resolver 取得 OPFS 資源，不接觸 absolute path 或任意 filesystem API。

## 不轉用

- Electron `BrowserWindow`、main/preload/IPC、Node.js `fs`、custom protocol、ASAR 與 packaging。
- Electron embedded Chromium 的 browser assumptions；驗證準據仍是 iOS Safari／WebKit。
- Desktop absolute paths、unrestricted filesystem access 或新增 Electron wrapper。
- 不把 Web Worker 當成 security boundary；它只負責效能與工作隔離。

## 建議的 architecture checks

- 定義統一 `FormatAdapter` contract：outline、search、location、selection-to-anchor、resolve-anchor、next／previous，並由 EPUB／TXT／PDF 共用 contract tests。
- Import／restore 使用 staged transaction：驗證 MIME、結構、ZIP entry path、展開大小與 SHA-256 後才寫入 OPFS，最後以單一 IndexedDB transaction 登記 Book。
- iOS 首版同時只處理一個大型 import／backup，避免 memory spike。
- Book 內部連結解析為 Logical Location；外部 URL 需 HTTPS、讀者手勢與明示確認。

以上是 consultation 建議，不代表已接受的產品或架構決策；其中安全邊界須經下一輪 `/grill-with-docs` 確認。

## Primary references

- Electron introduction: https://www.electronjs.org/docs/latest/
- Electron installation and supported platforms: https://www.electronjs.org/docs/latest/tutorial/installation
- Electron process model: https://www.electronjs.org/docs/latest/tutorial/process-model
- Electron context isolation: https://www.electronjs.org/docs/latest/tutorial/context-isolation
- Electron security: https://www.electronjs.org/docs/latest/tutorial/security
- Electron performance: https://www.electronjs.org/docs/latest/tutorial/performance
- HTML iframe sandbox: https://html.spec.whatwg.org/multipage/iframe-embed-object.html
- Content Security Policy Level 3: https://www.w3.org/TR/CSP3/
- Web Workers: https://html.spec.whatwg.org/multipage/workers.html
