---
title: CGM 與 HHSA 方法學比較審稿 Wrap-up（公開版）
date: 2026-09-06
tags:
  - CGM
  - HHSA
  - peer-review
  - reproducibility
  - evidence-boundary
category: Academic Review
status: completed
visibility: public-sanitized
---

# CGM 與 HHSA 方法學比較審稿 Wrap-up（公開版）

## 結論

一組 HHSA features 在 internal cross-validation 中具有較高平均 performance，並不自動建立「優於 conventional CGM metrics」的主張。要支持 superiority，至少需要 paired out-of-fold comparison 與 uncertainty；要支持 additional information，還需要 conventional-only、HHSA-only、combined 三個 nested models；要支持 clinical usefulness 或 generalizability，則需要 independent cohort 與臨床 outcome。

真實單一 CGM 個案對這個問題的價值，是暴露 representation 的自由度與 failure modes，而不是提供第二次分類驗證。這次 case-method audit 顯示，HHSA 能描述 conventional summary 未直接呈現的 temporal organization，但結果會受 decomposition、envelope、band edge、carrier／modulation constraint、digitization resolution 與 implementation specification 影響。

## 已完成

- 逐頁核對未出版 methods manuscript、reviewer 摘錄與一份真實 CGM case report。
- 重跑 synthetic carrier／modulation recovery、真實個案 HHSA、resolution analysis 與 199 次 AAFT surrogate test。
- 比較 Python 與 Octave 在 matched specification 及不同 method choices 下的結果。
- 建立 evidence-bound reviewer report，區分 manuscript claim、case observation、derived calculation 與 reviewer assessment。
- 建立桌面／手機 responsive 的互動式 artifact，含 tabs、theme、evidence chain 與 reviewer actions。
- 對內部產物做 UTF-8、browser、console、relative-link 與 SHA-256 驗證。

## 遭遇的 pitfalls

### 1. 單一個案不能測試 population classifier superiority

一位受試者只能產生一個 HHSA feature vector 與一個 conventional-metric vector。沒有跨受試者 labels、outcomes 與 out-of-fold predictions，就不能計算 AUC difference、accuracy difference 或 generalization。

### 2. Mean ± SD 不是 paired superiority test

兩組 cross-validation mean 不足以判斷差異是否超出 resampling uncertainty。需要保存相同 folds 的 out-of-fold probabilities，報告 paired difference、confidence interval 與適當的 paired analysis。

### 3. Head-to-head model 不等於 incremental value

HHSA-only 高於 conventional-only，仍不能證明 HHSA 在 conventional information 之外增加訊息。必須比較 combined model 與 conventional-only model，並使用同一組 outer folds。

### 4. 相同 feature count 不代表相同 selection burden

從大量 HHSA candidates 中選少數 features，與直接使用一組規模相近的 conventional metrics，具有不同的 search space 與 overfitting opportunity。比較設計需要 nested feature selection、selection stability 與完整 feature dictionary。

### 5. Physiological constraint 可能捨棄大部分 second-layer amplitude

將 carrier 與 modulation axes 同時限制在預設頻帶，可能在 feature extraction 前排除大量 amplitude。若不逐受試者報告 kept fraction、各 axis out-of-grid 與 non-finite handling，就無法判斷結果代表生理選擇或分析截斷。

### 6. 24 小時恰為 band edge，會產生分類跳變

接近 24 h 的 daily mode 可能因 decomposition 或 numerical precision 落在 band 內外。應移動 band edge、加入 supra-24 h band，或採預先定義的 adaptive rule 做 sensitivity analysis。

### 7. EEMD defaults 不是可重現的方法規格

Library version、ensemble size、noise amplitude、seed、maximum IMFs、stopping criteria、second-layer settings、edge trimming、residual handling 與 normalization 都可能改變結果。只報 seed 與 max IMF 不足以重現。

### 8. Cross-language 一致性取決於 specification 是否真的相同

當 Python 與 Octave 使用 matched EMD、envelope 與 spline choice 時可高度一致；更換 decomposition 或 envelope specification 後，dominant band cell 與完整 spectrum 都可能改變。不能把 matched-implementation success 外推為 method-choice robustness。

### 9. Surrogate significance 需處理多重比較與可解釋性

單一未校正的 small p-value 不能建立 nonlinear coupling 或 causal physiology。應預先定義 features、校正多重比較，並區分 power-spectrum／distribution 可解釋的結構與真正的 cross-scale dependence。

### 10. Digitized AGP 的高頻資訊有限

由 vendor PDF 重建的 signal 受到取樣、像素、數值格點與 interpolation 影響。接近 Nyquist 或資料有效解析度下限的 fast band，不能當作 fast physiology 的驗證。

### 11. Reference GUI 不等於完整原始演算法

只有 GUI 與部分 reference files、缺少被呼叫的 core functions 時，只能稱為 specification-level reimplementation，不能稱為 original implementation 的 byte-level reproduction。

### 12. 私有 artifact 無法直接作為已讀證據

Private web artifact 在未授權環境中無法開啟。可靠做法是以本機一對一鏡像、圖檔、scripts 與重跑 output 為準，並明確標示網頁本身未被直接讀取。

### 13. Office 與 PDF 的可讀性需要分層驗證

Cloud-drive DOCX 曾被 Word 直接開啟時警告可能損壞，但本機副本是有效 OOXML ZIP，能由 Word COM 開啟、轉成 PDF 並逐頁檢視。結構驗證與視覺驗證不可互相取代。

### 14. Scripts 對 working directory 與可選 dependency 有隱性依賴

部分 scripts 只有在特定資料目錄執行才找到相對路徑資料；另一個測試缺少 pandas。這次只在隔離的暫存 target 安裝 dependency，未修改全域 Anaconda，並把正確 cwd 記入驗證紀錄。

### 15. Windows sandbox 會間歇性阻止程序啟動

`SetTokenInformation(TokenDefaultDacl) failed: 1344` 是環境限制，不代表來源檔不存在或分析失敗。應縮小命令、重試唯讀檢查，必要時使用明確授權的 sandbox 外執行，並保留完整錯誤文字。

### 16. 本機 HTML 驗收不能直接使用 file protocol

Playwright 阻擋 `file:` URL，因此使用只綁定 `127.0.0.1`、只暴露 artifact 子目錄的暫時 HTTP server。不要為方便驗證而提供整個研究根目錄。

### 17. Browser QA 需處理 favicon 與 lazy loading

缺少 favicon 會造成唯一的 console 404；lazy-loaded figures 在尚未滾入 viewport 前 `naturalWidth` 為零。修正後應重新載入、滾入圖庫，再逐張驗證尺寸與 console。

### 18. Public GitHub 與 private research archive 必須分流

Public repo 不應包含未出版 manuscript、reviewer materials、患者 signal、原始 AGP、private URL 或可回推本機來源的路徑。本次 GitHub 僅保存公開安全版；完整 case artifact 只進入私人 Second Brain。

## 驗證結果

- Synthetic AM-FM recovery 通過，signal reconstruction error 接近 machine precision。
- 199 次 AAFT surrogate analysis 完成；沒有足以在多重比較後宣稱 nonlinear coupling 的結果。
- Python／Octave matched-specification comparison 完成。
- 互動頁通過 1440 px desktop 與 390 px mobile viewport；沒有 horizontal overflow。
- Tabs、theme、image modal 與 Escape 關閉流程通過。
- 最終內部 artifact console 為 0 errors／0 warnings；六張圖片均以原始尺寸載入。
- GitHub package 不含 confidential source、患者資料或本機絕對路徑。

## 下一步

1. 由作者提供每位受試者的 paired out-of-fold predictions，完成 superiority test 與 confidence interval。
2. 在 nested outer folds 比較 conventional-only、HHSA-only 與 combined model。
3. 報告每位受試者的 constraint retention、band-edge sensitivity 與 feature-selection stability。
4. 在 independent cohort 重現結果，並預先指定 primary metric、decision threshold 與 clinical outcome。

> 此為 AI 對方法學與審稿證據強度的判斷，請 reviewer 依原稿、期刊政策與實際統計輸出自行驗證。
