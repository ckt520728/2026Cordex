---
status: accepted
---

# Imported EPUB 一律以 untrusted static content 隔離

所有 imported EPUB 都視為不受信任的靜態出版物。Book Renderer 停用 scripts、inline event handlers、forms、nested iframes、objects／embeds 與自動外部網路請求；只允許經檢查的本機文字、CSS、圖片、字型及靜態媒體。外部 HTTPS 連結必須由讀者手勢觸發、顯示目的地並經明示確認後，交由 Trusted App Shell 開啟。

## Consequences

- EPUB XHTML 不得直接注入 Trusted App Shell DOM，必須置於 sandboxed iframe 並套用限制性 CSP。
- import pipeline 必須移除 active content、拒絕危險 URL schemes、阻止 path traversal 與 remote resource fetch。
- Book Renderer 不得直接存取 OPFS、IndexedDB、backup、clipboard 或 external navigation APIs。
- Book 內部連結由受控 resolver 轉為 Logical Location；Keyword Lookup 只能由 Trusted App Shell 依讀者選取與手勢產生。
- 測試必須包含惡意 EPUB fixtures，證明 script、form、nested frame、remote fetch 與 filesystem escape 均被阻擋。
