---
status: accepted
---

# 採用水平 paginated navigation

EPUB/TXT 依目前 viewport、字級與排版動態產生 Rendered Pages；設定改變可重新計算頁數，但必須維持 Logical Location。PDF 每一頁對應原始文件頁。前後頁皆支援可見按鈕、左右 swipe 與外接鍵盤方向鍵；首版不實作 3D page-curl 動畫。

## Consequences

- Reading Progress、Bookmark、Highlight 與 Outline jump 不得只保存 Reflowable Book 的 Rendered Page number。
- 重新分頁完成前必須提供穩定 loading 狀態，且不能把暫時頁數寫入進度。
- swipe 不得攔截文字選取、系統返回手勢或 Outline 面板操作。
- reduced-motion 設定下翻頁不得依賴非必要動畫。
