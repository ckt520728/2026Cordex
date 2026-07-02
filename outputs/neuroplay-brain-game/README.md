# NeuroPlay Brain Game

高齡者用的大腦認知功能訓練與鑑別診斷輔助 Brain Game MVP。

## 目前完成

- `閃現定位`: iconic memory / partial-report，追蹤視覺注意、位置錯誤與反應時間。
- `記憶宮殿`: object-location paired associate learning，追蹤 PAL accuracy 與 lure intrusion。
- `語意流暢`: semantic fluency，追蹤有效詞數、重複與漏答。
- `訓練紀錄`: 本機儲存 session-level 與 trial-level metrics，並提供非診斷性的趨勢解讀。

## 臨床界線

這是認知訓練與趨勢整理工具，不是醫療器材，也不提供自動診斷。若使用者有近期快速退步、生活功能下降、幻覺、明顯步態改變或安全疑慮，應安排正式神經心理評估與臨床診察。

## 開發與驗證

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run web -- --port 8093
```

驗證過的 smoke flow:

1. 首頁能載入三個遊戲入口。
2. 三個遊戲 route 能載入。
3. 語意流暢可提交答案。
4. 完成頁可導向訓練紀錄。
5. 訓練紀錄頁可顯示正確率、有效詞數與趨勢解讀。
