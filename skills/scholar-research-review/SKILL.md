---
name: scholar-research-review
description: Reconstruct and critically review a scholar's research timeline, topic evolution, and field contribution from Google Scholar, PubMed, Crossref, institutional profiles, CVs, and official guidelines. Use when the user asks to analyze a professor or researcher's publications, identify landmark papers, distinguish individual leadership from consortium work, audit Google Scholar exports, or produce an evidence-bound academic contribution review.
---

# Scholar Research Review

## 核心原則

先給結論，再呈現時間軸與證據。每項重要論點必須回指可核實來源。

1. **No citation ID, no literature claim.**
2. **No artifact path, no corpus-derived numeric claim.**
3. Google Scholar 是 publication discovery source，不是唯一的身分、作者角色或內容證據。
4. 不把共同作者身分自動解讀為主持、發明或主要貢獻。
5. 明確區分 `literature`、`derived`、`hypothesis` 與 `unsupported`。
6. 醫學研究優先使用 PubMed、期刊正式頁面、official guideline 與機構檔案。

## 成功標準

- 建立可稽核的 publication corpus，並記錄涵蓋範圍與缺漏。
- 完成同名作者消歧。
- 產出分期時間軸、主題演化矩陣與 landmark papers。
- 區分 first/corresponding author、共同作者、workgroup member、chair 與 initiative leader。
- 每個主要結論都有 citation IDs 或 corpus artifact。
- 經獨立 reviewer 檢查過度歸因、citation mismatch 與數字有效性。

## 工作流程

### 1. 定義問題與證據邊界

記錄目標學者、affiliation、研究領域、時間範圍、Scholar URL、CSV／CV、可接受來源，
以及 Scholar 自動存取或資料匯出限制。

若 Scholar CSV 只有 citations、h-index 等 profile metrics，不得宣稱它包含完整
publication corpus。

### 2. Crow：建立 citation library

先 retrieval，後 synthesis。優先順序：

1. PubMed／Europe PMC
2. Crossref／DOI
3. 期刊正式頁面
4. Official guideline 或 professional society
5. 大學 faculty profile／CV
6. Google Scholar metadata

每筆至少記錄：

```json
{
  "citation_id": "C-001",
  "title": "...",
  "year": 2007,
  "authors": ["..."],
  "journal": "...",
  "pmid": "...",
  "doi": "...",
  "url": "...",
  "verified": true,
  "identity_status": "confirmed",
  "author_position": 1
}
```

保留 retrieval query、日期、結果筆數及排除紀錄。

### 3. 執行作者消歧

不可只靠 `LastName + initials`。依 full author name、affiliation、email、ORCID、
institution profile、recurring coauthor network、topic continuity 與 chronology 判定。

使用以下狀態：

- `confirmed`
- `probable_historical_record`
- `excluded_same_name`
- `unresolved`

早期 MEDLINE 紀錄若缺 affiliation，保留 caveat，不要強制升級為 confirmed。

### 4. 建立年代與主題結構

先按年份與題名掃描，再按研究問題而非 keyword 數量分期。每一階段回答：

- 主要 clinical/scientific problem 是什麼？
- 使用了哪些方法或研究網絡？
- 相較前一階段，問題尺度如何改變？
- 哪些是 primary studies，哪些是 reviews、consensus 或 policy initiatives？
- 對下一階段造成什麼方法學或制度性影響？

### 5. Landmark paper selection

考量是否改變 disease definition、建立 cohort／registry／network、改變 clinical
practice 或 trial design、回答長期研究問題、學者的作者角色，以及後續研究延續性。

Citation counts 可作輔助，不能取代內容與角色判讀。

### 6. Falcon：只從 verified library 綜整

每個 claim 使用：

```json
{
  "claim_id": "CL-001",
  "claim": "...",
  "claim_type": "literature",
  "evidence_ids": ["C-003", "C-017"],
  "confidence": "high",
  "caveat": ""
}
```

沒有 evidence ID 的 factual statement：刪除、降級為 interpretation，或標記
`unsupported`。

### 7. 嚴格處理學術歸因

允許：

- 「為第一作者，具明確議程設定或寫作領導性」
- 「為 workgroup member，參與共同制定」
- 「持續參與 international consensus network」

避免：

- 把 RIFLE、KDIGO、consensus guideline 寫成單一作者發明
- 因列名於大型 consensus 就推論該主題是個人研究計畫
- 把 review 或 protocol 當作 completed empirical study
- 把共同作者的 biomarker paper 寫成個人發現

若可取得 contribution statement，優先於作者排序。

### 8. Corpus 數字與 bibliometrics

任何 publication count、topic count 或年代趨勢都要記錄 corpus source、query、
identity filters、inclusion/exclusion rules、extraction script 與 artifact path。

Keyword screen 只能作 navigation。未經人工 validation，不得稱為有效的研究
publications 數量或領域占比。

Scholar metrics 必須標記 snapshot date，並說明數值會變動。

### 9. Reviewer gate

使用獨立 reviewer 檢查：

1. citation ID 是否存在且內容匹配
2. 是否過度歸因
3. 數字是否由有效分類方法支持
4. 是否遺漏能直接支持重要主線的 landmark papers
5. feasibility、association、causality 用語是否正確
6. recent consensus participation 是否被誤寫為個人研究轉向

Reviewer 回傳 `PASS` 前不得定稿。Major issues 修正後必須重新送審。

## 最低輸出

```text
README.md
citation_library.json
evidence_report.json
results/
  claim_ledger.csv
  evidence_audit.md
  validation_results.json
reports/
  evidence_bound_report.md
  reviewer_report.md
```

純文獻綜整沒有 patient-level dataset 時，將 Finch／experimental layer 標為
`NOT_APPLICABLE`，不得製造 experimental observed claims。

## 報告結構

1. 結論先行
2. 資料範圍與限制
3. 分期研究時間軸
4. 主題演化矩陣
5. Landmark papers 與作者角色
6. 對領域的具體貢獻
7. 歸因界線與反例
8. 研究限制
9. Evidence audit status

## 常見陷阱

- Scholar 403：改用 PubMed API、Crossref 與 institutional profile；記錄 Scholar 缺口。
- 同名污染：以 affiliation、full name、email 與 coauthor network 排除。
- 搜尋 initials 過窄：補查 full name 與其他常見 author forms，再去重。
- Keyword classification 過寬：不得把自動 screen 當 bibliometric conclusion。
- 大型 consensus 過度歸因：區分 author position、chair、workgroup role 與 contribution。
- 平行驗證 race condition：不要同時寫入與讀取同一 validation artifact。
- Windows Unicode：設定 UTF-8 output，避免 cp950／mojibake。
- GitHub auth 誤判：`gh auth status` 與 plain `git push` 分別驗證。

## 最終檢核

- [ ] Scholar／CSV 的實際內容已確認
- [ ] publication corpus 可重建
- [ ] 同名排除有紀錄
- [ ] 主要 claims 都有 citation IDs
- [ ] corpus 數字都有 artifact path
- [ ] consensus 歸因保守且可驗證
- [ ] reviewer major issues 已修正
- [ ] validation fresh run 為 PASS
