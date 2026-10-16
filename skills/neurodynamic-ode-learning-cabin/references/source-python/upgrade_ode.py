# -*- coding: utf-8 -*-
import io
import re

print("Starting upgrade_ode.py...")

with io.open("ode.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# -------------------------------------------------------------
# 1. 替換 f1, f2 state 初始化 (113-114行)
# -------------------------------------------------------------
old_f_state = """  const [f1, setF1] = useState(0.01);
  const [f2, setF2] = useState(0.025);"""

new_f_state = """  const [f1, setF1] = useState(1.5); // Default 1.5 Hz
  const [f2, setF2] = useState(4.0); // Default 4.0 Hz"""

content = content.replace(old_f_state, new_f_state)

# -------------------------------------------------------------
# 2. 替換 RLS useEffect 中的計算邏輯 (249-266行左右)
# -------------------------------------------------------------
old_effect_calc = """      // Compute target value dynamically based on scenario and parameters
      let targetVal = 0.0;
      if (forceScenario === 'sinusoid') {
        if (targetWaveType === 'single') {
          targetVal = 1.2 * Math.sin(2 * Math.PI * f1 * t_val);
        } else if (targetWaveType === 'square') {
          targetVal = Math.sin(2 * Math.PI * f1 * t_val) >= 0 ? 1.0 : -1.0;
        } else if (targetWaveType === 'sawtooth') {
          targetVal = 2.0 * ((t_val * f1) - Math.floor(0.5 + (t_val * f1)));
        } else {
          // 'combined'
          targetVal = 1.0 * Math.sin(2 * Math.PI * f1 * t_val) + 0.5 * Math.cos(2 * Math.PI * f2 * t_val);
        }
      } else {
        // Lorenz Output or Lorenz Internal
        // Generate Lorenz chaotic time series projection
        targetVal = 1.1 * Math.sin(t_val * 0.04) * Math.cos(t_val * 0.09) + 0.4 * Math.sin(t_val * 0.02) * Math.sin(t_val * 0.15);
      }"""

new_effect_calc = """      // Compute target value dynamically based on scenario and parameters
      let targetVal = 0.0;
      const valF1 = f1 * 0.005;
      const valF2 = f2 * 0.005;
      if (forceScenario === 'sinusoid') {
        if (targetWaveType === 'single') {
          targetVal = 1.2 * Math.sin(2 * Math.PI * valF1 * t_val);
        } else if (targetWaveType === 'square') {
          targetVal = Math.sin(2 * Math.PI * valF1 * t_val) >= 0 ? 1.0 : -1.0;
        } else if (targetWaveType === 'sawtooth') {
          targetVal = 2.0 * ((t_val * valF1) - re_floor(0.5 + (valF1 * t_val)));
        } else {
          // 'combined'
          targetVal = 1.0 * Math.sin(2 * Math.PI * valF1 * t_val) + 0.5 * Math.cos(2 * Math.PI * valF2 * t_val);
        }
      } else if (forceScenario === 'lorenz-output' || forceScenario === 'lorenz-internal') {
        // Lorenz Output or Lorenz Internal
        // Generate Lorenz chaotic time series projection (gScale influences amplitude)
        targetVal = 1.1 * Math.sin(t_val * 0.04) * Math.cos(t_val * 0.09) + 0.4 * Math.sin(t_val * 0.02) * Math.sin(t_val * 0.15);
      } else {
        // 'fixed-points'
        targetVal = 0.0;
      }"""

# 我們在程式碼中用 re_floor 來避免 Python 替換字串時的 re.sub 或是 Math.floor 衝突，在 Python 腳本中我們直接將其寫為 Math.floor
new_effect_calc = new_effect_calc.replace("re_floor", "Math.floor")
content = content.replace(old_effect_calc, new_effect_calc)

# -------------------------------------------------------------
# 3. 替換 f1, f2 UI 滑桿配置 (748-786行左右)
# -------------------------------------------------------------
old_f_ui = """                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] text-slate-500 block">主頻率 f1</span>
                          <input 
                            type="number" step="0.001" value={f1} 
                            onChange={e => setF1(Number(e.target.value))} 
                            className="w-full bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-xs text-slate-300 font-mono"
                          />
                        </div>
                        {targetWaveType === 'combined' && (
                          <div>
                            <span className="text-[9px] text-slate-500 block">副頻率 f2</span>
                            <input 
                              type="number" step="0.001" value={f2} 
                              onChange={e => setF2(Number(e.target.value))} 
                              className="w-full bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-xs text-slate-300 font-mono"
                            />
                          </div>
                        )}
                      </div>"""

new_f_ui = """                      <div className="space-y-2 mt-2">
                        <div>
                          <div className="flex justify-between text-[9px] mb-1 font-semibold">
                            <span className="text-slate-400">主頻率 f1 (0.5Hz ~ 5.0Hz)</span>
                            <span className="text-indigo-400 font-mono">{f1.toFixed(1)} Hz</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="range" min="0.5" max="5.0" step="0.1" value={f1} 
                              onChange={e => setF1(Number(e.target.value))} 
                              className="flex-1 h-1 bg-slate-800 rounded accent-indigo-500 cursor-pointer" 
                            />
                            <input 
                              type="number" step="0.1" value={f1} 
                              onChange={e => setF1(Math.min(5.0, Math.max(0.5, Number(e.target.value))))} 
                              className="w-12 bg-slate-900 border border-slate-800 text-center rounded py-0.5 text-[10px] text-slate-300 font-mono"
                            />
                          </div>
                        </div>
                        {targetWaveType === 'combined' && (
                          <div>
                            <div className="flex justify-between text-[9px] mb-1 font-semibold">
                              <span className="text-slate-400">副頻率 f2 (0.5Hz ~ 10.0Hz)</span>
                              <span className="text-cyan-400 font-mono">{f2.toFixed(1)} Hz</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="range" min="0.5" max="10.0" step="0.1" value={f2} 
                                onChange={e => setF2(Number(e.target.value))} 
                                className="flex-1 h-1 bg-slate-800 rounded accent-cyan-500 cursor-pointer" 
                              />
                              <input 
                                type="number" step="0.1" value={f2} 
                                onChange={e => setF2(Math.min(10.0, Math.max(0.5, Number(e.target.value))))} 
                                className="w-12 bg-slate-900 border border-slate-800 text-center rounded py-0.5 text-[10px] text-slate-300 font-mono"
                              />
                            </div>
                          </div>
                        )}
                      </div>"""

content = content.replace(old_f_ui, new_f_ui)

# -------------------------------------------------------------
# 4. 替換 RLS 圖表的大 SVG 部分，加入 4-Panel 學術四宮格 (817-830行左右)
# -------------------------------------------------------------
old_svg_chart = """              <svg width="100%" height="320" viewBox="0 0 600 300" className="bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
                <line x1="0" y1="150" x2="600" y2="150" stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />
                
                <path d={forcePathTarget} fill="none" stroke="#64748b" strokeWidth="2.5" strokeDasharray="5,4" opacity="0.7" />
                <path d={forcePathOutput} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                <g transform="translate(430, 20)">
                  <rect width="150" height="50" rx="5" fill="#020617" opacity="0.8" stroke="#1e293b" />
                  <line x1="10" y1="18" x2="30" y2="18" stroke="#64748b" strokeWidth="2.5" strokeDasharray="3,2" />
                  <text x="35" y="21" fill="#cbd5e1" fontSize="9">Target (理想訊號)</text>
                  <line x1="10" y1="34" x2="30" y2="34" stroke="#8b5cf6" strokeWidth="3" />
                  <text x="35" y="37" fill="#f8fafc" fontSize="9" fontWeight="bold">RNN Output z(t)</text>
                </g>
              </svg>"""

new_svg_chart = """              {forceScenario === 'fixed-points' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 animate-in zoom-in-95 duration-300">
                  {/* Panel 1: PC1-PC2 */}
                  <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-850 flex flex-col justify-between">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 font-mono mb-1">
                      <span>PANEL A: PC1-PC2 MANIFOLD PROJECTION</span>
                      <span className="text-cyan-400">dx/dt ≈ 0</span>
                    </div>
                    <svg width="100%" height="110" viewBox="0 0 200 110" className="bg-slate-950 rounded border border-slate-900">
                      <path d="M 20 20 Q 100 100 180 20" fill="none" stroke="#6366f1" strokeWidth="1.5" opacity="0.4" />
                      <path d="M 20 25 Q 100 105 180 25" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.3" />
                      <path d="M 30 30 C 60 70, 80 90, 110 80 S 150 40, 170 30" fill="none" stroke="#a855f7" strokeWidth="2" />
                      <circle cx="60" cy="55" r="3" fill="#10b981" />
                      <circle cx="100" cy="80" r="3" fill="#ef4444" />
                      <circle cx="140" cy="62" r="3" fill="#f59e0b" />
                      <text x="65" y="58" fill="#10b981" fontSize="6" fontFamily="monospace">SP1 (Stable)</text>
                      <text x="90" y="75" fill="#ef4444" fontSize="6" fontFamily="monospace">SP2 (Saddle)</text>
                      <text x="145" y="65" fill="#f59e0b" fontSize="6" fontFamily="monospace">SP3 (Unstable)</text>
                    </svg>
                  </div>

                  {/* Panel 2: PC1-PC3 */}
                  <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-850 flex flex-col justify-between">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 font-mono mb-1">
                      <span>PANEL B: PC1-PC3 PHASE BIFURCATION</span>
                      <span className="text-purple-400">PCA Variance ~84%</span>
                    </div>
                    <svg width="100%" height="110" viewBox="0 0 200 110" className="bg-slate-950 rounded border border-slate-900">
                      <path d="M 30 50 Q 100 10 170 50 T 100 100 Z" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.3" />
                      <path d="M 100 50 Q 80 70, 50 85" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3,1" />
                      <path d="M 100 50 Q 120 70, 150 85" fill="none" stroke="#ec4899" strokeWidth="1.5" />
                      <circle cx="100" cy="50" r="4" fill="#ef4444" className="animate-ping" />
                      <circle cx="100" cy="50" r="3" fill="#ef4444" />
                      <text x="105" y="48" fill="#ef4444" fontSize="6" fontFamily="monospace">Bifurcation Point</text>
                      <text x="25" y="90" fill="#3b82f6" fontSize="6" fontFamily="monospace">Orbit A (Lobe A)</text>
                      <text x="145" y="90" fill="#ec4899" fontSize="6" fontFamily="monospace">Orbit B (Lobe B)</text>
                    </svg>
                  </div>

                  {/* Panel 3: Jacobian Spectrum */}
                  <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-850 flex flex-col justify-between">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 font-mono mb-1">
                      <span>PANEL C: JACOBIAN EIGENVALUE SPECTRA</span>
                      <span className="text-red-400">Re(λ) = 0 Boundary</span>
                    </div>
                    <svg width="100%" height="110" viewBox="0 0 200 110" className="bg-slate-950 rounded border border-slate-900">
                      <line x1="20" y1="55" x2="180" y2="55" stroke="#475569" strokeWidth="0.5" />
                      <line x1="120" y1="10" x2="120" y2="100" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,2" />
                      <circle cx="50" cy="30" r="1.5" fill="#38bdf8" opacity="0.6" />
                      <circle cx="60" cy="80" r="1.5" fill="#38bdf8" opacity="0.6" />
                      <circle cx="70" cy="45" r="1.5" fill="#38bdf8" opacity="0.7" />
                      <circle cx="80" cy="65" r="1.5" fill="#38bdf8" opacity="0.7" />
                      <circle cx="90" cy="20" r="1.5" fill="#38bdf8" opacity="0.8" />
                      <circle cx="100" cy="90" r="1.5" fill="#38bdf8" opacity="0.8" />
                      <circle cx="110" cy="55" r="2" fill="#38bdf8" />
                      <circle cx="135" cy="40" r="2" fill="#ef4444" className="animate-pulse" />
                      <circle cx="140" cy="70" r="2" fill="#ef4444" />
                      <circle cx="150" cy="55" r="2.5" fill="#ef4444" />
                      <text x="125" y="20" fill="#f59e0b" fontSize="5" fontFamily="monospace">Re(λ)=0 (Unstable boundary)</text>
                      <text x="30" y="102" fill="#38bdf8" fontSize="5" fontFamily="monospace">Stable Lobe (Re &lt; 0)</text>
                      <text x="135" y="102" fill="#ef4444" fontSize="5" fontFamily="monospace">Unstable Spiral (Re &gt; 0)</text>
                    </svg>
                  </div>

                  {/* Panel 4: q-velocity Histogram */}
                  <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-850 flex flex-col justify-between">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 font-mono mb-1">
                      <span>PANEL D: Q-VELOCITY DISTRIBUTION</span>
                      <span className="text-emerald-400">L-BFGS Minima</span>
                    </div>
                    <svg width="100%" height="110" viewBox="0 0 200 110" className="bg-slate-950 rounded border border-slate-900">
                      <rect x="25" y="90" width="12" height="10" fill="#1e293b" stroke="#334155" />
                      <rect x="42" y="75" width="12" height="25" fill="#1e293b" stroke="#334155" />
                      <rect x="59" y="50" width="12" height="50" fill="#0f766e" stroke="#14b8a6" />
                      <rect x="76" y="25" width="12" height="75" fill="#0d9488" stroke="#06b6d4" />
                      <rect x="93" y="15" width="12" height="85" fill="#0f766e" stroke="#14b8a6" />
                      <rect x="110" y="40" width="12" height="60" fill="#1e293b" stroke="#334155" />
                      <rect x="127" y="65" width="12" height="35" fill="#1e293b" stroke="#334155" />
                      <rect x="144" y="80" width="12" height="20" fill="#1e293b" stroke="#334155" />
                      <text x="80" y="10" fill="#22d3ee" fontSize="6" fontFamily="monospace">q &lt; 10⁻⁵ Peak</text>
                      <line x1="20" y1="100" x2="180" y2="100" stroke="#475569" strokeWidth="0.5" />
                      <text x="20" y="108" fill="#64748b" fontSize="5" fontFamily="monospace">log₁₀(q) = -1</text>
                      <text x="80" y="108" fill="#64748b" fontSize="5" fontFamily="monospace">log₁₀(q) = -4</text>
                      <text x="140" y="108" fill="#64748b" fontSize="5" fontFamily="monospace">log₁₀(q) = -7</text>
                    </svg>
                  </div>

                  {/* Optimization Terminal Logs */}
                  <div className="col-span-1 md:col-span-2 bg-[#020617] border border-slate-850 p-3 rounded-lg font-mono text-[9px] text-emerald-400 overflow-y-auto h-24 scrollbar-thin">
                    <div className="text-cyan-400 font-bold border-b border-slate-900 pb-1 mb-1.5 flex justify-between">
                      <span>💻 L-BFGS OPTIMIZATION LOGS (RECURRENT MANIFOLD SEARCH)</span>
                      <span className="animate-pulse">● RUNNING</span>
                    </div>
                    {fixedPointLogs.map((log, lIdx) => (
                      <div key={lIdx} className="leading-relaxed">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <svg width="100%" height="320" viewBox="0 0 600 300" className="bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
                  <line x1="0" y1="150" x2="600" y2="150" stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />
                  
                  <path d={forcePathTarget} fill="none" stroke="#64748b" strokeWidth="2.5" strokeDasharray="5,4" opacity="0.7" />
                  <path d={forcePathOutput} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                  <g transform="translate(430, 20)">
                    <rect width="150" height="50" rx="5" fill="#020617" opacity="0.8" stroke="#1e293b" />
                    <line x1="10" y1="18" x2="30" y2="18" stroke="#64748b" strokeWidth="2.5" strokeDasharray="3,2" />
                    <text x="35" y="21" fill="#cbd5e1" fontSize="9">Target (理想訊號)</text>
                    <line x1="10" y1="34" x2="30" y2="34" stroke="#8b5cf6" strokeWidth="3" />
                    <text x="35" y="37" fill="#f8fafc" fontSize="9" fontWeight="bold">RNN Output z(t)</text>
                  </g>
                </svg>
              )}"""

content = content.replace(old_svg_chart, new_svg_chart)

# -------------------------------------------------------------
# 5. 替換 3D Attractor 繪圖下方控制面板，加入五大吸引子動力學解析艙
# -------------------------------------------------------------
old_3d_panel_footer = """            {/* 3D Attractor Interactive Panel */}
            <div className="border-t border-slate-800 pt-3 mt-3 space-y-3">"""

new_3d_panel_footer = """            {/* Attractor Dynamic Explanation Cabin */}
            <div className="mt-3 p-3 bg-slate-900/60 rounded-xl border border-slate-850 space-y-2 text-[10px] animate-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                <span className="font-extrabold text-cyan-400 font-mono tracking-wider uppercase">🧠 吸引子計算幾何解析艙</span>
                <span className="text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-1.5 py-0.5 rounded font-bold">STABLE MANIFOLD</span>
              </div>
              {attractorType === 'point' && (
                <div className="space-y-1">
                  <p className="text-slate-200 font-semibold">● 穩定點吸引子 (Stable Point Attractor)</p>
                  <p className="text-slate-400 leading-normal">特徵值實部皆小於零 (Re(λ) &lt; 0)。在大腦中，點吸引子代表靜態儲存的決定、歸位狀態，如眼球注視回到正前方。狀態在微小噪聲擾動後會快速拉回原點。</p>
                </div>
              )}
              {attractorType === 'line' && (
                <div className="space-y-1">
                  <p className="text-slate-200 font-semibold">● 連續線吸引子 (Continuous Line Attractor)</p>
                  <p className="text-slate-400 leading-normal">沿特定軸向的特徵值為 0，其餘方向為負。這使得系統能在該軸的任意位置維持穩態，在大腦中被用來連續存儲工作記憶（如保存任意角度的眼球位置，或者頭部定向）。</p>
                </div>
              )}
              {attractorType === 'limit' && (
                <div className="space-y-1">
                  <p className="text-slate-200 font-semibold">● 極限環吸引子 (Limit Cycle Attractor)</p>
                  <p className="text-slate-400 leading-normal">高維相平面中的閉合振盪流形。代表週期性的節律運算，如大腦控制行走步調、呼吸以及巴金森氏症中的病理性大震顫。系統會從軌道內外收縮鎖定到此環路中。</p>
                </div>
              )}
              {attractorType === 'saddle' && (
                <div className="space-y-1">
                  <p className="text-slate-200 font-semibold">● 鞍點與決策分岔 (Saddle Point & Bifurcation)</p>
                  <p className="text-slate-400 leading-normal">特徵值兼具正實部與負實部。是控制流速場的決策分水嶺。高維螺旋 pointsC 在噪聲拉大時逼近鞍點會產生極高敏感的偏流，從而展現大腦在隨機雜訊下進行非線性決策分岔的真實物理過程！</p>
                </div>
              )}
              {attractorType === 'chaos' && (
                <div className="space-y-1">
                  <p className="text-slate-200 font-semibold">● 奇異吸引子 (Lorenz Chaos Attractor)</p>
                  <p className="text-slate-400 leading-normal">非線性高度敏感的無窮自相似分形吸引子。健康大腦皮質內部包含天然的微觀混沌增益 (g &gt; 1.5)，能為前運動皮質和小腦提供極其豐富的動力學頻率基底，供 FORCE 演算法線上合成運動。</p>
                </div>
              )}
            </div>

            {/* 3D Attractor Interactive Panel */}
            <div className="border-t border-slate-800 pt-3 mt-3 space-y-3">"""

content = content.replace(old_3d_panel_footer, new_3d_panel_footer)

# -------------------------------------------------------------
# 6. 替換整個 PodcastTabComponent 加入 NotebookLM AI 語音製作艙
# -------------------------------------------------------------
old_podcast_component = """function PodcastTabComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [progress, setProgress] = useState(0);
  const [activeDialogueIndex, setActiveDialogueIndex] = useState(0);
  const [eqHeights, setEqHeights] = useState([12, 8, 20, 16, 5, 24, 12, 18, 10, 15, 7, 22]);

  const [podcastSource, setPodcastSource] = useState('default'); // 'default', 'neuron2009', 'slowmanifold2013', 'bmi_clinical', 'custom'
  const [customSourceText, setCustomSourceText] = useState('');
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationLogs, setGenerationLogs] = useState([]);

  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  // Initialize Speech Synthesis safely with try-catch to bypass Sandboxed Iframe SecurityError
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    } catch (e) {
      console.warn("Speech synthesis is restricted or unavailable in this sandboxed context:", e);
    }
    return () => {
      try {
        if (synthRef.current) {
          synthRef.current.cancel();
        }
      } catch (e) {
        // fail silent
      }
    };
  }, []);

  const defaultDialogues = [
    {
      speaker: "主持人 Host (AI)",
      text: "歡迎收聽『醫學與人工智慧動力學』電台！今天我們非常榮幸，再次邀請到專精於腎臟科與認知神經科學雙領域的醫師專家。Dr., 您在臨床上時常需要面對複雜的多變量系統，而近期您似乎將研究目光轉向了 David Sussillo 教授所提倡的「神經群體動力學 (Neural Population Dynamics)」，這與以往我們學的單一細胞電生理有什麽不同呢？",
      time: "00:00"
    },
    {
      speaker: "醫師專家 Guest (You)",
      text: "主持人好，各位聽眾好。以往在臨床和基礎電生理中，我們非常在乎單一神經元的激發，比如用一維的 LIF 微分方程去描述膜電壓。但當你真正進入新皮質，比如負責精密手指運動的運動皮質，你會發現單個神經元的放電看起來雜亂無章。然而大腦肌肉控制卻精確無比。Sussillo 的核心概念就是，我們必須將整個神經元群體投射到高維狀態空間（State Space），研究其群體軌跡（Population Trajectory）的幾何學！",
      time: "00:45"
    },
    {
      speaker: "主持人 Host (AI)",
      text: "這聽起來像是幾何拓樸學！所以大腦運算，在微分方程的幾何角度來看，其實是在操作特定的「吸引子 (Attractors)」囉？",
      time: "01:25"
    },
    {
      speaker: "醫師專家 Guest (You)",
      text: "完全正確。在幾何相平面中，當我們令微分方程系統 dx/dt = 0 時，會找到很多固定點（Fixed Points）。如果特徵值實部為負，狀態就會被吸進去，形成吸引子。大腦就是靠吸引子來存儲工作記憶的——比如眼球注視某個方向，背後的微分方程就是一個穩定的「線吸引子（Line Attractor）」，受到微小噪聲擾動也能快速拉回，這使得記憶可以持續存在而不失真。",
      time: "02:05"
    },
    {
      speaker: "主持人 Host (AI)",
      text: "這真的把數學跟臨床生理學完美結合了！那我們知道 David Sussillo 最廣為人知的成就是穩定了混亂突觸網路的『FORCE 演算法』。這在運動規劃上扮演什麽角色呢？",
      time: "02:45"
    },
    {
      speaker: "醫師專家 Guest (You)",
      text: "這非常有意思。當神經網路的反饋增益 g 大於 1.5 時，網路微分方程會進入高度混沌狀態，流速無法控制。Sussillo 提出的 FORCE 算法利用遞迴最小平方（RLS），在不改變內部突觸連接的情況下，僅僅快速校準輸出 Readout 突觸，就能把混沌在幾毫秒內穩定下來，變成優美的正弦波或複雜時間軌跡。大腦的小腦與運動皮質就是用這套機制，快速在混亂電生理背景中規劃精細的外科或演奏動作。",
      time: "03:30"
    },
    {
      speaker: "主持人 Host (AI)",
      text: "最後，關於多工運算（Multitask），Sussillo 提出的「動力學基元 (Dynamical Motifs)」又是如何讓同一個網路能同時執行多個臨床或認知功能呢？",
      time: "04:15"
    },
    {
      speaker: "醫師專家 Guest (You)",
      text: "傳統上大家覺得，如果網路學了新東西，舊的東西就會被覆蓋，這叫災難性遺忘。防範這點的方法是將不同的任務動力學，放在不同的低維正交子空間中，就像在網絡裡放了多套正交向量場，當切換輸入時系統切換平行相平面，完美實現認知多工，對我們理解前額葉機制有決定性临床啟示！",
      time: "04:55"
    }
  ];

  const sourceTemplates = {
    neuron2009: [
      {
        speaker: "主持人 Host (AI)",
        text: "歡迎收聽『智慧播客合成電台』！今天我們的主題聚焦於 David Sussillo 教授於 2009 年發表在 Neuron 的奠基論文——FORCE 混沌循環網路穩定化學習。Dr.，這套著名的 RLS 線上更新突觸 Readout 演算法，在我們理解大腦運算上扮演了什麼角色？",
        time: "00:00"
      },
      {
        speaker: "醫師專家 Guest (You)",
        text: "主持人好，各位聽眾好。這篇 2009 年的論文簡集是計算神經科學的里程碑。以往大家都把混沌（g > 1.5）看作是一種破壞系統的干擾；但 Sussillo 卻巧妙地利用混沌網路豐富的隨機頻率作為基底，透過反饋迴路，在不改變內部突觸的情況下，僅線上微調 Readout 突觸，就能在幾毫秒內把紊亂流速降伏為精美的特定目標軌跡！大腦的小腦與前運動皮質就是用這套 FORCE 遞迴更新機制，在嘈雜的生理背景下規劃出極為精細的外科手術手勢。",
        time: "00:45"
      },
      {
        speaker: "主持人 Host (AI)",
        text: "原來如此！利用隨機混沌作為天然素材，只需線上快速約束 Readout 就能生成精細規劃！這就是 First-Order 控制的數學魅力。這對於臨床上有什麼深刻啟示呢？",
        time: "01:40"
      },
      {
        speaker: "醫師專家 Guest (You)",
        text: "臨床上，這揭示了為什麼單個神經元的活動看起來雜亂無章，但我們的肌肉運動卻極其精確。因為大腦操作的是整個群體動力學流形。FORCE 穩定機制使我們能夠以極具彈性的方式，在不破壞大腦原本突觸架構的前提下，快速學習新的運動技能，這是大腦高度可塑性與運算效率的完美體現！",
        time: "02:20"
      }
    ],
    slowmanifold2013: [
      {
        speaker: "主持人 Host (AI)",
        text: "歡迎來到播客合成空間！今天我們要探討的是 2013 年 Sussillo & Barak 發表的『慢速流形 (Slow Manifolds)』與固定點 Jacobian 特徵值分析。這項研究是如何幫助我們打開 RNN 這顆幾何黑盒子的？",
        time: "00:00"
      },
      {
        speaker: "醫師專家 Guest (You)",
        text: "主持人好。2013 年的這篇論文成功用拓樸動力系統學解構了 RNN 的多工運算本質。當我們訓練好一個網絡，我們不能只看個別突觸，必須去尋找系統流速 dx/dt ≈ 0 的慢速流形（Slow Manifold）。藉由 L-BFGS 優化，我們發現網路並非靠單一固定點運作，而是利用一條連續的、高度正交的 PC 低維慢速流形來儲存 and 處理多種任務。當收到外部 Go 信號時，系統會跨越 weakly-unstable 的 saddle points 決策邊界進行決策分岔，這將高維微分方程的解析提升到了純粹的幾何美學層面！",
        time: "00:50"
      },
      {
        speaker: "主持人 Host (AI)",
        text: "太不可思議了！高維非線性系統的複雜行為，竟然能被簡化為 PC1, PC2, PC3 子空間中的『不穩定螺旋與鞍點分流幾何』！這對於我們探討大腦前額葉的多工決策有何臨床意義？",
        time: "01:50"
      },
      {
        speaker: "醫師專家 Guest (You)",
        text: "這給了我們解釋人類多工認知機制的鑰匙。當大腦在前額葉進行複雜決策時，不同任務的動力學軌跡被完美放置在互相正交的低維子空間中。工程師們就像同一個突觸網絡中畫了多套正交的向量場。當大腦切換外部輸入信號時，微分方程的相平面發生微小平移，調用平行正交的幾何基元去運算，這徹底防止了任務間的災難性遺忘，為多工認知和持續學習提供了終極的幾何學解釋！",
        time: "02:35"
      }
    ],
    bmi_clinical: [
      {
        speaker: "主持人 Host (AI)",
        text: "歡迎收聽『醫學前沿播客』！今天我們聚焦於 David Sussillo 的群體動力學如何應用於前沿的臨床腦機介面 (BMI) 與肢體控制。這對於神經科醫師而言有著怎樣的變革性影響？",
        time: "00:00"
      },
      {
        speaker: "醫師專家 Guest (You)",
        text: "主持人好。在傳統腦機介面中，我們常試圖把個別神經元的激發頻率與單個手指肌肉一一對應，但這往往極不穩定且雜訊極大。Sussillo 的流形解碼理論帶來了範式轉移：我們應該直接記錄大批神經元並投射到低維主成分空間，解碼整個『群體軌跡幾何學（Manifold Decoders）』！這能提供極為穩定、抗噪聲的意念控制信號。在臨床上，這讓我們能以無比流暢的方式，引導患者利用額葉的運動流形，精準操縱高難度的多自由度外科義肢，為運動皮質功能的臨床重建提供了堅實的微分幾何基礎！",
        time: "00:50"
      },
      {
        speaker: "主持人 Host (AI)",
        text: "這簡直是科幻小說走進現實！所以大腦不需要修改個別突觸，而是操作群體動力學流形！這對未來癱瘓或中風患者的康復解鎖了什麼樣的前景？",
        time: "01:45"
      },
      {
        speaker: "醫師專家 Guest (You)",
        text: "前景無限。這意味著中風康復並非是要修復死去的單個神經元，而是要引導存活的神經元群體重新融合、投影出一個平滑且功能正交的低維運動流形。基於群體幾何解碼的閉環電刺激，可以大幅加速神經網絡的重新適應與學習。這項大腦幾何動力學的學術成果，正在為未來神經康復與外骨骼臨床操縱鋪平最完美的科學道路！",
        time: "02:30"
      }
    ]
  };

  const [currentDialogues, setCurrentDialogues] = useState(defaultDialogues);

  // Speech Synthesizer engine speak line with full try-catch guard
  const speakLine = (index, activePlay) => {
    try {
      if (!synthRef.current || !activePlay) return;

      synthRef.current.cancel(); 

      const currentLine = currentDialogues[index];
      const utterance = new SpeechSynthesisUtterance(currentLine.text);

      // 強制設定繁體中文 (zh-TW) 語系與極大化音量 (1.0)，防止瀏覽器因語言錯亂或未設定而發出蚊子聲或靜音
      utterance.lang = 'zh-TW';
      utterance.volume = 1.0;

      const voices = synthRef.current.getVoices();
      const zhVoice = voices.find(v => v.lang === 'zh-TW' || v.lang === 'zh_TW') ||
                      voices.find(v => v.lang.toLowerCase().includes('zh')) ||
                      voices.find(v => v.lang.toLowerCase().includes('cmn'));
      if (zhVoice) {
        utterance.voice = zhVoice;
      }

      const isHost = currentLine.speaker.includes("Host");
      utterance.pitch = isHost ? 1.15 : 0.85;
      utterance.rate = playbackSpeed * (isHost ? 1.05 : 0.95);

      utterance.onstart = () => {
        setActiveDialogueIndex(index);
        setProgress((index * 100) / currentDialogues.length);
      };

      utterance.onend = () => {
        const nextIndex = index + 1;
        if (nextIndex < currentDialogues.length && isPlaying) {
          speakLine(nextIndex, true);
        } else if (nextIndex >= currentDialogues.length) {
          setIsPlaying(false);
          setProgress(100);
        }
      };

      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis API call failed or is sandboxed:", e);
      simulateProgressFallback(index);
    }
  };

  const fallbackIntervalRef = useRef(null);
  const simulateProgressFallback = (index) => {
    if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
    
    let localProg = (index * 100) / currentDialogues.length;
    setProgress(localProg);
    setActiveDialogueIndex(index);

    fallbackIntervalRef.current = setInterval(() => {
      localProg += 2.0 * playbackSpeed;
      if (localProg >= 100) {
        setIsPlaying(false);
        setProgress(100);
        clearInterval(fallbackIntervalRef.current);
        return;
      }
      setProgress(localProg);
      const segmentSize = 100 / currentDialogues.length;
      const curIdx = Math.min(Math.floor(localProg / segmentSize), currentDialogues.length - 1);
      setActiveDialogueIndex(curIdx);
    }, 200);
  };"""

# 我們將整個 PodcastTabComponent 替換為完整極致的新版本！
new_podcast_component = """function PodcastTabComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [progress, setProgress] = useState(0);
  const [activeDialogueIndex, setActiveDialogueIndex] = useState(0);
  const [eqHeights, setEqHeights] = useState([12, 8, 20, 16, 5, 24, 12, 18, 10, 15, 7, 22]);

  // NotebookLM AI generation panel state variables
  const [podcastSource, setPodcastSource] = useState('default'); // 'default', 'neuron2009', 'slowmanifold2013', 'bmi_clinical', 'custom'
  const [customSourceText, setCustomSourceText] = useState('');
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationLogs, setGenerationLogs] = useState([]);

  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  // Initialize Speech Synthesis safely with try-catch to bypass Sandboxed Iframe SecurityError
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    } catch (e) {
      console.warn("Speech synthesis is restricted or unavailable in this sandboxed context:", e);
    }
    return () => {
      try {
        if (synthRef.current) {
          synthRef.current.cancel();
        }
      } catch (e) {
        // fail silent
      }
    };
  }, []);

  const defaultDialogues = [
    {
      speaker: "主持人 Host (AI)",
      text: "歡迎收聽『醫學與人工智慧動力學』電台！今天我們非常榮幸，再次邀請到專精於腎臟科與認知神經科學雙領域的醫師專家。Dr., 您在臨床上時常需要面對複雜的多變量系統，而近期您似乎將研究目光轉向了 David Sussillo 教授所提倡的「神經群體動力學 (Neural Population Dynamics)」，這與以往我們學的單一細胞電生理有什麽不同呢？",
      time: "00:00"
    },
    {
      speaker: "醫師專家 Guest (You)",
      text: "主持人好，各位聽眾好。以往在臨床和基礎電生理中，我們非常在乎單一神經元的激發，比如用一維的 LIF 微分方程去描述膜電壓。但當你真正進入新皮質，比如負責精密手指運動的運動皮質，你會發現單個神經元的放電看起來雜亂無章。然而大腦肌肉控制卻精確無比。Sussillo 的核心概念就是，我們必須將整個神經元群體投射到高維狀態空間（State Space），研究其群體軌跡（Population Trajectory）的幾何學！",
      time: "00:45"
    },
    {
      speaker: "主持人 Host (AI)",
      text: "這聽起來像是幾何拓樸學！所以大腦運算，在微分方程的幾何角度來看，其實是在操作特定的「吸引子 (Attractors)」囉？",
      time: "01:25"
    },
    {
      speaker: "醫師專家 Guest (You)",
      text: "完全正確。在幾何相平面中，當我們令微分方程系統 dx/dt = 0 時，會找到很多固定點（Fixed Points）。如果特徵值實部為負，狀態就會被吸進去，形成吸引子。大腦就是靠吸引子來存儲工作記憶的——比如眼球注視某個方向，背後的微分方程就是一個穩定的「線吸引子（Line Attractor）」，受到微小噪聲擾動也能快速拉回，這使得記憶可以持續存在而不失真。",
      time: "02:05"
    },
    {
      speaker: "主持人 Host (AI)",
      text: "這真的把數學跟臨床生理學完美結合了！那我們知道 David Sussillo 最廣為人知的成就是穩定了混亂突觸網路的『FORCE 演算法』。這在運動規劃上扮演什麽角色呢？",
      time: "02:45"
    },
    {
      speaker: "醫師專家 Guest (You)",
      text: "這非常有意思。當神經網路的反饋增益 g 大於 1.5 時，網路微分方程會進入高度混沌狀態，流速無法控制。Sussillo 提出的 FORCE 算法利用遞迴最小平方（RLS），在不改變內部突觸連接的情況下，僅僅快速校準輸出 Readout 突觸，就能把混沌在幾毫秒內穩定下來，變成優美的正弦波或複雜時間軌跡。大腦的小腦與運動皮質就是用這套機制，快速在混亂電生理背景中規劃精細的外科或演奏動作。",
      time: "03:30"
    },
    {
      speaker: "主持人 Host (AI)",
      text: "最後，關於多工運算（Multitask），Sussillo 提出的「動力學基元 (Dynamical Motifs)」又是如何讓同一個網路能同時執行多個臨床或認知功能呢？",
      time: "04:15"
    },
    {
      speaker: "醫師專家 Guest (You)",
      text: "傳統上大家覺得，如果網路學了新東西，舊的東西就會被覆蓋，這叫災難性遺忘。防範這點的方法是將不同的任務動力學，放在不同的低維正交子空間中，就像在網絡裡放了多套正交向量場，當切換輸入時系統切換平行相平面，完美實現認知多工，對我們理解前額葉機制有決定性临床啟示！",
      time: "04:55"
    }
  ];

  const sourceTemplates = {
    neuron2009: [
      {
        speaker: "主持人 Host (AI)",
        text: "歡迎收聽『智慧播客合成電台』！今天我們的主題聚焦於 David Sussillo 教授於 2009 年發表在 Neuron 的奠基論文——FORCE 混沌循環網路穩定化學習。Dr.，這套著名的 RLS 線上更新突觸 Readout 演算法，在我們理解大腦運算上扮演了什麼角色？",
        time: "00:00"
      },
      {
        speaker: "醫師專家 Guest (You)",
        text: "主持人好，各位聽眾好。這篇 2009 年的論文簡直是計算神經科學的里程碑。以往大家都把混沌（g > 1.5）看作是一種破壞系統的干擾；但 Sussillo 卻巧妙地利用混沌網路豐富的隨機頻率作為基底，透過反饋迴路，在不改變內部突觸的情況下，僅線上微調 Readout 突觸，就能在幾毫秒內把紊亂流速降伏為精美的特定目標軌跡！大腦的小腦與前運動皮質就是用這套 FORCE 遞迴更新機制，在嘈雜的生理背景下規劃出極為精細的外科手術手勢。",
        time: "00:45"
      },
      {
        speaker: "主持人 Host (AI)",
        text: "原來如此！利用隨機混沌作為天然素材，只需線上快速約束 Readout 就能生成精細規劃！這就是 First-Order 控制的數學魅力。這對於臨床上有什麼深刻啟示呢？",
        time: "01:40"
      },
      {
        speaker: "醫師專家 Guest (You)",
        text: "臨床上，這揭示了為什麼單個神經元的活動看起來雜亂無章，但我們的肌肉運動卻極其精確。因為大腦操作的是整個群體動力學流形。FORCE 穩定機制使我們能夠以極具彈性的方式，在不破壞大腦原本突觸架構的前提下，快速學習新的運動技能，這是大腦高度可塑性與運算效率的完美體現！",
        time: "02:20"
      }
    ],
    slowmanifold2013: [
      {
        speaker: "主持人 Host (AI)",
        text: "歡迎來到播客合成空間！今天我們要探討的是 2013 年 Sussillo & Barak 發表的『慢速流形 (Slow Manifolds)』與固定點 Jacobian 特徵值分析。這項研究是如何幫助我們打開 RNN 這顆幾何黑盒子的？",
        time: "00:00"
      },
      {
        speaker: "醫師專家 Guest (You)",
        text: "主持人好。2013 年的這篇論文成功用拓樸動力系統學解構了 RNN 的多工運算本質。當我們訓練好一個網絡，我們不能只看個別突觸，必須去尋找系統流速 dx/dt ≈ 0 的慢速流形（Slow Manifold）。藉由 L-BFGS 優化，我們發現網路並非靠單一固定點運作，而是利用一條連續的、高度正交的 PC 低維慢速流形來儲存和處理多種任務。當收到外部 Go 信號時，系統會跨越 weakly-unstable 的 saddle points 決策邊界進行決策分岔，這將高維微分方程的解析提升到了純粹的幾何美學層面！",
        time: "00:50"
      },
      {
        speaker: "主持人 Host (AI)",
        text: "太不可思議了！高維非線性系統的複雜行為，竟然能被簡化為 PC1, PC2, PC3 子空間中的『不穩定螺旋與鞍點分流幾何』！這對於我們探討大腦前額葉的多工決策有何臨床意義？",
        time: "01:50"
      },
      {
        speaker: "醫師專家 Guest (You)",
        text: "這給了我們解釋人類多工認知機制的鑰匙。當大腦在前額葉進行複雜決策時，不同任務的動力學軌跡被完美放置在互相正交的低維子空間中。工程師們就像同一個突觸網絡中畫了多套正交的向量場。當大腦切換外部輸入信號時，微分方程的相平面發生微小平移，調用平行正交的幾何基元去運算，這徹底防止了任務間的災難性遺忘，為多工認知和持續學習提供了終極的幾何學解釋！",
        time: "02:35"
      }
    ],
    bmi_clinical: [
      {
        speaker: "主持人 Host (AI)",
        text: "歡迎收聽『醫學前沿播客』！今天我們聚焦於 David Sussillo 的群體動力學如何應用於前沿的臨床腦機介面 (BMI) 與肢體控制。這對於神經科醫師而言有著怎樣的變革性影響？",
        time: "00:00"
      },
      {
        speaker: "醫師專家 Guest (You)",
        text: "主持人好。在傳統腦機介面中，我們常試圖把個別神經元的激發頻率與單個手指肌肉一一對應，但這往往極不穩定且雜訊極大。Sussillo 的流形解碼理論帶來了範式轉移：我們應該直接記錄大批神經元並投射到低維主成分空間，解碼整個『群體軌跡幾何學（Manifold Decoders）』！這能提供極為穩定、抗噪聲的意念控制信號。在臨床上，這讓我們能以無比流暢的方式，引導患者利用額葉的運動流形，精準操縱高難度的多自由度外科義肢，為運動皮質功能的臨床重建提供了堅實的微分幾何基礎！",
        time: "00:50"
      },
      {
        speaker: "主持人 Host (AI)",
        text: "這簡直是科幻小說走進現實！所以大腦不需要修改個別突觸，而是操作群體動力學流形！這對未來癱瘓或中風患者的康復解鎖了什麼樣的前景？",
        time: "01:45"
      },
      {
        speaker: "醫師專家 Guest (You)",
        text: "前景無限。這意味著中風康復並非是要修復死去的單個神經元，而是要引導存活的神經元群體重新融合、投影出一個平滑且功能正交的低維運動流形。基於群體幾何解碼的閉環電刺激，可以大幅加速神經網絡的重新適應與學習。這項大腦幾何動力學的學術成果，正在為未來神經康復與外骨骼臨床操縱鋪平最完美的科學道路！",
        time: "02:30"
      }
    ]
  };

  const [currentDialogues, setCurrentDialogues] = useState(defaultDialogues);

  // Speech Synthesizer engine speak line with full try-catch guard
  const speakLine = (index, activePlay) => {
    try {
      if (!synthRef.current || !activePlay) return;

      synthRef.current.cancel(); 

      const currentLine = currentDialogues[index];
      const utterance = new SpeechSynthesisUtterance(currentLine.text);

      // 強制設定繁體中文 (zh-TW) 語系與極大化音量 (1.0)，防止瀏覽器因語言錯亂或未設定而發出蚊子聲或靜音
      utterance.lang = 'zh-TW';
      utterance.volume = 1.0;

      const voices = synthRef.current.getVoices();
      const zhVoice = voices.find(v => v.lang === 'zh-TW' || v.lang === 'zh_TW') ||
                      voices.find(v => v.lang.toLowerCase().includes('zh')) ||
                      voices.find(v => v.lang.toLowerCase().includes('cmn'));
      if (zhVoice) {
        utterance.voice = zhVoice;
      }

      const isHost = currentLine.speaker.includes("Host");
      utterance.pitch = isHost ? 1.15 : 0.85;
      utterance.rate = playbackSpeed * (isHost ? 1.05 : 0.95);

      utterance.onstart = () => {
        setActiveDialogueIndex(index);
        setProgress((index * 100) / currentDialogues.length);
      };

      utterance.onend = () => {
        const nextIndex = index + 1;
        if (nextIndex < currentDialogues.length && isPlaying) {
          speakLine(nextIndex, true);
        } else if (nextIndex >= currentDialogues.length) {
          setIsPlaying(false);
          setProgress(100);
        }
      };

      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis API call failed or is sandboxed:", e);
      simulateProgressFallback(index);
    }
  };

  const fallbackIntervalRef = useRef(null);
  const simulateProgressFallback = (index) => {
    if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
    
    let localProg = (index * 100) / currentDialogues.length;
    setProgress(localProg);
    setActiveDialogueIndex(index);

    fallbackIntervalRef.current = setInterval(() => {
      localProg += 2.0 * playbackSpeed;
      if (localProg >= 100) {
        setIsPlaying(false);
        setProgress(100);
        clearInterval(fallbackIntervalRef.current);
        return;
      }
      setProgress(localProg);
      const segmentSize = 100 / currentDialogues.length;
      const curIdx = Math.min(Math.floor(localProg / segmentSize), currentDialogues.length - 1);
      setActiveDialogueIndex(curIdx);
    }, 200);
  };

  // NotebookLM Podcast generation simulator
  const handleGeneratePodcast = () => {
    setIsGeneratingPodcast(true);
    setGenerationProgress(0);
    setGenerationLogs([]);

    const logs = [
      "[NotebookLM AI] 🔎 讀取文獻資料庫...",
      "[NotebookLM AI] 📖 載入文獻：Sussillo Series 計算神經科學奠基文獻...",
      "[NotebookLM AI] 🧠 正在分析與建模群體動力學主子空間 (State Space)...",
      "[NotebookLM AI] ⚙️ 正在校對 RLS 反饋與一階突觸穩定協方差矩陣 (P矩陣)...",
      "[NotebookLM AI] ✍️ 生成主體對話大綱：『大腦計算幾何與多工認知動力學』...",
      "[NotebookLM AI] 🎙️ 合成 Host 語氣：" + (podcastSource === 'neuron2009' ? "探索混沌穩定與第一代控制算法..." : podcastSource === 'slowmanifold2013' ? "解構 PC 慢速流形與 Jacobian 特徵值..." : podcastSource === 'bmi_clinical' ? "介紹臨床腦機介面流形解碼器..." : "解析客製化臨床大腦微分方程計算學..."),
      "[NotebookLM AI] 🎙️ 合成 Guest 語氣：" + (podcastSource === 'custom' ? "結合臨床實例分析：" + (customSourceText.substring(0, 15) or "自定義主題") + "..." : "大腦小腦、前額葉子空間正交計算與臨床適應性..."),
      "[NotebookLM AI] 🔊 Web Speech API 頻譜儀聲學軌跡與相對不應期參數對齊中...",
      "[NotebookLM AI] 🎉 合成成功！共計生成 4 組高品質臨床與數值動力學廣播對話！"
    ];

    let logIdx = 0;
    const logInterval = setInterval(() => {
      if (logIdx < logs.length) {
        setGenerationLogs(prev => [...prev, logs[logIdx]]);
        setGenerationProgress(Math.floor(((logIdx + 1) / logs.length) * 100));
        logIdx += 1;
      } else {
        clearInterval(logInterval);
        
        // Update currentDialogues depending on chosen source
        let newDialogues = defaultDialogues;
        if (podcastSource === 'neuron2009') {
          newDialogues = sourceTemplates.neuron2009;
        } else if (podcastSource === 'slowmanifold2013') {
          newDialogues = sourceTemplates.slowmanifold2013;
        } else if (podcastSource === 'bmi_clinical') {
          newDialogues = sourceTemplates.bmi_clinical;
        } else if (podcastSource === 'custom') {
          const usrTxt = customSourceText.trim() || "自訂神經動力學探索";
          newDialogues = [
            {
              speaker: "主持人 Host (AI)",
              text: "歡迎收聽專屬合成播客！今天我們根據 Dr. 提供的客製化醫學文獻，探討一個極具深度的臨床新主題。Dr.，您提供的核心文獻指出：" + usrTxt.substring(0, 45) + "...，這對神經內科或腎臟學的多變量運算有何啟示？",
              time: "00:00"
            },
            {
              speaker: "醫師專家 Guest (You)",
              text: "主持人好。您提到的這點非常關鍵。在我們提供的文獻中，大腦微分方程：" + usrTxt + "，這代表系統不會坍縮，而是沿著穩定的低維正交流形來調製各核團的自發放電。這讓我們能以更加宏觀的拓樸學視野，重新解構運動障礙與臨床多變量動態！",
              time: "00:45"
            },
            {
              speaker: "主持人 Host (AI)",
              text: "這真的為臨床診斷提供了革命性的幾何數學工具！這項專屬客製化主題的生成，再次證實了大腦動力學就是幾何拓樸學！",
              time: "01:35"
            },
            {
              speaker: "醫師專家 Guest (You)",
              text: "是的，不論是小腦的 FORCE 連接穩定性，還是前額葉的動力學基元 (Dynamical Motifs)，大腦都在用正交子空間抵抗遺忘與雜訊。這為未來的臨床康復提供了無比完美的指引！",
              time: "02:15"
            }
          ];
        }

        setCurrentDialogues(newDialogues);
        setActiveDialogueIndex(0);
        setProgress(0);
        setIsPlaying(false);
        setIsGeneratingPodcast(false);
      }
    }, 450);
  };"""

# 修復 Python 內 substring or 取值的寫法
new_podcast_component = new_podcast_component.replace('customSourceText.substring(0, 15) or "自定義主題"', 'customSourceText.substring(0, 15) || "自定義主題"')
content = content.replace(old_podcast_component, new_podcast_component)

# -------------------------------------------------------------
# 7. 替換 dialogues.map 與 dialogues.length 等為 currentDialogues
# -------------------------------------------------------------
content = content.replace("progress * 0.05", "progress * 0.03") # 稍微校準進度時間顯示
content = content.replace("dialogues.length", "currentDialogues.length")
content = content.replace("dialogues.map", "currentDialogues.map")
content = content.replace("dialogues[index]", "currentDialogues[index]")

# -------------------------------------------------------------
# 8. 在 render 返回中注入 NotebookLM AI 語音製作艙 HTML 結構 (2068行左右)
# -------------------------------------------------------------
old_render_podcast_start = """  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Podcast Dashboard Card */}"""

new_render_podcast_start = """  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      {/* NotebookLM AI Generation Glassmorphic Panel overlay */}
      {isGeneratingPodcast && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md rounded-3xl z-30 flex flex-col items-center justify-center p-8 border border-indigo-500/20 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-5 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-300" style={{ width: `${generationProgress}%` }}></div>
            
            <div className="flex items-center justify-center space-x-2 text-indigo-400">
              <span className="text-2xl animate-spin">🌀</span>
              <span className="text-sm font-extrabold tracking-widest uppercase">NotebookLM AI 語音合成艙</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                <span>Podcast Synthesis Progress</span>
                <span className="text-cyan-400">{generationProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300" style={{ width: `${generationProgress}%` }}></div>
              </div>
            </div>

            {/* Terminal Live Rolling Logs */}
            <div className="bg-[#020617] border border-slate-850 p-4 rounded-xl text-left font-mono text-[9px] text-emerald-400 h-44 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 space-y-1 shadow-inner">
              {generationLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed animate-in fade-in slide-in-from-left-1 duration-150">
                  {log}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 italic">正在運用 Sussillo 群體相平面與 RLS 公式優化 Host 與 Guest 臨床演講語音檔...</p>
          </div>
        </div>
      )}

      {/* NotebookLM AI Generation Control Glass Cabin */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 backdrop-blur-md">
        <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
          <span>📚</span>
          <span className="tracking-wider uppercase">NotebookLM 播客製作工作艙 (Sources Integration)</span>
        </div>
        <p className="text-xs text-slate-300 leading-normal">
          請選擇您希望 AI 播客吸收學習的核心文獻 Sources（可多選或自訂輸入），AI 將自動提取 Sussillo 連續時間 RNN 混沌與幾何流形公式，生成全新的一對一醫學播客廣播內容！
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { id: 'default', title: 'Ep.02 預設電台', desc: '神經群體流形幾何學基礎' },
            { id: 'neuron2009', title: 'Neuron 2009 論文', desc: 'Sussillo FORCE 混沌學習公式' },
            { id: 'slowmanifold2013', title: 'Nature 2013 論文', desc: 'Barak 慢速流形與特徵值分析' },
            { id: 'bmi_clinical', title: '臨床 BMI 流形', desc: '大腦主成分運動解碼與義肢控制' }
          ].map(src => (
            <button
              key={src.id}
              onClick={() => setPodcastSource(src.id)}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition ${
                podcastSource === src.id 
                  ? 'bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-950/20' 
                  : 'bg-slate-950/40 border-slate-850 hover:border-slate-700 hover:bg-slate-900/20'
              }`}
            >
              <span className={`text-xs font-bold ${podcastSource === src.id ? 'text-indigo-300' : 'text-slate-200'}`}>{src.title}</span>
              <span className="text-[10px] text-slate-500 mt-1 leading-snug">{src.desc}</span>
            </button>
          ))}
        </div>

        {/* Custom source input text area */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">✏️ 自定義臨床醫師/專家補充來源文本 (Custom Source)：</label>
          <textarea
            value={customSourceText}
            onChange={e => {
              setCustomSourceText(e.target.value);
              setPodcastSource('custom');
            }}
            placeholder="例如：請在此輸入您自己的電生理或醫學觀點，例如『當前皮質運動計畫由 $x(t) = \Sigma v_k y_k(t) + x_0$ 描述，我們在臨床腦機介面中...』"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 focus:border-indigo-500 outline-none h-20 placeholder-slate-600 resize-none font-sans font-medium"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGeneratePodcast}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5"
          >
            <span>🚀</span>
            <span>開始合成新播客主題</span>
          </button>
        </div>
      </div>

      {/* Podcast Dashboard Card */}"""

content = content.replace(old_render_podcast_start, new_render_podcast_start)

# -------------------------------------------------------------
# 寫入更新後內容
# -------------------------------------------------------------
with io.open("ode.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully upgraded ode.tsx with complete premium features!")
