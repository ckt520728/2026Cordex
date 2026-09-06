---
title: HHSA 與 conventional CGM metrics 的 evidence-bound reviewer summary
date: 2026-09-06
tags:
  - CGM
  - HHSA
  - machine-learning
  - peer-review
category: Academic Review
status: public-sanitized
---

# HHSA 與 conventional CGM metrics 的 evidence-bound reviewer summary

## Reviewer judgment

目前證據可支持：physiologically constrained HHSA 提供一種 multiscale、modulation-aware representation，並在作者的 internal cross-validation 中呈現較高的平均分類 performance。

目前證據不能支持：HHSA 已具有 statistical superiority、在 conventional metrics 之外提供 incremental information、改善 clinical decision，或能推廣至 independent cohorts。

一個真實 CGM case audit 顯示，HHSA 可以描述 conventional summaries 未直接呈現的 temporal organization；同時也顯示結果對 decomposition、envelope、band assignment、constraint retention、24 h edge、digitization resolution 與 implementation specification 敏感。此個案因此是 method-stress test，而不是第二組 classification validation。

## 作者需要補充的主要分析

1. 保存兩組 pipelines 在相同 outer folds 的 out-of-fold probabilities，報告 paired performance difference、95% CI 與適當的 paired test。
2. 比較 conventional-only、HHSA-only、conventional + HHSA 三個 models，直接測試 incremental value。
3. 完整定義 conventional metrics 與所有 HHSA candidate features，並報告 nested selection 與 selection stability。
4. 逐受試者報告 layer-2 amplitude retention、carrier／modulation out-of-grid、non-finite 與 residual handling。
5. 對 24 h band edge、supra-24 h modulation、carrier-only constraint 與 modewise／pointwise assignment 做 sensitivity analysis。
6. 公開足以重現的 EEMD／second-layer parameters，並在 synthetic、surrogate 與 independent cohort 上驗證。

## 可接受的較窄結論

> HHSA offers a multiscale, modulation-aware representation that may complement conventional CGM summaries. In the reported internal validation, the HHSA feature set showed a higher mean cross-validated performance than the matched conventional set; formal superiority, incremental value and external generalizability require further testing.

本公開版刻意不呈現未出版 manuscript 的識別資訊、精確 table values、patient-derived spectra 或 confidential source locations。
