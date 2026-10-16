# Ebook Reader Unknown Ledger

本文件依 `Thariq_finding_unknown` 的治理概念，區分已知事實、尚待決策與參考專案邊界。它不是需求核准清單；每個重大決策仍須逐一確認。

## Map vs Territory

### 已確認

- 產品採用 Offline-first PWA。
- 目標裝置包含 iPhone 12 Pro Max 與 iPad。
- 首版支援 EPUB、TXT 與 PDF。
- EPUB/TXT 完整支援搜尋、字型／字級調整與文字高亮。
- PDF 保持 fixed layout；只有具 Text Layer 時才支援搜尋與高亮，且不提供字級重排或內建 OCR。
- 透過 iOS Files picker 匯入一本或多本書，書檔保存於 app-private OPFS，metadata 與閱讀資料保存於 IndexedDB。
- 提供容量警示與手動備份匯出；首版不提供帳號或跨裝置同步，因此各裝置的 Device Library 彼此獨立。
- Reading State 為 Unread、Reading 或 Finished；抵達最後內容位置時自動 Finished，並允許手動標記或取消。
- Already Read 是 Finished 的檢視；Must-read 與 Beloved 是可重疊且與 Reading State 獨立的分類。
- Reader Search 搜尋目前書籍全文並可跳至命中位置；Library Search 僅搜尋 title、author 與檔名，首版不建立跨書庫全文索引。
- Highlight 保存文字、精確位置、四種顏色之一與建立時間，提供清單／跳轉／刪除，不含文字註記；掃描型 PDF 不提供 Highlight。
- Bookmark 不需文字選取，保存目前邏輯位置並自動命名，提供清單／跳轉／刪除；同一位置最多一個，且與 Highlight 分離。
- Outline 使用 EPUB TOC、PDF embedded outline 或頁碼 fallback、TXT 明確章節標題；不使用 AI 生成或臆測章節。
- EPUB/TXT 使用動態水平分頁並以 Logical Location 保存進度；PDF 使用原始文件頁。按鈕、左右 swipe、方向鍵皆可翻頁，首版不做 3D page-curl。
- EPUB/TXT 共用 System Sans／System Serif、14–32 px font size、1.4–2.0 line height；變更排版後維持 Logical Location。PDF 僅提供縮放。
- 選取文字後可明示開啟 Web Search 或 Google AI Mode；只外送選取詞，Google prompt 由讀者確認送出，回應不回存 reader。
- Manual backup 分為 Reading Data Backup 與包含原始書檔的 Full Library Backup；還原先預覽、以 SHA-256 去重，衝突由讀者決定且不靜默覆寫。
- Imported EPUB 一律視為 untrusted static publication；active content 與 remote fetch 停用，外部 HTTPS 連結僅能由讀者明示確認後開啟。
- 技術基線為 React／TypeScript／Vite PWA、Dexie＋OPFS、統一 FormatAdapter、PDF.js、TXT adapter 與 Web Workers；Readium EPUB engine 需先通過 compatibility/security spike。
- iPhone 使用全螢幕 Reader＋bottom sheets；iPad 使用 sidebar／grid 與可收合 reader side panel；兩者共用 feature modules 與 accessibility constraints。
- 必要功能包含書籤、搜尋、字型／字級調整、文字高亮、目錄、前後翻頁，以及已讀／必讀／最愛書單。
- `smuyyh/BookReader` 僅作為功能與互動參考。

### 尚待決策

- GitHub remote 的 owner、repository name 與 visibility；這不阻擋 local implementation 與 verification。

## Reference Anchor

- 參考來源：https://github.com/smuyyh/BookReader
- 可借鑑：章節目錄、書籤定位、字級／主題、閱讀進度、前後翻頁等互動概念。
- 不沿用：停止維護的 Android Java 架構、失效的網路小說 API，以及舊版 EPUB/PDF 元件。

## Deviation Log

| 決策 | 與參考專案的差異 | 理由 |
| --- | --- | --- |
| Offline-first PWA | 不採 Android native app | 必須部署至 iPhone 與 iPad，並以單一可攜程式碼庫為優先 |
| EPUB/TXT/PDF 格式矩陣 | PDF 不沿用 Android reader 的一致化閱讀假設 | fixed-layout PDF 無法可靠提供 EPUB/TXT 的 reflow、搜尋與高亮能力 |
| Device-local library | 不採參考專案的網路書庫，也不新增 cloud sync | 首版優先達成私密、離線、免帳號且可在 iOS 安裝的閱讀體驗 |
| Reading State 與分類分離 | 不把 Already Read、Must-read、Beloved 都建模成互斥 shelf | 完成狀態與讀者偏好是不同維度，且 Must-read／Beloved 應可重疊 |
| Reader Search 與 Library Search 分離 | 不建立跨書庫全文索引 | 保留目前書籍的完整搜尋能力，同時控制行動裝置的 storage 與 indexing 成本 |
| 無文字註記的 Highlight | 不在首版加入 annotation editor | 優先驗證跨 reflow 與不同格式的可靠定位，避免擴大編輯與匯出範圍 |
| Bookmark 與 Highlight 分離 | 不以空白 Highlight 代表 Bookmark | 兩者分別表達閱讀位置與文字選取，互動及定位責任不同 |
| Source-faithful Outline | 不使用 AI 生成或推測章節 | 目錄必須可追溯至原書結構或明確標題，避免錯誤導覽 |
| 水平動態分頁 | 不移植 3D page-curl，也不以 rendered page 保存位置 | 優先維持文字選取、定位穩定性、accessibility 與行動裝置效能 |
| External Keyword Lookup | 不串接未公開的 Google AI Mode API，也不外送書籍上下文 | 保持可維護性、讀者明示控制與資料最小化 |
| Two-level manual backup | 不把 backup 當成 cloud sync，也不靜默覆寫衝突 | 同時支援輕量閱讀資料備份與完整跨裝置搬移 |
| Sandboxed EPUB content | 不信任書檔內的 scripts、forms、nested frames 或 remote resources | imported publication 是外部輸入，不能取得 app shell 或 Device Library 權限 |
| Replaceable FormatAdapter stack | 不讓 UI/domain 綁死特定 EPUB engine | Readium 仍需 WebKit/OPFS spike，保留可控的替換邊界 |
| Responsive device-specific density | 不強迫 iPhone 與 iPad 使用同一資訊密度 | 共用功能行為，但依可用空間選擇 bottom sheet 或 side panel |

## External Consultation

- Electron consultation 確認 Electron runtime 不支援 iPhone／iPad；只借鑑 trusted shell／untrusted renderer、narrow interface、worker pipeline 與 mediated resource access patterns。
- Consultation 建議尚未自動成為 accepted decisions；詳見 `docs/design/electron-consultation.md`。


## Verification Rubric

- 每個已確認決策都有可追溯文件。
- 每個必要功能都有可執行測試或裝置驗證證據。
- 任何格式限制都明確呈現在 UI 與文件中。
- 不以桌面瀏覽器通過取代 iPhone／iPad viewport 驗證。
