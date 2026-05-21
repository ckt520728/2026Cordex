# 對話摘要 — David Sussillo FORCE→CTPD（2026-05-21）

本次 session 從「分析資料夾中的 Sussillo 研究」一路做到「產出三件對外成品 + 打包上傳」。流程如下：

## 1. 啟動 ai-agent-research-automation，分析資料夾
- 盤點 `E:\...\David Sussillo_FORCE algorithm`（含 2009 FORCE、2013 Black Box、2014 Curr Opin、2018 Cortical Dynamics、2020 CTPD、2022 motifs、2026 Q&A、Churchland 2012、Yang 2019、Conway Game of Life 文獻等）。
- 讀關鍵論文摘要/導論，依「文獻綜整 → 概念脈絡 → 批判/novelty → 可證偽命題」框架，產出 FORCE→CTPD 演化分析，提出四個本體論轉折，並指出核心樞紐＝2013 Opening the Black Box。

## 2. 依序執行使用者指定的三步驟
- **Step 2 數學**：細讀 2009 FORCE 全文數學（式 1–8），講透「為何誤差從頭就小」（P 矩陣＝相關矩陣的逆＝二階更新；第一步即把誤差打到近乎零）。
- **Step 3 路線圖**：沿用使用者既有 SVG 風格，產出 `FORCE_to_CTPD_conceptual_pivots_roadmap.svg`（四轉折縱向時間軸、可點擊 sendPrompt）。
- **Step 4 模擬**：跑 force-rnn-sim skill —
  - sinusoid（~30s）：Cycle 1 MSE=1.9×10⁻⁵，驗證 FORCE。
  - lorenz-internal v3（~6min）：`|J|_norm` 僅變 0.7%，重建 Lorenz 蝴蝶。
  - fixed-points（~45s）：123 slow points，top-3 PC≈81%，unstable saddles 跨 Re=0。

## 3. soil-deck-pipeline：產出三件對外成品
- 釐清範圍（研究生 60min / 沿用既有資產 + CSS/SVG / Medium 長文）。
- 產 SOIL 六引擎大綱 → 使用者確認（精簡 35 張、HTML 著重 FORCE Demo）。
- 產出：
  - `article.md`（Medium 技術長文）
  - `deck.html`（35 張互動簡報，Chart.js 互動誤差曲線 + 3 Check-Point，base64 內嵌）
  - `deck.pptx`（35 張可編輯，python-pptx，3 圖嵌入）
- 以 preview 驗證 HTML（35 張載入、Chart/MathJax/圖片/投票皆正常）。

## 4. 打包上傳（本文件所屬）
- GitHub `ckt520728/2026Cordex` 的 `outputs/` 資料夾。
- Obsidian vault `2026_David Sussillo_compuational neuroscience/` 資料夾。

## 使用到的 skill / 工具
ai-agent-research-automation · force-rnn-sim · soil-deck-pipeline · mcp-obsidian · Claude_Preview · gh CLI · uv venv · python-pptx
