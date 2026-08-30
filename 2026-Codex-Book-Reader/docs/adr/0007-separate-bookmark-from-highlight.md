---
status: accepted
---

# Bookmark 與 Highlight 分離

Bookmark 表示讀者想返回的目前閱讀位置，不需要文字選取；系統依章節或頁碼及短摘要自動命名，並提供清單、跳轉與刪除。同一 Book 的同一邏輯位置最多存在一個 Bookmark，重複操作視為切換移除。

## Consequences

- EPUB Bookmark 以穩定的內容位置錨點保存，TXT 以文字 offset 保存，PDF 以頁碼及頁內位置保存。
- 字級、viewport 或方向改變後，Bookmark 必須返回相同內容，而不是舊 rendered page number。
- Bookmark 不保存選取範圍或顏色；有選取文字的持久標記必須使用 Highlight。
