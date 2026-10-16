---
status: accepted
---

# 分離 Reading State 與書庫分類

每本 Book 恰有一個 Reading State：Unread、Reading 或 Finished；進入第一個閱讀位置後轉為 Reading，抵達最後內容位置後自動轉為 Finished，讀者亦可手動標記或取消 Finished。Already Read 書單是 Finished 的檢視；Must-read 與 Beloved 則是可重疊、且與 Reading State 獨立的分類。

## Consequences

- 同一本 Book 可以同時出現在 Must-read、Beloved 與 Already Read 檢視。
- 手動取消 Finished 時，若仍有閱讀進度則回到 Reading，否則回到 Unread。
- 重新開啟 Finished Book 不會自動把狀態降回 Reading。
