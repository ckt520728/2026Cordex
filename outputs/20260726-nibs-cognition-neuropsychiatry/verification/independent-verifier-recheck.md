---
title: "NIBS cognition/neuropsychiatry independent verifier recheck"
date: 2026-07-26
run_id: 20260726-nibs-cognition-neuropsychiatry
verifier: fresh-independent-checker
status: ACCEPT-WITH-ONE-TRACEABILITY-FIX
---

# 結論

**複核 verdict：ACCEPT-WITH-ONE-TRACEABILITY-FIX**

原報告的 P0 安全性與視覺化問題已閉環；P1 的 Xu citation、S24/S25 metadata 與 references、PTSD contemporary evidence，以及 P2 的 mechanism sources 與精確臨床數值也已實質修正。  

目前只剩一個 evidence traceability 缺口：`claim-ledger.csv` 的 C16 明確涵蓋 tACS，但 `source_ids` 尚未列入直接支持 tACS cognition synthesis 的 S24、S25。將 C16 的來源改為 `S24|S25|S27|S29|S30|S31|S32` 後，可判定 **FINAL ACCEPT**。

Blog 的作者姓名與專業身分尚未由本人明確確認；依本次指示，這是發布前的 **human gate**，不是 evidence failure。

# 複核範圍

重新讀取並交叉核對：

1. `evidence/source-registry.csv`
2. `evidence/claim-ledger.csv`
3. `l2/synthesis/evidence-synthesis.md`
4. `l3/academic-paper/nibs-narrative-review.md`
5. `l3/blog/non-invasive-brain-stimulation-evidence-map.html`

另以原 `verification/independent-verifier-report.md` 的 P0/P1/P2 清單作 closure criteria。

# P0 閉環

| 原問題 | 複核結果 | 證據 |
|---|---|---|
| Blog 0–100 座標與 bubble size 造成 pseudo-precision | **PASS** | Blog 已明定 M1–M3 mechanistic category 與 C1–C3 clinical category；明示非 validated score、meta-analysis 或醫療工具。各技術圓點固定 `r=12`，小幅 offset 僅避免重疊，未再用圓圈大小表示文獻量。 |
| C18 把「未報告」改寫成頻率推估，且缺安全範圍／因果邊界 | **PASS** | Claim ledger、synthesis、academic paper 與 blog 均使用「逾 300,000 sessions 中未報告 tES-related serious adverse events」，並列 ≤4 mA、≤60 min/day、AE 不等同 confirmed causal side effect，以及 higher dose、monitoring、under-reporting 限制。 |

# P1 閉環

| 原問題 | 複核結果 | 證據／仍需修正 |
|---|---|---|
| HF-rTMS meta-analysis 誤引為 Webb | **PASS** | Academic paper 已改為 Xu et al. (2024)，reference entry 為 *Neuropsychology Review, 34*(1), 250–276，DOI `10.1007/s11065-023-09580-9`；registry S29 與 PMID 36857011 一致。 |
| S24/S25 tACS cognition references 不完整 | **PASS（文件層級）** | Registry 已列 S24：Lee 2023、DOI `10.1038/s41539-022-00152-9`；S25：Lee 2022、DOI `10.1177/20406223221140390`。Academic paper 與 blog 均納入兩篇。 |
| C05 以舊 RCT 支持「較新異質性」 | **PASS** | 新增 S34 Brown et al. 2024 Cochrane review，DOI `10.1002/14651858.CD015040.pub2`；C05、academic paper 與 blog 均並列 2020 IFCN Level B 與 2024 pooled evidence 的 tension。 |
| 作者署名未確認 | **HUMAN GATE** | Academic paper 保留「待作者確認」；blog 仍顯示姓名與專業身分。此項不降低 evidence verdict，但正式發布前須由本人確認，否則移除／改為待確認。 |
| C16 跨技術 cognition synthesis 的直接來源鏈 | **NEEDS FIX** | C16 claim 包含 rTMS/TBS/tDCS/tACS，但目前 `source_ids` 為 `S27|S29|S30|S31|S32`，未列直接支持 tACS 的 S24、S25。應改為 `S24|S25|S27|S29|S30|S31|S32`。 |

# P2 閉環

| 原問題 | 複核結果 | 證據 |
|---|---|---|
| C12 缺直接 polarity source | **PASS** | 新增 S35 Jacobson et al. 2012，DOI `10.1007/s00221-011-2891-9`；C12 已連結 `S26|S33|S35`，academic paper 明確限制 anodal-excitatory/cathodal-inhibitory heuristic。 |
| C17 缺直接 causal/network source | **PASS** | 新增 S36 Hobot et al. 2021，DOI `10.3389/fnhum.2020.586448`；C17 已連結 `S30|S33|S36`，academic paper 保留 causal-but-not-localist 邊界。 |
| SNT 精確數值不足 | **PASS** | Claim ledger、academic paper 與 blog 均列 sham RCT n=29（active 14、sham 15）、4-week MADRS reduction 52.5% vs 11.1%，並把約 90% remission 限定為先前 open-label work。 |
| 戒菸 RCT 精確數值不足 | **PASS** | Claim ledger、academic paper 與 blog 均列 ITT efficacy set n=234、Week-18 continuous quit rate 19.4% vs 8.7%（p=0.017），並保留 tobacco/device/cue-provocation protocol 邊界。 |
| AD/MCI 精確數值不足 | **PASS** | Claim ledger、academic paper 與 blog 均列 27 double-blind RCTs（n=1070）、HF-rTMS SMD 1.08（95% CI 0.35–1.80）及 anodal tDCS SMD 0.56（0.03–1.09）；另保留 MCI subgroup、tACS 排除與非 disease-modification 邊界。Koch trial 仍以 n=50、24-week phase-2 signal 表述。 |

# 機械式一致性檢查

- Source registry：36 筆，S01–S36 無重複 source ID。
- Claim ledger：20 筆，C01–C20 無重複 claim ID。
- Claim ledger 無不存在於 registry 的 dangling source ID。
- 五份 artifacts 均可用 UTF-8 讀取。
- 未發現殘留的 `Webb et al.`、`Xu et al., 2023`、未定義的 0–100 score 或依 evidence volume 改變的 bubble radius。

# 最終處置

1. **Evidence 修正（尚需完成）：** C16 `source_ids` 加入 `S24|S25`。
2. **發布 human gate：** 本人確認 blog 的姓名與專業署名；未確認前不得把它視為可發布定稿。

除上述 C16 traceability 一行修正外，原報告的 P0/P1/P2 evidence-content issues 均已閉環。

# 最終閉環複核

**FINAL ACCEPT**

C16 `source_ids` 已確認為 `S24|S25|S27|S29|S30|S31|S32`；其中各 source ID 均存在於 source registry，原唯一 evidence traceability 缺口已閉環。

最新 `claim-ledger.csv` SHA-256：`C837B53EFFC6BA005AB72E7FCE6B23E13C05A594D8A2FF3B89FA0330334DC054`

作者姓名與專業身分確認仍屬發布前 human gate，不影響本次 evidence verdict。
