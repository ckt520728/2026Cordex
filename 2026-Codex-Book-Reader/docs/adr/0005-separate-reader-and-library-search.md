---
status: accepted
---

# 分離 Reader Search 與 Library Search

首版的 Reader Search 搜尋目前 Book 的全文，顯示命中片段並可跳至閱讀位置；Library Search 僅比對 title、author 與檔名。首版不預先建立跨 Device Library 的全文索引，以限制行動裝置的 storage、CPU 與匯入延遲成本。

## Consequences

- EPUB/TXT 必須提供目前書籍全文搜尋；PDF 僅在具 Text Layer 時提供。
- Reader Search 結果需包含命中片段、結果序號及可重現的閱讀位置。
- Library Search 必須即時反映 metadata 更新，但不應暗示會搜尋書籍內容。
