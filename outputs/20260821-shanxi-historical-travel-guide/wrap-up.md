---
title: "山西 14 天深度歷史文化旅行指南：Wrap-up、pitfalls 與 artifacts"
date: 2026-08-21
tags: [Shanxi, travel-guide, historical-review, Chrome, PDF, pitfalls]
category: project-wrap-up
run_id: 20260821-shanxi-historical-travel-guide
status: COMPLETED_AND_VERIFIED
source: https://www.travel.com.tw/TOU/TOU0020/ZWS1400048/ZCC070414BR26A
---

# 結論

本次把鳳凰旅行社「山西晉情大全覽 14 天」的行程頁，轉成一套可版本控制、可列印、可追溯來源的繁體中文歷史文化旅行包。完成範圍不是只摘錄熱門景點，而是先重建 14 天路線，再逐一覆蓋 45 個核心、備選、條件式及跨省景點，最後輸出 Markdown 與可攜式 PDF。

最重要的編輯原則是：

> 旅行社頁面決定「去哪裡」，但不能單獨決定「歷史上發生了什麼」。

成品把創建年代、現存材料年代、修復／復建年代分開；把可證史實、學術解釋、地方傳說與旅遊宣傳分開；也避免用「最大、唯一、最早、世界三大」等稱號代替證據。

## 已完成 artifacts

    outputs/20260821-shanxi-historical-travel-guide/
    ├── wrap-up.md
    ├── manifest.md
    ├── artifacts/
    │   ├── AGENTS.md
    │   ├── handoff.md
    │   ├── itinerary.md
    │   ├── research.md
    │   ├── sources.md
    │   ├── guide.md
    │   └── guide.pdf
    └── reproducibility/
        ├── build_guide_pdf.py
        └── verify_pdf.py

核心成果：

- [guide.md](artifacts/guide.md)：14 天繁體中文深度導覽。
- [guide.pdf](artifacts/guide.pdf)：20 頁 A4 可攜式 PDF，含封面、目錄、嵌入字型與可點擊來源連結。
- [itinerary.md](artifacts/itinerary.md)：行程擷取、14 天路線與 45 個景點標準化清單。
- [research.md](artifacts/research.md)：六批歷史文化研究與跨景點主線。
- [sources.md](artifacts/sources.md)：41 筆直接來源及可信度說明。
- [AGENTS.md](artifacts/AGENTS.md)：專案範圍、史料層級與品質規則。
- [handoff.md](artifacts/handoff.md)：決策、辨誤、完成狀態與環境說明。

## 研究與製作流程

1. 以 Chrome computer use 開啟旅行社頁面，擷取真正列入行程的景點、備選點、條件式增加點及跨省延伸點。
2. 將行程標準化為 14 天、45 個具名景點；交通、住宿及城市節點另行標示。
3. 先建立 UNESCO 框架，再依大同／晉北、太原／平遙、晉南、晉城／長治及跨省延伸分批查找政府、文保、博物館與機構資料。
4. 建立 research.md 與 sources.md，對每一處景點記錄歷史背景、文化意義、現場觀看方式及必要辨誤。
5. 依行程順序撰寫 guide.md；不是景點百科拼貼，而是用帝國、宗教、資源、商業、堡寨和交通六條主線串聯。
6. 自動檢查 45 個景點名稱、14 個日程章節、直接連結、亂碼與來源表。
7. 將 Markdown 轉為 A4 PDF，嵌入繁體中文字型，保留外部超連結。
8. 逐頁渲染 PDF，檢查封面、目錄、章節轉頁、文字裁切、字型、連結和可搜尋性；修正後再輸出。
9. 對 Google Drive 成品與本機驗證版本做 SHA-256 比對。

## 歷史內容上的關鍵辨誤

### 1. 創建年代不等於眼前建築年代

- 懸空寺有北魏創建傳統，但現存大部為明代重建並經後世修繕。
- 解州關帝廟的廟史追到隋開皇九年，眼前建築主要反映明清重建。
- 平遙縣衙的行政沿革可追溯更早，現存官署空間不是北魏原物。
- 上黨門所代表的府署制度始於隋代，現存門樓和鐘鼓樓主要是明清材料。

**可重用規則：** 每個古蹟至少分成 foundation tradition、extant fabric、modern intervention 三欄。

### 2. 修復、復建與原構必須明說

- 晉祠魚沼飛梁現構為 1953 年依原形重建。
- 大同城牆是歷史夯土核心與 2009 年後大規模復原的組合。
- 鸛雀樓古樓早毀，現樓於 2002 年完成。
- 綿山大羅宮與天橋含大量近現代景區建設。
- 永樂宮是真實元代材料，但今日位置來自 20 世紀因三門峽水庫進行的整體搬遷。

**可重用規則：** 不把「材料真實」「位置原真」「外觀仿古」視為同一件事。

### 3. 傳說可以重要，但不能冒充事件實錄

- 介子推燒山與寒食節的完整因果，是後世逐步定型的文化記憶。
- 王莽追劉秀串連王莽嶺地名，缺乏足以逐點驗證的史料。
- 張壁古堡精確連到十六國張平，應寫成文保與地方研究的考證說。

**可重用規則：** 使用「傳說相連」「地方敘事」「常見解釋」等明確標籤，同時說明其文化影響。

### 4. 旅遊 superlatives 容易失真

- 大同九龍壁可由前後觀看，但並非兩面都有九龍；三大九龍壁中北海九龍壁才是著名雙面龍壁。
- 應縣木塔的價值不依賴「完全不用鐵釘」或「世界三大奇塔」。
- 「萬年冰洞」是景區名稱；公開資料不足以支持精確冰齡或「數百萬年形成」的斷言。
- UNESCO 長城頁面仍有過時的「月球可見」說法，成稿明確排除。

**可重用規則：** 最大、最早、唯一、世界第幾，一律建立獨立查核項；無強證據就改為描述性語句。

## Encountered pitfalls

### 1. Chrome plugin 版本不一致，computer use 初次無法連線

- **現象：** Chrome 已開啟，但 computer-use binding 無法建立。
- **原因：** 瀏覽器 plugin 與本機 runtime／helper 版本不一致，Windows sandbox discovery 也找不到 OpenAI helper executables。
- **修正：** 更新到 browser plugin 26.818.22352，並把 bundled helper executables 放到使用者可存取的 lookup path；重啟後重新綁定 Chrome。
- **防呆：** setup checklist 應同時記錄 plugin version、helper lookup path、session naming 與最小 tab-read smoke test。

### 2. Chrome tabs.new 只建立 about:blank

- **現象：** 新分頁物件存在，但 title 與 URL 都是 about:blank，DOM snapshot 為空。
- **原因：** 目前 Chrome API 的 tabs.new 不接受網址作為實際導覽參數。
- **修正：** 先 tabs.new，再對回傳 tab 執行 tab.goto(url)；載入完成後才做 domSnapshot。
- **防呆：** 每次導覽後先驗證 tab.url 與 tab.title，不要把成功建立 tab 當成成功載入頁面。

### 3. 山西部分政府網站直接連線逾時

- **現象：** wwj.shanxi.gov.cn、wlt.shanxi.gov.cn 某些頁面在 Chrome 顯示 ERR_CONNECTION_TIMED_OUT。
- **修正：** 用 Google 可見 DOM 找出直接 URL、標題與摘要，再尋找人民網、文化和旅遊部、地方政府轉載或同一機構的可讀頁面交叉驗證。
- **限制：** 搜尋結果只作 discovery；sources.md 與 guide.md 一律保存直接頁面 URL，不引用搜尋結果頁。
- **防呆：** 對無法直接開啟的來源標記可用範圍，不讓單一摘要支撐精確數字或爭議性結論。

### 4. 行程中的「平遙鏢局」無法唯一識別

- **現象：** 旅行社只寫「鏢局」；官方平遙套票同列同興公、華北第一鏢局和中國鏢局。
- **修正：** 指南保留通用制度史，明確標註實際館名待旅行社確認，不虛構參觀館舍。
- **防呆：** itinerary normalization 需有 exact、ambiguous、optional、substitute、transit 狀態。

### 5. PowerShell 預設文字編碼造成假性亂碼

- **現象：** Get-Content 顯示大量亂碼，容易誤判 Markdown 已損壞。
- **原因：** Windows PowerShell 的預設解碼與 UTF-8 檔案不一致。
- **修正：** 明確使用 Get-Content -Encoding UTF8；另以關鍵字、檔案大小與 SHA-256 驗證內容。
- **防呆：** 所有中日韓文字檔的 read／QA command 都顯式指定 UTF-8。

### 6. Google Drive 工作目錄不在一般 sandbox 內

- **現象：** 無法直接安全地用一般檔案編輯工具寫入 G:。
- **修正：** 先在使用者可寫的 staging directory 以 patch 編輯，再用明確 Copy-Item -LiteralPath 同步指定檔案；不使用 wildcard。
- **驗證：** 六份核心檔案逐檔 SHA-256 相同。
- **防呆：** 外部磁碟採 stage -> copy explicit paths -> checksum，不在同步磁碟直接做多步生成。

### 7. PDF runtime 與 artifact marker 缺失

- **現象：** container_tools/mark_artifact_operation_started.mjs 不存在；ReportLab、Markdown parser 與 Poppler 亦未預裝。
- **修正：** 保留缺失紀錄，改用 Python Markdown 產生自包含 HTML，再用 Microsoft Edge headless print-to-PDF；補裝 markdown、pypdf、pdfplumber、pymupdf 作驗證。
- **結果：** 產生標準 PDF 1.4、未加密、A4、嵌入 Microsoft JhengHei subset fonts、保留超連結。
- **防呆：** Windows PDF workflow 需預先探測 marker、renderer、CJK fonts 與 text extractor，並定義 Edge fallback。

### 8. 第一版 PDF 有一頁只剩開頭說明框

- **現象：** 來源 Markdown 的 blockquote 留在正文，下一個 H2 又強制換頁，造成大面積空白頁。
- **修正：** 把開頭說明整合到封面，從正文移除重複 blockquote，重新輸出後由 21 頁縮為 20 頁。
- **防呆：** 視覺 QA 不只找文字溢出，也要找孤兒段落、寡婦行與不合理空白頁。

### 9. pypdf 對 Chromium CJK subset font 產生假性缺字

- **現象：** pypdf.extract_text 誤報「雲岡石窟」「五臺山」等必要詞缺失，但畫面與 PyMuPDF 抽取均正常。
- **原因：** 不同 extractor 對 Chromium 產生的 CJK ToUnicode／subset font 支援不同。
- **修正：** 用 PyMuPDF 做中文文字完整性檢查，保留 pypdf 作結構、metadata 和 encryption 檢查。
- **防呆：** CJK PDF 至少使用兩個 extractor；任何缺字警報都需與渲染頁面交叉確認。

### 10. 文字／連結驗證不能取代逐頁視覺檢查

- **現象：** 第一版通過頁面尺寸、字型與 clipping 檢查，仍存在不美觀的孤立頁。
- **修正：** 將所有頁面渲染為 PNG，產生 contact sheets，再抽查密集頁與末頁原尺寸。
- **防呆：** PDF release gate 應同時包含 structural checks、text checks、link checks、all-page thumbnails 與 representative full-size inspection。

## 最終 QA 證據

### Markdown 與研究包

- 14 個逐日章節：通過。
- 45 個具名景點：Missing=0。
- 來源登錄：41 筆。
- guide.md 直接連結：37 個 unique URLs，搜尋結果頁為 0。
- 亂碼掃描：0 hits。

### PDF

- 頁數：20。
- 頁面尺寸：A4（595 × 842 pt）。
- 檔案大小：934,910 bytes。
- PDF 版本：1.4。
- 加密：否。
- 外部超連結：41。
- 嵌入字型：Microsoft JhengHei Regular／Bold subset。
- 必要中文詞彙：全部可由 PyMuPDF 擷取。
- 超出版面文字框：0。
- 全頁 contact-sheet 檢查：通過。
- 代表性原尺寸頁面檢查：通過。
- PDF SHA-256：6EF02435639A6B0F53059DB257098F159C7A711A96D8254BB6AEDE2892288B96。

## 已知限制與後續維護

1. 「平遙鏢局」館名仍須由旅行社在出發前確認。
2. 萬佛閣、懸空寺登臨、博物館週一閉館及預約規則屬時效資訊；本指南刻意不把擷取日資訊寫成永久規則。
3. 雲丘山冰洞的精確冰齡與形成機制，仍需要可公開覆核的地質研究。
4. 部分中國政府頁面可能從境外或特定網路環境連線不穩；來源表保留標題、出版者、直接 URL 與用途，便於日後換用機構鏡像。
5. 本包是歷史文化導覽，不取代景區安全公告、旅行社最終行前通知或現場管制。

## 重現 PDF

需求：

- Python 3。
- markdown。
- Microsoft Edge（Windows headless print）。
- 驗證用：pypdf、pdfplumber、pymupdf、Pillow。
- CJK 字型：Microsoft JhengHei 或等價繁體中文字型。

先產生 HTML：

    python reproducibility/build_guide_pdf.py artifacts/guide.md tmp/shanxi-guide.html

再以 Edge headless 列印：

    & 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf='artifacts/guide.pdf' 'file:///ABSOLUTE/PATH/TO/tmp/shanxi-guide.html'

驗證：

    python reproducibility/verify_pdf.py artifacts/guide.pdf tmp/rendered

verify_pdf.py 會檢查頁數、A4 尺寸、可搜尋文字、外部連結、嵌入字型、必要詞彙和裁切，並輸出所有頁面 PNG 與 contact sheets。渲染結果是 QA 暫存物，不納入版本控制。

## 可標準化的下一版 workflow

1. capture_itinerary：擷取路線並標記 exact／ambiguous／optional／substitute。
2. build_source_registry：以 UNESCO／文保／博物館／政府為優先，搜尋頁只作 discovery。
3. separate_time_layers：創建、現存、修復／復建三層年代。
4. label_narratives：史實、解釋、傳說、宣傳四類標籤。
5. coverage_gate：行程名稱對 guide 全覆蓋。
6. pdf_export：CJK font embedding、links、A4、metadata。
7. dual_extractor_qa：PyMuPDF + pypdf。
8. visual_pdf_qa：all-page contact sheets + full-size samples。
9. mirror_and_checksum：Google Drive／GitHub artifacts 逐檔 hash。

這套流程可重用於任何「旅行社行程頁 -> 深度歷史文化導覽 -> 可攜 PDF -> GitHub 歸檔」專案。
