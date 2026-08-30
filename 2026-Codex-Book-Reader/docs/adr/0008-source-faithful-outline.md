---
status: accepted
---

# Outline 必須忠於書籍來源

EPUB Outline 使用書檔內建 TOC；PDF 使用文件內建 outline，缺少時改為頁碼導覽；TXT 僅以保守規則辨識「第 X 章」、「Chapter X」等明確章節標題，未辨識到時只顯示單一內容入口。首版不使用 AI 生成或推測 Outline。

## Consequences

- Outline 項目必須能跳到穩定內容位置。
- PDF 頁碼導覽是 fallback navigation，不被標示為 Outline。
- TXT heading detector 必須以測試固定支援規則；不能把一般段落誤標為章節。
