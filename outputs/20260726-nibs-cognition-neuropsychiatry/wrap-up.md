---
title: "NIBS evidence review：Wrap-up、pitfalls 與後續標準化"
date: 2026-07-26
tags: [NIBS, NotebookLM, research-oak-loop, pitfalls, wrap-up]
category: project-wrap-up
run_id: 20260726-nibs-cognition-neuropsychiatry
status: PUBLISHED_AND_MIRRORED
source_ids: [NLM-01, NLM-02, NLM-03, NLM-04, NLM-05, NLM-06, S01-S36]
---

# 結論

本次已把六本 NotebookLM notebooks 的分散資料，轉成一套可版本控制的 evidence package：source registry、claim ledger、L2 synthesis、academic paper、interactive blog 與 QA evidence。最重要的知識修正是：

> NIBS 的合理比較單位不是 modality，而是  
> `modality × protocol × target/network × brain state × endpoint × timescale`。

在此框架下，rTMS/iTBS 對 MDD/TRD 的證據最成熟；OCD 與 tobacco use disorder 有 device/protocol-specific evidence；tDCS、tACS、schizophrenia、PTSD、MCI/AD 多屬 promising but investigational。認知神經科學的 causal perturbation 證據，整體比「普遍 cognitive enhancement」更穩健。

## 已產生 artifacts

```text
runs/20260726-nibs-cognition-neuropsychiatry/
├── intake.md
├── evidence/
│   ├── notebook-audit.md
│   ├── source-registry.csv
│   └── claim-ledger.csv
├── l2/synthesis/evidence-synthesis.md
├── l3/academic-paper/nibs-narrative-review.md
├── l3/blog/non-invasive-brain-stimulation-evidence-map.html
├── verification/
│   ├── independent-verifier-report.md
│   └── independent-verifier-recheck.md
└── wrap-up.md
```

`independent-verifier-report.md` 與閉環複核由 fresh non-fork checker 產生；最終 verdict 為 `FINAL ACCEPT`。作者署名已由使用者確認，外部發布於 2026-07-26 獲得明確授權。

## 研究流程

1. 由 183 本 NotebookLM notebooks 中，依 title/domain 明確選取六本；沒有執行 all-notebook query。
2. 使用 bounded cross-notebook prompt，要求 mechanism、protocol、outcome、nulls、adverse effects、citation identity 與 causal level。
3. 將 NotebookLM synthesis 降級為 discovery artifact；以 PubMed、IFCN guideline、primary RCT 與 FDA record 重建 source registry。
4. 建立 C01–C20 claim ledger；每一強主張保留 evidence level、source IDs、status 與 limitation。
5. 由同一 claim ledger 產生 academic paper 與 public blog，避免兩個成品出現不同 claim strength。
6. 以實際瀏覽器檢查 Canvas、互動、mobile viewport 與 console。
7. 交由 fresh non-fork verifier 獨立 re-extract sources。

## Encountered pitfalls

### 1. Cross-notebook query timeout

- **現象：** 六本 notebooks、完整 evidence-audit prompt 的 `cross_notebook_query` 在 180 秒 timeout。
- **原因判斷：** 聚合範圍與 source 數量過大，不是 auth failure。
- **修正：** 改為 per-notebook query，再由本機 registry 做 cross-notebook synthesis。
- **標準化建議：** 先以 source inventory 分層；`>50 sources` 使用 async query，小型 notebook 直接 query。

### 2. Async query result 的短暫保存／一次性回收

- **現象：** `notebook_query_status` 第一次顯示 completed；若只保存 status、未同時保存 result，下一次可能顯示 query ID expired/not found。
- **修正：** 完成輪詢時一次擷取 `answer + sources_used + citations + references`。
- **標準化建議：** wrapper 應把 completed payload 原子化寫入 timestamped JSON，再回報完成。

### 3. Source inventory 超出 client output limit

- **現象：** 大型 notebook 的 source list 超過 token limit，被截斷。
- **修正：** 不再嘗試全文列印；以 title keywords、source type 與 grounded citations 分批選取。
- **標準化建議：** source-inventory command 支援 regex filter、pagination 與 CSV export。

### 4. Notebook title relevance 不等於 evidence relevance

- **反例：** `Neuro_AD Therapy(2)_NIBS...` 標題極度相關，但對 MCI/AD 的四類 NIBS human trials 幾乎皆 `Not reported`；另一個 AD/PD/rhythms notebook 才含 network meta-analysis。
- **修正：** notebook selection 後仍執行 source-quality gate。
- **標準化建議：** selection score 分成 title match、direct-human-evidence count、source identity completeness 三欄。

### 5. NotebookLM 混合證據層級

- **現象：** 一個答案同時引用 guideline、book chapter、review、primary RCT 與 future/2026 local slides，語氣卻未充分分級。
- **修正：** 在 source registry 明確標示 `primary / secondary / guideline / regulatory / context`。
- **標準化建議：** synthesis 前先拒絕沒有 source identity 或 design type 的強 claim。

### 6. 容易過度外推的醫學敘述

- iTBS **noninferiority** 容易被改寫成「更有效」。
- SNT open-label 的極高 remission 容易與 sham-controlled RCT 混寫。
- FDA OCD authorization 容易被泛化成所有 TMS。
- tES safety 容易被解讀成 efficacy 或 DIY endorsement。
- AD biomarker／gamma／perfusion change 容易被寫成 disease modification。
- **修正：** 在正文把限制放在同一段，不放到文末才補充。

### 7. tACS artifact 是核心推論問題

- **現象：** stimulation 與 EEG/MEG 使用相同電磁域；retinal/cutaneous stimulation 也可能間接造成 rhythm changes。
- **修正：** direct cortical entrainment 需要 frequency/phase specificity、sensory/retinal controls、artifact-aware recording 與 behavioral convergence。
- **標準化建議：** tACS claim schema 強制填寫 `online/offline`、`artifact method`、`sensory control`、`blinding guess`。

### 8. 不可把過期的本機 sitemap 狀態當成遠端現況

- **現象：** 初始本機 snapshot 的 `sitemap.xml` 曾出現額外 `<url>`；重新 clone 遠端 `main`（baseline `b586e4c`）後，XML 已可正常解析。
- **處置：** 以 fresh clone 作發布基線，不對已修復的問題重複改動。
- **標準化建議：** publish gate 加入 fresh-origin check、XML parse、homepage card uniqueness 與 post URL uniqueness。

### 9. Mobile table 可讀性

- **現象：** 390-pixel viewport 下，四欄比較表被壓得過窄。
- **修正：** table 設 `min-width`，由 wrapper 提供 horizontal scroll。
- **驗證：** Playwright mobile screenshot 與 0-console-error check。

## 10. 公開文章英文密度過高

- **現象：** 初版在中文句子中大量混入 `protocol`、`network`、`brain state`、`endpoint`、`ordinal rubric` 等英文詞組，降低閱讀流暢度，也不符合個人網站的繁體中文風格。
- **修正：** 在文章最前方加入中英文對照表；英文全名只在對照表首見，正文改用中文名稱或必要縮寫；同步中文化首頁卡片、SVG、圖軸、互動說明與所有動態結論。
- **防呆：** 發布前自動掃描正文可見文字；排除參考文獻、英文對照欄、研究專名與必要縮寫後，英文單字殘留必須為 0。
- **驗證：** 390 × 844 行動版 Playwright 快照、疾病／技術切換、0 console errors；正文英文殘留稽核通過。

### 11. PowerShell `-LiteralPath` 不展開萬用字元

- **現象：** `Copy-Item -LiteralPath "$source\*"` 只建立空白目的地，沒有複製任何 artifacts；初次驗證得到 `COUNT_MISMATCH_10_0`。
- **原因：** `-LiteralPath` 會把 `*` 視為字面字元，不執行 wildcard expansion。
- **修正：** 先以 `Get-ChildItem -LiteralPath $source` 解析明確子項，再逐項使用 `Copy-Item -LiteralPath` 複製。
- **驗證：** 來源與目的地皆為 10 份檔案，逐檔 SHA-256 結果 `Missing=0`、`Mismatch=0`。

### 12. GitHub Pages legacy build 卡在 `building`

- **現象：** 推送正確 commit 後，Pages build 長時間停在 `building`，`updated_at` 不變、錯誤訊息為空，舊首頁仍可讀但新文章回傳 404。
- **判斷：** Vercel 已針對同一 commit 正常部署且本機／遠端檔案一致，因此優先判定為 Pages legacy build 佇列卡住，而非內容或路徑錯誤。
- **修正：** 使用 GitHub Pages API `POST /repos/ckt520728/kidney-cognition-lab/pages/builds` 重新觸發；新 build 約 22 秒完成。
- **驗證：** GitHub Pages 首頁與文章均回傳 HTTP 200，首頁含唯一文章卡片，文章標題正確。

## Browser QA

- Desktop load：成功。
- Page title、semantic headings、SVG alt/ARIA：成功。
- Canvas 依 `devicePixelRatio` resize：成功。
- Evidence map：已由無定義 0–100 座標改為有明確規則的 M1–M3／C1–C3 ordinal categories；圓點等大。
- Modality button：`rTMS → tACS` readout 正確更新。
- Indication select：`depression → MCI/AD／tobacco` readout 正確更新。
- Mobile viewport：390 × 844 已檢查並修正 table。
- Console：0 errors、0 warnings。
- `prefers-reduced-motion`：停用 smooth scroll、animation 與 transition。

## Independent verification closure

- 第一輪 verdict：`ACCEPT-WITH-FIXES`。
- 已修正：tES safety 原文界線、HF-rTMS 作者引用、tACS metadata、PTSD contemporary source、mechanism source、SNT／戒菸／AD 精確數值。
- 已移除 pseudo-quantitative 0–100／bubble-size 圖，改用公開 rubric 的 ordinal map。
- C16 最後一項 source traceability 已補入 S24、S25。
- 最終 verdict：`FINAL ACCEPT`。

## 發布與歸檔結果

1. `kidney-cognition-lab` 已推送 commit `c51ac07b6d786fdbc6339220b9a6906ac0c64f38`。
2. Vercel 與 GitHub Pages 的首頁、文章均回傳 HTTP 200；首頁卡片與文章標題檢查通過。
3. `2026Cordex` 已推送成果 commit `9f293798f9918deec0486795e4b7d51cf36ccf7b`。
4. 10 份 artifacts 已鏡像至 `G:\我的雲端硬碟\Second Brain\知識庫\2026Cordex\outputs\20260726-nibs-cognition-neuropsychiatry`，逐檔 SHA-256 比對結果為 Missing=0、Mismatch=0。
5. Academic paper 僅作研究草稿歸檔，未投稿。

## 下一版 workflow／skill 建議

若本 run 的 artifacts 通過 verifier 與發布後外部驗證，可將流程標準化為 `notebooklm-nibs-evidence-publisher` skill/plugin：

1. `select_notebooks`：bounded selection + source-quality score。
2. `extract_atomic`：async payload 原子化保存。
3. `classify_sources`：primary/secondary/guideline/regulatory。
4. `build_claim_ledger`：強 claim 必須有 limitation 與 exact source。
5. `write_dual_outputs`：paper/blog 共用 claim IDs。
6. `independent_verify`：fresh non-fork checker。
7. `browser_qa`：desktop/mobile/interaction/console/accessibility。
8. `human_gate`：顯示 exact touched paths、diff、public destination。
9. `publish_and_mirror`：homepage、sitemap、public HTTP、GitHub、Second Brain、SHA-256。

本次已完成真實發布、遠端 push、公開 HTTP 驗證、Second Brain 鏡像與使用者回饋閉環，已有足夠第一手證據進入正式 skill/plugin 規格化階段。
