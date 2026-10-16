# 個人電子書閱讀

本 context 描述讀者匯入、整理與閱讀個人電子書時使用的共同語言。

## Language

**Book**：
讀者匯入書庫並可獨立追蹤閱讀狀態的一份作品。
_Avoid_：File、document

**Device Library**：
一個裝置上保存的 Books 與其閱讀資料集合；首版不代表可跨裝置同步的帳號書庫。
_Avoid_：Cloud Library、account library

**Reading State**：
Book 在閱讀歷程中的單一狀態，依序為 Unread、Reading 或 Finished。
_Avoid_：Shelf、tag

**Finished**：
讀者已抵達 Book 最後內容位置，或已手動標記完成的 Reading State。
_Avoid_：Already Read shelf、archived

**Must-read**：
讀者主動標記為優先閱讀的獨立分類，可與任何 Reading State 或 Beloved 同時存在。
_Avoid_：Unread、Reading queue

**Beloved**：
讀者主動標記為喜愛的獨立分類，可與任何 Reading State 或 Must-read 同時存在。
_Avoid_：Finished、rating

**Reader Search**：
只在目前開啟 Book 的可搜尋文字中尋找內容，結果可返回對應閱讀位置。
_Avoid_：Library Search、web search

**Library Search**：
依 title、author 或檔名篩選 Device Library 中的 Books，不搜尋書籍全文。
_Avoid_：full-library text search、Reader Search

**Highlight**：
讀者對一段可選取文字建立的持久色彩標記，可從清單返回原閱讀位置。
_Avoid_：Bookmark、note、selection

**Bookmark**：
讀者對目前閱讀位置建立的持久標記，不要求選取文字；同一邏輯位置最多存在一個。
_Avoid_：Highlight、Reading Progress

**Keyword Lookup**：
讀者主動將已選取的單字或片語交給外部 Web Search 或 Google AI Mode；不包含未選取的書籍上下文。
_Avoid_：automatic enrichment、background search

**Reading Data Backup**：
不含原始書檔的可攜備份，保存 metadata、分類、進度、Bookmark、Highlight 與閱讀設定。
_Avoid_：Full Library Backup、sync

**Full Library Backup**：
包含 Reading Data Backup 與原始書檔的可攜備份，可由讀者手動搬移至另一裝置。
_Avoid_：cloud library、sync

**Outline**：
Book 提供或可由明確章節標題辨識的內容結構，用於跳轉；不得包含系統臆測的章節。
_Avoid_：AI summary、page list

**Logical Location**：
不受 viewport、字級或方向改變影響的內容位置，用於保存進度及返回相同內容。
_Avoid_：Rendered Page number、scroll offset

**Rendered Page**：
目前排版條件下呈現的一個 viewport；Reflowable Book 的 Rendered Page 數量可隨設定改變。
_Avoid_：Logical Location、PDF page

**Book Render Surface**：
目前 Book 內容的可見且可選取呈現；必須保留該格式必要的 geometry 與閱讀語意。
_Avoid_：Extracted Text View、PDF Viewer

**Reflowable Book**：
內容會依閱讀區域與文字設定重新排版的 Book；首版包含 EPUB 與 TXT。
_Avoid_：Responsive PDF

**Fixed-layout Book**：
每頁幾何位置固定、不因文字設定重新排版的 Book；首版指 PDF。
_Avoid_：Reflowable PDF

**Text Layer**：
Fixed-layout Book 中可供選取、搜尋與高亮的機器可讀文字。
_Avoid_：OCR result
