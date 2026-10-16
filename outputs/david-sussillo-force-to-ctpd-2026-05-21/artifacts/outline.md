# SOIL 大綱：從 FORCE Algorithm 到 Computation through Population Dynamics

## 六引擎設定

| 引擎 | 內容 |
|---|---|
| ① 概念引擎 (One Big Idea) | **FORCE 不是演算法升級，而是讓 RNN 從「無法馴服的混沌」變成「可解剖的動力系統」——這個本體論翻轉，生出了當代系統神經科學的主流框架 CTPD。** |
| ② 脈絡引擎 (Hook) | 痛點：我們能同時記錄上千個神經元，卻看不懂大腦在「算」什麼；single-neuron tuning curve 已經不夠用。 |
| ③ 架構引擎 | 0 開場 → 1 FORCE 數學 → 2 打開黑盒 → 3 四個轉折 → 4 親手重現 → 5 收斂到 CTPD + 批判 → 結尾 |
| ④ 認知引擎 | 一頁一概念；公式 ≤ 3／頁；列表 ≤ 5；每段結尾 take-home tile |
| ⑤ 風格引擎 | 深色主題、Anthropic 配色（紫=理論／綠=演算法／橘=應用／金=框架）；視覺母題＝state space 軌跡 |
| ⑥ 教學迴路 | 3 個 Check-Point 投票（HTML 版可接 classroom-vote）：標於 S9、S20、S33 |

---

## 逐頁大綱（40 張）

> 格式：**標題** ｜ 核心訊息 ｜ 視覺策略 ｜ 素材來源

### Part 0 — 開場（S1–S4）
1. **封面** ｜ 標題 + 副標 + One Big Idea 一句話 ｜ 全屏深色 + state-space 軌跡背景 ｜ 純 CSS/SVG
2. **Hook：1000 個神經元的沉默** ｜ 記錄變多，理解沒變多；tuning curve 的瓶頸 ｜ 對比圖：單神經元 PSTH vs 群體軌跡 ｜ 純 SVG
3. **本場的 One Big Idea** ｜ 把翻轉講白：工具 → 可解剖的動力系統 → 框架 ｜ 三段式大字 ｜ 純 CSS
4. **路線圖預告** ｜ 今天的五站 + 三個我親手跑的實驗 ｜ 迷你版四轉折時間軸 ｜ pivots_roadmap.svg（縮）

### Part 1 — FORCE 的數學核心（S5–S11）
5. **混沌 RNN 的困境** ｜ 為何混沌網路難訓練：誤差回饋 → reverberating 不穩定 ｜ 混沌軌跡示意 ｜ 純 SVG
6. **前人的迴避：echo-state** ｜ 刻意讓網路靜止才能訓 ｜ 對比示意 ｜ 純 SVG
7. **FORCE 的反直覺：保留混沌** ｜ 混沌從 bug 變 feature ｜ 轉折 1 tile ｜ pivots_roadmap S 區塊
8. **核心設定（式 1-3）** ｜ z=wᵀr；更新前/後誤差 e₋, e₊ ｜ 公式卡 ｜ LaTeX/MathJax
9. **【Check-Point 1】** ｜ 投票：FORCE 與一般 gradient descent 最大差異是？ ｜ 投票頁 ｜ classroom-vote（HTML）
10. **RLS 更新式與 P 矩陣（式 4-6）** ｜ P ≈ 相關矩陣的逆＝二階自適應學習率 ｜ 公式卡 + 直覺註解 ｜ LaTeX
11. **為何誤差從頭就小（式 7-8）** ｜ 第一步就把誤差打到近乎零；rᵀPr: 1→0 ｜ 誤差曲線示意 ｜ 純 SVG + LaTeX

### Part 2 — 本體論翻轉：打開黑盒（S12–S18）
12. **訓練好了，然後呢？** ｜ 黑盒問題：知道「做什麼」不知「怎麼做」 ｜ 黑盒圖示 ｜ 純 SVG
13. **關鍵洞見（轉折 2）★** ｜ 把 RNN 當非線性動力系統 NLDS 來逆向工程 ｜ 轉折 2 tile（核心樞紐）｜ pivots_roadmap
14. **動力系統語言入門** ｜ state space / trajectory / flow field / fixed point ｜ 鐘擺→神經群體類比 ｜ 純 SVG
15. **Fixed points 與 slow points** ｜ 線性化、Jacobian、穩定/不穩定方向 ｜ 相圖 + 特徵值示意 ｜ 純 SVG
16. **逆向工程三例** ｜ 3-bit flip-flop / sine generator / 2-point average ｜ 三欄縮圖 ｜ 純 SVG
17. **這一步為何是樞紐** ｜ 從「會動」到「能讀懂」——後續一切的支點 ｜ take-home tile ｜ 純 CSS
18. **Sussillo & Barak 2013 定位** ｜ 論文背景與貢獻 ｜ 引用卡 ｜ 純 CSS

### Part 3 — 四個轉折路線圖（S19–S24）
19. **完整路線圖** ｜ FORCE→CTPD 四轉折全景 ｜ 全屏 ｜ **pivots_roadmap.svg（主角）**
20. **【Check-Point 2】** ｜ 投票：你認為哪個轉折最關鍵？ ｜ 投票頁 ｜ classroom-vote
21. **轉折 1 回顧：混沌 bug→feature** ｜ ｜ 單卡放大 ｜ pivots_roadmap
22. **轉折 2 回顧：黑盒→動力系統** ｜ ｜ 單卡放大 ｜ pivots_roadmap
23. **轉折 3：分析模型→分析大腦** ｜ 動力系統語言反向套回真實神經群體（Barak/Romo 2013、Sussillo 2014）｜ 單卡放大 ｜ pivots_roadmap
24. **轉折 4：input 成為重構者** ｜ x₀ + u(t) 共同指定運算（Driscoll/Golub/Sussillo 2018）｜ 單卡放大 ｜ pivots_roadmap

### Part 4 — 親手重現（S25–S33）
25. **我為什麼自己跑一遍** ｜ 從讀論文到可執行 demo（numpy/scipy，零捏造）｜ 段落封面 ｜ 純 CSS
26. **實驗一：sinusoid（FORCE-Output）** ｜ 證明 FORCE 學週期 target ｜ 結果圖 ｜ **force_sinusoid_demo.png**
27. **判讀：誤差從第一步就小** ｜ Cycle 1 MSE=1.9×10⁻⁵，呼應式 7-8 ｜ 訓練 log 表 ｜ 純 CSS 表
28. **實驗二：Lorenz（FORCE-Internal v3）** ｜ 混沌 target、phase-split 訓練 ｜ 時序+蝴蝶圖 ｜ **force_internal_v3_demo.png**
29. **判讀：混沌被保留** ｜ |J|_norm 僅變 0.7%，運算靠 W 承載；phase divergence 是本性 ｜ 重點 tile ｜ 純 CSS
30. **實驗三：fixed-point 分析** ｜ 對 trained 網路做 slow point + Jacobian（Sussillo & Barak 2013 風格）｜ 4-panel 圖 ｜ **stage4_fixed_points_demo.png**
31. **判讀：低維 manifold** ｜ top-3 PC≈81%；slow points 聚在 lobe 中心 ｜ 重點 tile ｜ 純 CSS
32. **判讀：unstable saddles 驅動 lobe-switch** ｜ 特徵值跨過 Re=0；沒有真 fixed point 是 feature ｜ 特徵值雲說明 ｜ 純 SVG
33. **【Check-Point 3】** ｜ 投票：RNN 沒有 q<10⁻⁷ 的真不動點，代表什麼？ ｜ 投票頁 ｜ classroom-vote
34. **三實驗閉環** ｜ 轉折 2 的方法作用在 FORCE 網路 → 產出 CTPD 的微縮實證 ｜ 閉環示意 ｜ 純 SVG

### Part 5 — 收斂到 CTPD + 批判（S35–S40）
35. **終點：CTPD 框架** ｜ Vyas et al. 2020；motor/timing/decision/working memory ｜ 框架卡 ｜ 純 CSS
36. **dx/dt = f(x,u)：一條式子貫穿** ｜ 神經群體＝動力系統 ｜ 公式卡 ｜ LaTeX
37. **批判：RNN ≠ 大腦** ｜ 只是「運算可以如何被解」的一個範例，非 ground truth ｜ 警語 tile ｜ 純 CSS
38. **批判：低維投影的陷阱** ｜ 2D/3D 投影可 fit 任何假設，須在高維量化 ｜ 提醒 tile ｜ 純 CSS
39. **哲學底色：Emergence** ｜ Conway's Game of Life → 簡單規則的湧現（Sussillo 2026 自述）｜ 生命遊戲示意 ｜ 純 SVG
40. **Take-home + One Big Idea 回扣** ｜ 三句帶走 + 延伸閱讀清單 ｜ 收尾大字 ｜ 純 CSS

---

## 產物規劃（Step 5）

| 產物 | 工具 | 備註 |
|---|---|---|
| 教學文章 | article-writer | Medium/blog 技術長文，繁中，含數學式、3 張圖、程式碼片段 |
| HTML 互動簡報（主）| soil-html-deck | base64 內嵌圖、3 個 Check-Point 投票、一鍵分享 |
| 可編輯 PPTX（副）| soil-teaching-deck + python-pptx | 給只用 PowerPoint 的人；圖以 PNG 嵌入 |

## 待確認事項
- 40 張對 60min 偏紮實，可接受或要精簡到 ~35？
- Check-Point 投票 3 個位置 OK？（HTML 版才有互動，PPTX 版轉為討論題）
- 文章與簡報同主軸即可，或文章要更偏「我親手重現」的實作敘事？

---

## v2 修訂（使用者確認後）
- 張數精簡為 **35**：合併 echo-state→困境頁、S&B2013定位→樞紐頁、低維投影→批判頁；轉折逐一回顧只留轉折 3/4（1/2 已於 Part1/2 講過）。
- Check-Point 位置：S8 / S17 / S28。
- 文章與簡報同主軸。
- **HTML 互動簡報著重 FORCE Algorithm Demo**：Part 1（數學）與 Part 4（親手重現）加重，用 Chart.js 把「誤差從頭就小」做成互動曲線、模擬圖放大、可互動參數說明。PPTX 維持均衡 35 張。
