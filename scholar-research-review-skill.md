---
name: scholar-research-review
description: Reconstruct and critically review a scholar's research timeline, topic evolution, and field contribution from verified publications and official sources.
---

# Scholar Research Review

> Canonical Codex skill：`skills/scholar-research-review/SKILL.md`

本檔為 portable single-file 版本。

## 核心規則

1. No citation ID, no literature claim.
2. No artifact path, no corpus-derived numeric claim.
3. Scholar 只作 discovery，不作唯一內容或作者角色證據。
4. 不把共同作者自動解讀為 leader、chair 或 inventor。
5. Keyword screen 未人工驗證前，不得作 bibliometric conclusion。

## 執行流程

### 1. Intake

確認學者姓名、affiliation、研究領域、時間範圍、Scholar URL、CSV／CV，以及可接受來源。
先檢查檔案到底包含逐篇 publications，還是只有 citations、h-index 等 profile metrics。

### 2. Crow retrieval

依序使用 PubMed、Crossref、期刊正式頁、official guideline、institutional profile 與
Scholar metadata，建立 `citation_library.json`。每筆記錄 title、year、authors、
PMID、DOI、URL、identity status 與 author position。

### 3. Author disambiguation

使用 full name、affiliation、email、ORCID、coauthor network、topic continuity 與 chronology。
狀態分為 `confirmed`、`probable_historical_record`、`excluded_same_name`、`unresolved`。

### 4. Timeline and topic evolution

按研究問題分期，而非單純 keyword count。每期說明研究問題、方法、代表作、作者角色、
相較前期的尺度變化及對後續研究的影響。

### 5. Attribution audit

區分 first/corresponding author、共同作者、workgroup member、chair 與 initiative leader。
RIFLE、KDIGO、ADQI 等 consensus 必須視為集體成果，除非 contribution statement 支持
更強的個人歸因。

### 6. Falcon synthesis

所有 factual claims 必須引用 verified citation IDs。沒有證據者刪除、降級為 interpretation，
或標為 `unsupported`。

### 7. Corpus metrics

Publication count、topic count、年代趨勢必須附 query、filters、exclusion rules、
extraction script 與 artifact path。Scholar metrics 標記 snapshot date。

### 8. Independent review

Reviewer 必須檢查 citation mismatch、過度歸因、無效分類、遺漏 landmark papers，
以及 feasibility／association／causality 用語。Major issues 修正後重審，直到 `PASS`。

## 最低產出

- `citation_library.json`
- `evidence_report.json`
- `results/claim_ledger.csv`
- `results/evidence_audit.md`
- `reports/evidence_bound_report.md`
- `reports/reviewer_report.md`
- `results/validation_results.json`

## 常見陷阱

- Scholar 403：改用 PubMed API、Crossref 與 institutional profile。
- 同名污染：不可只靠 surname + initials。
- Author query 過窄：補查 full name 與常見 author forms。
- Keyword screen 過寬：只作 navigation，不作研究占比結論。
- Consensus 過度歸因：作者列名不等同主持。
- Windows Unicode：使用 UTF-8。
- Validation race condition：不要同時讀寫同一結果檔。

## 完成條件

- 主要 claims 全部有 citation IDs 或 artifact paths。
- 同名排除與資料缺口有明確記錄。
- 個人與 consortium 貢獻界線清楚。
- Independent reviewer 為 `PASS`。
- Fresh validation 為 `PASS`。
