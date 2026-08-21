---
title: HHSA 代表性 AM-FM 模擬頻譜重現與驗證
date: 2026-08-21
tags:
  - HHSA
  - AM-FM
  - EMD
  - synthetic-validation
  - EEG
category: Research/Projects/EEG Classification
---

# HHSA 代表性 AM-FM 模擬頻譜重現與驗證

## 結論

指定的 HHSA implementation ground truth 與四組論文代表性模擬均通過預先定義的驗證門檻。這表示目前 Python implementation 能在 synthetic ground truth 中辨識 additive frequency、carrier frequency、amplitude-modulation frequency、time-varying modulation strength，以及多重 carrier/modulator patterns。

這不是原作者 MATLAB 圖的 pixel-level reproduction，也不是生理 coupling 或臨床效度證明。Nguyen Supplementary Fig. S1 的 3 Hz AM 在細網格上的最大峰為 2.556 Hz，存在 14.8% 低估；但 68.6% 的 14 Hz carrier AM energy 集中於原文採用的 2–4 Hz dyadic band，因此判定為「band-level reproduction 通過、point estimate 有偏差」。

## 成功標準

1. HHSA skill 內建 3 h carrier / 24 h modulation ground truth 的 modulation period 誤差小於 15%。
2. Nguyen 2019 Supplementary Fig. S1 同時找回 2 Hz additive component、14 Hz carrier 與 2–4 Hz dyadic AM band。
3. Juan 2021 Fig. 4 的 `<4 fam | 32 fc>` energy 隨 `β = 0, 0.4, 1.0` 單調增加，且 `β=0.4` 相對未調變控制大於 100 倍。
4. Juan 2021 Fig. 5 在 0.5、1.5、2.5、3.5 s 的 recovered AM power 單調增加，並與理論 `β²` 高度一致（`r > 0.99`）。
5. Juan 2021 Fig. 6 找回 `<4|32>`、`<4|64>`、`<8|32>` 等指定 cells；所有 target/control specificity ratios 大於 10。
6. 所有 EMD reconstruction error 小於 `1e-10`；layer 2 使用 plain EMD，並逐點執行 `fam < fc` admissibility。

## 證據邊界

- Nguyen et al. (2019), *Unraveling nonlinear electrophysiologic processes in the human visual system with full dimension spectral analysis*, Scientific Reports, DOI `10.1038/s41598-019-53286-z`。
- 同文 Supplementary Information，尤其 Supplementary Fig. S1。
- Juan et al. (2021), *Revealing the Dynamic Nature of Amplitude Modulated Neural Entrainment With Holo-Hilbert Spectral Analysis*, Frontiers in Neuroscience 15:673369，尤其 Fig. 1、4、5、6。
- `hhsa-clinical-timeseries.skill`（GitHub blob SHA `08534e2e00a418f8741f750fd65a93adfe9b5b78`）及 Working folder 既有 `hhsa.py`。

未使用網路搜尋補入新的科學證據；GitHub 僅用於取得使用者指定的 skill 封裝。

## 方法

### HHSA implementation

- Sampling rate：論文模擬採 `1,000 Hz`。
- Layer 1：plain EMD。
- Instantaneous amplitude/frequency：PCHIP-based normalized Hilbert transform。
- Layer 2：對 layer-1 instantaneous amplitude 使用 plain EMD。
- HHS：以 geometric frequency bins 累積 `amplitude² × dt`。
- Admissibility：逐點排除 `fam >= fc`，並回報 rejected energy fraction。
- Edge trim：每端 0.25 s；skill ground truth 沿用原始 200 samples。

此流程依指定 skill 採 plain EMD 與 PCHIP；原論文則使用 masking EMD，Supplementary methods 亦描述 natural spline。因此本結果是「用指定 analytical skill 檢驗論文代表性 spectral claims」，不是宣稱與原始 MATLAB pipeline 完全同一。

### 模擬案例

#### Nguyen 2019 Supplementary Fig. S1

```text
S1 = 0.5 sin(2π·2t)
S2 = sin(2π·1.5t) sin(2π·14t)
S3 = S1 + S2
```

`S2` 的絕對 envelope 為 3 Hz；預期 layer-1 HHT 顯示 2 與 14 Hz，HHS 顯示 `<3 fam | 14 fc>`。

#### Juan 2021 Fig. 4–5

```text
x(t) = sin(2π·4t) + [1 + β(t) cos(2π·4t)] sin(2π·32t)
```

Fig. 4 使用固定 `β = 0, 0.4, 1.0`；Fig. 5 使用四秒內由 0 線性增加到 1 的 `β(t)`。

PDF 的可抽取文字將 Eq. 3 的 amplitude 寫成 `Kβ sin(...)`，但這會使 `β=0` 時 32 Hz carrier 消失，與「zero modulation depth」的定義不一致。本重現加入標準正值 baseline `1 + β cos(...)`。**此為 AI 判斷，請自行驗證原作者公式或原始 MATLAB code。**

#### Juan 2021 Fig. 6

- Case A：4 Hz phase，加上由 4 Hz 調變的 32 與 64 Hz carriers。
- Case B：4 Hz phase，加上同一 32 Hz carrier 同時被 4 與 8 Hz 調變。

## 結果

| 案例 | 預期 | 實測 | 判定 |
|---|---|---|---|
| Skill ground truth | 24 h modulation | 24.903 h；誤差 3.76% | 通過 |
| Nguyen S1 additive | 2 Hz | 2.029 Hz | 通過 |
| Nguyen S1 carrier | 14 Hz | HHT 14.050 Hz；HHS 13.650 Hz | 通過 |
| Nguyen S1 AM | 3 Hz / dyadic 2–4 Hz | peak 2.556 Hz；band concentration 68.6% | band-level 通過 |
| Juan Fig. 4 | AM energy 隨 β 增加 | `5.90e-9 → 0.493 → 2.152` | 通過 |
| Juan Fig. 5 | time-varying strength | `0.0159 → 0.1353 → 0.3741 → 0.7344`；與 `β²` 的 `r=0.999999` | 通過 |
| Juan Fig. 6A | `<4|32>`、`<4|64>` | energy `1.518`、`2.544` | 通過 |
| Juan Fig. 6B | `<4|32>`、`<8|32>` | energy `5.493`、`0.428` | 通過 |

整體最大 reconstruction error 為 `8.88e-16`；最大 inadmissible energy rejected fraction 為 `0.2648%`（Nguyen S1）。Fig. 6 最小 target/control specificity ratio 為 `133.9`。

## 圖檔

- `figure_01_nguyen_s1_reproduction.png`
- `figure_02_juan_coupling_strength.png`
- `figure_03_juan_time_varying.png`
- `figure_04_juan_multiple_patterns.png`

每張圖均由同一正式 run 產生；數值來源為 `amfm_validation_results.json`，摘要表為 `amfm_validation_table.csv`。

## 限制與可解讀邊界

1. 未取得原作者 MATLAB code、mask frequencies、完整 stopping criteria 與 plotting normalization，因此不能主張 exact reproduction。
2. Nguyen S1 的細網格 peak 並非精確 3 Hz；通過依據是原文 dyadic 2–4 Hz band 與預先設定的 15% peak tolerance。
3. `β=0` target energy 接近 machine floor，所以極大的 Fig. 4 ratio 是 negative-control separation，不應解讀為生物 effect size。
4. 本研究使用 deterministic synthetic ground truth 與未注入 target cells 作 negative controls。AAFT 與 cycle-rotation nulls適合臨床/clock-entrainment inference；此處沒有外部 clock anchor，且未做臨床顯著性主張，因此未將 cycle rotation 當作必要判定。
5. 結果不證明 HHSA 對 EEG dementia classification、prediction 或臨床診斷有效。移植到真實 EEG 前，仍需 noise、mode mixing、non-sinusoidal carrier、multiple-comparison 與 subject-level validation。

## 重現指令

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-amfm.txt
.\.venv\Scripts\python.exe -m unittest -v test_amfm_reproduction.py
.\.venv\Scripts\python.exe reproduce_amfm_figures.py --out output
```

Python `3.11.15`；固定套件版本見 `requirements-amfm.txt`。
