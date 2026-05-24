# 實作計畫 - 整合 FORCE-RNN-Sim 學術場景與 NotebookLM 播客生成面板

本計劃旨在滿足您對 **2026Antigravity 神經動力學學習艙** 的最新修正指示與功能升級：
1. **整合 NotebookLM 製作 Panel**：在 Podcast 面板中間新增一個高質感的 AI 語音製作艙，可以根據 3 大文獻來源或自定義輸入，高擬真模擬播客生成過程（高頻滾動日誌、模糊遮罩、0~100% 進度條），動態更新與朗讀全新播客字稿。
2. **擴充 FORCE 混沌學習面板 (RLS)**：根據 `FORCE-RNN-Sim` Skill 內容，擴充四大模擬情境 (`sinusoid`, `lorenz-output`, `lorenz-internal`, `fixed-points`)。新增 N, g, alpha, Cycles 及自定義目標波形 (`combined`, `single`, `square`, `sawtooth`)、主副頻率 ($f_1$, $f_2$) 的自訂滑桿。特別是針對 `fixed-points` 模式，實作專業的 **4-panel 學術圖表**（Manifold 投影、Jacobian 特徵值譜、q 直方圖、終端日誌）。
3. **升級 3D Attractor 面板**：完整實作五種吸引子幾何（Point, Line, Limit Cycle, Saddle, Lorenz Chaos）的 3D SVG 實時數學計算、`rotSpeed` 自動旋轉速度與 `noisePerturb` 決策分岔噪聲控制。
4. **雙向備份與 Git 推送**：
   - 打包今日對話、Sandbox 避坑 SOP 製作精美筆記 `2026 Antigravity 學習筆記.md`。
   - 上傳 App 至 GitHub 倉庫 `2026 Antigravity`。
   - 同步備份至 Obsidian 第二大腦 `C:\Users\User\Documents\2026 Antigravity`。

---

## 🛠️ 提案變更與功能設計

### 1. NotebookLM AI 語音製作艙 (Podcast 面板升級)
我們將在 `PodcastTabComponent` 中加入一個極致現代感、毛玻璃質感的 **NotebookLM AI 語音製作艙**：
- **來源文獻 (Sources) 選擇**：
  1. *Neuron 2009* - FORCE 混沌循環網路穩定化學習
  2. *Nature Neuroscience 2013* - 慢速流形與固定點幾何學 (Sussillo & Barak)
  3. *BMI Clinical Decoders* - 臨床腦機介面主成分解碼器
  4. *Custom Source* - 提供一個文字輸入框，可讓使用者（醫師/研究員）自行輸入自定義的文本內容。
- **高擬真 AI 播客合成動態**：
  - 點擊「🚀 開始合成新播客主題」後，開啟全螢幕/局部毛玻璃模糊遮罩，阻斷操作。
  - 展示 **0% 到 100% 合成進度條**。
  - 滾動展示 **AI 終端機高頻日誌**，如：
    ```text
    [NotebookLM AI] 讀取來源文獻 Neuron 2009 FORCE 論文...
    [NotebookLM AI] 正在解析一階 RLS 線上突觸更新協方差...
    [NotebookLM AI] 提取 Host (AI) 與 Guest (You) 的對話語意...
    [NotebookLM AI] 合成 Host 提問："利用隨機混沌作為天然素材..."
    [NotebookLM AI] 合成 Guest 解答："大腦的小腦與前運動皮質..."
    [NotebookLM AI] Web Speech API 語音時間軌對齊中...
    [NotebookLM AI] 合成成功！共產生 4 組高品質臨床對話！
    ```
  - 合成結束後，動態更新播客對話狀態 `currentDialogues`，使用者可立即點擊播放，使用 **zh-TW 高音量語音引擎** 進行朗讀！

### 2. FORCE 混沌學習面板 (RLS) 與 4-Panel 學術圖表
為了完整對應 `FORCE-RNN-Sim` Skill 中的學術深度，我們將在 `SimulatorTab` 的 FORCE 學習面板中實作四大情境：
- **四大學術情境切換**：
  - `sinusoid`：週期性正弦波學習（Sussillo Fig 2）。
  - `lorenz-output`：在混沌 Lorenz 目標上進行 FORCE-Output 訓練（Sussillo Fig 3）。
  - `lorenz-internal`：Sussillo v3 phase-split 內部神經元 RLS 連接矩陣訓練。
  - `fixed-points`：慢速流形優化與固定點幾何分析（Sussillo & Barak 2013 Fig 2 風格）。
- **完全參數自定義滑桿與輸入框**：
  - 網路規模 $N$（100 ~ 1500）
  - 隨機反饋增益 $g$（0.80 ~ 2.00，控制進入混沌）
  - 正則化參數 $\alpha$（1.0 ~ 50.0）
  - 訓練週期 Cycles（5 ~ 100）
  - 目標波形：複合弦波 (`combined`)、單正弦波 (`single`)、方波 (`square`)、鋸齒波 (`sawtooth`)。
  - 主頻率 $f_1$ (0.5Hz ~ 5.0Hz) 與副頻率 $f_2$ (0.5Hz ~ 10.0Hz)。
- **專業 4-Panel 學術圖表 (針對 fixed-points)**：
  - 當切換到 `fixed-points` 模式時，原本的 Waveform SVG 將替換為一個專業的 **2x2 學術研究四宮格圖表**：
    1. **PC1-PC2 Projection**：慢速流形 (U-manifold) PC 投影軌跡與慢速點 (Slow Points) 分佈。
    2. **PC1-PC3 Projection**：立體流形投影與不穩定決策分岔邊界。
    3. **Jacobian Eigenvalues (λ)**：雅可比矩陣特徵值分佈（Re 虛軸邊界分流，展現 unstable spiral 區間）。
    4. **q-velocity Histogram**：優化流速 $\log_{10}(q)$ 的直方圖分佈，直觀展現系統是如何逼近 dx/dt ≈ 0 的慢速區域。
    - 同步提供滾動的 **L-BFGS 優化收斂終端日誌**，讓使用者有在跑真實 Python 數值模擬的頂級學術既視感！

### 3. 3D Attractor 決策流形面板五種 Attraction 情境
在 `SlideDeckTabComponent` 與投影片中，我們將提供更醒目的吸引子類型切換：
- **Point Attractor**：6 條螺旋軌跡完美收斂至原點穩定吸引子。
- **Line Attractor**：展示 PC1/PC2 投影，多條軌跡向一條連續的 1D 線性流形收斂，展現工作記憶的穩定保存。
- **Limit Cycle Attractor**：展示 3D 封閉極限環吸引子，多條軌跡從內側與外側螺旋收斂至該極限環軌跡。
- **Saddle Point (Decision Bifurcation)**：展示紅色鞍點決策邊界，不穩定螺旋軌跡 pointsC 逼近鞍點後，隨 `noisePerturb` 的大少發生分岔，流向 Orbit A 或 Orbit B。
- **Lorenz Strange Attractor (Chaos)**：動態數值積分 Lorenz 吸引子，隨 `noisePerturb` 產生微小擾動，展現優美的雙葉蝴蝶混沌相圖。
- **3D 旋轉速度 `rotSpeed`** 與 **幾何雜訊 `noisePerturb`** 全面與這些 SVG 數學方程式進行實時計算連動！

### 4. Obsidian 學習筆記備份與 GitHub 同步
- 生成極致精美的 `2026 Antigravity 學習筆記.md`。
- 自動建立 `.gitignore` 排除不必要的依賴。
- 連結 GitHub 遠端倉庫 `2026 Antigravity` 並執行 push。
- 複製備份至 Obsidian 目錄下。

---

## 🔬 驗證與交付方案

### 1. 編譯與同步二次確認
- 執行 `python sync_index.py` 將 React 程式碼注入 `index.html`。
- 執行 `npm run build` 確認最終編譯打包 zero warnings，完美無瑕。

### 2. 系統與瀏覽器相容性驗證
- 確認語音朗讀在 Try-Catch 下 100% 健全，不因沙盒 iframe 限制而崩潰。
- 強制指定 `zh-TW` 語音與音量為 1.0，保證發音清晰洪亮。
