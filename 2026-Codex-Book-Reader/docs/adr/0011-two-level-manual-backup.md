---
status: accepted
---

# 提供兩層 manual backup

首版提供 Reading Data Backup 與 Full Library Backup：前者只含 metadata、分類、進度、Bookmark、Highlight 與設定；後者另含原始 EPUB/TXT/PDF，可透過 Files 或 AirDrop 手動搬移至另一裝置。還原前顯示內容預覽，以 SHA-256 辨識重複 Book；衝突必須由讀者選擇保留本機或備份版本，不得靜默覆寫。

## Consequences

- backup manifest 必須有 schema version、建立時間、app version、檔案清單、byte size 與 SHA-256。
- Reading Data Backup 缺少對應 Book 時，還原預覽必須標示資料無法附著，不能建立假的書籍內容。
- Full Library Backup 可能很大；export/import 必須支援進度、取消、容量預檢與 failure cleanup。
- 備份是 user-managed file，不等同同步；完成後 app 不持續追蹤外部檔案。
