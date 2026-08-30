---
status: accepted
---

# 首版採用無文字註記的 Highlight 模型

每個 Highlight 保存被選取文字、精確閱讀位置、四種顏色之一及建立時間，並可在 Highlight 清單中跳轉或刪除。首版不提供附加文字註記；不具 Text Layer 的掃描型 PDF 不提供 Highlight。

## Consequences

- EPUB Highlight 必須保存可跨重新排版恢復的位置錨點，並保留 text quote 作為定位 fallback。
- TXT Highlight 必須以正規化文字 offset 與 text quote 定位。
- PDF Highlight 必須以頁碼、文字範圍與頁面座標定位，不能只保存畫面 pixel。
- 書籍內容無法重新定位既有 Highlight 時，必須標示為 orphaned，不可靜默跳到錯誤文字。
