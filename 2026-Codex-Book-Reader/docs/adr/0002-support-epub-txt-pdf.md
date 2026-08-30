---
status: accepted
---

# 首版支援 EPUB、TXT 與 PDF

首版接受 EPUB、TXT 與 PDF。EPUB/TXT 作為 Reflowable Book，完整支援搜尋、字型／字級調整及文字高亮；PDF 作為 Fixed-layout Book，保持原始頁面幾何，僅在文件具 Text Layer 時支援搜尋與高亮，且不承諾字級重排。

## Consequences

- UI 必須在匯入或閱讀時清楚顯示 PDF 的能力限制。
- 測試必須分別覆蓋 EPUB、TXT、具 Text Layer 的 PDF，以及不具 Text Layer 的掃描 PDF。
- 「支援 PDF」不得被解讀為內建 OCR 或 reflow。
