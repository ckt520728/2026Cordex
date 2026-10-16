# 已確認的 test seams

以下 public behavior seams 已由核准的 `docs/design/v1-scope.md` 確認。測試透過這些邊界觀察結果，不依賴 private implementation。

## Domain library seam

- 匯入 Book 後可由 Device Library 查詢。
- Reading State transition 與 Must-read／Beloved overlap 符合 domain rules。
- 同一 SHA-256 Book 可辨識重複，刪除時不留下 reading data。

## FormatAdapter seam

- 各格式回報 capabilities、metadata、Outline 與 Logical Location。
- search、next／previous、selection anchor／resolve anchor 行為由 shared contract tests 驗證。
- 不具 Text Layer 的 PDF 明確降級，不假裝支援 search／Highlight。

## Reader session seam

- resume、font／viewport repagination、Bookmark、Highlight 與 search jump 保持相同內容位置。
- 抵達最後內容位置時自動 Finished；手動取消依既有 progress 回到 Reading 或 Unread。

## Storage and backup seam

- OPFS 與 IndexedDB 的 staged import 成功或完整 rollback。
- Reading Data／Full Library backup round trip、SHA-256 dedupe、restore preview 與 conflict choice。
- quota failure、取消及 invalid archive 不留下半套資料。

## Security seam

- malicious EPUB 無法執行 scripts、event handlers、forms、nested frames、remote fetch、危險 URL scheme 或 path traversal。
- Keyword Lookup 只帶選取文字，且一定由使用者手勢觸發。

## User-flow seam

- Library import／search／分類、Reader navigation／panels／settings、offline restart、PWA update recovery。
- iPhone 12 Pro Max 與 iPad portrait／landscape viewport 無水平溢位，44×44 targets 可操作且 keyboard／screen-reader semantics 存在。

