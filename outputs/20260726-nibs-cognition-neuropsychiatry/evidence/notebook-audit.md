---
title: "NotebookLM bounded cross-notebook source audit"
date: 2026-07-26
tags: [NotebookLM, source-audit, NIBS]
category: evidence-audit
run_id: 20260726-nibs-cognition-neuropsychiatry
status: L1_COMPLETE
source_ids: [NLM-01, NLM-02, NLM-03, NLM-04, NLM-05, NLM-06]
---

# 結論

六本 notebooks 被明確選入，不是掃描全部 183 本。真正提供本題 human evidence 的主力為 NLM-01、NLM-03、NLM-04、NLM-05；NLM-02 標題相關但幾乎不含 MCI/AD 的 rTMS/TBS/tDCS/tACS 臨床試驗，NLM-06 僅作 neuropsychiatric background，不可提升為直接 efficacy evidence。

| ID | Notebook title | Notebook UUID | 角色 | Audit verdict |
|---|---|---|---|---|
| NLM-01 | `*Neuro_2026_Taiwan_S_Neurophysiology_&_Juan's_Papers_經顱磁刺激臨床指南` | `115b2675-3e10-4fdb-b2fe-d454cd3fbcf0` | TMS/TBS guideline、TMS-EEG、MDD/OCD/PTSD、safety | INCLUDE；逐項回查 full text |
| NLM-02 | `Neuro_AD Therapy(2)_NIBS_Taiwan_EEG_新藥與早期診斷` | `121646e5-11f4-4165-bd5f-861854d4a955` | AD treatment 與台灣 NIBS 背景 | CONTEXT ONLY；本題直接 human evidence 不足 |
| NLM-03 | `Neuro_AD_PD_NIBS_Brain_Rhythmic_Oscillations` | `b0223c46-6787-4a24-bddd-7c403b4fcee3` | AD/MCI NIBS network meta-analysis、gamma、cognition | INCLUDE |
| NLM-04 | `Neuro_Clinical Research with Transcranial Direct Current Stimulation: Challenges and Future Directions` | `31687d1e-5abe-4add-854b-24a56eae75c8` | tDCS dosing、field measurement、nulls、safety | INCLUDE |
| NLM-05 | `#Neuro_Oscillatory_Entrainment&_伽瑪振盪與大腦局部迴路機制` | `7d869e98-c20e-4603-9c53-57c10171d1bb` | tACS entrainment、artifact、state-dependence | INCLUDE |
| NLM-06 | `Neuro_Neurobiology of Brain Disorders_難治性憂鬱症與快速抗抑鬱治療研究指南` | `e7e7b701-63d1-49c0-bf49-79de9ae4d29f` | depression/OCD textbook background | CONTEXT ONLY |

## Query contract

- 只使用 existing sources。
- 回報 modality、population/task、protocol、outcome、nulls、adverse effects、evidence type 與 source identity。
- 缺失寫 `Not reported`；禁止補猜 DOI、數字或 authorship。
- 必須區分 online entrainment、offline modulation、association 與 causal perturbation。

## Cross-notebook findings

1. **rTMS/iTBS 的臨床證據最成熟於 depression**；iTBS 的關鍵證據是對 10-Hz rTMS 的 non-inferiority，而非對 sham 的全面優越性。
2. **tDCS 的簡單 polarity heuristic 不可靠**：電場受 cortical folding、montage、dose、baseline state 與 medication 影響；「anodal excitatory / cathodal inhibitory」不可跨區域與劑量直接外推。
3. **tACS 的 strongest mechanistic claim 是 phase/frequency-sensitive modulation**；真正 online cortical entrainment 需排除 retinal/cutaneous confounds 與 concurrent EEG/MEG artifact。
4. **cognitive enhancement 多為小效應、高異質性**；健康受試者的短期 task improvement 不等同 neuropsychiatric functional benefit。
5. **AD/MCI 為 promising but investigational**：小型 RCT、single-center 與異質 protocols 尚不足以支持 routine care。

## Source-selection counterexample

NLM-02 的標題高度相關，但 grounded query 顯示其 MCI/AD 的四類 NIBS human trials 幾乎皆為 `Not reported`；反之 NLM-03 含 Chu et al. component network meta-analysis 與 gamma neuromodulation review。此例證明 notebook title 只能作 candidate detector，不能作 evidence-quality gate。

## Connector pitfalls

1. `cross_notebook_query` 在六本 notebook、完整 audit prompt 下於 180 秒 timeout。
2. `notebook_query_start` 的 completed payload 具短暫保存／一次性回收特性；若只讀 `status` 而不保存 `result`，後續可能回報 query ID expired/not found。
3. 大型 notebook 的 `source_list_drive` 輸出超過 client token limit，必須以 relevance filter 分批擷取。
4. NotebookLM 可能把 review、book chapter、guideline 與 primary RCT 混在同一答案；必須在本機 registry 重新分級。

