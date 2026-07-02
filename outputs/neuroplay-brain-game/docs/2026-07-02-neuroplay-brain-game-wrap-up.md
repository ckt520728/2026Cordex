# NeuroPlay Brain Game Wrap-up

日期: 2026-07-02
工作資料夾: `D:\Brain games and cognitive training`
GitHub 目標: `ckt520728/2026Cordex`

## 結論

已完成一個可執行的 Expo / React Native MVP，目標是高齡者的大腦認知功能訓練與鑑別診斷前的趨勢整理。它不是診斷工具，而是把遊戲化任務轉成可討論的 trial-level / session-level metrics。

## 完成內容

1. 首頁與臨床使用界線
   - 修復原本壞掉的繁中文案與 route 標題。
   - 明確寫入「不提供自動診斷」與建議正式評估的情境。

2. 三個核心 Brain Games
   - `閃現定位`: iconic memory / partial-report，追蹤 location error 與反應時間。
   - `記憶宮殿`: object-location PAL + lure rejection，追蹤 PAL accuracy 與 lure intrusion。
   - `語意流暢`: semantic fluency，追蹤有效詞數、重複與漏答。

3. 本機資料紀錄
   - 每個 session 都保留 `SessionResult`。
   - 每題保留 `TrialResult`，包含 correctness、reaction time、error type、meta。
   - Web 使用 `localStorage`，native 使用 `AsyncStorage`。

4. 訓練紀錄頁
   - 顯示正確率、平均反應時間、誤認誘餌、漏答、有效詞數。
   - 提供保守的非診斷性解讀。

## 驗證

已通過:

```powershell
npm.cmd run typecheck
```

瀏覽器 smoke test 已驗證:

- `http://localhost:8093/` 首頁正常顯示。
- `/games/flash-locate` 正常顯示。
- `/games/palace` 正常顯示。
- `/games/semantic-fluency` 正常顯示並可提交答案。
- 完成語意流暢後，點擊「查看訓練紀錄」可看到:
  - 正確率 `100%`
  - 有效詞數 `8`
  - 趨勢解讀文字

## Encountered Pitfalls

1. 來源檔案有 mojibake / encoding corruption
   - `app/index.tsx`、`app/_layout.tsx`、`src/games/catalog.ts`、`src/content/stimuli.ts` 都有嚴重亂碼。
   - 處理方式: 不嘗試猜回所有原文，依既有英文 paradigm 與資料夾 reference notes 重建保守繁中文案。

2. Route 尚未實作
   - catalog 指向三個 games 與 progress，但 `app/games/*` 和 `app/progress.tsx` 不存在。
   - 處理方式: 補最小可玩的 MVP，不引入複雜狀態管理。

3. PowerShell 執行 npm script 被 execution policy 擋住
   - `npm run typecheck` 會觸發 `npm.ps1` 權限錯誤。
   - 處理方式: 改用 `npm.cmd run typecheck`。

4. Expo web dependency 不完整
   - `expo start --web` 缺 `react-native-web`。
   - 處理方式: 安裝 `react-native-web@^0.21.2` 與 `react-dom@19.2.3`，避免 React peer mismatch。

5. Expo / npm cache 超出沙盒
   - Expo 與 npm 需要寫入 `C:\Users\User` 底下 cache。
   - 處理方式: 對必要啟動與安裝步驟使用授權執行。

6. Web storage 與 native storage 差異
   - `AsyncStorage` 在 web smoke test 中不適合作為唯一存取層。
   - 處理方式: 在 `src/storage/store.ts` 加入 platform-aware adapter；web 使用 `localStorage`，native 使用 `AsyncStorage`。

7. Playwright `open` 會切換 context
   - 直接用 `open /progress` 會看不到剛才遊戲頁寫入的 localStorage。
   - 處理方式: 在遊戲完成頁加入「查看訓練紀錄」按鈕，使用 app navigation 在同一 context 驗證。

## 後續建議

1. 加入正式測驗模式: 固定 60 秒計時、施測者註記、錯誤分類。
2. 加入難度階梯: 3x3 到 4x4、PAL 物品數從 6 增至 8 或 10。
3. 加入趨勢圖: 週平均、rolling baseline、within-person decline flag。
4. 加入照護者匯出: JSON / CSV / PDF，方便門診討論。
5. 若要走臨床研究，需補 IRB、標準化施測流程、normative reference 與效度驗證。
