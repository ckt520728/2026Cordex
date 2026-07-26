---
title: "從因果攝動到臨床轉譯：rTMS、Theta-burst TMS、tDCS 與 tACS 在認知神經科學及神經精神疾病的應用"
date: 2026-07-26
tags: [NIBS, rTMS, TBS, tDCS, tACS, narrative-review]
category: academic-paper
run_id: 20260726-nibs-cognition-neuropsychiatry
status: L3_VERIFIED_DRAFT_AWAITING_AUTHOR_AND_PUBLISH_GATE
source_ids: [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29, S30, S31, S32, S33, S34, S35, S36]
---

# 從因果攝動到臨床轉譯：rTMS、Theta-burst TMS、tDCS 與 tACS 在認知神經科學及神經精神疾病的應用

**English title:** From Causal Perturbation to Clinical Translation: Applications of rTMS, Theta-Burst TMS, tDCS, and tACS in Cognitive Neuroscience and Neuropsychiatric Disorders

**Article type:** Structured narrative review  
**Target audience:** Cognitive neuroscientists、clinical neurophysiologists、psychiatrists、neurologists  
**Author／affiliation:** 待作者確認  
**Citation style:** APA 7（journal-neutral draft）  
**Scope date:** 2026-07-26

## Structured abstract

### Background

Repetitive transcranial magnetic stimulation（rTMS）、theta-burst stimulation（TBS）、transcranial direct current stimulation（tDCS）及 transcranial alternating current stimulation（tACS）已從認知神經科學實驗工具，逐步發展為神經精神疾病的治療候選。然而，「非侵入性腦刺激有效」並不是可跨技術、參數、標靶與疾病泛化的命題。

### Objective

本 structured narrative review 比較四類 NIBS 的物理與神經生理作用、因果推論層級、成人認知效應、神經精神疾病療效、安全性與轉譯限制。

### Evidence synthesis

我們對六本預先界定的 NotebookLM notebooks 進行 bounded grounded query，並以 PubMed、IFCN guidelines、primary randomized trials 與 FDA regulatory record 回查重要 claims。rTMS/TBS 可誘發 action potentials，對時空因果攝動最有力；左 DLPFC high-frequency rTMS 對 depression 具 IFCN Level A evidence，iTBS 對 10-Hz rTMS 在 treatment-resistant depression 達 noninferiority。tDCS 的 subthreshold polarization 受 montage、dose、anatomy 與 brain state 影響，ELECT-TDCS 未證明對 escitalopram noninferiority。tACS 可產生 phase/frequency-sensitive modulation，但 retinal/cutaneous pathways、blinding 與 concurrent recording artifacts 限制 direct cortical entrainment 的宣稱。跨技術的 cognitive enhancement 多為小效應、高異質且 task-specific。OCD 與 tobacco use disorder 的部分 TMS evidence 為 device/protocol-specific；MCI/Alzheimer's disease、schizophrenia、PTSD 與其他應用仍以 promising but investigational 為宜。

### Conclusions

NIBS 應以 `modality × protocol × target/network × brain state × endpoint × timescale` 評估，而非依 modality 做單一排名。NIBS 在 cognitive neuroscience 的 causal perturbation 價值，整體高於普遍 cognitive enhancement 的證據。未來臨床試驗應優先驗證 target engagement、active sham、blinding、functional endpoint、durability 與多中心可重複性。

**Keywords:** non-invasive brain stimulation; rTMS; theta-burst stimulation; tDCS; tACS; cognitive neuroscience; depression; neuropsychiatry; Alzheimer’s disease

## 1. Introduction

NIBS 的吸引力來自三個可同時成立、卻常被混寫的目標：以外部能量測試 brain–behavior causality、短期調節認知表現，以及治療持續性的神經精神症狀。這三者需要不同的對照條件與證據門檻。一次 TMS pulse 造成的 milliseconds-level behavioral disruption，不等於多週 rTMS course 的臨床 efficacy；tACS 刺激期間出現 phase locking，不等於刺激後具有 synaptic plasticity，更不等於疾病功能改善。

本文主張，NIBS 的基本判讀單位不是技術名稱，而是完整 intervention package。若省略 frequency、intensity、pulse number/current density、montage/coil、target、brain state、concurrent task、sham、endpoint 與 follow-up，「rTMS 有效」或「tACS 能同步大腦」都不是可被科學驗證的完整命題。

## 2. Definitions and scope

本文是 structured narrative review，不是 systematic review 或新執行的 meta-analysis。納入成人 human studies，以 2016–2026 evidence 為主，並納入定義技術與關鍵因果論證所必需的 seminal studies。疾病範圍包括 MDD/TRD、schizophrenia、OCD、PTSD、tobacco/addiction、MCI/AD；認知範圍包括 attention、working memory、executive function、learning/memory。

Evidence discovery 先以六本明確指定的 NotebookLM notebooks 進行跨庫盤點；NotebookLM 回答只作 synthesis artifact，不作 primary evidence。臨床等級、數值、法規與安全主張再以 PubMed、IFCN guideline、primary RCT 或 FDA record 核對。因未執行可重現的全資料庫搜尋、雙人 screening 與 risk-of-bias protocol，本文不使用「systematic review」標籤。

## 3. Four modalities, four different perturbations

### 3.1 rTMS: suprathreshold perturbation and network propagation

TMS 以快速變動磁場在皮質產生感應電流，適當強度可誘發 action potentials。Single-/paired-pulse TMS 可在特定時間窗干擾行為或量測 corticocortical propagation；重複刺激則可能造成持續的 network modulation。它對 cognitive neuroscience 的核心優勢是可把純相關推進到 intervention-based causality。然而，causal 不等於 localist：刺激同時產生 auditory/somatosensory inputs，並沿 structural/functional networks 傳播。觀察到 behavioral change，只能證明該 target–time–network configuration 對任務具有 causal relevance，不能證明該區單獨「儲存」該功能（Hobot et al., 2021; Parkin et al., 2015）。

### 3.2 Theta-burst stimulation: efficient patterned rTMS, not a universal LTP/LTD switch

TBS 通常由 50-Hz triplets 以 5-Hz theta rhythm 組織；經典 motor-cortex model 將 iTBS 視為 LTP-like、cTBS 視為 LTD-like。然而，prefrontal、cognitive 與 clinical results 受 intensity、dose、target、state 與個體差異影響。Prefrontal cTBS review 顯示注意、抑制控制、planning 與 decision making 的方向並不一致；iTBS cognitive meta-analysis 亦對 outlier、navigation 與 stimulation site 敏感（Ngetich et al., 2020; Pabst et al., 2022）。因此，「iTBS excitatory／cTBS inhibitory」應視為 protocol-dependent working model。

### 3.3 tDCS: context-dependent polarization

tDCS 以弱直流電改變 neuronal membrane polarization，通常不直接引發 action potentials。Intracranial measurement 證明常規 scalp current 能在 human brain 形成可測電場（Huang et al., 2017），但 cortical folding 使同一電極下不同 neuronal compartments 與 gyri orientations 可能承受相反方向電場。「anodal excitatory、cathodal inhibitory」來自特定 motor-cortex protocols；meta-analytical review 顯示 cathodal inhibition 在 non-motor cognition 特別不一致，不能不加條件地外推至 prefrontal cognition（Jacobson et al., 2012）。藥物、baseline excitability、年齡、atrophy、task state、electrode size 與 montage 都可能改變 direction 與 magnitude。

### 3.4 tACS: entrainment, modulation, or sensory mediation?

tACS 以週期性 subthreshold current 影響 spike timing、phase alignment 與 cross-frequency coupling。Concurrent EEG/MEG studies 提供 online frequency/phase interaction evidence（Helfrich et al., 2014; Kasten et al., 2018; Witkowski et al., 2016），但這類記錄容易受巨大 stimulation artifact、heartbeat/respiration-mediated nonlinear artifact 影響（Noury et al., 2016）。此外，retinal phosphenes 與 cutaneous afferents 可能間接牽引腦活動並破壞 blinding（Schutter, 2016）。刺激後 alpha power 增加也可能是 plasticity，而非 entrainment 的物理延續（Vossen et al., 2015）。

因此，直接 cortical entrainment 至少需要 frequency/phase specificity、適當 active sensory control、artifact-aware recording 與 behavioral/neural convergence。

## 4. Cognitive neuroscience applications

### 4.1 Attention and executive function

TMS/TBS 可測試 attention network 與 executive-control nodes 的時間因果角色。cTBS 有時降低 performance，有時透過抑制 competing processes 改善表現，說明「cognitive enhancement」可能源於 network rebalancing，而非全域能力提升。Healthy-adult offline HF-rTMS meta-analysis 的 pooled accuracy/reaction-time effects 為 small magnitude，executive function 相對較明顯，但仍不支持 broad neuroenhancement（Xu et al., 2024）。

tDCS/tACS 在 attention/executive tasks 有 positive 與 null studies。tACS meta-analysis 報告小幅 cognitive-performance benefit，但 reaction time 可無顯著改變，moderator 結果依 timing、frequency 與 target 而變（Lee, Lee, & Kang, 2023）。精神疾病樣本的 pooled signal 亦受少量試驗與寬 confidence intervals 限制（Lee et al., 2022）。這種 task-specific effect 不等同 real-world executive function。

### 4.2 Working memory

Fronto-parietal theta synchronization 是 tACS working-memory studies 的重要 target。Reinhart 與 Nguyen（2019）在 older adults 以 individualized frontotemporal theta stimulation 報告短期 working-memory improvement 與 phase-coupling recovery，但這是特定 task、短期 endpoint，不能寫成逆轉 aging。tDCS working-memory literature 同時存在 small positive synthesis 與 publication/evidential-value criticism（Mancuso et al., 2016; Medina & Cason, 2017）。

### 4.3 Learning and memory

Memory studies 常混合 encoding、consolidation、retrieval 與 disease progression。Sleep slow-oscillatory tDCS 亦有 well-controlled null result；這提醒生理上合理的 oscillatory target 不必然轉成 behavioral gain。AD 的 precuneus rTMS 則把 network target、longitudinal clinical endpoint 與 TMS-EEG marker放在同一試驗，較接近臨床轉譯，但仍需 replication。

## 5. Neuropsychiatric disorders

### 5.1 Major depression and treatment-resistant depression

2020 IFCN guideline 將 figure-of-8/H1-coil 左 DLPFC high-frequency rTMS 列為 Level A，右 DLPFC low-frequency 與 bilateral combinations 為較低但支持性的層級（Lefaucheur et al., 2020）。這是目前四種技術中最成熟的 clinical evidence。

THREE-D trial 將 414 名 TRD 患者隨機分配至 10-Hz rTMS 或 iTBS；iTBS 對症狀改善達 noninferiority，且 session 約 3 分鐘，對照 37.5 分鐘（Blumberger et al., 2018）。應精確表述為「對 active standard treatment noninferior」，而非「證明 iTBS 優於 sham」。

Accelerated individualized iTBS/SNT 的 double-blind sham-controlled RCT 納入 29 名接受治療者（active 14、sham 15），4-week MADRS reduction 為 52.5% 對 11.1%，提供 rapid-response signal（Cole et al., 2022）；但早期約 90% remission 來自 open-label cohort，不能與該 RCT 合併解讀。小樣本、single center、durability 與 independent replication 限制其泛化。

tDCS evidence 較不一致。ELECT-TDCS 顯示 tDCS 未達對 escitalopram 的 noninferiority，且 adverse-event profile 不同（Brunoni et al., 2017）。因此，即使 active tDCS 可優於 placebo，也不能宣稱可取代 antidepressant treatment。tACS 在 depression 的 trials 仍少，meta-analytic signal 的 confidence interval 寬，證據成熟度低於 rTMS/iTBS。

### 5.2 Schizophrenia

rTMS targets 包括 left temporoparietal cortex for auditory hallucinations 與 DLPFC for negative/cognitive symptoms；guideline-level certainty 未達 depression。tDCS 新近大型 double-blind RCT（n=173）報告 working-memory/neurocognition improvement（García-Fernández et al., 2025），但跨研究 montage、dose、symptom stability、cognitive battery 與 follow-up 不一致。單一 cognitive battery change 不能等同 psychosocial functioning。

### 5.3 Obsessive-compulsive disorder

FDA 2018 permitted marketing of the BrainsWay Deep TMS system for OCD，基礎 multicenter study 為 100 人；active response 38%、sham 11%。這是 device、coil、target、provocation 與 protocol-specific evidence，不是所有 rTMS 的 class-wide approval。Pre-SMA tDCS 有小型 double-blind sham RCT，但目前宜視為 investigational。

### 5.4 Post-traumatic stress disorder

2020 IFCN guideline 將 right-DLPFC high-frequency rTMS 列為 Level B。早期 double-blind study（n=24）支持 10-Hz right-DLPFC protocol；但 2024 Cochrane review 納入 13 個 RCTs（577 人），primary analysis 顯示 active rTMS 對短期 PTSD severity 可能 little-to-no difference，擴大 sensitivity analysis 又呈顯著異質（Brown et al., 2024）。這項當代 pooled evidence 與較早 guideline 的 evidence window 不同，必須並列。tDCS 與 virtual-reality exposure 的組合研究有臨床興趣，但若 trial 未設足以拆解 components 的 arms，不能把全部改善歸因於 electrical stimulation。

### 5.5 Addiction

Zangen et al.（2021）在 262 名 chronic smokers 的 multicenter double-blind RCT 中，將 bilateral lateral prefrontal/insular rTMS 與 cue-induced craving procedure 結合；ITT efficacy set 為 234 人，Week-18 continuous quit rate 為 active 19.4% 對 sham 8.7%（p=0.017）。這支持特定 tobacco-use-disorder protocol，不能直接外推 alcohol、stimulant、其他 coil/target 或沒有 cue provocation 的療程。

### 5.6 MCI and Alzheimer’s disease

Koch et al.（2022）在 50 名 mild-to-moderate AD 患者執行 24-week double-blind phase-2 trial；precuneus rTMS 組 CDR-SB 較穩定，並在 secondary cognitive/functional outcomes 與 local gamma activity 出現差異。研究同時有 clinically meaningful endpoint 與 mechanistic marker，是重要 signal；但 sample size、single center 與 phase-2 status 不足以支持 routine clinical use。

AD/MCI component network meta-analysis 納入 27 個 double-blind RCTs（n=1070）：short-term general cognition 的 HF-rTMS SMD 為 1.08（95% CI 0.35–1.80），anodal tDCS SMD 為 0.56（0.03–1.09）；pure AD/MCI subgroup 中僅 AD 顯示相同方向的 positive effects（Chu et al., 2021）。這些估計不包含 tACS，且 protocol、disease stage、target、outcome 與 follow-up 高度異質。40-Hz tACS studies 可另作 mechanistic/clinical signals；amyloid、perfusion 或 oscillation change 不能單獨證明 disease modification。

## 6. Safety, contraindications, and implementation

TMS 常見 adverse effects 為 scalp discomfort 與 headache；seizure 是嚴重但罕見風險。不同 protocol、coil、medication 與 patient risk 不能用單一 seizure rate 概括。電子／磁性 implants、epilepsy risk、sleep deprivation、medications 與 concurrent procedures 應依 current expert guideline逐案 screen（Rossi et al., 2021）。

2026 tES safety update 在逾 300,000 sessions 中未報告 tES-related serious adverse events；其主要安全範圍為 ≤4 mA、≤60 min/day（Antal et al., 2026）。Tingling/burning、headache、fatigue 等是常見、與刺激時間相關的 adverse events，但 AE 不等同已確立因果的 side effect；更高 dose、監測品質與 under-reporting 仍限制推論。這只支持 guideline-defined dosing 的 safety profile，不證明 efficacy，也不構成 unsupervised DIY 或超參數使用的背書。

## 7. Competing interpretations

### Interpretation A: NIBS directly normalizes a pathological circuit

此模型在 target-specific clinical response、network connectivity change 與 mechanistic physiology convergent 時最有力。但大部分研究未同時滿足 target engagement、active sham、network specificity 與 durable function。

### Interpretation B: NIBS changes general arousal, expectation, sensation, or task strategy

Scalp sensation、auditory click、phosphene、pain、blinding failure 與 concurrent task learning 均可造成 behavioral change。這不是否定 NIBS，而是要求 controls 對應 modality-specific sensory signature。

### Interpretation C: Biomarker change is an intermediate state, not a clinical mechanism

EEG power、phase coupling、functional connectivity、perfusion 或 MEP change 可以是 target-engagement marker，也可以是 epiphenomenon。除非 mediation、dose-response、temporal precedence 與 clinical endpoint 同時支持，不能將 biomarker 直接命名為 therapeutic mechanism。

## 8. A six-dimensional framework for interpretation

本文提出以下六維框架（作者整合，非已驗證 clinical score）：

1. **Modality:** suprathreshold magnetic、patterned magnetic、direct current、alternating current。
2. **Protocol:** frequency、intensity、pulse/current dose、session density。
3. **Target/network:** scalp coordinate、electric field、connectivity-defined node。
4. **Brain state:** rest/task、oscillatory phase、medication、sleep、disease stage。
5. **Endpoint:** physiology、task performance、symptom scale、function、disease progression。
6. **Timescale:** online milliseconds/minutes、offline hours/days、clinical weeks/months。

只有六維條件相近的 studies 才適合直接比較。這也解釋為何以「modality」作排行榜經常誤導。

## 9. Limitations

本研究是 narrative review，沒有執行完整資料庫搜尋、protocol registration、雙人 title/full-text screening、formal risk-of-bias scoring 或新 pooled analysis。NotebookLM notebooks 反映使用者既有 source collection，存在 selection bias；部分 NotebookLM citations 未提供完整 DOI，因而未被用於強數值主張。Guideline evidence windows 落後於 2026；較新 RCT 尚未充分進入 guideline。不同疾病與 cognitive domains 的篇幅不等，不能視為完整 clinical practice guideline。

此外，本稿由 AI 協助整理。所有醫療與方法學結論在投稿或臨床採用前，必須由領域專家回查 full text、更新 search 並完成 formal risk-of-bias assessment。**此為 AI 判斷，請自行驗證。**

## 10. Research agenda

1. 以 measured/modelled electric field 與 network engagement 報告 dose，而非只列 scalp coordinates。
2. 將 blinding guess、sensory intensity 與 sham fidelity 列為 core outcomes。
3. 對 cognition 預先指定 primary task、near/far transfer 與 real-world function。
4. tACS concurrent recording 使用 physiological-artifact model 與 retinal/cutaneous controls。
5. individualized/closed-loop protocols 需與 optimized open-loop active comparator 做 preregistered head-to-head RCT。
6. AD/MCI trials 應分層 disease stage、biomarker status、atrophy 與 field distribution，並分開報告 cognition、function 與 biomarkers。
7. 建立跨研究最小 common data elements：dose、target、state、sham、adverse events、follow-up 與 raw analysis provenance。

## 11. Conclusions

rTMS/iTBS 在 MDD/TRD 具最成熟、protocol-specific evidence；OCD 與 tobacco use disorder 的部分 TMS applications 有 device/protocol-specific regulatory 或 RCT support。tDCS、tACS 與其他疾病 applications 具有重要研究潛力，但 evidence maturity 不一。對 cognitive neuroscience 而言，NIBS 作為 causal perturbation 的科學價值，整體高於「普遍提升認知」的證據。

下一階段的關鍵不是再問「哪種刺激最好」，而是以完整 intervention package 判斷：在何種 brain state、對哪個 network、以何種 dose、改變哪個 endpoint、維持多久，以及是否能排除 sensory、expectation 與 analysis artifacts。

## References

Antal, A., et al. (2026). Low intensity transcranial electric stimulation: Safety, ethical, legal regulatory and application guidelines (2017–2025 update). *Clinical Neurophysiology, 184*, 2111436. https://doi.org/10.1016/j.clinph.2025.2111436

Blumberger, D. M., et al. (2018). Effectiveness of theta burst versus high-frequency repetitive transcranial magnetic stimulation in patients with depression (THREE-D). *The Lancet, 391*(10131), 1683–1692. https://doi.org/10.1016/S0140-6736(18)30295-2

Brunoni, A. R., et al. (2017). Trial of electrical direct-current therapy versus escitalopram for depression. *New England Journal of Medicine, 376*(26), 2523–2533. https://doi.org/10.1056/NEJMoa1612999

Brown, R., Cherian, K., Jones, K., Wickham, R., Gomez, R., & Sahlem, G. (2024). Repetitive transcranial magnetic stimulation for post-traumatic stress disorder in adults. *Cochrane Database of Systematic Reviews, 8*, CD015040. https://doi.org/10.1002/14651858.CD015040.pub2

Chu, C.-S., et al. (2021). Cognitive effects and acceptability of non-invasive brain stimulation on Alzheimer's disease and mild cognitive impairment: A component network meta-analysis. *Journal of Neurology, Neurosurgery & Psychiatry, 92*(2), 195–203. https://doi.org/10.1136/jnnp-2020-323870

Cole, E. J., et al. (2022). Stanford Neuromodulation Therapy (SNT): A double-blind randomized controlled trial. *American Journal of Psychiatry, 179*(2), 132–141. https://doi.org/10.1176/appi.ajp.2021.20101429

García-Fernández, L., et al. (2025). Transcranial direct current stimulation enhances cognitive function in schizophrenia: A randomized double-blind sham-controlled trial. *Psychiatry Research, 344*, 116308. https://doi.org/10.1016/j.psychres.2024.116308

Hobot, J., Klincewicz, M., Sandberg, K., & Wierzchoń, M. (2021). Causal inferences in repetitive transcranial magnetic stimulation research: Challenges and perspectives. *Frontiers in Human Neuroscience, 14*, 586448. https://doi.org/10.3389/fnhum.2020.586448

Helfrich, R. F., et al. (2014). Entrainment of brain oscillations by transcranial alternating current stimulation. *Current Biology, 24*(3), 333–339. https://doi.org/10.1016/j.cub.2013.12.041

Huang, Y., et al. (2017). Measurements and models of electric fields in the in vivo human brain during transcranial electric stimulation. *eLife, 6*, e18834. https://doi.org/10.7554/eLife.18834

Jacobson, L., Koslowsky, M., & Lavidor, M. (2012). tDCS polarity effects in motor and cognitive domains: A meta-analytical review. *Experimental Brain Research, 216*(1), 1–10. https://doi.org/10.1007/s00221-011-2891-9

Kasten, F. H., et al. (2018). Facilitated event-related power modulations during transcranial alternating current stimulation revealed by concurrent tACS-MEG. *eNeuro, 5*(3). https://doi.org/10.1523/ENEURO.0069-18.2018

Kleinert, M.-L., et al. (2017). Frequency-unspecific effects of tACS. *Frontiers in Human Neuroscience, 11*, 367. https://doi.org/10.3389/fnhum.2017.00367

Koch, G., et al. (2022). Precuneus magnetic stimulation for Alzheimer's disease: A randomized, sham-controlled trial. *Brain, 145*(11), 3776–3786. https://doi.org/10.1093/brain/awac285

Lefaucheur, J.-P., et al. (2017). Evidence-based guidelines on the therapeutic use of transcranial direct current stimulation (tDCS). *Clinical Neurophysiology, 128*(1), 56–92. https://doi.org/10.1016/j.clinph.2016.10.087

Lefaucheur, J.-P., et al. (2020). Evidence-based guidelines on the therapeutic use of repetitive transcranial magnetic stimulation (rTMS): An update (2014–2018). *Clinical Neurophysiology, 131*(2), 474–528. https://doi.org/10.1016/j.clinph.2019.11.002

Lee, A. R. Y. B., et al. (2022). Transcranial alternating current stimulation and its effects on cognition and the treatment of psychiatric disorders: A systematic review and meta-analysis. *Therapeutic Advances in Chronic Disease, 13*, 20406223221140390. https://doi.org/10.1177/20406223221140390

Lee, T. L., Lee, H., & Kang, N. (2023). A meta-analysis showing improved cognitive performance in healthy young adults with transcranial alternating current stimulation. *npj Science of Learning, 8*, 1. https://doi.org/10.1038/s41539-022-00152-9

Mancuso, L. E., Ilieva, I. P., Hamilton, R. H., & Farah, M. J. (2016). Does transcranial direct current stimulation improve healthy working memory? *Journal of Cognitive Neuroscience, 28*(8), 1063–1089. https://doi.org/10.1162/jocn_a_00956

Medina, J., & Cason, S. (2017). No evidential value in samples of transcranial direct current stimulation studies of cognition and working memory in healthy populations. *Cortex, 94*, 131–141. https://doi.org/10.1016/j.cortex.2017.06.021

Ngetich, R., et al. (2020). Assessing the effects of continuous theta burst stimulation over the dorsolateral prefrontal cortex on human cognition: A systematic review. *Frontiers in Integrative Neuroscience, 14*, 35. https://doi.org/10.3389/fnint.2020.00035

Noury, N., et al. (2016). Physiological processes non-linearly affect electrophysiological recordings during transcranial electric stimulation. *NeuroImage, 140*, 99–109. https://doi.org/10.1016/j.neuroimage.2016.03.065

Pabst, A., et al. (2022). A systematic review and meta-analysis of the efficacy of intermittent theta burst stimulation on cognitive enhancement. *Neuroscience & Biobehavioral Reviews, 135*, 104587. https://doi.org/10.1016/j.neubiorev.2022.104587

Parkin, B. L., Ekhtiari, H., & Walsh, V. F. (2015). Non-invasive human brain stimulation in cognitive neuroscience: A primer. *Neuron, 87*(5), 932–945. https://doi.org/10.1016/j.neuron.2015.07.032

Reinhart, R. M. G., & Nguyen, J. A. (2019). Working memory revived in older adults by synchronizing rhythmic brain circuits. *Nature Neuroscience, 22*, 820–827. https://doi.org/10.1038/s41593-019-0371-x

Rossi, S., et al. (2021). Safety and recommendations for TMS use in healthy subjects and patient populations. *Clinical Neurophysiology, 132*(1), 269–306. https://doi.org/10.1016/j.clinph.2020.10.003

Schutter, D. J. L. G. (2016). Cutaneous retinal activation and neural entrainment in transcranial alternating current stimulation: A systematic review. *NeuroImage, 140*, 83–88. https://doi.org/10.1016/j.neuroimage.2015.09.067

Vossen, A., Gross, J., & Thut, G. (2015). Alpha power increase after transcranial alternating current stimulation at alpha frequency reflects plastic changes rather than entrainment. *Brain Stimulation, 8*(3), 499–508. https://doi.org/10.1016/j.brs.2014.12.004

Witkowski, M., et al. (2016). Mapping entrained brain oscillations during transcranial alternating current stimulation. *NeuroImage, 140*, 89–98. https://doi.org/10.1016/j.neuroimage.2015.10.024

Xu, M., Nikolin, S., Samaratunga, N., Chow, E. J. H., Loo, C. K., & Martin, D. M. (2024). Cognitive effects following offline high-frequency repetitive transcranial magnetic stimulation (HF-rTMS) in healthy populations: A systematic review and meta-analysis. *Neuropsychology Review, 34*(1), 250–276. https://doi.org/10.1007/s11065-023-09580-9

Zangen, A., et al. (2021). Repetitive transcranial magnetic stimulation for smoking cessation: A pivotal multicenter double-blind randomized controlled trial. *World Psychiatry, 20*(3), 397–404. https://doi.org/10.1002/wps.20905
