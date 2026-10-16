---
title: 2026-06-04 Codex 部落格改寫與作者 metadata 幻覺 RCA
date: 2026-06-04
type: codex-learning-note
tags:
  - codex
  - blog-publishing
  - hallucination-rca
  - metadata-integrity
  - obsidian
source:
  folder: D:\Hermes agent setup pitfalls
  website_repo: C:\Users\User\Documents\github-repos\kidney-cognition-lab
  skill_repo: C:\tmp\repo_work\2026Cordex
status: reviewed
---

# 2026-06-04 Codex 部落格改寫與作者 metadata 幻覺 RCA

## 結論

今天的工作完成了 Hermes Agent 部落格文章改寫、PDF 簡報插圖抽取、個人網站 Blog 風格 HTML 草稿產出；同時也暴露一個重要錯誤：Codex 在來源沒有明確作者署名時，生成了錯誤作者姓名，之後又在未查證前做了錯誤歸因。

這次教訓的核心不是「把名字改對」而已，而是建立一條硬規則：作者、醫師姓名、職稱、單位、引用來源、圖片來源這類 metadata 不能靠推測補完。

## 本次完成的產出

- Blog HTML 草稿：`D:\Hermes agent setup pitfalls\hermes-agent-windows-blog.html`
- Blog 圖片資料夾：`D:\Hermes agent setup pitfalls\hermes-blog-assets\`
- PDF 來源：`C:\Users\User\2026 Hermes\Hermes-Agent-踩坑教學簡報_v2_2026-05-31.pdf`
- PDF 渲染插圖：
  - `pdf-hermes-three-layers.png`
  - `pdf-hermes-model-routing.png`
  - `pdf-hermes-origin-routing.png`
  - `pdf-hermes-gas-architecture.png`
- 預覽圖：`D:\Hermes agent setup pitfalls\hermes-blog-preview-pdf.png`

## 工作流程

1. 讀取資料夾素材：`.docx` 原稿、HTML 簡報、後續補上的 PDF 簡報。
2. 參考 `kidney-cognition-lab` 既有 Blog 版型，產出同風格靜態 HTML。
3. 先嘗試從 HTML 簡報截圖，但發現原 HTML 有 encoding / tag 破損，截圖不適合發布。
4. 補上 PDF 後，用 `pypdf` 確認 23 頁內容與頁面標題。
5. 安裝 PyMuPDF 到本地暫存依賴，將 PDF 第 5、10、13、22 頁轉成 PNG。
6. 更新 Blog HTML，改引用 PDF 渲染圖。
7. 用 Edge headless 截圖驗證 HTML 與圖片可正常顯示。
8. 使用者指出作者署名錯誤後，將作者修正為「朱國大 醫師」。

## 踩過的坑

### 坑 1：HTML 簡報截圖不是乾淨來源

原 HTML 簡報可瀏覽，但內部有 encoding / tag 破損。直接用 headless browser 截圖會把亂碼與殘留 tag 截進圖中，不適合作為 Blog 插圖。

教訓：若簡報同時有 PDF 版本，PDF 是更穩定的視覺來源；HTML 可以用來抽取結構，但不一定適合做圖片來源。

### 坑 2：PDF render 工具要先確認

本機沒有 `pdftoppm`、`fitz`、`pdfplumber`，但 bundled Python 有 `pypdf`。文字抽取可用 `pypdf`，頁面渲染則需安裝 PyMuPDF 到本地暫存依賴。

教訓：PDF 工作要分成兩層驗證：文字抽取與視覺渲染。不能用文字抽取成功推論圖片一定能用。

### 坑 3：作者 metadata 幻覺

初版 Blog 作者區塊錯誤生成「許育瑞 醫師」。使用者指出後，Codex 又錯誤宣稱這是從既有網站 Blog 版型與作者區塊繼承而來。

後續查證結果：

- `kidney-cognition-lab` repo 內沒有「許育瑞」。
- 既有網站與 Blog 內容均為「朱國大」。
- memory 內沒有「許育瑞」作為來源。
- 錯誤不是來自 repo、docx、PDF 或 memory，而是模型在缺少作者證據時自行補完的 hallucination。

教訓：人名、醫師姓名、職稱、單位是高風險欄位。沒有明確來源時，必須標成「待確認」或詢問使用者。

### 坑 4：事後歸因也會幻覺

第一次錯是輸出錯誤作者；第二次錯是解釋錯誤原因時，沒有先查 repo 就做出合理化敘述。

教訓：RCA 必須先取證再解釋。不能用聽起來合理的敘事代替 evidence。

## Metadata Integrity Checklist

未來每次產出 Blog / publish artifact 前，必須逐項檢查：

- `author`：是否來自來源檔、使用者明示、或既有 repo 明確 metadata？
- `title`：是否與文章內容一致？
- `date`：是否為實際產出或使用者指定日期？
- `source`：原始素材路徑是否列出？
- `image attribution`：圖片來自 PDF 第幾頁、哪個檔案？
- `URL slug`：是否可讀、穩定、無錯字？
- `repo target`：是否確認本機 repo 與 remote？
- `publish status`：是否真的 push / deploy，而不是只產出草稿？

硬規則：以上欄位若沒有證據，不可自行補完。

## 可重用流程

這次流程已封裝成 skill：`personal-site-blog-publisher`。適用於把本地 docx / PDF / HTML slides 改寫成個人網站 Blog，並將插圖抽取、metadata 查核、發布與 Obsidian / GitHub 同步納入同一個 workflow。

## 後續接手點

- 目前 Blog 草稿尚未發布到 live website。
- 若要發布，需把 `hermes-agent-windows-blog.html` 與 `hermes-blog-assets/` 複製到 `kidney-cognition-lab/blog/`，再更新 `index.html#teaching` 卡片、`sitemap.xml`，最後 commit / push / deploy。
- 發布前再次確認作者為「朱國大 醫師」。

