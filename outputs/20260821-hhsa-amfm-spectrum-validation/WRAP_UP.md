---
title: HHSA 代表性 AM-FM 頻譜驗證 - 專案收尾
date: 2026-08-21
tags:
  - HHSA
  - AM-FM
  - EMD
  - synthetic-validation
  - EEG
category: Research/Projects/EEG Classification
---

# HHSA 代表性 AM-FM 頻譜驗證 - 專案收尾

## 結論

本專案使用 `hhsa-clinical-timeseries` analytical skill，針對 Nguyen et al. (2019) Supplementary Fig. S1 與 Juan et al. (2021) Fig. 4-6 建立可重現的 synthetic AM-FM tests。Skill ground truth 與五組代表性判定全部通過，共 6/6 regression tests 通過。

本成果證明目前 Python implementation 能在已知 synthetic ground truth 下辨識：

- additive 與 carrier frequencies；
- carrier 上的 amplitude-modulation frequency；
- 隨時間增加的 modulation strength；
- 多 carrier / 單一 modulator；
- 單一 carrier / 多 modulator；
- `f_am < f_carrier` admissibility 與 machine-precision reconstruction。

這不是原始 MATLAB pipeline 的 pixel-level reproduction，也不構成 EEG physiology、dementia biomarker 或臨床診斷效度證明。

## 核心結果

| 驗證項目 | 結果 | 判定 |
|---|---:|---|
| Skill 24 h modulation ground truth | 24.903 h，誤差 3.76% | 通過 |
| Nguyen S1 additive component | 2.029 Hz | 通過 |
| Nguyen S1 carrier | HHT 14.050 Hz；HHS 13.650 Hz | 通過 |
| Nguyen S1 AM | peak 2.556 Hz；2-4 Hz dyadic concentration 68.6% | band-level 通過 |
| Juan Fig. 4 fixed coupling strength | target energy `5.90e-9 -> 0.493 -> 2.152` | 單調增加 |
| Juan Fig. 5 time-varying coupling | recovered power 與 `beta^2` 的 `r=0.999999` | 通過 |
| Juan Fig. 6 multiple patterns | 最小 target/control ratio 133.9 | 通過 |
| 全案例最大 reconstruction error | `8.88e-16` | 通過 |
| 最大 inadmissible-energy rejection | 0.2648% | 已回報 |

## 遇到的 pitfalls 與處理方式

### 1. 預設 Python scientific stack ABI 不相容

系統預設 Python 3.9 同時載入舊 SciPy 與 NumPy 2.0.2，導致：

```text
ValueError: numpy.dtype size changed, may indicate binary incompatibility
```

處理方式：不修改全域 Anaconda，建立獨立 Python 3.11.15 environment，固定 `numpy==2.3.2`、`scipy==1.16.1`、`matplotlib==3.10.5`。這避免修復一個專案時破壞其他研究環境。

### 2. 論文方法與指定 skill 的 decomposition 規則不同

原論文使用 masking EMD，Supplementary methods 描述 natural spline；指定 skill 則要求：

- layer 1 與 layer 2 主分析皆用 plain EMD；
- amplitude normalization 使用 PCHIP；
- 每個 time point 執行 `f_am < f_carrier`；
- 計算維持 linear power，只在顯示時轉 dB。

因此本專案的 claim 被限定為「用指定 skill 檢驗代表性 spectral claims」，不能宣稱完全重現原作者 MATLAB 數值。

### 3. Juan Eq. 3 的 PDF text layer 遺漏正 envelope baseline

可抽取文字呈現 `A_fA(t)=K beta sin(...)`。若直接使用，`beta=0` 時 32 Hz carrier 會完全消失，與「zero modulation depth」不一致。

本分析採標準正值 envelope：

```text
A_fA(t) = K [1 + beta cos(2 pi f_AM t)]
```

此為明示的 modeling assumption。**此為 AI 判斷，請自行以原始 MATLAB code 或作者說明驗證。**

### 4. Nguyen 3 Hz modulation 不能只看單一細網格 peak

Nguyen S1 由 `1.5 Hz x 14 Hz` 乘積形成，絕對 envelope 為 3 Hz。Fine-grid HHS peak 為 2.556 Hz，低估 14.8%；若只報 peak，容易把結果誤判為精確重現。

原文以 dyadic frequency axis 呈現；本結果有 68.6% 的相關能量集中在 2-4 Hz dyadic band。因此採「band-level 通過、point estimate 有偏差」的誠實結論。

### 5. `beta=0` 的 machine-floor 使能量比異常巨大

Juan Fig. 4 未調變控制的 target-cell energy 約 `5.90e-9`。以它作分母會得到極大的 ratio。該 ratio 只能解讀為 target/control separation，不能當作 biological effect size。

### 6. 「圖看起來合理」不是驗證

最初的寬鬆條件如 `target_energy > 0` 無法排除 leakage。最終門檻加入：

- 頻率位置 tolerance；
- Nguyen dyadic-band concentration > 60%；
- Juan Fig. 4 相對未調變控制 > 100 倍；
- Juan Fig. 5 與理論 `beta^2` 的 correlation > 0.99；
- Juan Fig. 6 所有 target/control specificity ratios > 10；
- reconstruction error < `1e-10`。

### 7. Windows sandbox 無法穩定讀取外接碟與同步碟

讀取 E: 與 G: 時曾出現：

```text
SetTokenInformation(TokenDefaultDacl) failed: 1344
```

這是 sandbox limitation，不是檔案不存在。處理方式是使用明確、唯讀、單一路徑的命令並逐項驗證；沒有以錯誤訊息推論資料遺失。

### 8. PDF text extraction 會破壞公式排版

`pdftotext -layout` 與 `-raw` 可定位 captions，但上下標、括號和分式可能錯位。公式必須與 figure caption、敘述及物理限制交叉核對，不能只複製文字層。

### 9. Google Drive 分享連結指向專案根目錄，不是 Working folder 本身

分享 URL 的直接 children 另含 `Working`、`Output`、`Analysis` 等目錄。交付後另以 Google Drive API 進入實際 `Working` folder，確認 `AMFM_reproduction_20260821` 及其 11 個 artifacts 已同步可見。

### 10. 發布時必須避免帶入研究來源與暫存資料

公開套件刻意排除：

- 三份來源 PDF；
- PDF rendered pages 與暫存抽取文字；
- `.venv`、`__pycache__`；
- 本機 E:/G: paths；
- 任何病人資料或識別資訊。

Git 僅 stage 本輸出目錄，不使用 `git add .` 或 `git add -A`。

## Generated artifacts

| 路徑 | 用途 |
|---|---|
| `AMFM_HHSA_REPRODUCTION_REPORT.md` | 完整方法、結果、限制與來源邊界 |
| `WRAP_UP.md` | 本收尾文件與 pitfalls |
| `hhsa.py` | 經 synthetic ground truth 驗證的 HHSA core |
| `reproduce_amfm_figures.py` | 產生全部 simulations、metrics 與 figures |
| `test_amfm_reproduction.py` | 6 項 regression tests |
| `requirements-amfm.txt` | 固定 Python dependencies |
| `output/amfm_validation_results.json` | 完整 machine-readable metrics |
| `output/amfm_validation_table.csv` | 精簡驗證摘要 |
| `output/figure_01_nguyen_s1_reproduction.png` | Nguyen S1 waveform、HHT、HHS |
| `output/figure_02_juan_coupling_strength.png` | Juan Fig. 4 fixed coupling strength |
| `output/figure_03_juan_time_varying.png` | Juan Fig. 5 time-varying AM |
| `output/figure_04_juan_multiple_patterns.png` | Juan Fig. 6 multiple AM-FM patterns |
| `manifest.sha256` | 發布檔案 SHA-256 manifest |

## 重現方式

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-amfm.txt
.\.venv\Scripts\python.exe -m unittest -v test_amfm_reproduction.py
.\.venv\Scripts\python.exe reproduce_amfm_figures.py --out output
```

成功標準：6 項測試全部通過，且 `output/amfm_validation_results.json` 的 `all_passed` 為 `true`。

## 下一步建議

若要把此流程延伸到真實 EEG，下一階段應先加入 noise、mode mixing、non-sinusoidal carrier 與 AAFT surrogate validation，再進行 subject-level analysis。任何與 dementia classification 或 prediction 有關的結論，都需要獨立 dataset、cross-validation、multiple-comparison control 與臨床 endpoint 定義；本 synthetic package 不支援該類 claim。
