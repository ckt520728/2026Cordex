---
name: peer-review-cross-ref
description: Use when reviewing a manuscript, grant, thesis, or paper by cross-referencing its claims against the user's local literature library, lecture/PhD/reference notes, or prior curated bibliographies. Trigger for requests like "用我的文獻庫審這份稿件", "peer review cross-reference", "整理文獻支持審稿意見", "把稿件跟 E 槽 PDF 比對", "review this manuscript using my library", or when Codex must turn a scattered personal PDF library into Major/Minor reviewer comments, controversy maps, mechanistic synthesis, Analysis_Report.md, INDEX.md, and key finding notes.
---

# Peer Review Cross Reference

## 成功標準

完成時要能驗證下列產物存在且內容可追溯:

1. `Analysis_Report.md`: 稿件核心 claims、文獻支持度、爭議點、mechanistic synthesis、可寫入審稿信的 Major/Minor comments。
2. `INDEX.md`: 依稿件指標或論點分類的文獻清單,標示最值得引用者。
3. `NN_<topic>_<name>/`: 已歸檔的 PDF 或來源文件,必要時附 `README_gap_note.md`。
4. `★KEY_*.md`: 對每個重大爭議、方向性反轉、或個人引用映射建立獨立專文。
5. 報告開頭有版本記錄,每輪新增發現以 patch/append 方式保留,不要整篇重寫。

## 工作流程

### Step 0: 先找個人引用資產

在掃大量 PDF 前,先問或主動搜尋使用者是否有已整理過的:

- PhD viva / lecture slides / grant / prior manuscript reference list
- Obsidian/Second Brain 筆記
- Zotero/EndNote/BibTeX 匯出
- 既有 literature review 草稿或 analysis report

這些是 first-class context source,通常比從零掃 PDF 更能產生 L4/L5 級審稿價值。

### Step 1: 萃取稿件 claims

先讀稿件、deep analysis、review comments、或摘要,萃取 3-8 個核心 claims/indices。

每個 claim 至少記錄:

- 稿件原始說法
- 對應章節或頁碼
- claim type: directionality / mechanism / method / clinical translation / limitation
- 需要驗證的方向:支持、一致但過度簡化、相反、爭議、缺 citation

若稿件很長,先產出 claim map,不要直接開始全文文獻整理。

### Step 2: 先掃資料夾,再讀內容

大型本機文獻庫不要先全文 grep PDF。先用資料夾與檔名建立候選清單:

```powershell
Get-ChildItem -LiteralPath <library_root> -Directory -Recurse -Depth 3 |
  Where-Object { $_.Name -match "<topic keywords>" } |
  Select-Object FullName
```

把二級/三級候選資料夾列給使用者確認哪些值得深入。使用者指出漏掉的資料夾時,把它當成新的高優先 context。

### Step 3: 建立分類資料夾與索引

依稿件 claims 建立穩定命名:

```text
01_<Claim_or_Index_Name>/
02_<Claim_or_Index_Name>/
03_<Claim_or_Index_Name>/
...
```

每個資料夾保存:

- 相關 PDF 或來源文件
- 必要的 gap note
- 重大爭議或鑑別點的 `★KEY_*.md`

檔案複製時一律從 `Get-ChildItem` 取真實 `FullName`,避免手寫特殊字元路徑:

```powershell
Get-ChildItem -LiteralPath <folder> -File |
  Where-Object { $_.Name -match "<pattern>" } |
  ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination <dest> }
```

### Step 4: 每個 claim 做五問

方向性是審稿價值核心。每個 index/claim 都問:

1. Healthy/normal condition 的方向是什麼?
2. Disease/pathological condition 的方向是什麼?
3. 兩者相同、相反、還是不能比較?
4. 有沒有 stage-dependent reversal,例如 preclinical/MCI compensatory phase?
5. 有沒有 region-dependent、method-dependent、algorithm-dependent 的方向差異?

先列出名詞 convention 映射,再寫結論。例如 aperiodic:

```text
Steeper slope = log-log slope 更負 = slope 數值下降 = FOOOF exponent 上升
Flatter slope = log-log slope 較不負 = slope 數值上升 = FOOOF exponent 下降
```

### Step 5: 查近年 review 以定位爭議

任何 claim 寫成定論前,先找近 2-3 年 systematic review / consensus / editorial。目標不是堆 citation,而是判斷:

- 是否有 unresolved controversy
- 是否有 consensus guideline
- 是否有 directionality inconsistency
- 是否有臨床轉譯或標準化缺口

若發現重大爭議,建立 `★KEY_CONTROVERSY_*.md`。

### Step 6: 做 mechanistic synthesis

把文獻從 L1/L2 推到 L4/L5:

- L1: 列出相關文獻
- L2: 依稿件指標分類
- L3: 檢查稿件與文獻是否一致
- L4: 定位方向性爭議、鑑別點、缺漏 consensus
- L5: 用使用者既有 PhD/lecture/clinical expertise 串成機制軸

審稿信最有價值的 comment 通常是 L4 + L5,不是最長的 bibliography。

### Step 7: 產出可直接使用的 reviewer comments

Major comment 應包含:

- 稿件問題:精準指出章節與 claim
- 文獻證據:代表性支持、反例、systematic review/consensus
- 對作者的可行修改:改表格欄位、改 wording、補哪幾篇、加入哪個 mechanistic axis
- reviewer stance: why this matters for interpretation, generalizability, or clinical translation

Minor comment 用於 state-vs-trait、方法學警示、單篇補充引用、術語精準化。

## 輸出格式

優先使用 `assets/templates/`:

- `analysis_report_template.md`: 主分析報告
- `index_template.md`: 文獻索引
- `key_note_template.md`: 爭議或鑑別專文

需要詳細踩坑與 guardrails 時讀 `references/workflow_guardrails.md`。

## 驗證

結案前檢查:

- `Analysis_Report.md` 與 `INDEX.md` 皆存在。
- 每個主題資料夾的數量與 `INDEX.md` 一致,或在報告中說明版本差異。
- 每個 Major comment 至少有一個本機來源與一個可檢查的修改建議。
- gap 不假裝填補:建立 `README_gap_note.md` 或在 report 中明確標示。
- 未把 healthy aging、disease、MCI/preclinical compensation 混成單一路徑。
