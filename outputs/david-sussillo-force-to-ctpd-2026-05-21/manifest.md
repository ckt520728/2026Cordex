# Manifest — david-sussillo-force-to-ctpd-2026-05-21

## 文件
- `force-to-ctpd_學習成果整理.md` — 主學習文件（One Big Idea、四轉折、FORCE 數學、模擬判讀、批判）
- `conversation-summary.md` — 本次 session 流程摘要
- `pitfalls.md` — 環境與建置踩坑筆記
- `manifest.md` — 本檔

## artifacts/
- `article.md` — Medium 技術長文（教學文章）
- `deck.html` — 35 張 HTML 互動簡報（Chart.js + MathJax + base64 圖 + 3 Check-Point）
- `deck.pptx` — 35 張可編輯 PowerPoint
- `outline.md` — SOIL 六引擎大綱（含 v2 修訂）
- `build_html.py` / `build_pptx.py` — 簡報產生器（可重跑）
- `pivots_roadmap.svg` — FORCE→CTPD 四轉折路線圖
- `force_sinusoid_demo.png` — 實驗一輸出
- `force_internal_v3_demo.png` — 實驗二輸出（Lorenz 蝴蝶）
- `stage4_fixed_points_demo.png` — 實驗三輸出（4-panel fixed-point 分析）

## skill/
- force-rnn-sim 的腳本與文件（force_sinusoid/lorenz/internal、stage4_fixed_points、SKILL/README/PITFALLS、requirements）

## 重現方式
```cmd
uv venv --python 3.12 .venv
uv pip install --python .venv\Scripts\python.exe numpy scipy matplotlib python-pptx
set PYTHONIOENCODING=utf-8
:: 模擬
.venv\Scripts\python.exe skill\force_sinusoid.py
.venv\Scripts\python.exe skill\force_internal.py
.venv\Scripts\python.exe skill\stage4_fixed_points.py
:: 簡報
.venv\Scripts\python.exe artifacts\build_html.py
.venv\Scripts\python.exe artifacts\build_pptx.py
```
