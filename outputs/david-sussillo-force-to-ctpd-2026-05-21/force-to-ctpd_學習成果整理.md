# 從 FORCE 到 Computation through Population Dynamics — 學習成果整理

> 日期：2026-05-21 ｜ 主題：David Sussillo 研究主線（FORCE → CTPD）
> 工作流：ai-agent-research-automation → force-rnn-sim → soil-deck-pipeline

## One Big Idea

**FORCE 不是演算法升級，而是讓 RNN 從「無法馴服的混沌」變成「可解剖的動力系統」——這個本體論翻轉，生出了當代系統神經科學的主流框架 CTPD（Computation through Neural Population Dynamics）。**

FORCE 提供「能用的網路」，但真正生出 CTPD 的，是「把訓練好的 RNN 當動力系統來解剖」那一步（2013 Opening the Black Box）。

---

## 一、演化主線與時間軸

| 年 | 論文 | 角色 | 關鍵貢獻 |
|---|---|---|---|
| 2009 | Sussillo & Abbott, *Neuron* | 工具誕生 | FORCE learning：RLS + closed-loop feedback，誤差全程維持極小，壓制混沌 |
| 2013 | Sussillo & Barak, *Neural Computation* | **本體論翻轉（樞紐）** | 把訓練後 RNN 視為 NLDS，用 fixed/slow points + 線性化逆向工程 |
| 2013 | Barak/Sussillo/Romo/Tsodyks/Abbott, *Prog. Neurobiol.* | 接觸真實資料 | 套到 Romo 延遲辨別任務 |
| 2014 | Sussillo, *Curr. Opin. Neurobiol.* | 明確宣言 | RNN 橫跨 NLDS 與 ML，立為系統神經科學 model class |
| 2018 | Driscoll/Golub/Sussillo, *Neuron* | 命名定型 | 「computation through dynamics」；input 重構動力 = 指定運算 |
| 2020 | Vyas/Golub/Sussillo/Shenoy, *Annu. Rev. Neurosci.* | 集大成 | CTPD 框架正典化 |
| 2022 | Driscoll & Sussillo | 框架延伸 | 多任務共用 dynamical motifs |
| 2026 | Sussillo, *Neuron* Q&A | 回溯 | FORCE 緣起；童年 Game of Life → emergence 母題 |

## 二、四個本體論轉折

1. **混沌：bug → feature**（FORCE 2009）：保留混沌、主動壓制（回饋 ≈ f(t) 誘導 chaotic→nonchaotic）。
2. **黑盒工具 → 可逆向工程的動力系統**（Opening the Black Box 2013）★ 核心樞紐。監督式訓練只規定「做什麼」、不規定「怎麼做」→「怎麼做」變成可研究的科學問題。
3. **分析模型 → 分析大腦**（Barak/Romo 2013、Sussillo 2014）：動力系統語言反向套回真實神經群體，顛覆 single-neuron tuning。
4. **input 成為「重構者」**（Driscoll/Golub/Sussillo 2018）：x₀ 與 u(t) 共同指定一個運算。

## 三、FORCE 數學核心：為何「誤差從頭就小」

- 輸出 `z = wᵀr`（式1）；更新前/後誤差 `e₋`, `e₊`（式2,3）。
- RLS 更新 `w(t)=w(t−Δt)−e₋(t)P(t)r(t)`（式4）；P 矩陣更新（式5）；`P(0)=I/α`（式6）。
- **P ≈ firing-rate 相關矩陣的逆（加正則化）**，等於二階（Newton-like）更新，每個突觸有自己的自適應步長（不是純量學習率）。
- 第一次更新誤差 `e₋(Δt) = −αf/(α+rᵀr)`（式7），因 `rᵀr ~ O(N)` 且 `α≪N`，從第一步就 tiny。
- `e₊ = e₋·(1−rᵀPr)`（式8）：初期 `rᵀPr≈1` → `e₊≈0`（幾乎完全抵銷）；後期 → 0（收斂、可關閉）。
- **與傳統訓練本質差異**：gradient descent 是「大誤差慢慢縮小」；FORCE 是「全程維持小誤差，維持所需的修改量遞減」。誤差小 → 回饋擾動小 → 混沌被壓住。

## 四、親手重現（numpy/scipy，零捏造）

| 實驗 | 結果 | 判讀 |
|---|---|---|
| ① sinusoid (FORCE-Output) | Cycle 1 MSE=1.9×10⁻⁵；test MSE=6×10⁻⁶ | 誤差從第一步就小，式7-8 實證 |
| ② Lorenz (FORCE-Internal v3) | `\|J\|_norm` 0.168→0.169（僅 0.7%）；`\|W\|` 0.09→0.54 | 混沌 regime 保留，運算靠 W 承載；後段 phase divergence 是混沌本性 |
| ③ fixed-point 分析 | 123 slow points；top-3 PC≈81%；特徵值跨過 Re=0；無 q<10⁻⁷ 真不動點 | RNN 用連續 slow manifold（非離散吸引子）計算混沌；unstable saddles 驅動 lobe-switch |

**三實驗閉環**：轉折 2 的方法（fixed-point 分析）作用在轉折 1 的網路（FORCE 訓練）上，產出的低維 manifold 正是 CTPD 框架在可控模型上的微縮實證。

## 五、批判（守住界線）

1. **RNN ≠ 大腦**：訓練好的 RNN 只是「運算可以如何被解」的一個範例，非 ground truth；是 hypothesis-generating tool（2018 Preview 自述）。
2. **低維投影陷阱**：2D/3D 投影幾乎可 fit 任何假設 → 必須在高維（10–20 維 denoised）量化（KiNeT 等）。

## 六、哲學底色：Emergence

Conway's Game of Life「簡單規則 → 複雜湧現」是 Sussillo 的終生母題（2026 Q&A）。對應 population dynamics 信念：運算從大量簡單單元的集體動力中湧現，而非定位於單一元件。

## 帶走三句話
1. FORCE 的魔法在用 **P 矩陣**在第一步把誤差打到近乎零 → 保留並馴服混沌。
2. 真正生出 CTPD 的，是把 RNN **當動力系統來解剖**（fixed points）——這是支點。
3. 高維神經運算落在**低維 manifold**，由 fixed/slow points 與 unstable directions 的幾何決定。
