# iPhone／iPad Safari Standalone 實機驗證清單

目標網址：`https://codex-book-reader.web.app`

此清單只記錄實際裝置證據；不可用 Playwright WebKit 結果代填。測試書須為 DRM-free，且不得把私人書檔、畫面內容或裝置識別資訊提交至 repository。

## 測試裝置紀錄

| 欄位 | iPhone | iPad |
| --- | --- | --- |
| 型號 | iPhone 12 Pro Max |  |
| iOS／iPadOS version |  |  |
| Safari version |  |  |
| 測試日期 |  |  |
| portrait／landscape |  |  |
| 結果 | 未執行 | 未執行 |

## A. 安裝與更新

1. Safari 開啟目標網址，確認標題「墨頁 Book Reader」與「檢查更新」按鈕可見。
2. 使用「分享」→「加入主畫面」，由主畫面開啟 standalone app。
3. 確認 status bar、瀏海／Dynamic Island、Home Indicator 未遮住操作區。
4. 點擊「檢查更新」，記錄是否正常完成且沒有空白頁。

證據：裝置／OS、portrait 與 landscape screenshot、結果與錯誤文字。

## B. 原生 OPFS 與批次匯入

1. 從 Files 一次選取 DRM-free EPUB、TXT、具 Text Layer／圖形的 PDF。
2. 確認逐本進度、三本書均出現在書庫，title／format 正確。
3. 再匯入一個重複檔；確認既有書仍在，失敗檔名有顯示。
4. 完全關閉 standalone app 後重開；確認書檔仍可開啟。

證據：匯入前後書庫 screenshot、重開後結果、可用儲存空間訊息。

## C. 必要閱讀功能

對 EPUB、TXT、PDF 逐一測試：

1. Previous／Next 可見按鈕。
2. 左右 swipe；長按選取文字時不得誤觸翻頁。
3. Outline 開啟、跳轉與返回跳轉前位置。
4. Reader Search 命中並跳轉；Library Search 可找回書籍。
5. 建立 Bookmark，關閉 app 後重開並由 Bookmark 清單跳回。
6. 建立 yellow／green／blue／pink Highlight，關閉 app 後重開仍顯示於原文與清單。
7. EPUB／TXT 切換 System Serif／Sans、14／32px、1.4／2.0 line height。
8. PDF 將 zoom 由 100% 改為 150%；圖形與 Text Layer 對齊，文字可選取。

證據：每種格式至少一組 before／after screenshot；任何定位錯誤須記錄書名、頁面與操作順序，但不提交原書內容。

## D. 書單與重啟

1. 將三本不同書分別加入 Must-read、Beloved、Finished。
2. 在「必讀」「最愛」「已讀」view 找回正確書籍。
3. 關閉 standalone app、重新開啟，再次確認三種分類。

## E. 真正離線重啟

1. 線上開啟 standalone app，等待頁面與書庫完成載入。
2. 開啟飛航模式，確認 Wi-Fi 與行動網路均關閉。
3. 從 app switcher 完全關閉墨頁，再由主畫面重新開啟。
4. 開啟已匯入的 EPUB、TXT、PDF，測試翻頁、Bookmark 與 Highlight。
5. 恢復網路後再次點擊「檢查更新」。

任何一步若只在 Safari tab 通過、standalone 失敗，必須分開記錄，不能合併為通過。

## F. Accessibility 與長時間儲存

1. 將系統 Dynamic Type 調至最大，再開啟 app；44×44 touch target、工具列與 bottom sheet 不得重疊或水平溢位。
2. VoiceOver 依序巡覽書庫、閱讀工具、翻頁與 Highlight buttons；控制項須有可理解名稱。
3. 24 小時後重開 app，確認書檔、reading progress、Bookmark、Highlight 與三種書單仍在。

## 完成準則

- iPhone 12 Pro Max 與至少一台代表性 iPad 全部 A–F 通過。
- 每項失敗均有可重現步驟；不能以「偶發」略過。
- 通過前，`docs/testing/original-goal-verification.md` 的實機 gate 保持未完成。
