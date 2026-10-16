# -*- coding: utf-8 -*-
"""Build the FORCE->CTPD interactive HTML deck (single file, base64-embedded).
Reproducible: reads images/, emits output/deck.html. No external image gen.
"""
import base64, os, pathlib

HERE = pathlib.Path(__file__).resolve().parent
IMG = HERE.parent / "images"

def b64(name):
    data = (IMG / name).read_bytes()
    return base64.b64encode(data).decode("ascii")

IMG_SIN = "data:image/png;base64," + b64("force_sinusoid_demo.png")
IMG_LOR = "data:image/png;base64," + b64("force_internal_v3_demo.png")
IMG_FP  = "data:image/png;base64," + b64("stage4_fixed_points_demo.png")
SVG_ROADMAP = (IMG / "pivots_roadmap.svg").read_text(encoding="utf-8")
# strip the onclick handlers so inline SVG is inert inside the deck
import re
SVG_ROADMAP = re.sub(r'onclick="[^"]*"', '', SVG_ROADMAP)

# ---- per-slide HTML (35 slides) -------------------------------------------
S = []
def slide(theme, html):
    S.append((theme, html))

# Part 0
slide("cover", """
<div class="center">
  <div class="kicker">Computational Neuroscience · 60 min</div>
  <h1>從 FORCE 到 Population Dynamics</h1>
  <p class="sub">一個演算法如何翻轉我們理解大腦的方式</p>
  <div class="bigidea">FORCE 不是演算法升級，而是讓 RNN 從「無法馴服的混沌」<br>變成「可解剖的動力系統」——這個翻轉，生出了 CTPD 框架。</div>
  <div class="byline">重讀 David Sussillo 研究主線 · 並親手把它跑一遍</div>
</div>""")

slide("dark", """
<h2>Hook：1000 個神經元的沉默</h2>
<div class="cols">
  <div class="card green">
    <h3>我們能記錄的</h3>
    <p>同時記錄上千個神經元，array、雙光子、Neuropixels…</p>
  </div>
  <div class="card brown">
    <h3>我們能理解的</h3>
    <p>把每個神經元的 tuning curve 一條條畫出，面對前額葉的高維時間動態——卡住。</p>
  </div>
</div>
<p class="lead">記錄變多，理解沒等比例變多。<b>single-neuron tuning curve 不夠用了。</b></p>""")

slide("dark", """
<h2>本場的 One Big Idea</h2>
<div class="flow">
  <div class="step green">能訓練的<b>工具</b><br><span>FORCE 2009</span></div>
  <div class="arrow">→</div>
  <div class="step purple">可解剖的<b>動力系統</b><br><span>Black Box 2013</span></div>
  <div class="arrow">→</div>
  <div class="step gold">系統神經科學<b>框架</b><br><span>CTPD 2020</span></div>
</div>
<p class="lead">今天就講清楚這條翻轉是怎麼發生的。</p>""")

slide("dark", """
<h2>今天的路線</h2>
<ul class="big">
  <li><span class="num green">1</span> FORCE 的數學核心 — 為何誤差從頭就小</li>
  <li><span class="num purple">2</span> 樞紐轉折 — 打開黑盒</li>
  <li><span class="num">3</span> 四個轉折路線圖</li>
  <li><span class="num brown">4</span> 親手重現 — FORCE 模擬 + fixed-point 分析</li>
  <li><span class="num gold">5</span> 收斂到 CTPD + 批判</li>
</ul>
<p class="note">★ 含三個我親手跑的 numpy 實驗（零捏造）</p>""")

# Part 1 (FORCE math) -- emphasised
slide("dark", """
<h2><span class="tag green">Part 1</span> 混沌 RNN 的困境</h2>
<p class="lead">把輸出誤差回饋進遞迴網路去修正，回饋會反覆放大（reverberating）→ 訓練發散。</p>
<div class="cols">
  <div class="card">前人解法（echo-state）：刻意讓網路<b>無輸入時靜止</b>才能訓 → 犧牲混沌的豐富動態。</div>
  <div class="card green">FORCE 解法：<b>保留混沌</b>，在訓練中主動壓制它。</div>
</div>""")

slide("dark", """
<h2>轉折 1：混沌 bug → feature</h2>
<div class="bigidea green">FORCE 保留混沌的自發活動，<br>用<b>強而快</b>的突觸修改在訓練早期壓制它。</div>
<p class="lead">關鍵：回饋訊號 ≈ f(t)，振幅夠時可誘導 <b>chaotic → nonchaotic transition</b>。</p>""")

slide("dark", """
<h2>核心設定（式 1–3）</h2>
<div class="math">$$z(t) = \\mathbf{w}^T \\mathbf{r}(t) \\tag{1}$$</div>
<div class="math">$$e_-(t) = \\mathbf{w}^T(t-\\Delta t)\\,\\mathbf{r}(t) - f(t) \\tag{2}$$</div>
<div class="math">$$e_+(t) = \\mathbf{w}^T(t)\\,\\mathbf{r}(t) - f(t) \\tag{3}$$</div>
<p class="note">輸出是 firing rate 的線性讀出；分別記更新「前」與「後」的誤差。</p>""")

slide("vote", """
<div class="cp">Check-Point 1</div>
<h2>FORCE 與一般 gradient descent 最大差異是？</h2>
<div class="opts" data-correct="C">
  <button class="opt" data-k="A">A. 用更大的 batch</button>
  <button class="opt" data-k="B">B. 學習率調得更小</button>
  <button class="opt" data-k="C">C. 誤差全程維持很小，而非由大慢慢縮小</button>
  <button class="opt" data-k="D">D. 不需要 target</button>
</div>
<p class="reveal" hidden>答案 <b>C</b>：FORCE 不走「減小大誤差」，而是「維持小誤差」。</p>""")

slide("dark", """
<h2>RLS 更新式與 P 矩陣（式 4–6）</h2>
<div class="math">$$\\mathbf{w}(t) = \\mathbf{w}(t-\\Delta t) - e_-(t)\\,\\mathbf{P}(t)\\,\\mathbf{r}(t) \\tag{4}$$</div>
<div class="math">$$\\mathbf{P}(t) = \\mathbf{P}(t-\\Delta t) - \\frac{\\mathbf{P}\\mathbf{r}\\,\\mathbf{r}^T\\mathbf{P}}{1 + \\mathbf{r}^T\\mathbf{P}\\mathbf{r}},\\quad \\mathbf{P}(0)=\\mathbf{I}/\\alpha \\tag{5,6}$$</div>
<div class="cols">
  <div class="card purple"><b>P ≈ 相關矩陣的逆</b><br>= 二階（Newton-like）更新</div>
  <div class="card"><b>每個突觸有自己</b>的、隨資料調整的有效步長（不是純量學習率）</div>
</div>""")

slide("demo", """
<h2><span class="tag green">互動</span> 為何誤差從頭就小（式 7–8）</h2>
<div class="cols">
  <div>
    <div class="math small">$$e_-(\\Delta t) = -\\frac{\\alpha f}{\\alpha + \\mathbf{r}^T\\mathbf{r}},\\quad \\mathbf{r}^T\\mathbf{r}\\sim O(N)$$</div>
    <div class="math small">$$e_+(t) = e_-(t)\\,(1 - \\mathbf{r}^T\\mathbf{P}\\mathbf{r})$$</div>
    <p class="note">α≪N → 第一步誤差 ≈ −αf/N，極小。<br>rᵀPr：初期≈1（e₊≈0）→ 後期→0（收斂）。</p>
    <button id="toggleScale" class="btn">切換 線性 / 對數軸</button>
  </div>
  <div class="chartbox"><canvas id="errChart"></canvas></div>
</div>
<p class="note">下方曲線為 FORCE vs gradient descent 的誤差軌跡示意（概念）。</p>""")

# Part 2 (open the black box)
slide("dark", """
<h2><span class="tag purple">Part 2</span> 訓練好了，然後呢？</h2>
<div class="blackbox">
  <div class="bb">輸入 →　<b>?</b>　→ 正確輸出</div>
</div>
<p class="lead">監督式訓練規定了「<b>做什麼</b>」，卻沒規定「<b>怎麼做</b>」。<br>網路成了黑盒。</p>""")

slide("dark", """
<h2>關鍵洞見（轉折 2）<span class="star">★</span></h2>
<div class="bigidea purple">「怎麼做」就是一個<b>可研究的科學問題</b>。<br>把訓練好的 RNN 當<b>非線性動力系統 (NLDS)</b> 來逆向工程。</div>
<p class="lead">Sussillo &amp; Barak 2013 · Opening the Black Box · 整條演化的支點。</p>""")

slide("dark", """
<h2>動力系統語言入門</h2>
<div class="grid4">
  <div class="card">State space<br><span>每軸一個神經元</span></div>
  <div class="card">Trajectory<br><span>狀態隨時間的路徑</span></div>
  <div class="card">Flow field<br><span>每點往哪走</span></div>
  <div class="card purple">Fixed / slow point<br><span>速度≈0 的點</span></div>
</div>
<p class="note">鐘擺（位置×速度）→ 神經群體（N 維狀態）的同一套語言。</p>""")

slide("dark", """
<h2>Fixed points 與 slow points</h2>
<ul class="big">
  <li>在相空間找速度近乎為零的點</li>
  <li>對該點做<b>線性化（Jacobian）</b></li>
  <li>特徵值 → 穩定 / 不穩定方向</li>
  <li>由幾何結構反推網路如何運算</li>
</ul>
<p class="note">逆向工程三例：3-bit flip-flop、sine generator、2-point average — 機制皆可被讀出。</p>""")

slide("dark", """
<h2>這一步為何是樞紐</h2>
<div class="bigidea purple">從「<b>會動</b>」到「<b>能讀懂</b>」。</div>
<p class="lead">沒有它，FORCE 只是工程技巧；<br>有了它，RNN 成為<b>能生成假設的動力系統模型</b>。</p>
<p class="note">Sussillo &amp; Barak 2013, Neural Computation — 後續一切的支點。</p>""")

# Part 3 (roadmap)
slide("roadmap", """
<h2>四個轉折：FORCE → CTPD 全景</h2>
<div class="svgwrap">__SVG_ROADMAP__</div>""")

slide("vote", """
<div class="cp">Check-Point 2</div>
<h2>你認為哪個轉折最關鍵？</h2>
<div class="opts" data-correct="B">
  <button class="opt" data-k="A">A. 混沌 bug→feature</button>
  <button class="opt" data-k="B">B. 黑盒→可解剖的動力系統</button>
  <button class="opt" data-k="C">C. 模型→大腦</button>
  <button class="opt" data-k="D">D. input 成為重構者</button>
</div>
<p class="reveal" hidden>講者觀點 <b>B</b>：它是支點——讓「逆向工程」成為可能，後三者才得以展開。</p>""")

slide("dark", """
<h2>轉折 3：分析模型 → 分析大腦</h2>
<div class="bigidea brown">RNN 的動力系統語言（state space、trajectory、attractor）<br><b>反向套回真實神經群體資料</b>。</div>
<p class="lead">顛覆 single-neuron tuning 典範：要懂單一神經元，先懂 population。</p>
<p class="note">Barak/Sussillo/Romo 2013（延遲辨別）· Sussillo 2014「circuits as dynamical systems」</p>""")

slide("dark", """
<h2>轉折 4：input 成為「重構者」</h2>
<div class="math">$$\\frac{d\\mathbf{x}}{dt} = F(\\mathbf{x}(t),\\,\\mathbf{u}(t))$$</div>
<p class="lead">輸入不只是被加入的訊號：<b>initial condition x₀ 與 input u(t) 共同<u>指定</u>一個運算</b>。</p>
<p class="note">reservoir「丟石頭進池塘」→ 為特定運算量身打造的動力系統 · Driscoll/Golub/Sussillo 2018</p>""")

# Part 4 (hands-on) -- emphasised
slide("dark", """
<h2><span class="tag brown">Part 4</span> 我為什麼自己跑一遍</h2>
<p class="lead">光看論文不夠。用 <b>numpy + scipy</b> 寫最小可運行版本，<br>圖跟數字都是真實 RLS 計算出來的——<b>零捏造</b>。</p>
<div class="flow">
  <div class="step green">① sinusoid<br><span>FORCE-Output</span></div>
  <div class="step brown">② Lorenz<br><span>FORCE-Internal v3</span></div>
  <div class="step purple">③ fixed-point<br><span>解剖 trained 網路</span></div>
</div>""")

slide("img", """
<h2>實驗一：sinusoid（FORCE-Output）</h2>
<img src="__IMG_SIN__" alt="sinusoid demo">
<p class="cap">N=1000, g=1.5, 15 train cycles — 紅線整段覆蓋灰線，test error 在 ±0.008 內。</p>""")

slide("dark", """
<h2>判讀：誤差從第一步就小</h2>
<table class="tbl">
<tr><th>Cycle</th><th>Train MSE</th><th>|W|</th></tr>
<tr><td>1</td><td class="hot">0.000019</td><td>0.093</td></tr>
<tr><td>5</td><td>0.000048</td><td>0.196</td></tr>
<tr><td>15</td><td>0.000005</td><td>0.251</td></tr>
<tr><td>16 (test)</td><td>0.000006</td><td>0.251</td></tr>
</table>
<p class="lead">Cycle 1 就是 <b>1.9×10⁻⁵</b> — 式 (7)(8) 的實證。</p>""")

slide("img", """
<h2>實驗二：Lorenz（FORCE-Internal v3）</h2>
<img src="__IMG_LOR__" alt="lorenz demo">
<p class="cap">左：時序前段貼合、後段 phase divergence（混沌本性）。右：delay-embedding 重建出 Lorenz 蝴蝶。</p>""")

slide("dark", """
<h2>判讀：混沌被保留</h2>
<div class="cols">
  <div class="card brown"><b>|J|_norm: 0.168 → 0.169</b><br>全程僅變 <b>0.7%</b> → chaotic regime 完整保留</div>
  <div class="card"><b>運算靠 W 承載</b><br>|W|: 0.09 → 0.54</div>
</div>
<p class="note">test MSE 在 cycle 32+ 衝到 0.2–0.5 看似嚇人，但那是混沌 phase divergence 必然 — 判讀看 attractor，不看 point-by-point。</p>""")

slide("img", """
<h2>實驗三：fixed-point 分析（Sussillo &amp; Barak 2013 風格）</h2>
<img src="__IMG_FP__" alt="fixed point demo">
<p class="cap">4-panel：PC1-PC2 / PC1-PC3 / Jacobian 特徵值雲 / q-landscape 直方圖。123 個 slow points。</p>""")

slide("dark", """
<h2>判讀：低維 manifold</h2>
<div class="bigidea purple">top-3 PC 解釋 ≈ <b>81%</b> 變異<br>（55.2% + 19.2% + 6.6%）</div>
<p class="lead">高維 RNN 的運算落在<b>低維流形</b>上；slow points 聚在兩個 lobe 中心 → 對應 Lorenz 的 C⁺/C⁻。</p>""")

slide("dark", """
<h2>判讀：unstable saddles 驅動 lobe-switch</h2>
<ul class="big">
  <li>特徵值雲多數在 Re≈−1（因 F=−x+… 主導）</li>
  <li>但有可觀部分<b>跨過虛軸 Re=0</b> 進入 unstable 區</li>
  <li>強 saddle 最多 26 個 unstable directions, max Re≈0.40</li>
  <li><b>沒有 q&lt;10⁻⁷ 的真不動點 — 這是 feature</b></li>
</ul>
<p class="note">RNN 用<b>連續的 slow manifold</b>（而非離散吸引子）在「計算」混沌。</p>""")

slide("vote", """
<div class="cp">Check-Point 3</div>
<h2>RNN 找不到真正的 fixed point（q&lt;10⁻⁷），代表什麼？</h2>
<div class="opts" data-correct="C">
  <button class="opt" data-k="A">A. 訓練失敗</button>
  <button class="opt" data-k="B">B. 網路太小</button>
  <button class="opt" data-k="C">C. 它用連續的 slow manifold 編碼混沌動態</button>
  <button class="opt" data-k="D">D. 演算法 bug</button>
</div>
<p class="reveal" hidden>答案 <b>C</b>：離散答案是錯問題；混沌 RNN 的 slow manifold 在 N 維空間是連續的。</p>""")

slide("dark", """
<h2>三實驗閉環</h2>
<div class="flow">
  <div class="step green">FORCE 訓練<br><span>轉折 1</span></div>
  <div class="arrow">→</div>
  <div class="step purple">fixed-point 解剖<br><span>轉折 2</span></div>
  <div class="arrow">→</div>
  <div class="step gold">低維 manifold<br><span>CTPD 微縮實證</span></div>
</div>
<p class="lead">轉折 2 的方法，作用在轉折 1 的網路上，產出 CTPD 框架的縮影。</p>""")

# Part 5 (CTPD + critique)
slide("dark", """
<h2><span class="tag gold">Part 5</span> 終點：CTPD 框架</h2>
<div class="bigidea gold">Computation through Neural Population Dynamics<br><span class="small2">Vyas, Golub, Sussillo &amp; Shenoy 2020, Annu. Rev. Neurosci.</span></div>
<div class="grid4">
  <div class="card">Motor control</div><div class="card">Timing</div>
  <div class="card">Decision-making</div><div class="card">Working memory</div>
</div>""")

slide("dark", """
<h2>一條式子貫穿全場</h2>
<div class="math big">$$\\frac{d\\mathbf{x}}{dt} = f(\\mathbf{x}(t),\\,\\mathbf{u}(t))$$</div>
<p class="lead">x 是 N 維神經群體狀態。<b>神經群體就是一個動力系統</b>，<br>運算透過它在 state space 的時間演化來實現。</p>""")

slide("dark", """
<h2>批判：守住兩條界線</h2>
<div class="cols">
  <div class="card brown"><b>RNN ≠ 大腦</b><br>只是「運算可以如何被解」的一個範例，非 ground truth。RNN 是 hypothesis-generating tool。</div>
  <div class="card brown"><b>低維投影的陷阱</b><br>2D/3D 投影幾乎可 fit 任何假設 → 必須在高維（10–20 維）量化（KiNeT 等）。</div>
</div>""")

slide("dark", """
<h2>哲學底色：Emergence</h2>
<div class="bigidea">Conway's Game of Life：<b>簡單規則 → 複雜湧現</b></div>
<p class="lead">Sussillo 2026 Q&amp;A 自述為終生母題。</p>
<p class="note">運算從大量簡單單元的集體動力中湧現，而非定位於單一元件 — 即 population dynamics 的信念。</p>""")

slide("cover", """
<div class="center">
  <h2 class="end">帶走三句話</h2>
  <ul class="takehome">
    <li>FORCE 用 <b>P 矩陣</b>在第一步把誤差打到近乎零 → 保留並馴服混沌。</li>
    <li>真正生出 CTPD 的，是把 RNN <b>當動力系統來解剖</b>（fixed points）。</li>
    <li>高維神經運算落在<b>低維 manifold</b>，由 fixed/slow points 的幾何決定。</li>
  </ul>
  <div class="byline">問題 · 討論 · 一起把它跑一遍</div>
</div>""")

slide("dark", """
<h2>延伸閱讀</h2>
<ul class="big">
  <li><b>Sussillo &amp; Abbott 2009</b> · Neuron — FORCE learning</li>
  <li><b>Sussillo &amp; Barak 2013</b> · Neural Computation — Opening the Black Box</li>
  <li><b>Sussillo 2014</b> · Curr. Opin. Neurobiol. — Circuits as dynamical systems</li>
  <li><b>Driscoll, Golub &amp; Sussillo 2018</b> · Neuron — Computation through Cortical Dynamics</li>
  <li><b>Vyas, Golub, Sussillo &amp; Shenoy 2020</b> · Annu. Rev. Neurosci. — CTPD</li>
</ul>
<p class="note">三張圖皆由 numpy/scipy 實際計算產生（基於 Sussillo &amp; Abbott 2009 最小重現），零捏造。</p>""")

# ---- assemble -------------------------------------------------------------
slides_html = []
for i,(theme,html) in enumerate(S):
    html = html.replace("__IMG_SIN__", IMG_SIN).replace("__IMG_LOR__", IMG_LOR)
    html = html.replace("__IMG_FP__", IMG_FP).replace("__SVG_ROADMAP__", SVG_ROADMAP)
    slides_html.append(f'<section class="slide {theme}" data-i="{i+1}">{html}</section>')
SLIDES = "\n".join(slides_html)
N = len(S)

CSS = """
:root{--bg:#11100e;--bg2:#1a1815;--fg:#faf9f5;--mut:#c2c0b6;
--green:#5dcaa5;--greenbg:#085041;--purple:#afa9ec;--purplebg:#3c3489;
--brown:#f0997b;--brownbg:#712b13;--gold:#ef9f27;--goldbg:#633806;}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:var(--bg);color:var(--fg);
font-family:"Anthropic Sans","Segoe UI",-apple-system,system-ui,"Microsoft JhengHei",sans-serif}
#deck{height:100vh;width:100vw;overflow:hidden;position:relative}
.slide{position:absolute;inset:0;display:none;flex-direction:column;justify-content:center;
padding:6vh 8vw;animation:f .35s ease}
.slide.on{display:flex}
@keyframes f{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
h1{font-size:3.4rem;line-height:1.1;font-weight:700;margin-bottom:.4em}
h2{font-size:2.1rem;font-weight:600;margin-bottom:.7em;color:var(--fg)}
h3{font-size:1.15rem;font-weight:600;margin-bottom:.4em}
.sub{font-size:1.5rem;color:var(--mut);margin-bottom:1.2em}
.kicker{color:var(--green);letter-spacing:.2em;font-size:.9rem;margin-bottom:1.5em;text-transform:uppercase}
.lead{font-size:1.35rem;line-height:1.6;margin-top:.6em;color:var(--fg)}
.note{font-size:1rem;color:var(--mut);margin-top:1em;line-height:1.5}
.byline{color:var(--mut);font-size:.95rem;margin-top:2em}
.center{text-align:center;align-items:center;margin:auto;max-width:60vw}
.bigidea{background:rgba(255,255,255,.04);border-left:4px solid var(--purple);
padding:1em 1.3em;border-radius:8px;font-size:1.5rem;line-height:1.5;margin:.6em 0}
.bigidea.green{border-color:var(--green)} .bigidea.purple{border-color:var(--purple)}
.bigidea.gold{border-color:var(--gold)} .bigidea.brown{border-color:var(--brown)}
.bigidea .small2{font-size:1rem;color:var(--mut)}
.cols{display:flex;gap:1.2em;margin:.8em 0}
.cols>*{flex:1}
.card{background:var(--bg2);border:1px solid rgba(255,255,255,.08);border-radius:10px;
padding:1.1em 1.2em;font-size:1.1rem;line-height:1.5}
.card.green{border-color:var(--green)} .card.purple{border-color:var(--purple)}
.card.brown{border-color:var(--brown)} .card.gold{border-color:var(--gold)}
.card span{color:var(--mut);font-size:.95rem}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:1em;margin:.8em 0}
.flow{display:flex;align-items:center;justify-content:center;gap:1em;margin:1.2em 0;flex-wrap:wrap}
.step{background:var(--bg2);border:1px solid rgba(255,255,255,.1);border-radius:10px;
padding:1em 1.3em;text-align:center;font-size:1.2rem;min-width:150px}
.step b{display:block;font-size:1.3rem;margin:.2em 0} .step span{color:var(--mut);font-size:.9rem}
.step.green{border-color:var(--green)} .step.purple{border-color:var(--purple)}
.step.brown{border-color:var(--brown)} .step.gold{border-color:var(--gold)}
.arrow{font-size:2rem;color:var(--mut)}
ul.big{list-style:none;font-size:1.4rem;line-height:2}
ul.big li{padding-left:.2em}
.num{display:inline-block;width:1.6em;height:1.6em;line-height:1.6em;text-align:center;
border-radius:50%;background:var(--bg2);border:1px solid var(--mut);margin-right:.5em;font-size:1rem}
.num.green{border-color:var(--green);color:var(--green)} .num.purple{border-color:var(--purple);color:var(--purple)}
.num.brown{border-color:var(--brown);color:var(--brown)} .num.gold{border-color:var(--gold);color:var(--gold)}
.tag{font-size:.85rem;padding:.15em .6em;border-radius:6px;background:var(--bg2);vertical-align:middle;margin-right:.4em}
.tag.green{color:var(--green)} .tag.purple{color:var(--purple)} .tag.brown{color:var(--brown)} .tag.gold{color:var(--gold)}
.star{color:var(--gold)}
.math{margin:.6em 0;font-size:1.3rem;text-align:center}
.math.small{font-size:1.05rem} .math.big{font-size:2rem;margin:1em 0}
img{max-width:78vw;max-height:62vh;display:block;margin:.4em auto;border-radius:8px;
background:#fff;padding:.4em;box-shadow:0 8px 30px rgba(0,0,0,.5)}
.cap{text-align:center;color:var(--mut);font-size:1rem;margin-top:.6em}
.tbl{border-collapse:collapse;font-size:1.3rem;margin:.6em 0}
.tbl th,.tbl td{border:1px solid rgba(255,255,255,.15);padding:.45em 1.1em;text-align:center}
.tbl th{background:var(--bg2);color:var(--mut)} .tbl .hot{color:var(--green);font-weight:700}
.blackbox{display:flex;justify-content:center;margin:1.2em 0}
.bb{background:var(--bg2);border:2px dashed var(--mut);border-radius:12px;padding:1.5em 2.5em;font-size:1.6rem}
.bb b{color:var(--purple);font-size:2.2rem}
.cp{color:var(--gold);letter-spacing:.15em;font-size:1rem;text-transform:uppercase;margin-bottom:.6em}
.opts{display:flex;flex-direction:column;gap:.7em;margin:1em 0;max-width:40em}
.opt{text-align:left;background:var(--bg2);border:1px solid rgba(255,255,255,.12);color:var(--fg);
padding:.8em 1.1em;border-radius:8px;font-size:1.2rem;cursor:pointer;transition:.15s}
.opt:hover{border-color:var(--gold)} .opt.sel{border-color:var(--gold);background:rgba(239,159,39,.12)}
.opt.right{border-color:var(--green);background:rgba(93,202,165,.15)}
.reveal{font-size:1.2rem;color:var(--green);margin-top:.8em}
.btn{background:var(--purplebg);color:var(--fg);border:1px solid var(--purple);border-radius:8px;
padding:.6em 1.1em;font-size:1rem;cursor:pointer;margin-top:.8em}
.chartbox{background:var(--bg2);border-radius:10px;padding:1em;height:46vh}
.demo .cols>*{flex:1}
.takehome{list-style:none;font-size:1.4rem;line-height:2.1;text-align:left;margin:1em auto;max-width:46em}
.takehome li{padding-left:1.4em;position:relative}
.takehome li:before{content:"→";position:absolute;left:0;color:var(--gold)}
.end{font-size:2.4rem;margin-bottom:.5em}
.svgwrap{max-height:74vh;display:flex;justify-content:center}
.svgwrap svg{max-height:74vh;width:auto}
.cover{background:radial-gradient(circle at 50% 30%,#1f1c30,var(--bg))}
#hud{position:fixed;bottom:18px;right:24px;color:var(--mut);font-size:.9rem;z-index:10}
#bar{position:fixed;top:0;left:0;height:3px;background:var(--gold);z-index:10;transition:width .3s}
.navhint{position:fixed;bottom:18px;left:24px;color:var(--mut);font-size:.85rem;z-index:10}
"""

JS = """
const slides=[...document.querySelectorAll('.slide')];let cur=0;const N=slides.length;
function show(i){cur=Math.max(0,Math.min(N-1,i));slides.forEach((s,k)=>s.classList.toggle('on',k===cur));
document.getElementById('hud').textContent=(cur+1)+' / '+N;
document.getElementById('bar').style.width=((cur+1)/N*100)+'%';
if(window.MathJax&&MathJax.typesetPromise)MathJax.typesetPromise([slides[cur]]);
if(cur===9)initChart();}
document.addEventListener('keydown',e=>{
if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' ')show(cur+1);
if(e.key==='ArrowLeft'||e.key==='PageUp')show(cur-1);
if(e.key==='Home')show(0);if(e.key==='End')show(N-1);});
document.addEventListener('click',e=>{
const o=e.target.closest('.opt');if(o){const box=o.closest('.opts');
box.querySelectorAll('.opt').forEach(x=>x.classList.remove('sel'));o.classList.add('sel');
const correct=box.dataset.correct;
box.querySelectorAll('.opt').forEach(x=>{if(x.dataset.k===correct)x.classList.add('right')});
const r=o.closest('.slide').querySelector('.reveal');if(r)r.hidden=false;return;}
const t=e.target.closest('#toggleScale');if(t){toggleScale();return;}});
// FORCE error chart (real sinusoid training data + illustrative GD curve)
let chart=null,logScale=true;
const mse=[1.9e-5,1.4e-5,1.5e-5,4.3e-5,4.8e-5,7.1e-5,5.7e-5,4.4e-5,3.9e-5,1.2e-5,1.7e-5,9e-6,1.7e-5,3e-6,5e-6,6e-6];
const gd=[0.9,0.62,0.43,0.31,0.22,0.16,0.12,0.09,0.07,0.05,0.04,0.03,0.022,0.017,0.013,0.01];
const labels=[...Array(16)].map((_,i)=>i+1);
function initChart(){if(chart||!window.Chart)return;const ctx=document.getElementById('errChart');if(!ctx)return;
chart=new Chart(ctx,{type:'line',data:{labels,datasets:[
{label:'FORCE (實測 train MSE)',data:mse,borderColor:'#5dcaa5',backgroundColor:'#5dcaa5',tension:.3,pointRadius:3},
{label:'gradient descent (示意)',data:gd,borderColor:'#f0997b',borderDash:[6,4],tension:.3,pointRadius:0}]},
options:{responsive:true,maintainAspectRatio:false,
plugins:{legend:{labels:{color:'#faf9f5'}},title:{display:true,text:'誤差 vs 訓練 cycle',color:'#c2c0b6'}},
scales:{y:{type:'logarithmic',ticks:{color:'#c2c0b6'},grid:{color:'rgba(255,255,255,.08)'},title:{display:true,text:'MSE',color:'#c2c0b6'}},
x:{ticks:{color:'#c2c0b6'},grid:{color:'rgba(255,255,255,.05)'},title:{display:true,text:'cycle',color:'#c2c0b6'}}}}});}
function toggleScale(){if(!chart)return;logScale=!logScale;chart.options.scales.y.type=logScale?'logarithmic':'linear';chart.update();}
show(0);
"""

HTML = f"""<!doctype html><html lang="zh-Hant"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>從 FORCE 到 Population Dynamics</title>
<script>window.MathJax={{tex:{{inlineMath:[['$','$']],displayMath:[['$$','$$']]}},svg:{{fontCache:'global'}}}};</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>{CSS}</style></head><body>
<div id="bar"></div><div id="deck">{SLIDES}</div>
<div id="hud"></div><div class="navhint">← → 切換投影片 · Space 下一頁</div>
<script>{JS}</script></body></html>"""

out = HERE / "deck.html"
out.write_text(HTML, encoding="utf-8")
print("OK ->", out, "slides:", N, "size:", round(len(HTML)/1024), "KB")
