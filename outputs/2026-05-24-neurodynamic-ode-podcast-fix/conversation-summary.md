# 2026-05-24 Neurodynamic ODE Podcast 與 Chaos 修復紀錄：對話摘要

## 使用者回報

1. 原始 AI 產生的網頁無法正常開啟，需要修復成可以實際執行的網頁。
2. 後續提供 `ode.tsx` 與 `Antigravity_implementation_plan_r1.md`，要求套用第二次性能提升。
3. 本機瀏覽器看到的仍是舊版，需要確認建置與 standalone 輸出是否真的更新。
4. Podcast 面板合成後沒有聲音。
5. Slide Deck 中「吸引子計算幾何解析」的 Chaos 項目點入後空白，甚至當掉。
6. 最終要求：修復 Podcast、推到可觀看網頁，並把對話與踩坑打包到 `2026Cordex` 與 Obsidian 第二大腦。

## 關鍵判斷

- Podcast 無聲不是 NotebookLM MCP 的資料問題，而是前端播放時機問題；目前頁面使用的是瀏覽器 Web Speech API。
- 合成完成後自動播放不可靠，因為瀏覽器常要求語音或音訊播放必須發生在使用者 click gesture 內。
- Chaos crash 是 component scope bug：Chaos branch 使用了 `SimulatorTab` 才有的 `runTime`。
- 舊版反覆出現的原因之一，是 standalone build 沒有正確 mount `App`，導致 bundle 很小但頁面不是最新可執行版本。

## 最後處理方式

- 生成 Podcast 後不再自動播放，改成顯示 ready 狀態；按下 Play 時立即觸發 `speechSynthesis.speak()`。
- Play/Pause 改為 deterministic：pause 會 cancel speech queue，避免殘留語音。
- Chaos 動畫改用 local `angle` 計算 pulse index。
- 補上 `standalone-entry.tsx`，確保 Vite build 會 render `<App />`。
- 發佈到 GitHub Pages 的 `2026Cordex` 路徑，並將同份紀錄備份到 Obsidian。

## 接手注意

- 如果使用者說仍無聲，先檢查瀏覽器 site audio permission、Windows 音量、是否安裝中文 voice。
- Headless Playwright 無法保證真的聽得到聲音，只能驗證播放流程沒有 JS error。
- 若未來要做真正的 NotebookLM audio 檔產出，需要把 NotebookLM MCP 當成後端生成流程，而不是讓靜態 HTML 直接呼叫 MCP。
