---
title: "NIBS cognition/neuropsychiatry independent verifier report"
date: 2026-07-26
run_id: 20260726-nibs-cognition-neuropsychiatry
verifier: fresh-independent-checker
status: ACCEPT-WITH-FIXES
---

# 結論

**最終 verdict：ACCEPT-WITH-FIXES**

20 個核心 claims 中，19 個內容方向通過獨立來源核驗；C18 因安全性措辭把「未報告 tES-related serious adverse events」改寫成可推估發生率的「罕見」，判定 FAIL，需統一改成原 guideline 的報告／因果語言。其餘主要問題是可局部修正的 citation/provenance 與視覺化問題：academic paper 把 Xu et al.（2023/2024 issue）的 HF-rTMS meta-analysis 誤引為 Webb et al.；S25 年份與 DOI 不完整；PTSD「較新異質性」沒有以較新來源登錄；blog 的 0–100 座標與 bubble size 沒有可重現 scoring rule，造成不必要的假精確度。

本報告未修改 maker 的五份 artifacts。

## 核驗原則

- 不採信 NotebookLM synthesis 作為 primary evidence。
- clinical/regulatory/safety 數值優先回查 PubMed、FDA de novo record、primary RCT/full text 或 DOI landing page。
- `exact support` 欄使用可核對的研究設計、樣本、endpoint、effect estimate 或原文短語；未把作者結論升格成 disease modification 或 class effect。
- PASS 代表 claim 的核心內容被支持；`needed fix` 仍可列 provenance、措辭或 citation 修正。

# C01–C20 claim table

| claim_id | verdict | source | exact support | needed fix |
|---|---|---|---|---|
| C01 | PASS | [Lefaucheur et al., 2020, PMID 31901449](https://pubmed.ncbi.nlm.nih.gov/31901449/) | Guideline 明列 left-DLPFC HF-rTMS（figure-of-8 或 H1 coil）治療 depression 為 Level A；同一 abstract 明示 guideline efficacy 不必然達 clinically relevant benefit。 | 保留 device/protocol 與 evidence-window（至 2018）限定。 |
| C02 | PASS | [Blumberger et al., THREE-D, DOI](https://doi.org/10.1016/S0140-6736(18)30295-2) | Multicenter randomized noninferiority trial，n=414；iTBS 約 3 分鐘、standard 10-Hz rTMS 37.5 分鐘；primary depression improvement 達 noninferiority。 | 建議寫「just over 3 min」或「約 3 分鐘」；不可改寫為對 sham superiority。 |
| C03 | PASS | [Cole et al., 2022, PMID 34711062](https://pubmed.ncbi.nlm.nih.gov/34711062/) | RCT abstract 明確區分先前 open-label 約 90% remission 與本次 sham-controlled double-blind trial；29 人接受 treatment（active 14、sham 15），4-week MADRS reduction 52.5% vs 11.1%。 | 在 paper/blog 加上 RCT 的 n=29 與 endpoint；open-label 90% 不得與 RCT remission 混算。 |
| C04 | PASS | [FDA 2018 news release](https://www.fda.gov/news-events/press-announcements/fda-permits-marketing-transcranial-magnetic-stimulation-treatment-obsessive-compulsive-disorder)；[FDA de novo review DEN170078](https://www.accessdata.fda.gov/cdrh_docs/reviews/DEN170078.pdf) | FDA permitted marketing of the **BrainsWay Deep TMS System**；100-person multicenter study；6-week response 38.1% (16/42) vs 11.1% (5/45) sham。 | 維持 device-specific authorization；不要寫成所有 rTMS 的 class-wide approval。 |
| C05 | PASS | [Lefaucheur et al., 2020, PMID 31901449](https://pubmed.ncbi.nlm.nih.gov/31901449/)；[Cochrane review, PMID 39092744](https://pubmed.ncbi.nlm.nih.gov/39092744/) | 2020 guideline 列 right-DLPFC HF-rTMS for PTSD 為 Level B；2024 Cochrane review 指出 protocols/participants 多樣且 active rTMS 對 PTSD severity 的 certainty 受限。 | S09（2004 RCT）不能單獨支持「較新試驗仍異質」；source-registry 應增列 2024 review 或明確的新 RCT。 |
| C06 | PASS | [Zangen et al., 2021, PMID 34505368](https://pubmed.ncbi.nlm.nih.gov/34505368/) | Multicenter double-blind RCT 招募 262 位 chronic smokers；bilateral lateral prefrontal/insular rTMS 並含 cue provocation。ITT efficacy set n=234，Week-18 continuous quit rate 19.4% active vs 8.7% sham，p=0.017。 | 以「aid in smoking cessation／提高 continuous quit rate」表述；不可外推其他 substance、coil 或無 cue-provocation protocol。 |
| C07 | PASS | [Koch et al., 2022, PMID 36281767](https://pubmed.ncbi.nlm.nih.gov/36281767/)；[full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC9679166/) | Randomized double-blind sham-controlled phase-2 trial，n=50、24 weeks；primary CDR-SB 在 active 組穩定、sham 組惡化；ADAS-Cog11、MMSE、ADCS-ADL 與 local gamma 亦有 group differences。 | 保留「may slow decline／signal」與 single-center、phase-2、n=50 限制；不得稱 disease-modifying 或 routine treatment。 |
| C08 | PASS | [Chu et al., 2021, PMID 33115936](https://pubmed.ncbi.nlm.nih.gov/33115936/) | Component network meta-analysis 納入 27 double-blind RCTs、n=1070；short-term general cognition：HF-rTMS 1.08 (95% CI 0.35–1.80)，anodal tDCS 0.56 (0.03–1.09)；pure AD/MCI subgroup 只有 AD 呈 positive effects。 | Claim ledger 的 PROVISIONAL 可升為 VERIFIED，但 paper 應列 pooled estimates／population boundary；不要延伸到 tACS 或 disease modification。 |
| C09 | PASS | [Brunoni et al., ELECT-TDCS, PMID 28657871](https://pubmed.ncbi.nlm.nih.gov/28657871/) | Single-center double-blind noninferiority trial，n=245；HDRS-17 decrease 11.3 escitalopram、9.0 tDCS、5.8 placebo。tDCS vs escitalopram difference −2.3 (95% CI −4.3 to −0.4)，跨越 prespecified margin，故不能主張 noninferiority；兩 active arms 均優於 placebo。 | 現有 wording 正確；可補 10-week、2-mA/30-min montage 與 single-center 限制。 |
| C10 | PASS | [Lefaucheur et al., 2017, PMID 27866120](https://pubmed.ncbi.nlm.nih.gov/27866120/) | Evidence through Sep 2016；沒有 indication 達 Level A。Level B 包含特定 left-DLPFC depression montage、right-DLPFC addiction/craving montage，另有 fibromyalgia。 | 最好明示「特定 montage」且補上 drug-resistant depression 的 Level B probable inefficacy tension。 |
| C11 | PASS | [García-Fernández et al., 2025, PMID 39647260](https://pubmed.ncbi.nlm.nih.gov/39647260/) | Double-blind randomized sham-controlled trial，n=173、bifrontal F3/F4、2 mA × 20 min × 10 sessions；working-memory EMM difference 2.716 (p<0.001)，neurocognition 1.289 (p=0.007)。 | 保留「單一 RCT signal」；不可把 MCCB change 寫成 psychosocial/function recovery 或 guideline-level efficacy。 |
| C12 | PASS | [Huang et al., eLife 2017](https://doi.org/10.7554/eLife.18834)；[Jacobson et al., PMID 21989847](https://pubmed.ncbi.nlm.nih.gov/21989847/) | Intracranial recordings 證實 conventional scalp tES 可產生可測 brain electric fields，且 individualized anatomy 預測與 cortical/depth recordings 高相關；polarity meta-review 顯示 non-motor cognition 尤其 cathodal inhibition 不符合簡單 AeCi rule。 | S26 單獨不能支持全部 polarity/state-dependent claim；應把 polarity meta-review 或等級相當的 mechanism review登錄為直接來源。 |
| C13 | PASS | [Helfrich et al., 2014, PMID 24461998](https://pubmed.ncbi.nlm.nih.gov/24461998/)；[Witkowski et al., PMID 26481671](https://pubmed.ncbi.nlm.nih.gov/26481671/)；[Noury et al., DOI](https://doi.org/10.1016/j.neuroimage.2016.03.065)；[Schutter, DOI](https://doi.org/10.1016/j.neuroimage.2015.09.067) | Helfrich reported 10-Hz tACS-related alpha increase、frequency matching 與 phase-dependent behavior；Witkowski 明示 electromagnetic artifacts impede mechanism testing；Noury showed physiological processes can generate nonlinear recording artifacts；Schutter reviewed retinal/cutaneous mediation。 | 現有「modulation」優於「direct entrainment」的分界正確；避免把 artifact-cleaned single study 當成 confound 已普遍排除。 |
| C14 | PASS | [Vossen et al., 2015, PMID 25648377](https://pubmed.ncbi.nlm.nih.gov/25648377/) | n=12；alpha aftereffects 不依賴 phase continuity，且沒有 prolonged phase alignment 或 exact-frequency synchronization；作者結論是 plasticity sufficient to explain aftereffects。 | 應寫「該實驗支持 plasticity explanation」，不要泛化為所有 offline tACS aftereffects 的唯一機制。 |
| C15 | PASS | [Lee et al., 2023, DOI](https://doi.org/10.1038/s41539-022-00152-9)；[Lee et al., 2022, PMID 36479141](https://pubmed.ncbi.nlm.nih.gov/36479141/) | Healthy-young-adult meta-analysis：performance 為 small positive effects；reaction time pooled SMD 0.062 (95% CI −0.055 to 0.180)，p=0.229，I²=53.2%。Psychiatric/cognition review 只有 12 RCTs，明示 sample-size limitation。 | S25 registry year 應改 2022，補 DOI `10.1177/20406223221140390`；academic/blog references 應納入這兩篇。 |
| C16 | PASS | [Xu et al., HF-rTMS meta-analysis, PMID 36857011](https://pubmed.ncbi.nlm.nih.gov/36857011/)；[Pabst et al., PMID 35202646](https://pubmed.ncbi.nlm.nih.gov/35202646/)；[Mancuso et al., PMID 27054400](https://pubmed.ncbi.nlm.nih.gov/27054400/)；[Lee et al., tACS](https://doi.org/10.1038/s41539-022-00152-9) | Healthy HF-rTMS accuracy g=0.12、RT g=−0.13；iTBS enhancement 對 outliers/target/navigation 敏感且 heterogeneity significant；tDCS working-memory effects small/mixed and publication-bias sensitive；tACS performance small、RT null。 | Academic paper line 77 的「Webb et al., 2023」應改為 **Xu et al.**；避免把「四種技術 generally small」誤讀成每個 protocol 都是 null。 |
| C17 | PASS | [Parkin et al., 2015, DOI](https://doi.org/10.1016/j.neuron.2015.07.032)；[Bergmann & Hartwigsen, 2021, full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC7873895/) | Intervention-based TMS 可支持 target/time/network 對 behavior 的 causal relevance；但刺激鄰近區與 transsynaptic remote network effects、state dependence 均限制單一區域定位推論。 | 現有「causal but not localist」措辭正確；若正式投稿，建議把後一篇 causal-inference review 加入 registry/references。 |
| C18 | **FAIL** | [Antal et al., 2026, PMID 41622107](https://pubmed.ncbi.nlm.nih.gov/41622107/)；[full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC7618810/) | Guideline 的精確結論是：over 300,000 sessions 中 **no tES-related serious AEs were reported**；mild AEs common，包括 localized tingling/burning、headache、fatigue，且 sham 也可出現。Safety established 的核心範圍為 ≤4 mA、≤60 min/day；更高 dose 資料少。 | 所有 artifacts 統一改為「未報告 tES-related serious AEs」，不要改寫為「serious AEs 罕見／極少」；把 AE（時間相關）與 side effect（因果較強）分開，並列 ≤4 mA/≤60 min 與 under-reporting/監測限制。 |
| C19 | PASS | [Rossi et al., 2021, PMID 33243615](https://pubmed.ncbi.nlm.nih.gov/33243615/)；[full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC9094636/) | Guideline/full text：seizure 是 TMS 最嚴重 acute AE，但在傳統參數與 focal coils 的大型資料中 risk very low；drug、metabolic、sleep/individual risk 與 implants 需 protocol-specific screening。 | 保留「無 universal seizure rate」；implant 應區分 head/coil-near ferromagnetic/electronic device 與遠端一般金屬。 |
| C20 | PASS | Multiple guidelines/trials above；maker 明確標為 author synthesis | 六維模型與跨研究證據一致，且 artifacts 已明示「作者整合、非已驗證 clinical/prognostic score」。 | 保留 conceptual label；不可讓 blog 0–100 plot 暗示六維模型已有量化驗證。 |

# 特別稽核結論

## THREE-D

PASS。Noninferiority comparator、n=414 與約 3/37.5 分鐘均正確；文稿有明確阻止「對 sham superiority」的誤讀。

## SNT

PASS。文稿正確把約 90% remission 放在 open-label history，而非 2022 sham RCT。建議補上 RCT 實際 n=29 與 4-week MADRS effect，避免只寫 rapid-response signal。

## FDA OCD

PASS。BrainsWay system、100-person multicenter study、38% vs 11% 及 device/protocol-specific boundary 均正確；使用「permitted marketing／authorization」優於籠統的 class approval。

## Zangen smoking RCT

PASS。需保持 cue-provocation、lateral prefrontal/insular target、tobacco-use-disorder 與 Week-18 continuous quit rate 的限定。

## Koch AD

PASS。n=50、24-week、phase 2、CDR-SB primary endpoint 與 secondary cognitive/functional/TMS-EEG signals 都有 primary trial 支持；文稿也保留 single-center/replication/routine-care boundary。

## ELECT-TDCS

PASS。未達 escitalopram noninferiority、但兩 active treatments 可優於 placebo的 tension 被正確保留。

## 2026 tES 300,000 sessions 與安全用語

數值 PASS、用語 FAIL。應精確寫「300,000+ sessions 中未報告 tES-related serious AEs」，而非由此估計「罕見」。對 mild AEs 亦應避免把 temporally associated AE 全部寫成 confirmed causal side effect。

## tACS entrainment / modulation / confounds

PASS。文稿有清楚區分 online phase/frequency-sensitive modulation、offline plasticity aftereffect、retinal/cutaneous mediation 與 concurrent-recording artifact；Vossen 結果亦未被錯寫成持續 entrainment。

## Healthy cognition

PASS。small/mixed/task-specific、reaction-time nulls、publication-bias sensitivity 與 heterogeneity都有 meta-analysis 支持；但 academic citation 的 first author 錯誤必須修正。

# Rubric

| rubric | PASS/FAIL | 判定依據 |
|---|---|---|
| R-accuracy | **FAIL** | 核心臨床數值大致正確，但 C18 safety frequency wording 不精確；academic paper 把 Xu et al. 誤引為 Webb et al.；S25 year/DOI 不完整；blog 的 0–100 numbers 無方法定義。 |
| R-causal | PASS | 明確區分 intervention-based causality、localist inference、network propagation、sensory/expectation confounds 與 biomarker mediation。 |
| R-periodic | PASS | tACS 的 periodic phase/frequency modulation、online entrainment evidence 與 offline plasticity aftereffect 有分開，未把刺激後 alpha power 當持續 entrainment。 |
| R-nulls | PASS | 保留 tACS reaction-time null、tDCS evidential-value criticism、ELECT-TDCS noninferiority failure、frequency-unspecific tACS 與 clinical uncertainty。 |
| R-paths | PASS | 五份指定 artifacts 均存在可讀；registry 的 DOI/FDA/PubMed URLs 可解析。需補 modern PTSD source 與缺漏的 meta-analysis references，但不是 filesystem path failure。 |
| R-source-quality | PASS | 高風險 clinical claims 主要依 IFCN guideline、FDA、primary RCT、PubMed/PMC full text；NotebookLM 未被當作 final authority。 |
| R-no-double-count | PASS | Registry 無重複 DOI/title；SNT open-label 與 sham RCT 有清楚分開，沒有把同 cohort 當兩份獨立 evidence。 |
| R-quotes | PASS | 未發現偽造或過長 verbatim quotation；引號主要用於術語／被否定的過度主張。 |
| R-no-overclaim | **FAIL** | 主文 overclaim 控制良好，但 blog 以無 scoring rule 的 0–100 axes 與 bubble sizes呈現「causal interpretability／clinical maturity／evidence volume」，即使稱教學圖仍造成 pseudo-quantitative precision。另作者姓名／專業署名需由本人明確確認。 |
| R-tension | PASS | positive signals 與 noninferiority failure、nulls、heterogeneity、confounds、durability/replication limits 同時保留。 |

# 按優先序修正清單

1. **P0 — 移除或重做 blog pseudo-quantitative evidence map。** 刪除未經定義的 0–100 座標與 bubble-size numbers；改為有明確 rubric 的 ordinal categories（例如 guideline/RCT/meta-analysis/early signal），或公開 scoring formula、來源與 uncertainty。未完成前不要把該圖當 evidence map 發布。
2. **P0 — 統一 C18 安全性語言。** 全部 artifacts 使用「across >300,000 sessions, no tES-related serious AEs were reported」；同時列出 guideline 核心範圍 ≤4 mA、≤60 min/day，並區分 AE、side effect、causal attribution 與 monitoring/under-reporting。
3. **P1 — 修正 HF-rTMS meta-analysis citation。** Academic line 77 的 `Webb et al., 2023` 改為 `Xu et al., 2023`（issue 2024；PMID 36857011），並確保 reference entry一致。
4. **P1 — 補齊 tACS cognition references。** Academic/blog 新增 Lee et al. healthy-young-adult meta-analysis（DOI 10.1038/s41539-022-00152-9）與 Lee et al. psychiatric/cognition meta-analysis（DOI 10.1177/20406223221140390）；source registry 的 S25 year 改為 2022。
5. **P1 — 修復 C05 provenance。** S09 是 2004 RCT，不能支持「較新試驗仍異質」；增列 2024 Cochrane review（PMID 39092744）或逐篇較新 RCT，並把 guideline Level B 與 contemporary pooled evidence 分欄。
6. **P1 — 確認作者署名。** Academic 已寫「待作者確認」，但 blog 已直接標示姓名與臨床／博士身份；發布前需由本人明確確認，否則改成待確認或移除。
7. **P2 — 補直接 mechanism sources。** C12 加 polarity meta-review；C17 加 causal-inference/network-effects review，使 claim-ledger 不只靠 broad primer/field-measurement paper。
8. **P2 — 強化精確數值但不增添過度主張。** C03 補 RCT n=29 與 4-week MADRS；C06 補 ITT n=234、19.4% vs 8.7%；C08 補 27 RCTs/n=1070 與 modality/population estimates；Koch AD 維持「signal/may slow」。

# 最終判定

**ACCEPT-WITH-FIXES**

核心 evidence direction 與多數 high-risk clinical boundaries 可接受；以上 P0/P1 修正完成前，不建議把 blog 的量化 evidence map 或未確認署名視為可發布定稿。
