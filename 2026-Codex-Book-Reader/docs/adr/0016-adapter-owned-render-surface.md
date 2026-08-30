---
status: accepted
reviewed: 2026-08-30
---

# FormatAdapter 擁有 Book Render Surface

Reader 只提供受信任的 host，由 `FormatAdapter` 負責目前內容的 Render Surface 與 selection semantics。PDF adapter 使用 PDF.js canvas 與 selectable Text Layer 保留原始頁面 geometry；UI 不直接依賴 PDF.js，也不以抽取文字重建 PDF 版面。

## Considered Options

- 採用：adapter-owned Render Surface；保留 renderer 邊界與 PDF.js 原生 page／Text Layer 行為。
- 不採用：adapter 回傳圖片與定位文字資料，再由 React 重建；這會複製 PDF.js 的排版責任，增加文字定位與旋轉／縮放誤差。

## Consequences

- `ReaderSession` 提供可取消的 render lifecycle，負責清理自行建立的 DOM、event listener 與 PDF.js resources。
- `ReaderScreen` 只管理 host、navigation 與 persistence，不辨識 PDF.js page proxy、viewport 或 text item。
- selection token 由 Render Surface 產生，UI 不再以顯示字串 `indexOf` 反推 Logical Location。
