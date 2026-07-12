# NotebookLM cross-paper synthesis export prompt

請針對以下研究問題，綜合目前 Notebook 中實際相關的來源，輸出一份可供後續 primary-source verification 的 Markdown。這不是逐篇摘要。

研究問題：

> 【貼上研究問題】

分析目的：

> 【比較／批判／矛盾解析／關聯建模／研究缺口】

## 規則

1. 只能使用目前 Notebook 中存在的來源。
2. 每項重要主張保留 NotebookLM inline citation。
3. 不得虛構作者、年份、DOI、頁碼、統計值或研究結果。
4. 區分來源直接陳述、單篇作者解釋、跨來源推論與假說。
5. 不可用模糊折衷句掩蓋來源矛盾。
6. 標示多篇文章可能共享同一資料集或上游引用的情況。
7. NotebookLM 綜合結果不得標成 primary evidence。

## YAML front matter

```yaml
---
analysis_id: "Q-YYYYMMDD-01"
title: ""
type: "cross-paper-synthesis"
created: "YYYY-MM-DD"
tool: "NotebookLM"
language: "zh-TW"
research_question: >
  
analysis_objectives: ["comparison", "critique", "relationship-mapping", "contradiction-analysis", "gap-analysis"]
source_ids: []
source_titles: {}
synthesis_status: "notebooklm-derived"
primary_source_verification: "required"
evidence_scope: "closed-notebook-corpus"
confidence: "mixed"
known_limitations:
  - "尚未逐項回到原始 PDF 查核"
---
```

## 必要章節

1. 研究問題與範圍。
2. 來源集合與角色表：Source ID、標題、角色、相關程度、來源類型。
3. 與問題直接相關的各來源立場。
4. 跨文獻比較矩陣。
5. 共同支持的結論：支持來源、支持方式、證據強度、不可延伸的主張。
6. 矛盾：衝突主張、衝突類型、可能解釋、能否解析、PDF 查核需求。
7. 跨來源關聯：概念延伸、因果鏈、分析層次、方法互補或反例。
8. 主張與證據帳本：Claim ID、最小可查核主張、claim type、支持／反對來源、強度、是否須查 PDF。
9. PDF 查核清單：高／中／低優先序、來源、應查位置、查核失敗的降階方式。
10. 研究缺口：來源明示、跨來源暴露、新推論、資料不足。
11. Academic paper 候選論證結構，列出 Claim IDs 與 Source IDs。
12. 可以說什麼、不能說什麼、最重要矛盾、下一步查核。

最後輸出有效 JSON：

```json
{
  "analysis_id": "Q-YYYYMMDD-01",
  "research_question": "",
  "source_ids": [],
  "supported_claim_ids": [],
  "contested_claim_ids": [],
  "cross_source_inference_ids": [],
  "hypothesis_ids": [],
  "high_priority_pdf_checks": [],
  "candidate_paper_sections": []
}
```

輸出前確認 YAML 與 JSON 可解析、重要主張都有引用、矛盾未被刪除，且所有跨來源結論仍標記為待 primary-source verification。
