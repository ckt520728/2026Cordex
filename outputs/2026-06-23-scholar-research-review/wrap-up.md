---
title: 2026-06-23 Ravindra L. Mehta AKI 學術軌跡研究與 Scholar Review Skill 踩坑紀錄
source:
  type: personal
  authors: [Kwota, Codex]
  url: https://github.com/ckt520728/2026Cordex
  file: D:\2026_AKI
  published: '2026-06-23'
date_ingested: '2026-06-23'
status: reviewed
tags: [codex, scholar-research, acute-kidney-injury, evidence-audit, multi-agent, pubmed, troubleshooting]
related:
  - '[[2026-06-09 Multi-Agent Research v2.6 與 Face Perception Bias 踩坑紀錄]]'
  - '[[scholar-research-review-skill]]'
---

# 2026-06-23 Ravindra L. Mehta AKI 學術軌跡研究與 Scholar Review Skill 踩坑紀錄

## 結論先行

本次以 `multi_agent_research_skill_v2.7` 的 Crow／Falcon、claim ledger 與 independent
reviewer 原則，完成 Professor Ravindra L. Mehta 的 AKI 研究時間軸、主題演化與領域
貢獻分析。

核心歷史判斷：

> Mehta 教授的主要定位是 AKI clinical research architect。他將 CRRT 技術、疾病定義、
> multicenter epidemiology、global health 與 implementation science 串成連續研究路徑。

歸因界線：

- 2007 AKIN 可支持 Mehta 第一作者的明確領導性。
- RIFLE、KDIGO 及多數 ADQI consensus 是跨國集體成果。
- 後期大型 consensus 的作者列名，只能支持持續參與 network，不能自動視為個人主持。

## 完成的研究產出

工作目錄：`D:\2026_AKI`

- `reports/evidence_bound_report.md`
- `citation_library.json`
- `evidence_report.json`
- `results/claim_ledger.csv`
- `results/evidence_audit.md`
- `reports/reviewer_report.md`
- `results/validation_results.json`
- `scripts/fetch_pubmed.py`
- `scripts/build_citation_library.py`
- `scripts/validate_evidence.py`

最終驗證：

- Citation library entries：310
- 身分核對後 PubMed publications：307
- Evidence-bound claims：16
- Claim ledger validation errors：0
- Independent reviewer Round 2：`PASS`
- Final status：`LITERATURE_SYNTHESIS_PASS`

## 研究流程

### 1. 證據邊界

使用者提供 Google Scholar profile、`metric-value-5.csv` 與
`multi_agent_research_skill_v2.7.md`。

CSV 實際只含 citations、h-index、i10-index、affiliation 與 focus areas，沒有逐篇
publication rows。因此 Scholar metrics 只作 snapshot context，不能當 publication corpus。

### 2. Crow retrieval

Google Scholar 自動存取回傳 403，因此改用 PubMed E-utilities 建立可重跑 corpus，
並以 DOI、UCSD profile 與 official guideline 補充身分及角色證據。

PubMed 搜尋結合 `Mehta RL`、`Mehta, Ravindra L`、`Mehta R` 加 AKI／ARF／CRRT
title-abstract filters，再依 PMID 去重與消歧。

### 3. 三條平行分析

- 完整年代與 landmark publications
- AKI definitions／ADQI／RIFLE／AKIN／KDIGO
- CRRT、fluid、biomarkers、global health 與 post-AKI outcomes

整合後建立 `evidence_report.json` 與 `claim_ledger.csv`。

### 4. Reviewer gate

Round 1 reviewer 發現三個 major issues：

1. 自動 keyword screen 對 AKI relevance 分類過寬。
2. 將近期大型 consensus participation 過度描述為個人研究重心。
3. KRT delivered-dose 主線漏掉直接支持文獻。

修正後 Round 2 `PASS`。

## 遭遇的陷阱與修正

### 陷阱 1：把 profile metrics CSV 誤認為 publication export

檔名看似 Scholar 匯出，但只有五筆 summary metrics。修正方式是先讀 schema，
區分 profile metrics 與 publication-level corpus，並為 Scholar metrics 標記 snapshot date。

### 陷阱 2：Google Scholar 403

不反覆繞過 anti-bot。改用 PubMed E-utilities、Crossref、期刊頁與 institutional profile，
並記錄 PubMed corpus 不等於 Scholar 完整清單。

### 陷阱 3：同名作者污染

`Mehta RL` 搜尋混入 Rajnikant L. Mehta。使用 full name、affiliation、email 與 coauthor
network 消歧，建立 explicit exclusion list。Surname + initials 不是可靠 scholar identity。

### 陷阱 4：Author query 過窄

只搜尋 `Mehta RL` 會漏掉以 `Ravindra Mehta` 或 `Mehta R` 索引的文獻。必須使用多種
author forms、topic filters、PMID 去重與後續消歧。

### 陷阱 5：Keyword screen 被誤當 bibliometric 結論

初版規則只要摘要含 `critically ill` 就判為 AKI relevant，使非 AKI trial 也被納入。
Reviewer 判定「265 篇 AKI publications」不可靠。修正為只作 corpus navigation，
移除 publication 占比結論。

### 陷阱 6：把集體 consensus 過度歸因給單一學者

近期 digital health、pregnancy、sex/gender、ECMO 等大型 consensus 因 Mehta 列名，
被誤寫成個人研究轉向。修正為檢查 author position、chair、workgroup role 與
contribution statement，並表述為「持續參與 AKI consensus network」。

### 陷阱 7：低估或高估 biomarker 貢獻

Urine IL-18 是第一作者 primary research；但不能把所有共同作者 biomarker papers
寫成其個人發現。最終同時呈現 primary work 與更持續的 consensus architecture。

### 陷阱 8：重要主線缺少最直接文獻

報告談 delivered CRRT dose，卻漏掉直接量測 effluent volume 與 delivered dose 差距的
研究。Reviewer 要求補入 2011 delivered-dose study 與 2014 PICARD analysis。

### 陷阱 9：平行驗證造成 race condition

Validator 正在重寫 `validation_results.json` 時，另一個平行程序讀取而產生暫時性
`JSONDecodeError`。修正為 writer 完成後再序列讀取。

### 陷阱 10：Windows encoding

cp950 遇到 Unicode title 產生 `UnicodeEncodeError`。設定 `PYTHONIOENCODING=utf-8`，
JSON／Markdown／CSV 使用 UTF-8 或 UTF-8 BOM。

### 陷阱 11：Git repo reality check

研究工作目錄 `D:\2026_AKI` 不是 Git repo。發布前必須 clone 真正目標 repo，
驗證 remote、branch 與 working tree。

### 陷阱 12：Skill initializer 權限與 metadata validation

官方 initializer 首次建立 skill folder回傳 `WinError 5`；核准權限後建立成功，但
`short_description` 太短而部分完成。使用 `generate_openai_yaml.py` 補建合規 metadata，
最後執行 `quick_validate.py`。Validator 首次又因 Windows 預設 cp950 無法讀取 UTF-8
中文而出現 `UnicodeDecodeError`；設定 `PYTHONUTF8=1` 後驗證通過。

## 可重用最佳實務

1. 先檢查使用者資料實際 schema。
2. Retrieval 與 synthesis 分離。
3. Scholar research 必須先做 identity disambiguation。
4. Consensus 的參與與領導分開。
5. 自動 topic classifier 未 validation 前只能協助導覽。
6. 每項數字都有 extraction rule 與 artifact path。
7. Reviewer 同時查 citation、歸因強度與分類效度。
8. 沒有 patient-level dataset 時，不製造 experimental observed claims。
9. Final validation 必須 fresh run。

## 新增 Skill

- Portable：`scholar-research-review-skill.md`
- Canonical：`skills/scholar-research-review/SKILL.md`

此 skill 封裝 Scholar／PubMed corpus intake、author disambiguation、timeline
reconstruction、topic-evolution analysis、landmark selection、attribution audit、
claim ledger 與 independent reviewer gate。

## 後續可改進

- 加入 ORCID／OpenAlex／Semantic Scholar 多來源 deduplication。
- 建立人工標註 sample，評估 topic classifier precision／recall。
- 對 landmark papers 建立 citation-network 或 coauthor-network 圖。
- 將 contribution statements 系統化寫入 citation library。
- 對年代主題做可重現 topic model，並保留人工 validation。
