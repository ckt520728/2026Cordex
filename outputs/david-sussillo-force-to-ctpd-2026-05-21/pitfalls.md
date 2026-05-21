# 踩坑筆記 — 環境與建置（2026-05-21）

本次 session 實際踩到並解決的坑，供日後重跑時避免。

## 1. Anaconda base 的 numpy 壞掉（MKL DLL）
- **症狀**：`import numpy` 報 `mkl-service package failed to import` + `DLL load failed while importing _multiarray_umath`。
- **解法**：不硬修 base env，直接 `uv venv --python 3.12 .venv` 起乾淨環境，`uv pip install numpy scipy matplotlib`。實測 OK。
- **對應**：force-rnn-sim 的 PITFALLS 坑 14。

## 2. PDF 檔名含特殊字元無法被 Read 工具開啟
- **症狀**：檔名含 `{ } ' [ ]` 等字元時 `pdftoppm failed: Couldn't open file`。
- **解法**：先用 `cp` 把 PDF 複製成簡單檔名（如 `2009_FORCE.pdf`）再讀。

## 3. bash `/tmp` 與 Read/Write 工具的 Windows 路徑不一致
- **症狀**：在 bash 用 `/tmp/...` 複製檔案後，Read/Write 工具報 `ENOENT \tmp\...`（工具用 Windows 路徑，bash /tmp 是 git-bash mount）。
- **解法**：暫存檔一律放在 Windows 可見路徑（如工作目錄下的子資料夾），不要用 `/tmp`。

## 4. PYTHONIOENCODING（Windows cmd cp950）
- **症狀**：script 內有 `≈ ① ②` 等字元時 `print` 在 cp950 下炸 `UnicodeEncodeError`。
- **解法**：執行前設 `PYTHONIOENCODING=utf-8`，不要在 .py 內 wrap stdout。

## 5. force-rnn-sim 的 fixed-points 依賴 v3 state
- **重點**：`stage4_fixed_points.py` 必須先跑過 `force_internal.py`（產生 `force_internal_v3_state.npz`，~6min）才能跑。
- **長任務**：v3 用 background run，別讓使用者以為當機。

## 6. Claude_Preview 截圖逾時（非 deck bug）
- **症狀**：795KB HTML（base64 圖 + MathJax SVG）`preview_screenshot` 30s 逾時。
- **解法**：改用 `preview_eval` 驗證功能（slide 數、Chart 初始化、圖片 naturalWidth、投票互動），確認 deck 正常。

## 7. python-pptx 無法直接嵌 SVG
- **症狀**：路線圖是 SVG，python-pptx 不吃 SVG。
- **解法**：PPTX 版用原生色塊 + 文字重建四轉折路線圖（順便更易編輯）；HTML 版才 inline SVG。

## 8. 名稱對齊（避免另建重複資料夾）
- GitHub repo 實際名稱 `2026Cordex`（非「2026 Cordex」），output 資料夾是 `outputs/`（複數）。
- Obsidian 既有資料夾 `2026_David Sussillo_compuational neuroscience/`（沿用，不另建）。
