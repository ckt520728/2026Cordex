---
status: accepted
---

# 採用 device-local library 與 app-private storage

首版透過 iOS Files picker 匯入一本或多本 EPUB、TXT、PDF，將書檔複製至 app-private Origin Private File System，並以 IndexedDB 保存 metadata、閱讀進度、書籤與高亮。產品提供容量警示及手動備份匯出，但不建立帳號、server library 或跨裝置同步。

## Consequences

- iPhone 與 iPad 的 Device Library 彼此獨立，除非讀者手動匯出及還原備份。
- 匯入前後必須估算 storage usage/quota，並處理 `QuotaExceededError`。
- 啟動時必須 feature-detect 必要的 storage APIs；不支援或處於 Private Browsing 時應清楚阻止不可靠的匯入流程。
- 刪除 Book 時必須一致清除書檔及其衍生資料，並要求明確確認。
