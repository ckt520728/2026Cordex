---
title: "從 FORCE 到 Population Dynamics：一個演算法如何翻轉我們理解大腦的方式"
subtitle: "重讀 David Sussillo 的研究主線，並親手把它跑一遍"
tags: [computational-neuroscience, RNN, dynamical-systems, FORCE, neuroscience]
lang: zh-Hant
---

# 從 FORCE 到 Population Dynamics：一個演算法如何翻轉我們理解大腦的方式

> **一句話**：FORCE 不是一次演算法升級，而是讓 RNN 從「無法馴服的混沌」變成「可解剖的動力系統」——這個本體論翻轉，生出了當代系統神經科學的主流框架：**Computation through Neural Population Dynamics (CTPD)**。

我們現在能同時記錄上千個神經元。但弔詭的是：記錄變多了，理解卻沒有等比例變多。把每個神經元的 tuning curve 一條條畫出來，面對前額葉那種「看起來毫無道理」的高維時間動態，傳統的單神經元視角徹底卡住。

David Sussillo 這條從 2009 到 2020 的研究主線，正是回答這個困境的關鍵。本文做兩件事：**(1) 把這條演化線的四個關鍵轉折講清楚；(2) 親手用 numpy 把 FORCE 與後續的 fixed-point 分析跑一遍**，讓概念落地成可驗證的圖。

---

## 一、起點：FORCE 是什麼，以及它為什麼反直覺

2009 年，Sussillo 與 L.F. Abbott 在 *Neuron* 發表 FORCE learning。它要解決的問題是：**怎麼訓練一個本質混沌的 recurrent network，讓它自主產生你要的輸出？**

混沌網路難訓練的原因很實際：你把輸出誤差回饋進網路去修正，但這個回饋會在遞迴結構裡反覆放大（reverberating），讓訓練發散。前人（Jaeger & Haas 的 echo-state network）的解法是**迴避**——刻意把網路設計成無輸入時靜止，犧牲了混沌帶來的豐富動態。

FORCE 反其道而行：**保留混沌，並在訓練中主動壓制它**。這是第一個轉折——混沌從 bug 變成 feature。

### 數學核心：為什麼「誤差從頭就小」

網路輸出是 firing rate 的線性讀出：

$$z(t) = \mathbf{w}^T \mathbf{r}(t) \tag{1}$$

更新前後的誤差：

$$e_-(t) = \mathbf{w}^T(t-\Delta t)\,\mathbf{r}(t) - f(t) \tag{2}$$
$$e_+(t) = \mathbf{w}^T(t)\,\mathbf{r}(t) - f(t) \tag{3}$$

核心是用 **RLS（遞迴最小平方）** 更新權重，其中 P 是一個 N×N 矩陣：

$$\mathbf{w}(t) = \mathbf{w}(t-\Delta t) - e_-(t)\,\mathbf{P}(t)\,\mathbf{r}(t) \tag{4}$$

$$\mathbf{P}(t) = \mathbf{P}(t-\Delta t) - \frac{\mathbf{P}(t-\Delta t)\mathbf{r}\,\mathbf{r}^T\mathbf{P}(t-\Delta t)}{1 + \mathbf{r}^T\mathbf{P}(t-\Delta t)\mathbf{r}} \tag{5}$$

P 的身分是關鍵：它是 firing-rate 相關矩陣的逆（加正則化）的線上估計，初始化為 $\mathbf{P}(0)=\mathbf{I}/\alpha$。相較一般 delta rule 用**純量**學習率，FORCE 用整個矩陣 P，等於一個**二階（Newton-like）更新**——每個突觸都有自己、隨資料調整的有效步長。

這就是「誤差從頭就小」的物理原因。看第一次更新的誤差：

$$e_-(\Delta t) = -\frac{\alpha f(\Delta t)}{\alpha + \mathbf{r}^T\mathbf{r}} \tag{7}$$

因為 $\mathbf{r}^T\mathbf{r}\sim O(N)$，只要 $\alpha \ll N$，誤差 $\approx -\alpha f/N$——**從第一步就 tiny**。再看更新前後的關係：

$$e_+(t) = e_-(t)\big(1 - \mathbf{r}^T\mathbf{P}\,\mathbf{r}\big) \tag{8}$$

其中 $\mathbf{r}^T\mathbf{P}\mathbf{r}$ 在訓練初期 ≈ 1（所以 $e_+\approx 0$，每步幾乎完全抵銷誤差），後期 → 0（權重停止改變，學習收斂、可關閉）。

**和傳統訓練的本質差異**：gradient descent 是「大誤差慢慢縮小」；FORCE 是「全程維持小誤差，只是維持所需的修改量遞減」。誤差全程小 → 回饋擾動全程小 → 不會激發 reverberating 不穩定 → 混沌被壓住。

### 親手驗證一：sinusoid

我用 numpy 寫了最小可運行版本（N=1000, g=1.5, α=1.0），訓練網路產生四正弦混合的週期 target：

![FORCE-Output 學會週期 target](../images/force_sinusoid_demo.png)

結果完美：紅線（RNN output）整段覆蓋灰線（target），test error 在 ±0.008 內。最關鍵的數字是訓練 log：

| Cycle | Train MSE | \|W\| |
|---|---|---|
| 1 | **0.000019** | 0.093 |
| 5 | 0.000048 | 0.196 |
| 15 | 0.000005 | 0.251 |
| 16 (test) | 0.000006 | 0.251 |

**Cycle 1 的 MSE 就是 1.9×10⁻⁵**——這正是式 (7)(8) 的實證：誤差從第一步就小，之後只是維持。

---

## 二、樞紐轉折：把訓練好的 RNN 當「動力系統」來解剖

這是整條演化線的核心。2013 年 Sussillo 與 Omri Barak 在 *Neural Computation* 發表〈Opening the Black Box〉。

關鍵洞見極其優雅：**監督式訓練只規定網路「做什麼」、不規定「怎麼做」，所以「怎麼做」就變成一個可研究的科學問題。** 一個訓練好的 RNN 是一個非線性動力系統 (NLDS)，而動力系統有成熟的分析語言：state space、trajectory、flow field，以及最重要的——**fixed points 與 slow points**。

他們提出一個最佳化技術：在 RNN 的相空間裡尋找「速度近乎為零」的點（fixed/slow points），對這些點做**線性化（Jacobian）**，由特徵值的穩定/不穩定方向反推網路如何運算。他們用 3-bit flip-flop、sine generator、2-point average 三個例子證明：**訓練網路的機制可以從 fixed/slow points 與其周圍的線性化動態被讀出來。**

這一步為什麼是樞紐？因為它把 RNN 從「會動但看不懂的黑盒工具」變成「能被逆向工程的科學對象」。沒有這一步，FORCE 只是工程技巧；有了這一步，RNN 才成為**能生成假設的動力系統模型**。

---

## 三、四個轉折：從工具到框架

把這條線整理成四個本體論轉折：

![FORCE → CTPD 四個概念轉折路線圖](../images/pivots_roadmap.svg)

1. **混沌：bug → feature**（FORCE 2009）：保留混沌、主動壓制。
2. **黑盒工具 → 可逆向工程的動力系統**（Opening the Black Box 2013）★ 核心樞紐。
3. **分析模型 → 分析大腦**（Barak/Romo 2013、Sussillo 2014）：動力系統語言反向套回真實神經群體資料，顛覆 single-neuron tuning 典範。
4. **input 成為動力系統的「重構者」**（Driscoll/Golub/Sussillo 2018）：輸入不只是訊號，initial condition $x_0$ 與 input $u(t)$ 共同**指定**一個運算。

---

## 四、親手重現二：在混沌 target 上訓練，再解剖它

光看論文不夠。我把 FORCE-Internal（v3，phase-split 訓練）跑在 Lorenz 混沌系統上：

![FORCE-Internal v3：Lorenz](../images/force_internal_v3_demo.png)

左圖時序前段貼合、後段出現 phase divergence——這是混沌的**本性**，理論上不可能 point-by-point 重合。右圖的 delay-embedding 重建出清晰的 **Lorenz 雙 lobe 蝴蝶**，拓樸正確。最重要的數字：訓練全程 `|J|_norm` 只從 0.168 變到 0.169（**僅 0.7%**），代表 chaotic regime 被完整保留，運算其實由讀出權重 W（0.09→0.54）承載。

接著對這個訓練好的網路做 fixed-point 分析（Sussillo & Barak 2013 風格）：

![Fixed-point 分析](../images/stage4_fixed_points_demo.png)

判讀：

- **低維 manifold**：top-3 PC 解釋了 ~81% 變異（55.2% + 19.2% + 6.6%），高維 RNN 的運算其實落在低維流形上。slow points（紅點）聚在兩個 lobe 中心，對應 Lorenz 的 C⁺/C⁻。
- **unstable saddles 驅動 lobe-switch**：Jacobian 特徵值雲多數集中在 Re≈−1（因 $F=-x+\dots$ 的 $-x$ 主導），但有可觀部分**跨過虛軸 Re=0** 進入 unstable 區——這些 saddle（最多 26 個 unstable directions, max Re≈0.40）正是驅動蝴蝶在兩翼間切換的機制。
- **沒有真正的 fixed point 是 feature**：多數點收斂到 $q\sim10^{-3}$（slow points），找不到 $q<10^{-7}$ 的真不動點。RNN 是用**連續的 slow manifold**（而非離散吸引子）在「計算」混沌。

**三實驗閉環**：轉折 2 的分析方法（fixed points），作用在用 FORCE（轉折 1）訓練的網路上，產出的低維 manifold 圖像，正是 CTPD 框架在一個可控模型上的微縮實證。

---

## 五、終點：Computation through Population Dynamics

2020 年，Vyas、Golub、Sussillo、Shenoy 在 *Annual Review of Neuroscience* 把這套觀點正典化為 **CTPD 框架**。核心是一條式子：

$$\frac{d\mathbf{x}}{dt} = f(\mathbf{x}(t), \mathbf{u}(t))$$

其中 $\mathbf{x}$ 是 N 維神經群體狀態。神經群體**就是**一個動力系統，運算透過它在 state space 的時間演化來實現。這個框架已在 motor control、timing、decision-making、working memory 上累積大量實證。

### 但要守住兩條界線（批判）

1. **RNN ≠ 大腦**。Sussillo 團隊自己在 2018 的 Preview 裡明說：訓練好的 RNN 只是「運算**可以**如何被解的一個範例」，不證明大腦用同樣方式解。RNN 是 hypothesis-generating tool，不是 ground truth。
2. **低維投影的陷阱**。2D/3D 投影幾乎可以 fit 任何假設，必須在高維（10–20 維 denoised 空間）做統計、用 KiNeT 等工具量化軌跡幾何，否則容易過度詮釋。

### 哲學底色：Emergence

在 2026 年的 *Neuron* Q&A 裡，Sussillo 自述童年被 Conway's Game of Life 震撼——「簡單規則湧現複雜行為」成為他整個生涯的母題。這正是 population dynamics 的信念：**運算從大量簡單單元的集體動力中湧現，而非定位於單一元件。**

---

## 帶走三句話

1. FORCE 的魔法不在「更強的訓練」，而在**用 P 矩陣在第一步就把誤差打到近乎零**，從而能保留並馴服混沌。
2. 真正生出 CTPD 的，是**把訓練好的 RNN 當動力系統來解剖**（fixed points）——這個本體論翻轉是支點。
3. 高維神經群體的運算，往往落在**低維 manifold** 上，由 fixed/slow points 與 unstable directions 的幾何結構決定。

### 延伸閱讀
- Sussillo & Abbott (2009) *Neuron* — FORCE learning
- Sussillo & Barak (2013) *Neural Computation* — Opening the Black Box
- Sussillo (2014) *Curr. Opin. Neurobiol.* — Neural circuits as computational dynamical systems
- Driscoll, Golub & Sussillo (2018) *Neuron* — Computation through Cortical Dynamics
- Vyas, Golub, Sussillo & Shenoy (2020) *Annu. Rev. Neurosci.* — Computation Through Neural Population Dynamics

*（本文的三張圖皆由 numpy/scipy 實際計算產生，程式碼基於 Sussillo & Abbott 2009 的最小重現，無捏造結果。）*
