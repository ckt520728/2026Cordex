---
title: 2026-05-24 Neurodynamic ODE Podcast 與 Chaos 修復紀錄
date: 2026-05-24
type: implementation-log
project: Neurodynamic ODE Lab
repo: 2026-Antigravity
backup_repo: 2026Cordex
---

# 2026-05-24 Neurodynamic ODE Podcast 與 Chaos 修復紀錄

## 結論

這次修復把 `Neurodynamic ODE Lab` 更新為可單檔執行與可發佈版本，重點是 Podcast 播放與 Slide Deck 的 Chaos 分頁。

- 可觀看頁面檔：`index.html`
- 本機原始檔：`C:\Users\User\2026Antigravity\ode.tsx`
- 本機 standalone：`C:\Users\User\Downloads\neurodynamic-ode-standalone.html`
- 驗證截圖：`current-podcast-chaos.png`

## 本輪修復

1. Podcast 播放問題
   - 根因：Web Speech API 的語音播放被放在 React state effect 或合成完成後的 async callback 中啟動，瀏覽器可能不視為使用者手勢，因此合成完成但沒有聲音。
   - 修復：生成完成後停在 ready 狀態；使用者按下 Play 時，click handler 直接呼叫 `speechSynthesis.speak()`。
   - 補強：新增 `aria-label`，讓 Playwright 與無障礙工具能穩定找到播放鍵。

2. Chaos 分頁空白或當掉
   - 根因：`SlideDeckTabComponent` 的 Chaos 分支使用了不屬於該 component scope 的 `runTime`，只有點入 Chaos 時才觸發 `ReferenceError`。
   - 修復：改用該 component 已存在的 `angle` 推算動畫 pulse index。

3. 第二次性能提升
   - `SimulatorTab` 的 SVG 路徑與投影點改成 `useMemo` / `useCallback`。
   - 3D rotation interval 從 30ms 放寬到 60ms，且速度為 0 時不啟動 interval。
   - 移除 Slide Deck 中重複的 Attractor Dynamic Explanation Cabin。

4. Standalone build 修復
   - 根因：`ode.tsx` 只 `export default App`，直接當 Vite 入口打包會產生偏小 bundle，沒有真正 mount React App。
   - 修復：建立臨時入口 `standalone-entry.tsx`，用 `createRoot(...).render(<App />)` 正確掛載後再 inline 成單一 HTML。

## 驗證

- Vite production build：成功，完整 bundle 約 244 KB。
- Playwright file preview：成功。
- Chaos 分頁：可點入，無 runtime error。
- Podcast panel：可開啟，Play button 可觸發播放流程，無 console/page error。

注意：自動化測試只能驗證播放流程與 Web Speech API 呼叫路徑；實際是否有聲音仍取決於瀏覽器音訊權限、Windows 音量輸出，以及系統是否安裝中文語音 voice。

## 踩坑

- `file://` 頁面若引用外部 Vite bundle，容易因路徑或 CORS 導致空白；最後改成單一 HTML。
- `ode.tsx` 不是完整 entrypoint，只 export App，不能直接當可執行頁面。
- PowerShell 預設編碼會讓中文 selector/status 在腳本中變亂碼；後續狀態字串改用 ASCII，驗證 selector 避免依賴中文。
- Web Speech API 的播放必須盡量發生在使用者手勢內；生成完成後自動播放不可靠。
- Chaos bug 是 lazy branch bug：平常不會爆，只有點到該 tab 才會觸發。
- `2026Cordex` checkout 在 Codex sandbox 下被 Git 判定為 dubious ownership，需要加入 `safe.directory`。

## 主要檔案

- `index.html`：可直接發佈的 standalone 網頁。
- `current-podcast-chaos.png`：本輪驗證截圖。
- `manifest.md`：本紀錄。
