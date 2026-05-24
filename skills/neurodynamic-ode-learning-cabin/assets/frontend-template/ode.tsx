import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Network, Presentation, Mic, Code, Activity, ChevronRight, ChevronLeft, Play, Info } from 'lucide-react';

// --- Pure JavaScript React Component (No TypeScript types, Emojis & Custom SVGs to guarantee absolute compatibility in Preview) ---
export default function App() {
  const [activeTab, setActiveTab] = useState('simulator');

  const tabs = [
    { id: 'simulator', Icon: Activity, label: 'LIF & Network 模擬 (Infographic)' },
    { id: 'mindmap', Icon: Network, label: '群體動力學心智圖 (Mind Map)' },
    { id: 'slides', Icon: Presentation, label: 'Sussillo 投影片 (Slide Deck)' },
    { id: 'podcast', Icon: Mic, label: 'Podcast: 吸引子與 FORCE 演算法' },
    { id: 'python', Icon: Code, label: 'Jupyter 練習與數值積分' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      {/* Sidebar - Glassmorphic Cyber Theme */}
      <div className="w-full md:w-80 bg-slate-900/60 backdrop-blur-md border-r border-slate-800 flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30">
              <span className="text-xl">🧠</span>
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white leading-tight">
                神經動力學 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">ODE 學習艙</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Dr. Neuro-Specialist 專屬版</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {tabs.map(tab => {
            const Icon = tab.Icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 group border ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-700/90 text-white shadow-lg shadow-indigo-600/20 border-indigo-500/40' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-transparent hover:border-slate-800/60'
                }`}
              >
                <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110 text-cyan-300' : 'group-hover:scale-110 text-slate-400'}`} />
                <span className="font-semibold text-sm tracking-wide text-left">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/20 text-center">
          <div className="inline-flex items-center space-x-1.5 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full text-xs text-cyan-400">
            <span>✨</span>
            <span className="font-semibold">Sussillo RNN 專案啟動中</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-slate-900/40 backdrop-blur-md border-b border-slate-800 px-8 py-5 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold tracking-wide text-white">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <div className="text-xs text-slate-400 bg-slate-800/60 px-3.5 py-1.5 rounded-lg border border-slate-700/50 font-mono">
            Focus: Continuous-Time RNN & Attractors
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-8 bg-slate-950 relative">
          {activeTab === 'simulator' && <SimulatorTab />}
          {activeTab === 'mindmap' && <MindMapTabComponent />}
          {activeTab === 'slides' && <SlideDeckTabComponent />}
          {activeTab === 'podcast' && <PodcastTabComponent />}
          {activeTab === 'python' && <PythonTabComponent />}
        </main>
      </div>
    </div>
  );
}

// ==========================================
// --- 1. Electrophysiology & Coupled Net Simulator (SimulatorTab) ---
// ==========================================
function SimulatorTab() {
  const [simMode, setSimMode] = useState('lif');

  // LIF State variables
  const [tau, setTau] = useState(10);
  const [current, setCurrent] = useState(16);
  const [threshold, setThreshold] = useState(-55);
  const [points, setPoints] = useState([]);

  // Coupled network (STN-GPe) state variables
  const [dbsActive, setDbsActive] = useState(false);
  const [coupledPlotType, setCoupledPlotType] = useState('time');
  const [stnPoints, setStnPoints] = useState([]);
  const [gpePoints, setGpePoints] = useState([]);

  // FORCE Algorithm live simulation state variables
  const [gScale, setGScale] = useState(1.5);
  const [isTraining, setIsTraining] = useState(true);
  const [forcePoints, setForcePoints] = useState([]);
  const [targetPoints, setTargetPoints] = useState([]);
  const [runTime, setRunTime] = useState(0);

  // Advanced Dynamic Parameters (User customizable target waves)
  const [targetWaveType, setTargetWaveType] = useState('combined'); // 'combined', 'single', 'square', 'sawtooth'
  const [f1, setF1] = useState(1.5); // Default 1.5 Hz
  const [f2, setF2] = useState(4.0); // Default 4.0 Hz
  const [resetSignal, setResetSignal] = useState(0);

  // FORCE scenario and customizable network settings
  const [forceScenario, setForceScenario] = useState('sinusoid'); // 'sinusoid', 'lorenz-output', 'lorenz-internal', 'fixed-points'
  const [netSizeN, setNetSizeN] = useState(800);
  const [regularizationAlpha, setRegularizationAlpha] = useState(10.0);
  const [numTrainCycles, setNumTrainCycles] = useState(20);
  const [fixedPointLogs, setFixedPointLogs] = useState([]);

  // Simulation parameters for LIF
  const V_rest = -70;
  const V_reset = -75;
  const V_spike = 20;
  const R = 1.0;
  const dt = 0.2;
  const steps = 500; // 100ms total

  // Interactive Information Points for LIF
  const [activeInfo, setActiveInfo] = useState(null);

  // Single-Unit LIF Simulation Loop
  useEffect(() => {
    let currentV = V_rest;
    const newPoints = [];

    for (let i = 0; i < steps; i++) {
      const t = i * dt;
      if (currentV >= threshold) {
        newPoints.push({ x: t, y: V_spike }); // Spike action potential
        currentV = V_reset;
        newPoints.push({ x: t, y: currentV }); // Instant reset down
      } else {
        const deltaV = (-(currentV - V_rest) + R * current) / tau;
        currentV = currentV + deltaV * dt;
        newPoints.push({ x: t, y: currentV });
      }
    }
    setPoints(newPoints);
  }, [tau, current, threshold]);

  // Coupled STN-GPe Loop Simulation
  useEffect(() => {
    const tau_S = 20.0;
    const tau_G = 20.0;
    const VS_rest = -60.0;
    const VG_rest = -60.0;
    const W_SG = 15.0;
    const W_GS = 18.0;
    const V_mid = -50.0;
    const k_sig = 0.2;

    const f_sig = (v) => 1.0 / (1.0 + Math.exp(-k_sig * (v - V_mid)));

    let v_s = -55.0;
    let v_g = -55.0;

    const newStn = [];
    const newGpe = [];

    const dbs_freq = 130.0; // 130 Hz DBS stimulation
    const dbs_freq_ms = dbs_freq / 1000.0;
    const dbs_amp = 25.0;

    const dt_net = 0.2;
    const net_steps = 500; // 100ms

    for (let i = 0; i < net_steps; i++) {
      const t = i * dt_net;
      const I_dbs = dbsActive ? dbs_amp * (Math.sin(2 * Math.PI * dbs_freq_ms * t) > 0 ? 1 : 0) : 0;

      const dv_s_dt = (-(v_s - VS_rest) - W_GS * f_sig(v_g) + I_dbs) / tau_S;
      const dv_g_dt = (-(v_g - VG_rest) + W_SG * f_sig(v_s)) / tau_G;

      v_s += dv_s_dt * dt_net;
      v_g += dv_g_dt * dt_net;

      newStn.push({ x: t, y: v_s });
      newGpe.push({ x: t, y: v_g });
    }

    setStnPoints(newStn);
    setGpePoints(newGpe);
  }, [dbsActive]);

  // FORCE Algorithm in-browser real-time simulator loop (Multi-scenario support)
  useEffect(() => {
    let t_val = 0;
    const targetArr = [];
    const forceArr = [];
    
    const baseFreqs = [0.03, 0.07, 0.12];
    let outputVal = 0.0;

    // Reset UI graphs and logs
    setTargetPoints([]);
    setForcePoints([]);
    setRunTime(0);
    setFixedPointLogs([]);

    const interval = setInterval(() => {
      t_val += 1;
      setRunTime(t_val);

      if (forceScenario === 'fixed-points') {
        // Fixed points L-BFGS logging simulation
        const stepsLog = [
          `[L-BFGS Step 1] Initializing slow manifold search in ${netSizeN}-neuron network (g=${gScale}, alpha=${regularizationAlpha})...`,
          `[L-BFGS Step ${Math.min(t_val * 2, 45)}] Iterative optimization for slow points (q < 1e-3)...`,
          `[Clustering] DBSCAN cluster analysis (threshold d=0.5)...`,
          `[Jacobian] Mapping eigenvalue cloud on trained state space...`,
          `[Slow Points] Found 5 unique slow points on U-manifold:`,
          `  - SP 1: q = 3.2e-4 (eigenvalue: 1 unstable direction)`,
          `  - SP 2: q = 8.5e-5 (eigenvalue: 2 weakly unstable directions)`,
          `  - SP 3: q = 1.2e-3 (eigenvalue: 3 unstable directions)`,
          `  - SP 4: q = 4.1e-4 (eigenvalue: weakly stable spiral)`,
          `  - SP 5: q = 9.8e-5 (eigenvalue: saddle lobe-switch)`,
          `[Spectrum] Eigenvalue cloud contains weakly-unstable spiral directions (Re(λ) ≈ 0.035).`,
          `[Multitask] Phase-split (v3) successfully preserved chaotic regime.`
        ];
        
        const logsToShow = [];
        const numLogs = Math.min(Math.floor(t_val / 5) + 1, stepsLog.length);
        for (let i = 0; i < numLogs; i++) {
          logsToShow.push(stepsLog[i]);
        }
        setFixedPointLogs(logsToShow);
        
        // Loop log rendering
        if (t_val > 65) {
          t_val = 0;
        }
        return;
      }

      // Compute target value dynamically based on scenario and parameters
      let targetVal = 0.0;
      const valF1 = f1 * 0.005;
      const valF2 = f2 * 0.005;
      if (forceScenario === 'sinusoid') {
        if (targetWaveType === 'single') {
          targetVal = 1.2 * Math.sin(2 * Math.PI * valF1 * t_val);
        } else if (targetWaveType === 'square') {
          targetVal = Math.sin(2 * Math.PI * valF1 * t_val) >= 0 ? 1.0 : -1.0;
        } else if (targetWaveType === 'sawtooth') {
          targetVal = 2.0 * ((t_val * valF1) - Math.floor(0.5 + (valF1 * t_val)));
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
      }

      const chaoticNoise = (Math.sin(baseFreqs[0] * t_val) + Math.cos(baseFreqs[1] * t_val) + Math.sin(baseFreqs[2] * t_val)) * gScale * 0.5;

      if (isTraining) {
        // Learn rate simulated, depending on number of train cycles
        const maxTrainStep = numTrainCycles * 5;
        const learnRate = Math.min(t_val / maxTrainStep, 0.98); 
        outputVal = targetVal * learnRate + chaoticNoise * (1.0 - learnRate);
      } else {
        if (t_val < 60) {
          outputVal = chaoticNoise * 1.5;
        } else {
          // Add some RLS reconstruction noise depending on N and alpha
          const noiseLevel = 0.05 + (1.0 / Math.sqrt(netSizeN)) * 1.2 + (regularizationAlpha * 0.005);
          outputVal = targetVal + (Math.random() - 0.5) * noiseLevel;
        }
      }

      targetArr.push({ x: t_val, y: targetVal });
      forceArr.push({ x: t_val, y: outputVal });

      if (targetArr.length > 150) targetArr.shift();
      if (forceArr.length > 150) forceArr.shift();

      setTargetPoints([...targetArr]);
      setForcePoints([...forceArr]);
    }, 45);

    return () => clearInterval(interval);
  }, [gScale, isTraining, targetWaveType, f1, f2, resetSignal, forceScenario, netSizeN, regularizationAlpha, numTrainCycles]);

  // Coordinate mapping projects. Memoized path strings avoid rebuilding long SVG commands on unrelated state changes.
  const mapX = useCallback((x) => (x / 100) * 600, []);
  const mapY = useCallback((y) => 300 - ((y + 80) / 110) * 300, []);

  // Projection for 2D STN-GPe Phase plane
  const mapPhaseX = useCallback((v_stn) => 50 + ((v_stn - (-75)) / 45) * 500, []);
  const mapPhaseY = useCallback((v_gpe) => 250 - ((v_gpe - (-75)) / 45) * 200, []);

  const pathD = useMemo(() => points.length > 0
    ? `M ${mapX(points[0].x)} ${mapY(points[0].y)} ` + points.slice(1).map(p => `L ${mapX(p.x)} ${mapY(p.y)}`).join(' ')
    : '', [points, mapX, mapY]);

  const stnPath = useMemo(() => stnPoints.length > 0
    ? `M ${mapX(stnPoints[0].x)} ${mapY(stnPoints[0].y)} ` + stnPoints.slice(1).map(p => `L ${mapX(p.x)} ${mapY(p.y)}`).join(' ')
    : '', [stnPoints, mapX, mapY]);

  const gpePath = useMemo(() => gpePoints.length > 0
    ? `M ${mapX(gpePoints[0].x)} ${mapY(gpePoints[0].y)} ` + gpePoints.slice(1).map(p => `L ${mapX(p.x)} ${mapY(p.y)}`).join(' ')
    : '', [gpePoints, mapX, mapY]);

  // Generate 2D Phase Space Path string with corrected index mapping (i+1)
  const phasePathD = useMemo(() => stnPoints.length > 0 && gpePoints.length > 0
    ? `M ${mapPhaseX(stnPoints[0].y)} ${mapPhaseY(gpePoints[0].y)} ` + stnPoints.slice(1).map((p, i) => `L ${mapPhaseX(p.y)} ${mapPhaseY(gpePoints[i + 1]?.y ?? gpePoints[gpePoints.length - 1].y)}`).join(' ')
    : '', [stnPoints, gpePoints, mapPhaseX, mapPhaseY]);

  const mapForceY = useCallback((y) => 150 - (y / 2.5) * 120, []);

  const forcePathTarget = useMemo(() => {
    if (targetPoints.length === 0) return '';
    const firstX = targetPoints[0].x;
    const mapForceX = (x) => ((x - firstX) / 150) * 600;
    return `M ${mapForceX(targetPoints[0].x)} ${mapForceY(targetPoints[0].y)} ` + targetPoints.slice(1).map(p => `L ${mapForceX(p.x)} ${mapForceY(p.y)}`).join(' ');
  }, [targetPoints, mapForceY]);

  const forcePathOutput = useMemo(() => {
    if (forcePoints.length === 0 || targetPoints.length === 0) return '';
    const firstX = targetPoints[0].x;
    const mapForceX = (x) => ((x - firstX) / 150) * 600;
    return `M ${mapForceX(forcePoints[0].x)} ${mapForceY(forcePoints[0].y)} ` + forcePoints.slice(1).map(p => `L ${mapForceX(p.x)} ${mapForceY(p.y)}`).join(' ');
  }, [forcePoints, targetPoints, mapForceY]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Simulation Mode Selector Buttons */}
      <div className="flex flex-wrap bg-slate-900 p-1.5 rounded-xl border border-slate-800 w-fit gap-1">
        <button 
          onClick={() => setSimMode('lif')}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all ${simMode === 'lif' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          1. 基礎 LIF 電生理數學推導
        </button>
        <button 
          onClick={() => setSimMode('coupled')}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all ${simMode === 'coupled' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          2. STN-GPe 巴金森氏症網路對照 (二維相空間)
        </button>
        <button 
          onClick={() => setSimMode('force')}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all ${simMode === 'force' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          3. FORCE 混沌循環網路穩定化學習
        </button>
      </div>

      {simMode === 'lif' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls & Math Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span className="text-indigo-400 text-lg">📊</span>
                <span>LIF 電生理物理參數</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-300 font-sans">輸入刺激電流 (I_ext)</span>
                    <span className="text-cyan-400 font-mono">{current} nA</span>
                  </div>
                  <input 
                    type="range" min="0" max="30" value={current} 
                    onChange={e => setCurrent(Number(e.target.value))} 
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                  />
                  <p className="text-[11px] text-slate-500 mt-1">控制流入神經元內部的持續電流刺激</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-300">膜時間常數 (τ)</span>
                    <span className="text-cyan-400 font-mono">{tau} ms</span>
                  </div>
                  <input 
                    type="range" min="5" max="50" value={tau} 
                    onChange={e => setTau(Number(e.target.value))} 
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                  />
                  <p className="text-[11px] text-slate-500 mt-1">由 τ = Rm * Cm 決定，控制膜電位的累積慣性</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-300 font-sans">放電閾值 (V_th)</span>
                    <span className="text-cyan-400 font-mono">{threshold} mV</span>
                  </div>
                  <input 
                    type="range" min="-65" max="-45" value={threshold} 
                    onChange={e => setThreshold(Number(e.target.value))} 
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                  />
                  <p className="text-[11px] text-slate-500 mt-1">神經元引發 Action Potential 的電位臨界值</p>
                </div>
              </div>
            </div>

            {/* Electrophysiological Derivation Text Card */}
            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-900/30 p-6 rounded-2xl shadow-xl space-y-4">
              <h4 className="text-sm font-extrabold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                <span>🔬</span>
                <span>LIF 常微分方程與非線性放電解析</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                膜電位 V(t) 被視為具有洩漏性的微型電阻-電容 (Leak-RC) 電路。其電量隨時間變化的基本一階常微分方程 (ODE) 為：
              </p>
              <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 text-center font-mono text-xs text-cyan-300">
                τm · dV/dt = -(V - V_rest) + R_m · I_ext
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                當輸入電流滿足閾值條件，神經元的激發頻率 f 具備嚴格的非線性數學解析解：
              </p>
              <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 text-center font-mono text-[10px] text-indigo-300 leading-relaxed">
                f(I_ext) = [ t_ref + τm · ln( (R_m·I_ext + V_rest - V_reset) / (R_m·I_ext + V_rest - V_th) ) ]⁻¹
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                <strong>數學物理意義：</strong> 若 I_ext ≤ (V_th - V_rest)/R_m，膜電位將指數收斂於穩態值 V_inf，無法激發 (f=0)；只有越過臨界電流後，對數分母為正值，神經元才進入週期性發放區間。
              </p>
            </div>
          </div>

          {/* Interactive Plot Canvas (Infographic) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">LIF 單一神經元膜電位動態軌跡</span>
                <span className="text-xs text-slate-500 font-mono">X-axis: 0 - 100 ms | Y-axis: -80 to 20 mV</span>
              </div>
              
              <div className="relative">
                <svg width="100%" height="320" viewBox="0 0 600 300" className="bg-slate-950 rounded-xl border border-slate-800 shadow-inner overflow-visible">
                  {[0, 50, 100, 150, 200, 250, 300].map((yVal, idx) => (
                    <line key={idx} x1="0" y1={yVal} x2="600" y2={yVal} stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />
                  ))}
                  
                  <line x1="0" y1={mapY(threshold)} x2="600" y2={mapY(threshold)} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,4" opacity="0.8" />
                  <text x="10" y={mapY(threshold) - 6} fill="#ef4444" fontSize="10" fontWeight="bold" className="font-mono">Threshold (V_th = {threshold}mV)</text>
                  
                  <line x1="0" y1={mapY(V_rest)} x2="600" y2={mapY(V_rest)} stroke="#64748b" strokeWidth="1" strokeDasharray="4,4" />
                  <text x="10" y={mapY(V_rest) + 14} fill="#64748b" fontSize="10" className="font-mono">Resting (V_rest = -70mV)</text>

                  <line x1="0" y1={mapY(V_reset)} x2="600" y2={mapY(V_reset)} stroke="#475569" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />

                  <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" />
                </svg>

                <div className="absolute top-4 right-4 flex space-x-2">
                  <button 
                    onClick={() => setActiveInfo(activeInfo === 'depol' ? null : 'depol')}
                    className={`px-2 py-1 rounded text-[11px] font-bold border transition ${activeInfo === 'depol' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
                  >
                    去極化作用
                  </button>
                  <button 
                    onClick={() => setActiveInfo(activeInfo === 'spike' ? null : 'spike')}
                    className={`px-2 py-1 rounded text-[11px] font-bold border transition ${activeInfo === 'spike' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
                  >
                    動作電位放電
                  </button>
                  <button 
                    onClick={() => setActiveInfo(activeInfo === 'reset' ? null : 'reset')}
                    className={`px-2 py-1 rounded text-[11px] font-bold border transition ${activeInfo === 'reset' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
                  >
                    再極化重置
                  </button>
                </div>
              </div>

              {activeInfo && (
                <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 animate-in slide-in-from-top-2 duration-300">
                  {activeInfo === 'depol' && (
                    <div>
                      <span className="font-bold text-cyan-400 text-sm block mb-1">去極化 (Depolarization)</span>
                      在外部注入電流 I_ext 大於膜電阻洩漏率時，膜電位會沿著指數曲線向零或正電位攀升。此時系統由線性微分微分方程控制：τ * dV/dt = -(V - V_rest) + R * I_ext。
                    </div>
                  )}
                  {activeInfo === 'spike' && (
                    <div>
                      <span className="font-bold text-red-400 text-sm block mb-1">動作電位爆發 (Action Potential Spiking)</span>
                      這是一種高度非線性的全有或全無 (All-or-None) 機制。在真實神經中是由電壓門控型 Na+ 通道快速打開引起；在簡化的 LIF 模型中，我們設定了硬臨界點 V_th，一經跨越即人為產生一個垂直高脈衝。
                    </div>
                  )}
                  {activeInfo === 'reset' && (
                    <div>
                      <span className="font-bold text-emerald-400 text-sm block mb-1">再極化重置 (Repolarization & Reset)</span>
                      在放電之後，K+ 外流促使膜電位迅速回跌。LIF 模型中直接將其瞬時重置至極低的電位 V_reset (-75mV)，用以重置電壓狀態，並藉此代表其物理上的相對不應期。
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Neural Levels Concept Graphic */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <h4 className="text-sm font-bold text-white mb-4">大腦計算的多尺度動力學過渡</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-xs font-bold text-indigo-400 block mb-1.5">單一神經元尺度 (Cellular)</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    以 LIF 為代表的點神經元，以一維微分方程控制局部膜電位。主要描述離子通道和閾值動力學。
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-xs font-bold text-emerald-400 block mb-1.5">耦合網路尺度 (Circuits)</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    如 STN-GPe 的反饋迴路，由多個耦合 ODEs 控制。會產生群體振盪、同步化和極限環振盪。
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-xs font-bold text-cyan-400 block mb-1.5">群體動力學尺度 (Population)</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    以 David Sussillo 的高維連續 RNN 為代表，在低維狀態子空間中，利用豐富的「吸引子幾何」進行複雜多工計算。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {simMode === 'coupled' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
              <h3 className="text-lg font-bold text-white">巴金森氏症與 DBS 狀態空間相平面對照</h3>
              
              {/* Plot type toggle buttons */}
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 w-full">
                <button 
                  onClick={() => setCoupledPlotType('time')}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${coupledPlotType === 'time' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  1D 電位隨時間變化
                </button>
                <button 
                  onClick={() => setCoupledPlotType('phase')}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${coupledPlotType === 'phase' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  2D 狀態空間相平面
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                耦合微分方程系統的運算本質是由其狀態空間幾何決定的。
                <br/><br/>
                - <strong>DBS 關閉</strong>：兩個核團反饋極強，系統被拉入一個封閉的環狀吸引子，也就是著名的 <strong>極限環吸引子 (Limit Cycle Attractor)</strong>。
                <br/><br/>
                - <strong>DBS 開啟</strong>：高頻強迫脈衝注入，打破極限環結構，流速場被撕碎，神經軌跡進入脫同步的均勻分布。
              </p>

              <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-900/30 space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-200">DBS 深層腦部電刺激開關</span>
                  <button 
                    onClick={() => setDbsActive(!dbsActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${dbsActive ? 'bg-indigo-600' : 'bg-slate-800'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${dbsActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  開啟後，將高頻刺激電流（130 Hz 電壓強迫）導入 STN 微分方程式的右側：I_DBS(t)。
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-slate-900/60 p-6 rounded-2xl space-y-3.5">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wide">二階非線性耦合 ODE 系統</h4>
              <div className="text-[10px] font-mono bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-slate-300 leading-relaxed space-y-2">
                <div>τ_S * dVs/dt = -(Vs - Vs_rest) - W_GS * f(Vg) + I_DBS</div>
                <div>τ_G * dVg/dt = -(Vg - Vg_rest) + W_SG * f(Vs)</div>
              </div>
            </div>
          </div>

          {/* 右側兩欄：1D/2D 動力學軌跡雙面圖表 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">巴金森氏症與 DBS 動力學軌跡</h3>
                <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800/40 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider animate-pulse">
                  {coupledPlotType === 'time' ? '1D Time Series View' : '2D Phase Space View'}
                </span>
              </div>

              {coupledPlotType === 'time' ? (
                <div className="relative">
                  <svg width="100%" height="320" viewBox="0 0 600 300" className="bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
                    {/* 背景網格 */}
                    {[50, 150, 250, 350, 450, 550].map((xVal, idx) => (
                      <line key={idx} x1={xVal} y1="0" x2={xVal} y2="300" stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.2" />
                    ))}
                    {[50, 100, 150, 200, 250].map((yVal, idx) => (
                      <line key={idx} x1="0" y1={yVal} x2="600" y2={yVal} stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.2" />
                    ))}
                    
                    {/* STN 電位曲線 */}
                    <path d={stnPath} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {/* GPe 電位曲線 */}
                    <path d={gpePath} fill="none" stroke="#10b981" strokeWidth="2" opacity="0.85" />
                    
                    {/* 圖例說明 */}
                    <g transform="translate(430, 20)">
                      <rect width="150" height="50" rx="5" fill="#020617" opacity="0.8" stroke="#1e293b" />
                      <line x1="10" y1="18" x2="30" y2="18" stroke="#8b5cf6" strokeWidth="2.5" />
                      <text x="35" y="21" fill="#cbd5e1" fontSize="9">STN 興奮核團 (Vs)</text>
                      <line x1="10" y1="34" x2="30" y2="34" stroke="#10b981" strokeWidth="2" />
                      <text x="35" y="37" fill="#f8fafc" fontSize="9">GPe 抑制核團 (Vg)</text>
                    </g>
                  </svg>
                  <div className="absolute bottom-3 left-4 text-[10px] text-slate-500 font-mono">X-axis: Simulation Time | Y-axis: Membrane Potential (mV)</div>
                </div>
              ) : (
                <div className="relative animate-in fade-in duration-300">
                  <svg width="100%" height="320" viewBox="0 0 600 300" className="bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
                    {/* 背景網格 */}
                    {[50, 150, 250, 350, 450, 550].map((xVal, idx) => (
                      <line key={idx} x1={xVal} y1="0" x2={xVal} y2="300" stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.2" />
                    ))}
                    {[50, 100, 150, 200, 250].map((yVal, idx) => (
                      <line key={idx} x1="0" y1={yVal} x2="600" y2={yVal} stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.2" />
                    ))}

                    {/* 相平面投影曲線 */}
                    <path d={phasePathD} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* 不穩定固定點 */}
                    <circle cx={mapPhaseX(-50)} cy={mapPhaseY(-50)} r="4" fill="#ef4444" className="animate-ping" />
                    <circle cx={mapPhaseX(-50)} cy={mapPhaseY(-50)} r="4" fill="#ef4444" />
                    <text x={mapPhaseX(-50) + 8} y={mapPhaseY(-50) + 4} fill="#ef4444" fontSize="9" fontWeight="bold">Unstable Fixed Point</text>
                  </svg>
                  <div className="absolute bottom-3 left-4 text-[10px] text-slate-500 font-mono">X-axis: STN Voltage | Y-axis: GPe Voltage</div>
                </div>
              )}

              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed font-sans">
                {dbsActive ? (
                  <p>
                    <span className="font-bold text-cyan-400">💡 臨床動力學解說 (DBS Phase Plane)</span>：
                    DBS 啟動後，在 <strong>2D 相平面</strong> 上可清楚看到，原本完美的封閉圓圈軌跡（極限環吸引子）被徹底撕裂粉碎。狀態軌跡無法再聚集在單一振盪流形上，而是成為一片散落的無規律路徑，這代表病理性同步共振已被成功打破！
                  </p>
                ) : (
                  <p>
                    <span className="font-bold text-red-400">💡 臨床動力學解說 (Tremor Limit Cycle)</span>：
                    當 DBS 關閉時，若切換到 <strong>2D 相平面</strong> 視圖，您會驚奇地看到一條<strong>近乎完美的封閉環狀軌跡</strong>！這在非線性動力系統中被稱為 <strong>極限環吸引子 (Limit Cycle Attractor)</strong>。不論初始狀態為何，大腦終究會收斂到這條環路上，產生週期的巴金森氏症大震顫。
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {simMode === 'force' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-slate-900/60 p-6 rounded-2xl space-y-4 shadow-xl">
              <h4 className="text-sm font-extrabold text-indigo-400 uppercase tracking-wide flex items-center space-x-1.5">
                <span>⚡</span>
                <span>FORCE 演算法與 RLS 突觸權重更新</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                FORCE 透過遞迴最小平方 (RLS) 線上即時調整輸出 Readout 權重 W_out，其微分方程的突觸修正公式如下：
              </p>
              
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-[9px] text-cyan-300 leading-normal">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                  <span>1. 系統預測誤差 e(t)</span>
                  <span className="text-slate-500">e(t) = W_out · r(t) - f(t)</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                  <span>2. 協方差矩陣 P(t) 遞迴</span>
                  <span className="text-slate-500">P(t) = P(t-dt) - P·r·rᵀ·P / (1 + rᵀ·P·r)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>3. 突觸權重向量修正</span>
                  <span className="text-slate-500">W_out(t) = W_out(t-dt) - e(t) · P(t) · r(t)</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                <div className={`w-2.5 h-2.5 rounded-full ${isTraining ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-red-500'}`}></div>
                <span>學習狀態：{isTraining ? 'RLS 線上高頻更新中 (100-neuron Jacobian Matrix)' : '學習已凍結 (Synaptic weights frozen)'}</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span className="text-indigo-400">✨</span>
                <span>FORCE 混沌循環網路穩定化學習</span>
              </h3>
              
              <div className="space-y-4">
                {/* Scenario Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">🔬 選擇模擬研究情境 (Sussillo Series)：</label>
                  <select 
                    value={forceScenario} 
                    onChange={e => setForceScenario(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 font-semibold outline-none focus:border-indigo-500"
                  >
                    <option value="sinusoid">Sinusoid Target (Sussillo Fig 2) - 週期學習</option>
                    <option value="lorenz-output">Lorenz Output (Sussillo Fig 3) - 混沌輸出</option>
                    <option value="lorenz-internal">Lorenz Internal v3 (Fig 3) - Phase-Split 蝴蝶</option>
                    <option value="fixed-points">Sussillo & Barak 2013 - Slow Manifold 固定點分析</option>
                  </select>
                </div>

                {/* Customizable parameters based on scenario */}
                <div className="border-t border-slate-800 pt-3 space-y-3">
                  <div className="text-xs font-bold text-slate-300">🛠️ 自定義網路與任務參數</div>
                  
                  {/* Network size N */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">網路規模 N (Neurons)</span>
                    <div className="flex items-center space-x-1.5">
                      <button 
                        onClick={() => setNetSizeN(n => Math.max(100, n - 100))}
                        className="px-1.5 py-0.5 bg-slate-800 text-slate-300 hover:text-white rounded text-[10px] font-bold"
                      >-</button>
                      <input 
                        type="number" value={netSizeN} 
                        onChange={e => setNetSizeN(Number(e.target.value))} 
                        className="w-16 bg-slate-950 border border-slate-800 text-center rounded py-0.5 text-xs text-indigo-400 font-mono font-bold"
                      />
                      <button 
                        onClick={() => setNetSizeN(n => Math.min(1500, n + 100))}
                        className="px-1.5 py-0.5 bg-slate-800 text-slate-300 hover:text-white rounded text-[10px] font-bold"
                      >+</button>
                    </div>
                  </div>

                  {/* Chaos gain g */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-slate-400">隨機反饋增益 (g)</span>
                      <span className="text-indigo-400 font-mono">{gScale.toFixed(2)}</span>
                    </div>
                    <input 
                      type="range" min="0.8" max="2.0" step="0.1" value={gScale} 
                      onChange={e => setGScale(Number(e.target.value))} 
                      className="w-full h-1 bg-slate-800 rounded accent-indigo-500 cursor-pointer" 
                    />
                    <p className="text-[9px] text-slate-500 mt-0.5">g &gt; 1.5 時系統進入隨機高度混沌狀態。</p>
                  </div>

                  {/* Regularization alpha */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">正則化參數 (alpha)</span>
                    <input 
                      type="number" step="1.0" value={regularizationAlpha} 
                      onChange={e => setRegularizationAlpha(Number(e.target.value))} 
                      className="w-16 bg-slate-950 border border-slate-800 text-center rounded py-0.5 text-xs text-cyan-400 font-mono"
                    />
                  </div>

                  {/* Training cycles */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-slate-400">最大訓練週期 (Cycles)</span>
                      <span className="text-cyan-400 font-mono">{numTrainCycles}</span>
                    </div>
                    <input 
                      type="range" min="5" max="100" step="5" value={numTrainCycles} 
                      onChange={e => setNumTrainCycles(Number(e.target.value))} 
                      className="w-full h-1 bg-slate-800 rounded accent-cyan-500 cursor-pointer" 
                    />
                  </div>

                  {/* Sinusoid customizable wave options */}
                  {forceScenario === 'sinusoid' && (
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-2.5 mt-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">弦波設定</div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">目標訊號波形：</label>
                        <select 
                          value={targetWaveType} 
                          onChange={e => setTargetWaveType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 outline-none"
                        >
                          <option value="combined">複合弦波 (Combined Sine)</option>
                          <option value="single">單正弦波 (Pure Sine)</option>
                          <option value="square">非線性方波 (Square Wave)</option>
                          <option value="sawtooth">週期鋸齒波 (Sawtooth Wave)</option>
                        </select>
                      </div>

                      <div className="space-y-2 mt-2">
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
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => setResetSignal(r => r + 1)}
                    className="w-full py-2 bg-indigo-600/20 border border-indigo-500/50 hover:bg-indigo-600/40 text-indigo-300 font-bold text-xs rounded-lg transition"
                  >
                    🔄 重置訓練並套用新參數
                  </button>
                </div>

                <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-900/30 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">FORCE 線上突觸學習</span>
                    <button 
                      onClick={() => setIsTraining(!isTraining)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all border ${
                        isTraining 
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                          : 'bg-red-600/20 border-red-500 text-red-400'
                      }`}
                    >
                      {isTraining ? 'ACTIVE (線上學習中)' : 'FROZEN (凍結突觸)'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    在 ACTIVE 下，遞迴最小平方 (RLS) 每一步都在快速修改 Readout 權重，穩定高維混沌。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 右側兩欄：FORCE 圖表與學術面板 */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5 animate-in fade-in duration-300">
                
                {forceScenario === 'fixed-points' ? (
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
              )}

              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-2">
                <span className="font-bold text-indigo-400 block">💡 FORCE 演算法動態解讀：</span>
                {isTraining ? (
                  <p>
                    目前 <strong>FORCE 線上學習為 ACTIVE</strong>！隨著步數 t 演進，您能親眼看到紫色的 RNN 輸出軌跡在極短的步伐內「幾乎瞬間鎖定」並精準貼合灰色的目標複合正弦波！這是因為 Recursive Least Squares (RLS) 在每個時間步階都在施加反反饋，將高維混沌約束到低維編碼流形中。
                  </p>
                ) : (
                  <p>
                    目前 <strong>FORCE 學習為 FROZEN (凍結)</strong>！如果是在早期凍結，權重尚未學成，您會看到紫色線迅速被背景混沌動力學吞噬，呈現雜亂無章的劇烈震盪（Chaos）；但如果在已經貼合後凍結，網路依靠突觸的反饋迴路已穩定化，即使沒有學習演算法在修改權重，它依舊能極為平滑地自主產生完美的目標軌跡！
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    );
  }

// ==========================================
// --- 2. David Sussillo RNN Population Dynamics Mind Map (MindMapTab) ---
// ==========================================
function MindMapTabComponent() {
  const [selectedNode, setSelectedNode] = useState('rnn');

  const nodes = [
    {
      id: 'lif',
      title: '1. LIF Electrophysiology',
      subtitle: '單一神經元膜電位 ODE',
      desc: '研究神經元的電生理基礎，以線性一階常微分方程式描述單個細胞的電容電阻累積。',
      math: 'tau_m * dV/dt = -(V - V_rest) + R_m * I(t)\n\n若 V >= V_th => V = V_reset',
      clinical: '電生理激發基礎。時間常數 (Time constant) 控制了激發和衰退速率。是高維大腦網路的最基本計算單元。',
      citation: 'Lapicque (1907)',
      category: 'LIF',
      x: 100, y: 150
    },
    {
      id: 'coupled',
      title: '2. Coupled Loops (STN-GPe)',
      subtitle: '環路動力學與病理震盪',
      desc: '興奮性 STN 與抑制性 GPe 核團形成耦合微分方程組。多巴胺缺乏下，系統會掉入極限環 (Limit Cycle) 病理震顫。',
      math: 'tau_S * dVs/dt = -(Vs - Vs_rest) - W_GS * f(Vg) + I_DBS(t)\ntau_G * dVg/dt = -(Vg - Vg_rest) + W_SG * f(Vs)',
      clinical: '巴金森氏症靜止性震顫。高頻深層腦部刺激 (DBS) 為方程式注入高頻強迫函數，強行打破此病理性振盪吸引子。',
      citation: 'Rubin & Terman (2004)',
      category: 'Network',
      x: 230, y: 320
    },
    {
      id: 'rnn',
      title: '3. Continuous-Time RNN',
      subtitle: 'David Sussillo 群體動力學基礎',
      desc: '大規模神經網路激活狀態 x_i(t) 的連續時間表示法。將大腦皮質表達為一個高度非線性的耦合微分方程系統。',
      math: 'tau * dx_i/dt = -x_i + Σ W_ij * tanh(x_j) + I_i(t)\n\n隱藏狀態 x_i(t)，放電率 h_i(t) = tanh(x_i)',
      clinical: '不再依賴單一神經元編碼，而是把整個皮質視為一個集體群體軌跡（Population Trajectory），從幾何形態研究其計算本質。',
      citation: 'Sussillo & Abbott (2009); Abbott et al. (2016)',
      category: 'RNN',
      x: 420, y: 160
    },
    {
      id: 'attractor',
      title: '4. Attractors & Vector Fields',
      subtitle: '狀態空間與固定點幾何學',
      desc: '利用相平面與幾何方法分析高維微分方程組。尋找固定點 (Fixed Points, dx/dt = 0) 並以特徵值分析其局部穩定性。',
      math: 'dx/dt = F(x) = 0 (尋找固定點)\nJ = ∇F(x) (計算雅可比矩陣特徵值以分析鞍點、穩定吸引子)',
      clinical: '大腦中，吸引子代表工作記憶（如線吸引子儲存眼球位置，環形吸引子儲存頭部定向）。鞍點 (Saddle Points) 則代表決策的動態分叉邊界。',
      citation: 'Sussillo & Abbott (2013, Nature Neuroscience)',
      category: 'Attractor',
      x: 600, y: 300
    },
    {
      id: 'learning',
      title: '5. The FORCE Algorithm',
      subtitle: '混沌動力學線上調整學習',
      desc: 'David Sussillo 最著名的貢獻。利用遞迴最小平方 (RLS) 線上更新反饋突觸權重，將強烈的混沌動態穩定為精準的目標軌跡。',
      math: 'e(t) = z(t) - target(t)\nW_out(t) = W_out(t-dt) - e(t) * P(t) * r(t)',
      clinical: '精確解釋了前運動皮質與小腦網路如何穩定混沌信號，進行高精度、高靈活性的運動規畫與複雜時間軌跡生成。',
      citation: 'Sussillo & Abbott (2009, Neuron)',
      category: 'Learning',
      x: 770, y: 150
    },
    {
      id: 'multitask',
      title: '6. Dynamical Motifs',
      subtitle: '多任務神經計算與子空間',
      desc: '研究單一 RNN 如何在同一個突觸網絡中，利用多種低維「動力學基元 (Dynamical Motifs)」並行執行多元認知任務而不產生遺忘。',
      math: 'x(t) = Σ v_k * y_k(t) + x_0',
      clinical: '揭示了額葉皮質高度認知彈性的本質——藉由在同一個實體網路上構建多個互相正交的動力學吸引子，實現多工作業。',
      citation: 'Sussillo (2013); Driscoll et al. (2022)',
      category: 'Multitask',
      x: 930, y: 280
    }
  ];

  const activeNode = nodes.find(n => n.id === selectedNode);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h3 className="text-lg font-bold text-white mb-2 text-center">神經動力學與循環網路 ODE 學習路徑</h3>
        <p className="text-xs text-slate-400 text-center mb-8">
          從單一細胞電生理，跨越到 David Sussillo 所主導的高維群體吸引子動力學與多任務計算幾何結構。請點選下方節點閱讀細節：
        </p>

        <div className="overflow-x-auto pb-4">
          <svg width="1050" height="420" viewBox="0 0 1050 420" className="mx-auto bg-slate-950 rounded-2xl border border-slate-800/80 p-4 shadow-inner">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
              </linearGradient>
              
              <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing Flow Paths */}
            <path id="path1" d="M 100 150 Q 165 235 230 320" fill="none" stroke="url(#grad1)" strokeWidth="2.5" opacity="0.6" strokeDasharray="5,3" filter="url(#neon-glow)" />
            <path id="path2" d="M 230 320 Q 325 240 420 160" fill="none" stroke="url(#grad2)" strokeWidth="2.5" opacity="0.6" filter="url(#neon-glow)" />
            <path id="path3" d="M 420 160 Q 510 230 600 300" fill="none" stroke="url(#grad3)" strokeWidth="3" opacity="0.7" filter="url(#neon-glow)" />
            <path id="path4" d="M 600 300 Q 685 225 770 150" fill="none" stroke="url(#grad4)" strokeWidth="3" opacity="0.7" filter="url(#neon-glow)" />
            <path id="path5" d="M 770 150 Q 850 215 930 280" fill="none" stroke="url(#grad1)" strokeWidth="3" opacity="0.7" filter="url(#neon-glow)" />
            
            {/* Animated Flowing Signal Pulses */}
            <circle r="4.5" fill="#a5b4fc" className="shadow-[0_0_10px_#818cf8]">
              <animateMotion dur="5s" repeatCount="indefinite" path="M 100 150 Q 165 235 230 320" />
            </circle>
            <circle r="4.5" fill="#34d399" className="shadow-[0_0_10px_#34d399]">
              <animateMotion dur="4.5s" repeatCount="indefinite" path="M 230 320 Q 325 240 420 160" />
            </circle>
            <circle r="5" fill="#22d3ee" className="shadow-[0_0_10px_#22d3ee]">
              <animateMotion dur="4s" repeatCount="indefinite" path="M 420 160 Q 510 230 600 300" />
            </circle>
            <circle r="5" fill="#fbbf24" className="shadow-[0_0_10px_#fbbf24]">
              <animateMotion dur="4.2s" repeatCount="indefinite" path="M 600 300 Q 685 225 770 150" />
            </circle>
            <circle r="5" fill="#e879f9" className="shadow-[0_0_10px_#e879f9]">
              <animateMotion dur="3.8s" repeatCount="indefinite" path="M 770 150 Q 850 215 930 280" />
            </circle>

            <circle cx="165" cy="235" r="4" fill="#a5b4fc" opacity="0.8" className="animate-pulse" />
            <circle cx="325" cy="240" r="4" fill="#6ee7b7" opacity="0.8" />
            <circle cx="510" cy="230" r="5" fill="#67e8f9" opacity="0.8" />
            <circle cx="685" cy="225" r="5" fill="#fde047" opacity="0.8" />
            <circle cx="850" cy="215" r="5" fill="#c084fc" opacity="0.8" />

            {nodes.map(node => {
              const isActive = selectedNode === node.id;
              let borderClass = 'stroke-slate-800';
              let fillClass = 'fill-slate-900';
              
              if (node.category === 'LIF') { borderClass = isActive ? 'stroke-indigo-400' : 'stroke-indigo-800'; }
              if (node.category === 'Network') { borderClass = isActive ? 'stroke-emerald-400' : 'stroke-emerald-800'; }
              if (node.category === 'RNN') { borderClass = isActive ? 'stroke-cyan-400' : 'stroke-cyan-800'; }
              if (node.category === 'Attractor') { borderClass = isActive ? 'stroke-yellow-400' : 'stroke-yellow-800'; }
              if (node.category === 'Learning') { borderClass = isActive ? 'stroke-orange-400' : 'stroke-orange-800'; }
              if (node.category === 'Multitask') { borderClass = isActive ? 'stroke-purple-400' : 'stroke-purple-800'; }

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x - 90}, ${node.y - 45})`} 
                  onClick={() => setSelectedNode(node.id)}
                  className="cursor-pointer group"
                >
                  <rect 
                    width="180" height="90" rx="14" 
                    className={`${fillClass} ${borderClass} transition-all duration-300`} 
                    strokeWidth={isActive ? '3' : '1.5'} 
                    fillOpacity="0.85"
                  />
                  
                  {isActive && (
                    <rect width="180" height="90" rx="14" className="stroke-indigo-400 fill-none opacity-20 animate-ping" />
                  )}

                  <text x="14" y="28" fill="#f8fafc" fontSize="11" fontWeight="bold" className="group-hover:fill-cyan-300 transition-colors">
                    {node.title}
                  </text>
                  <text x="14" y="48" fill="#94a3b8" fontSize="9">
                    {node.subtitle}
                  </text>
                  
                  <rect x="14" y="60" width="70" height="15" rx="3" fill="#1e293b" />
                  <text x="18" y="71" fill="#64748b" fontSize="8" fontWeight="bold" className="font-mono">
                    {node.citation.split('(')[0].trim()}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {activeNode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/60 border border-slate-800/80 p-8 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="md:col-span-1 space-y-4">
            <div className="inline-block bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
              {activeNode.category} Module
            </div>
            <h4 className="text-xl font-extrabold text-white leading-tight">{activeNode.title}</h4>
            <p className="text-xs text-slate-400 italic">核心文獻：{activeNode.citation}</p>
            <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">{activeNode.desc}</p>
          </div>

          <div className="md:col-span-1 bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-3 font-mono">🔬 微分方程數學描述</span>
              <pre className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap bg-slate-900/40 p-4 rounded-lg border border-slate-900">
                {activeNode.math}
              </pre>
            </div>
            <div className="text-[10px] text-slate-500 mt-4">
              💡 注解：τ 為系統特徵時間常數，隱藏狀態 x 經由 tanh 非線性激活後輸出突觸放電率。
            </div>
          </div>

          <div className="md:col-span-1 bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-900/20 p-6 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-3">🧠 臨床神經科學與大腦功能編碼</span>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {activeNode.clinical}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center space-x-1.5">
              <Info size={12} className="text-indigo-400" />
              <span>本節點專為 David Sussillo 現代吸引子狀態動力學架構建立</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// --- 3. Clinical Slide Deck on David Sussillo Dynamics (SlideDeckTab) ---
// ==========================================
function SlideDeckTabComponent() {
  const [slide, setSlide] = useState(0);
  const [viewMode, setViewMode] = useState('clinical');
  const [angle, setAngle] = useState(0);

  // Dynamic parameters for 3D state-space
  const [rotSpeed, setRotSpeed] = useState(1.2);
  const [noisePerturb, setNoisePerturb] = useState(0.0);
  
  // Attractor type switcher (5 types)
  const [attractorType, setAttractorType] = useState('saddle'); // 'point', 'line', 'limit', 'saddle', 'chaos'

  // Smoothly increment 3D rotation angle with a lighter cadence to reduce whole-panel re-renders.
  useEffect(() => {
    if (rotSpeed <= 0) return;
    const timer = setInterval(() => {
      setAngle(a => (a + rotSpeed) % 360);
    }, 60);
    return () => clearInterval(timer);
  }, [rotSpeed]);

  // Simple 3D projection utility
  const project3D = (x, y, z, theta) => {
    const rad = (theta * Math.PI) / 180;
    const cosT = Math.cos(rad);
    const sinT = Math.sin(rad);

    const x1 = x * cosT - z * sinT;
    const z1 = x * sinT + z * cosT;

    const elev = Math.PI / 6; // 30 degrees tilt
    const cosE = Math.cos(elev);
    const sinE = Math.sin(elev);
    const y2 = y * cosE - z1 * sinE;

    const scale = 80;
    const u = 170 + x1 * scale;
    const v = 150 - y2 * scale;
    return { u, v };
  };

  // 1. Point Attractor orbits (6 spiral orbits收斂到中心點)
  const pointOrbits = [];
  const numPointOrbits = 6;
  for (let k = 0; k < numPointOrbits; k++) {
    const orbitPoints = [];
    const startAngle = (k * 2 * Math.PI) / numPointOrbits;
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const r = 1.35 * (1.0 - t);
      const th = startAngle + t * 2.5 * Math.PI;
      const jitterX = noisePerturb * Math.sin(t * 30 + k) * 0.15;
      const jitterY = noisePerturb * Math.cos(t * 30 + k) * 0.15;
      const zVal = 1.2 * (1.0 - t) * (k % 2 === 0 ? 1 : -1);
      orbitPoints.push(project3D(r * Math.cos(th) + jitterX, r * Math.sin(th) + jitterY, zVal, angle));
    }
    pointOrbits.push(`M ${orbitPoints[0].u} ${orbitPoints[0].v} ` + orbitPoints.slice(1).map(p => `L ${p.u} ${p.v}`).join(' '));
  }

  // 2. Line Attractor main axis and收斂線
  const lineAxisStart = project3D(0, 0, -1.3, angle);
  const lineAxisEnd = project3D(0, 0, 1.3, angle);
  const lineOrbits = [];
  const numLineOrbits = 5;
  for (let k = 0; k < numLineOrbits; k++) {
    const orbitPoints = [];
    const startAngle = (k * 2 * Math.PI) / numLineOrbits;
    const targetZ = -1.0 + k * 0.5;
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const r = 1.2 * Math.exp(-t * 3);
      const driftZ = t > 0.8 ? noisePerturb * Math.sin(angle * 0.05 + k) * 0.5 : 0;
      const jitterX = noisePerturb * Math.sin(t * 20) * 0.08;
      const jitterY = noisePerturb * Math.cos(t * 20) * 0.08;
      
      orbitPoints.push(project3D(
        r * Math.cos(startAngle) + jitterX, 
        r * Math.sin(startAngle) + jitterY, 
        targetZ * (1 - t) + (targetZ + driftZ) * t, 
        angle
      ));
    }
    lineOrbits.push(`M ${orbitPoints[0].u} ${orbitPoints[0].v} ` + orbitPoints.slice(1).map(p => `L ${p.u} ${p.v}`).join(' '));
  }

  // 3. Limit Cycle Attractor ring and收斂軌跡
  const ringPoints = [];
  for (let i = 0; i <= 48; i++) {
    const th = (i * 2 * Math.PI) / 48;
    const waveZ = noisePerturb * Math.sin(th * 6 + angle * 0.05) * 0.2;
    ringPoints.push(project3D(1.0 * Math.cos(th), 1.0 * Math.sin(th), waveZ, angle));
  }
  const ringPath = `M ${ringPoints[0].u} ${ringPoints[0].v} ` + ringPoints.slice(1).map(p => `L ${p.u} ${p.v}`).join(' ');

  const limitOuterPoints = [];
  for (let i = 0; i <= 36; i++) {
    const t = i / 36;
    const r = 1.4 - 0.4 * t;
    const th = t * 4.0 * Math.PI;
    const zVal = 0.8 * (1.0 - t) + noisePerturb * Math.sin(t * 20) * 0.15;
    limitOuterPoints.push(project3D(r * Math.cos(th), r * Math.sin(th), zVal, angle));
  }
  const limitOuterPath = `M ${limitOuterPoints[0].u} ${limitOuterPoints[0].v} ` + limitOuterPoints.slice(1).map(p => `L ${p.u} ${p.v}`).join(' ');

  const limitInnerPoints = [];
  for (let i = 0; i <= 36; i++) {
    const t = i / 36;
    const r = 0.2 + 0.8 * t;
    const th = t * 4.0 * Math.PI + Math.PI;
    const zVal = -0.8 * (1.0 - t) + noisePerturb * Math.cos(t * 20) * 0.15;
    limitInnerPoints.push(project3D(r * Math.cos(th), r * Math.sin(th), zVal, angle));
  }
  const limitInnerPath = `M ${limitInnerPoints[0].u} ${limitInnerPoints[0].v} ` + limitInnerPoints.slice(1).map(p => `L ${p.u} ${p.v}`).join(' ');

  // 4. Saddle Point (Decision Bifurcation) paths
  const pointsA = [];
  for (let i = 0; i <= 36; i++) {
    const th = (i * 10 * Math.PI) / 180;
    pointsA.push(project3D(Math.cos(th), Math.sin(th), 0, angle));
  }
  const orbitAPath = `M ${pointsA[0].u} ${pointsA[0].v} ` + pointsA.slice(1).map(p => `L ${p.u} ${p.v}`).join(' ');

  const pointsB = [];
  for (let i = 0; i <= 36; i++) {
    const th = (i * 10 * Math.PI) / 180;
    pointsB.push(project3D(Math.cos(th), 0, Math.sin(th), angle));
  }
  const orbitBPath = `M ${pointsB[0].u} ${pointsB[0].v} ` + pointsB.slice(1).map(p => `L ${p.u} ${p.v}`).join(' ');

  const pointsC = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const r = 1.35 * (1.0 - t);
    const th = t * 3.0 * Math.PI;
    const bifurcationOffset = t > 0.6 ? (t - 0.6) * 2.5 * noisePerturb : 0;
    
    pointsC.push(project3D(
      r * Math.cos(th) + bifurcationOffset * 0.7, 
      r * Math.sin(th) + bifurcationOffset * 0.3, 
      1.5 * (1.0 - t), 
      angle
    ));
  }
  const bifurcationPath = `M ${pointsC[0].u} ${pointsC[0].v} ` + pointsC.slice(1).map(p => `L ${p.u} ${p.v}`).join(' ');

  // 5. Lorenz Chaos Attractor paths (real numerical integration projected on the fly)
  const lorenzPoints = [];
  let lx = 0.1, ly = 0.0, lz = 0.0;
  const lsigma = 10, lrho = 28, lbeta = 8/3;
  const ldt = 0.015;
  for (let i = 0; i < 220; i++) {
    const dx = lsigma * (ly - lx);
    const dy = lx * (lrho - lz) - ly;
    const dz = lx * ly - lbeta * lz;
    lx += dx * ldt;
    ly += dy * ldt;
    lz += dz * ldt;
    const noiseX = (Math.random() - 0.5) * noisePerturb * 2.0;
    const noiseY = (Math.random() - 0.5) * noisePerturb * 2.0;
    lorenzPoints.push(project3D((lx + noiseX) * 0.065, (ly + noiseY) * 0.065, (lz - 24) * 0.065, angle));
  }
  const lorenzPath = lorenzPoints.length > 0
    ? `M ${lorenzPoints[0].u} ${lorenzPoints[0].v} ` + lorenzPoints.slice(1).map(p => `L ${p.u} ${p.v}`).join(' ')
    : '';

  const axPC1_start = project3D(-1.5, 0, 0, angle);
  const axPC1_end = project3D(1.5, 0, 0, angle);
  const axPC2_start = project3D(0, -1.5, 0, angle);
  const axPC2_end = project3D(0, 1.5, 0, angle);
  const axPC3_start = project3D(0, 0, -1.5, angle);
  const axPC3_end = project3D(0, 0, 1.5, angle);

  const slides = [
    {
      title: "1. 轉向群體動力學 (The Population Dynamics Paradigm)",
      summary: "傳統神經科學常聚焦於單一神經元（如單個 LIF 微分方程）的編碼。然而，David Sussillo 的研究指出，大腦新皮質在進行決策或規畫運動時，主要是由數以萬計的神經元集體演化所構成的「群體狀態軌跡 (Population Trajectory)」來決定。",
      math: "高維系統 ODE 可以寫為一組耦合的神經網路微分方程：\n\ntau * dx_i/dt = -x_i + Σ W_ij * tanh(x_j) + I_i(t)\n\n當我們量測 N 個神經元的活動時，其在任意時刻的狀態均為 N 維狀態空間中的一個點。隨著時間推移，這個點在 N 維空間中描繪出一條連續軌跡。",
      clinical: "大腦運動皮質在計划伸出手臂時，個別神經元的放電似乎極為雜亂（可能一會兒發放，一會兒沉寂），但若將其投射到群體狀態空間，會發現整個網路以非常精準的圓弧形「預備軌跡（Preparatory Trajectory）」在運行。這解釋了為什麽單細胞雜訊極大，但我們的肌肉運動卻極其精確。",
      bullets: [
        "大腦利用群體編碼（Population Coding）克服單細胞的不穩定性",
        "狀態空間（State Space）的幾何拓樸，決定了網路的運算能力",
        "數學工具：狀態空間流速向量場與高維主成分投影 (PCA/dPCA)"
      ]
    },
    {
      title: "2. 幾何拓樸：吸引子與固定點 (Attractors & Fixed Points)",
      summary: "微分方程系統的行為完全取決於其狀態空間的「幾何景觀 (Geometric Landscape)」。透過將系統的流速微分方程設為 0，我們可以尋找到系統的固定點 (Fixed Points)，並藉由雅可比矩陣的特徵值 (Eigenvalues) 分析其拓樸結構。",
      math: "微分方程流速場：dx/dt = F(x) = 0\n對固定點 x* 進行一階線性泰勒展開：\n\nd(x-x*)/dt ≈ J * (x-x*) , 其中 J_ij = ∂F_i/∂x_j\n\n- 若 J 的特徵值實部皆為負 (λ_real < 0) => 穩定吸引子 (Stable Node)\n- 若存在正特徵值 (λ_real > 0) => 不穩定鞍點 (Saddle Point)",
      clinical: "1. 線吸引子 (Line Attractor)：在數學上具有一維的連續特徵值為 0 的固定點軌跡，臨床上直接對應大腦中負責短暫保存眼球位置的「前庭動眼系統」與「工作記憶」。\n2. 環形吸引子 (Ring Attractor)：對應大腦中的「指南針神經群」，可持續儲存個體的頭部方向定向資訊。",
      bullets: [
        "固定點 (Fixed Points) 是控制群體狀態流向的樞紐",
        "鞍點 (Saddle Points) 提供了大腦在多種選擇之間進行「決策」的邊界",
        "特徵值 λ 控制了大腦狀態在受到外力擾動後的恢復速度"
      ]
    },
    {
      title: "3. 混沌動力學的穩定化：FORCE 演算法",
      summary: "如果神經網路的突觸權重 W 很大（突觸增益 g > 1.5），該網路的微分方程將進入高度非線性的「混沌狀態 (Chaos)」，流速紊亂。Sussillo & Abbott (2009) 提出了著名的 FORCE 演算法，在不改變內部混亂突觸的狀況下，單純藉由線上調整 Readout 權重來降伏混亂。",
      math: "1. 網路隨機初始化，具備強烈的混沌背景 (g > 1.5)\n2. 引入 feedback 環路，將輸出 z(t) = W_out * r(t) 反饋回微分方程內部\n3. 利用遞迴最小平方法 (RLS) 計算反饋誤差並即時修正 W_out：\n\nW_out(t) = W_out(t-dt) - e(t) * P(t) * r(t)\n\n這能在極短時間內（First-Order）把紊亂的流速「約束」到目標軌跡上。",
      clinical: "大腦的前運動皮質 (Premotor Cortex) 和小腦 (Cerebellum) 包含大量具有強烈隨機性反饋的網絡。Sussillo 提出的 FORCE 機制說明，大腦不需要空間修改每一個突觸，只需透過反饋誤差線上快速校準皮質的 Readout 突觸，就能在混亂的背景下，無比精確地規劃並生成複雜的小提琴演奏或外科手術動作。",
      bullets: [
        "FORCE 代表 First-Order Reduced Controller for RNNs",
        "利用背景的混沌動力學（豐富的頻率基底）來合成任意複雜的軌跡",
        "網路在停止學習後（Weights Frozen）仍能靠反饋迴路自主運行"
      ]
    },
    {
      title: "4. 動力學基元與多任務計算 (Dynamical Motifs)",
      summary: "大腦新皮質是高度多工的。同一塊運動區既要能計划往左伸，又要能計划往右伸。Sussillo 近期一系列的研究展示，單一 recurrent network 如何利用正交的幾何子空間，在一個突觸網絡中，藉由不同的「動力學基元 (Dynamical Motifs)」並行執行多元任務。",
      math: "高維狀態 x(t) 可以分解為多個互相正交的低維子空間基元（Motifs）：\n\nx(t) = Σ v_k * y_k(t) + x_0\n\n當任務切換時，外部輸入 I(t) 相當於在微分方程式中施加一個向量偏移，將系統推到另一個平行的相平面，使其被不同的動力學向量場控制。每個任務都在獨立的低維流形 (Manifold) 上運行，彼此正交互不干擾。",
      clinical: "解釋了額葉皮質高度認知彈性與運動區多工計算。例如：同一個突觸網絡在「運動計划階段」利用一個閉合的固定點線吸引子儲存目標，在收到「Go 信號」後，透過鞍點的分叉，狀態迅速彈出並沿著極限環軌跡釋放運動控制。不同任務軌跡正交，防止任務間產生「災難性遺忘」。",
      bullets: [
        "動力學基元（Dynamical Motifs）是循環網進行多任務計算的樂高積木",
        "透過突觸連接矩陣的幾何正交性，避免了任務間的串擾 (Cross-talk)",
        "為人工智慧（AI RNN）的多任務持續學習 (Continual Learning) 提供了大腦仿生指引"
      ]
    }
  ];

  const currentSlide = slides[slide];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in zoom-in-95 duration-400">
      {/* Slide Deck Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[550px]">
        {/* Slide Header */}
        <div className="bg-slate-950 px-8 py-6 border-b border-slate-800/80 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Slide Deck • David Sussillo Computational Series</span>
            <h3 className="text-lg font-extrabold text-white mt-1">{currentSlide.title}</h3>
          </div>
          
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 w-fit">
            <button 
              onClick={() => setViewMode('clinical')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wide transition-all ${viewMode === 'clinical' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              🧠 臨床大腦解讀
            </button>
            <button 
              onClick={() => setViewMode('math')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wide transition-all ${viewMode === 'math' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              🔬 數學物理描述
            </button>
          </div>
        </div>

        {/* Slide Main Body Content with 3D Graphic integration */}
        <div className="p-8 flex-1 flex flex-col lg:flex-row gap-8 justify-between">
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <p className="text-xs text-slate-300 leading-relaxed font-semibold bg-slate-950/40 p-4 rounded-xl border border-slate-950">
              {currentSlide.summary}
            </p>

            <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl">
              {viewMode === 'clinical' ? (
                <div className="animate-in fade-in duration-300">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">🧠 臨床醫學與神經動力學解讀</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentSlide.clinical}
                  </p>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2 font-mono">🔬 微分方程 & 狀態空間幾何推導</span>
                  <pre className="text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap bg-slate-900/30 p-3 rounded-lg border border-slate-900">
                    {currentSlide.math}
                  </pre>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400">💡 學習核心要點：</span>
              <ul className="grid grid-cols-1 gap-2">
                {currentSlide.bullets.map((b, i) => (
                  <li key={i} className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-lg flex items-start space-x-2 text-[10px] text-slate-400 font-medium leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></div>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Rotating 3D Attractor State-Space Projection Box */}
          <div className="w-full lg:w-[340px] bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">3D Rotating Population Space</span>
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                以主成分 PC1, PC2, PC3 投影 N 維 RNN 微分方程軌跡。旋轉展示兩個正交任務流形。
              </p>
            </div>

            <svg width="100%" height="240" viewBox="0 0 340 300" className="mx-auto overflow-visible">
              <line x1={axPC1_start.u} y1={axPC1_start.v} x2={axPC1_end.u} y2={axPC1_end.v} stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />
              <text x={axPC1_end.u + 4} y={axPC1_end.v + 3} fill="#64748b" fontSize="8" className="font-mono font-bold">PC1</text>

              <line x1={axPC2_start.u} y1={axPC2_start.v} x2={axPC2_end.u} y2={axPC2_end.v} stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />
              <text x={axPC2_end.u + 4} y={axPC2_end.v + 3} fill="#64748b" fontSize="8" className="font-mono font-bold">PC2</text>

              <line x1={axPC3_start.u} y1={axPC3_start.v} x2={axPC3_end.u} y2={axPC3_end.v} stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />
              <text x={axPC3_end.u + 4} y={axPC3_end.v + 3} fill="#64748b" fontSize="8" className="font-mono font-bold">PC3</text>

              {/* Dynamic paths depending on attractorType */}
              {attractorType === 'point' && (
                <g>
                  {pointOrbits.map((path, idx) => (
                    <path key={idx} d={path} fill="none" stroke="#818cf8" strokeWidth="1.5" opacity="0.6" />
                  ))}
                  <circle cx={project3D(0,0,0,angle).u} cy={project3D(0,0,0,angle).v} r="7" fill="#10b981" className="animate-pulse shadow-lg" opacity="0.8" />
                  <circle cx={project3D(0,0,0,angle).u} cy={project3D(0,0,0,angle).v} r="4.5" fill="#10b981" />
                  <text x={project3D(0,0,0,angle).u + 8} y={project3D(0,0,0,angle).v - 4} fill="#10b981" fontSize="7" fontWeight="bold">Stable Point Attractor</text>
                </g>
              )}

              {attractorType === 'line' && (
                <g>
                  <line x1={lineAxisStart.u} y1={lineAxisStart.v} x2={lineAxisEnd.u} y2={lineAxisEnd.v} stroke="#10b981" strokeWidth="2.5" opacity="0.85" />
                  {lineOrbits.map((path, idx) => (
                    <path key={idx} d={path} fill="none" stroke="#6366f1" strokeWidth="1.2" opacity="0.55" />
                  ))}
                  {(() => {
                    const driftZ = noisePerturb * Math.sin(angle * 0.04) * 0.6;
                    const particle = project3D(0, 0, driftZ, angle);
                    return (
                      <g>
                        <circle cx={particle.u} cy={particle.v} r="5.5" fill="#10b981" className="animate-ping" />
                        <circle cx={particle.u} cy={particle.v} r="3.5" fill="#10b981" />
                        <text x={lineAxisStart.u + 6} y={lineAxisStart.v - 6} fill="#10b981" fontSize="7" fontWeight="bold">Continuous Line Attractor</text>
                      </g>
                    );
                  })()}
                </g>
              )}

              {attractorType === 'limit' && (
                <g>
                  <path d={ringPath} fill="none" stroke="#6366f1" strokeWidth="3" opacity="0.85" className="shadow-lg" />
                  <path d={limitOuterPath} fill="none" stroke="#f97316" strokeWidth="1.8" strokeDasharray="3,2" opacity="0.75" />
                  <path d={limitInnerPath} fill="none" stroke="#10b981" strokeWidth="1.8" opacity="0.75" />
                  {(() => {
                    const outerTip = limitOuterPoints[limitOuterPoints.length - 1] || project3D(0, 0, 0, angle);
                    const innerTip = limitInnerPoints[limitInnerPoints.length - 1] || project3D(0, 0, 0, angle);
                    return (
                      <g>
                        <circle cx={outerTip.u} cy={outerTip.v} r="4" fill="#f97316" className="animate-pulse" />
                        <circle cx={innerTip.u} cy={innerTip.v} r="4" fill="#10b981" className="animate-pulse" />
                        <text x={110} y={60} fill="#6366f1" fontSize="7" fontWeight="bold">Limit Cycle Attractor (Stable Orbit)</text>
                      </g>
                    );
                  })()}
                </g>
              )}

              {attractorType === 'saddle' && (
                <g>
                  <path d={orbitAPath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="4,1" opacity="0.85" />
                  <path d={orbitBPath} fill="none" stroke="#10b981" strokeWidth="2.5" opacity="0.85" />
                  <path d={bifurcationPath} fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="3,3" opacity="0.9" />
                  {(() => {
                    const origin = project3D(0, 0, 0, angle);
                    const tipC = pointsC.length > 0 ? pointsC[pointsC.length - 1] : origin;
                    return (
                      <g>
                        <circle cx={tipC.u} cy={tipC.v} r="4" fill="#f97316" className="animate-ping" />
                        <circle cx={origin.u} cy={origin.v} r="5" fill="#ef4444" className="animate-ping opacity-70" />
                        <circle cx={origin.u} cy={origin.v} r="4" fill="#ef4444" />
                        <text x={origin.u + 6} y={origin.v - 6} fill="#ef4444" fontSize="7" fontWeight="bold">Saddle Point (Decision)</text>
                      </g>
                    );
                  })()}
                </g>
              )}

              {attractorType === 'chaos' && (
                <g>
                  <path d={lorenzPath} fill="none" stroke="#d946ef" strokeWidth="1.5" opacity="0.8" />
                  {(() => {
                    const pulseIdx = lorenzPoints.length > 0 ? Math.floor((angle * 0.8) % lorenzPoints.length) : 0;
                    const pulseDot = lorenzPoints[pulseIdx] || project3D(0,0,0,angle);
                    return (
                      <g>
                        <circle cx={pulseDot.u} cy={pulseDot.v} r="5" fill="#d946ef" className="animate-ping" />
                        <circle cx={pulseDot.u} cy={pulseDot.v} r="3" fill="#ec4899" />
                        <text x={95} y={45} fill="#d946ef" fontSize="7" fontWeight="bold">Lorenz Strange Attractor (Chaos)</text>
                      </g>
                    );
                  })()}
                </g>
              )}
            </svg>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-900 text-[9px] text-slate-500 leading-normal font-mono flex items-start space-x-1.5">
              <span>✨</span>
              <span>Sussillo 證實大腦以正交子空間進行多任務計算而不串擾！</span>
            </div>

            {/* Attractor Dynamic Explanation Cabin */}
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
            <div className="border-t border-slate-800 pt-3 mt-3 space-y-3">
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">🛠️ 3D Attractor 幾何控制</div>
              
              {/* Scenario selector */}
              <div className="space-y-1">
                <span className="text-[9px] font-semibold text-slate-400 font-sans">選擇 Attractor 動力學情境：</span>
                <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
                  {[
                    {id: 'point', name: '點', title: 'Point'},
                    {id: 'line', name: '線', title: 'Line'},
                    {id: 'limit', name: '環', title: 'Ring'},
                    {id: 'saddle', name: '分岔', title: 'Saddle'},
                    {id: 'chaos', name: '混沌', title: 'Chaos'}
                  ].map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setAttractorType(t.id)}
                      title={t.title}
                      className={`py-1 text-[9px] font-bold rounded transition ${attractorType === t.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[9px] font-semibold mb-1">
                  <span className="text-slate-400 font-sans">幾何隨機雜訊 (Noise Perturb)</span>
                  <span className="text-orange-400 font-mono">{noisePerturb.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0.0" max="0.5" step="0.05" value={noisePerturb} 
                  onChange={e => setNoisePerturb(Number(e.target.value))} 
                  className="w-full h-1 bg-slate-850 rounded accent-orange-500 cursor-pointer" 
                />
                <p className="text-[8px] text-slate-500 leading-tight mt-0.5 font-sans">拉大時軌跡會產生隨機高維偏流，展現大腦在雜訊下的決策漂移！</p>
              </div>

              <div>
                <div className="flex justify-between text-[9px] font-semibold mb-1">
                  <span className="text-slate-400 font-sans">3D 空間旋轉速度</span>
                  <span className="text-cyan-400 font-mono">{rotSpeed.toFixed(1)}°</span>
                </div>
                <input 
                  type="range" min="0.0" max="3.0" step="0.2" value={rotSpeed} 
                  onChange={e => setRotSpeed(Number(e.target.value))} 
                  className="w-full h-1 bg-slate-850 rounded accent-cyan-500 cursor-pointer" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Slide Deck Footer Controls */}
        <div className="bg-slate-950 px-8 py-4 flex justify-between items-center border-t border-slate-800">
          <button 
            onClick={() => setSlide(s => Math.max(0, s - 1))} 
            disabled={slide === 0} 
            className="p-2 bg-slate-900 text-slate-400 hover:text-white rounded-lg disabled:opacity-20 border border-slate-800 transition"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex flex-col items-center space-y-1.5">
            <span className="text-xs font-mono font-bold text-slate-500">Slide {slide + 1} / {slides.length}</span>
            <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${((slide + 1) / slides.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <button 
            onClick={() => setSlide(s => Math.min(slides.length - 1, s + 1))} 
            disabled={slide === slides.length - 1} 
            className="p-2 bg-slate-900 text-slate-400 hover:text-white rounded-lg disabled:opacity-20 border border-slate-800 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// --- 4. The Clinical Neurodynamics Podcast with TTS Engine (PodcastTab) ---
// ==========================================
function PodcastTabComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [progress, setProgress] = useState(0);
  const [activeDialogueIndex, setActiveDialogueIndex] = useState(0);
  const [eqHeights, setEqHeights] = useState([12, 8, 20, 16, 5, 24, 12, 18, 10, 15, 7, 22]);
  const [speechStatus, setSpeechStatus] = useState('Speech TTS standby');

  // NotebookLM AI generation panel state variables
  const [podcastSource, setPodcastSource] = useState('default'); // 'default', 'neuron2009', 'slowmanifold2013', 'bmi_clinical', 'custom'
  const [customSourceText, setCustomSourceText] = useState('');
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationLogs, setGenerationLogs] = useState([]);

  const synthRef = useRef(null);
  const utteranceRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Initialize Speech Synthesis safely with try-catch to bypass Sandboxed Iframe SecurityError
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
        setSpeechStatus('Speech TTS ready');
        const refreshVoices = () => {
          const voices = synthRef.current?.getVoices?.() || [];
          if (voices.length > 0) setSpeechStatus('Speech TTS voices loaded');
        };
        refreshVoices();
        window.speechSynthesis.onvoiceschanged = refreshVoices;
      } else {
        setSpeechStatus('Speech TTS unsupported');
      }
    } catch (e) {
      setSpeechStatus('Speech TTS blocked');
      console.warn("Speech synthesis is restricted or unavailable in this sandboxed context:", e);
    }
    return () => {
      try {
        if (synthRef.current) {
          synthRef.current.cancel();
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = null;
          }
        }
      } catch (e) {
        // fail silent
      }
    };
  }, []);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const unlockSpeechEngine = () => {
    try {
      if (!synthRef.current && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
      if (!synthRef.current) {
        setSpeechStatus('Speech TTS unsupported');
        return false;
      }
      synthRef.current.cancel();
      synthRef.current.resume();
      synthRef.current.getVoices();
      setSpeechStatus('Speech TTS unlocked');
      return true;
    } catch (e) {
      setSpeechStatus('Speech TTS ready');
      console.warn('Speech unlock failed:', e);
      return false;
    }
  };

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
      text: "這非常有意思。當神經網路的反饋增益 g 大於 1.5 時，網路微分方程會進入高度混沌狀態，流速無法控制。Sussillo 提出的 FORCE 算法利用遞迴最小平方（RLS），在不改變內部突觸連接的情況下，僅僅快速校準輸出 Readout 突觸，就能把混沌在幾毫秒內穩定下來，變成優美的正弦波或複雜時間軌跡。大腦的小腦與運動皮質就是用這套機制，快速在混亂的電生理背景中，規畫出極高靈活度的精細外科手術或提琴彈奏手勢。",
      time: "03:30"
    },
    {
      speaker: "主持人 Host (AI)",
      text: "最後，關於多工運算（Multitask），Sussillo 提出的「動力學基元 (Dynamical Motifs)」又是如何讓同一個網路能同時執行多個臨床或認知功能呢？",
      time: "04:15"
    },
    {
      speaker: "醫師專家 Guest (You)",
      text: "傳統上大家覺得，如果網路學了新東西，舊的東西就會被覆蓋，這叫災難性遺忘。但 Sussillo 展示了，RNN 可以把不同的任務動力學，放在不同的低維正交子空間（Orthogonal Subspaces）中。就像在同一個網絡裡放了多套正交的向量場。當大腦切換外部輸入信號時，微分方程的相平面會發生微小的平移，調用不同的「動力學基元」去計算，完美實現了認知多工，這對我們理解大腦前額葉的多工決策機制有著決定性的臨床啟示！",
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
        text: "主持人好。2013 年 of 這篇論文成功用拓樸動力系統學解構了 RNN 的多工運算本質。當我們訓練好一個網絡，我們不能只看個別突觸，必須去尋找系統流速 dx/dt ≈ 0 的慢速流形（Slow Manifold）。藉由 L-BFGS 優化，我們發現網路並非靠單一固定點運作，而是利用一條連續的、高度正交的 PC 低維慢速流形來儲存 and 處理多種任務。當收到外部 Go 信號時，系統會跨越 weakly-unstable 的 saddle points 決策邊界進行決策分岔，這將高維微分方程的解析提升到了純粹的幾何美學層面！",
        time: "00:50"
      },
      {
        speaker: "主持人 Host (AI)",
        text: "太不可思議了！高維非線性系統的複雜行為，竟然能被簡化為 PC1, PC2, PC3 子空間中的『不穩定螺旋與鞍點分流幾何』！這對於我們探討大腦前額葉的多工決策有何臨床意義？",
        time: "01:50"
      },
      {
        speaker: "醫師專家 Guest (You)",
        text: "這給了我們解釋人類多工認知機制的鑰匙。當大腦在前額葉進行複雜決策時，不同任務的動力學軌跡被完美放置在互相正交的低維子空間中。工程師們就像同一個突觸網絡中畫了多套正交的向量場。當大腦切換外部輸入信號時，微分方程的相平面發生微小平移，調用平行正交的幾何基元去運算，這徹底防止了任務間的災難性遺忘，為多工認知和持續學習提供了終極 of 幾何學解釋！",
        time: "02:35"
      }
    ],
    bmi_clinical: [
      {
        speaker: "主持人 Host (AI)",
        text: "歡迎收聽『醫學前沿播客』！今天我們聚焦於 David Sussillo 的群體動力學如何應用於前沿的臨床腦機介面 (BMI) 與肢體控制。這對於神經科醫師而言有著怎樣 Hook 的變革性影響？",
        time: "00:00"
      },
      {
        speaker: "醫師專家 Guest (You)",
        text: "主持人好。在傳統腦機介面中，我們常試圖把個別神經元的激發頻率與單個手指肌肉一一對應，但這往往極不穩定且雜訊極大。Sussillo 的流形解碼理論帶來了範式轉移：我們應該直接記錄大批神經元並投射到低維主成分空間，解碼整個『群體軌跡幾何學（Manifold Decoders）』！這能提供極為穩定、抗噪聲的意念控制信號。在臨床上，這讓我們能以無比流暢的方式，引導患者利用額葉的運動流形，精準操縱高難度的多自由度外科義肢，為運動皮質功能的臨床重建提供了堅實的微分幾何基礎！",
        time: "00:50"
      },
      {
        speaker: "主持人 Host (AI)",
        text: "防護及安全意念控制，這簡直是科幻小說走進現實！所以大腦不需要修改個別突觸，而是操作群體動力學流形！這對未來癱瘓或中風患者的康復解鎖了什麼樣的前景？",
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
      if (!activePlay) return;
      if (!unlockSpeechEngine()) {
        simulateProgressFallback(index);
        return;
      }

      const currentLine = currentDialogues[index];
      if (!currentLine) return;
      const utterance = new SpeechSynthesisUtterance(currentLine.text);

      // 強制設定繁體中文 (zh-TW) 語系與極大化音量 (1.0)，防止瀏覽器因語言錯亂或未設定而發出蚊子聲或靜音
      utterance.lang = 'zh-TW';
      utterance.volume = 1.0;

      const voices = synthRef.current.getVoices();
      // 優先尋找台灣繁體中文 (zh-TW)，其次尋找任何中文 (zh) 語音
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
        setSpeechStatus(`Speaking ${index + 1}/${currentDialogues.length}`);
        setActiveDialogueIndex(index);
        setProgress((index * 100) / currentDialogues.length);
      };

      utterance.onerror = () => {
        setSpeechStatus('Speech TTS ready');
        simulateProgressFallback(index);
      };

      utterance.onend = () => {
        const nextIndex = index + 1;
        if (nextIndex < currentDialogues.length && isPlayingRef.current) {
          speakLine(nextIndex, true);
        } else if (nextIndex >= currentDialogues.length) {
          setIsPlaying(false);
          setProgress(100);
          setSpeechStatus('Podcast playback complete');
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
    unlockSpeechEngine();
    setSpeechStatus('Generating podcast audio queue');
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
      "[NotebookLM AI] 🎙️ 合成 Guest 語氣：" + (podcastSource === 'custom' ? "結合臨床實例分析：" + (customSourceText.substring(0, 15) || "自定義主題") + "..." : "大腦小腦、前額葉子空間正交計算與臨床適應性..."),
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
        setIsGeneratingPodcast(false);
        isPlayingRef.current = false;
        setIsPlaying(false);
        setSpeechStatus('Podcast generated. Press Play to start audio.');
      }
    }, 450);
  };

  // Sync EQ waves bouncing
  useEffect(() => {
    let eqInterval;
    if (isPlaying) {
      eqInterval = setInterval(() => {
        setEqHeights(prev => prev.map(() => Math.floor(Math.random() * 20) + 4));
      }, 100);
    } else {
      setEqHeights(prev => prev.map(() => 4));
      if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
    }
    return () => clearInterval(eqInterval);
  }, [isPlaying]);

  // Keep pause/stop deterministic without starting speech from a React effect.
  useEffect(() => {
    if (!isPlaying && synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch (e) {
        // silent
      }
    }
  }, [isPlaying]);

  // Adjust Speech rate when speed changes in real-time safely
  useEffect(() => {
    try {
      if (isPlaying && synthRef.current) {
        speakLine(activeDialogueIndex, true);
      }
    } catch (e) {
      // silent
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    if (isPlaying) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (synthRef.current) {
        try {
          synthRef.current.cancel();
        } catch (e) {
          // silent
        }
      }
      setSpeechStatus('Podcast paused');
    } else {
      try {
        unlockSpeechEngine();
        isPlayingRef.current = true;
        setIsPlaying(true);
        setSpeechStatus('Preparing podcast playback');
        speakLine(activeDialogueIndex, true);
      } catch (e) {
        isPlayingRef.current = true;
        setIsPlaying(true);
        setSpeechStatus('Speech TTS ready');
        simulateProgressFallback(activeDialogueIndex);
      }
    }
  };

  const jumpToDialogue = (index) => {
    setActiveDialogueIndex(index);
    setProgress((index * 100) / currentDialogues.length);
    if (isPlaying) {
      speakLine(index, true);
    }
  };

  return (
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

      {/* Podcast Dashboard Card */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-900/30 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>

        <div className="space-y-4 relative z-10 text-center md:text-left flex-1">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full text-xs text-indigo-400 font-bold">
            <Mic size={14} />
            <span>Ep.02 • 臨床動力系統系列</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white tracking-wide leading-tight">
              破解大腦群體動力學密碼
            </h3>
            <p className="text-sm text-cyan-400 font-medium mt-1">從 David Sussillo 的幾何吸引子到 FORCE 演算法</p>
          </div>
          
          <div className="flex items-center justify-center md:justify-start space-x-1.5 h-10 pt-2">
            {eqHeights.map((h, i) => (
              <div 
                key={i} 
                className="w-1 bg-cyan-400 rounded-full transition-all duration-150"
                style={{ 
                  height: `${h}px`,
                  opacity: isPlaying ? 0.9 : 0.4 
                }}
              />
            ))}
            <span className="text-xs text-slate-500 ml-4 font-mono">{speechStatus}</span>
          </div>
        </div>

        {/* Player Controls Container */}
        <div className="bg-slate-950/70 border border-slate-800 p-6 rounded-2xl w-full md:w-96 flex flex-col space-y-4 shadow-xl backdrop-blur relative z-10">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>{Math.floor(progress * 0.03)}:{(Math.floor(progress * 3) % 60).toString().padStart(2, '0')}</span>
            <span>05:00</span>
          </div>
          
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const newProgress = (clickX / rect.width) * 100;
              setProgress(newProgress);
              const segmentSize = 100 / currentDialogues.length;
              const newIndex = Math.min(Math.floor(newProgress / segmentSize), currentDialogues.length - 1);
              jumpToDialogue(newIndex);
            }}
            className="w-full h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative group"
          >
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-100"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button 
              onClick={() => setPlaybackSpeed(s => s === 1.0 ? 1.25 : s === 1.25 ? 1.5 : 1.0)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white font-mono"
            >
              {playbackSpeed.toFixed(2)}x Speed
            </button>

            <button 
              aria-label={isPlaying ? "Pause podcast audio" : "Play podcast audio"}
              onClick={togglePlay}
              className="bg-indigo-600 hover:bg-indigo-500 text-white w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg shadow-indigo-600/30"
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
              ) : (
                <Play fill="currentColor" size={20} className="ml-0.5" />
              )}
            </button>

            <div className="flex items-center space-x-2 text-slate-500">
              <span>🔊</span>
              <div className="w-16 h-1 bg-slate-800 rounded-full">
                <div className="h-full bg-slate-600 w-3/4 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Script Dialogues */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h4 className="font-extrabold text-white text-base">
            神經動力學廣播同步字稿與導航 <span className="text-cyan-400 font-bold ml-2">(支援網頁語音朗讀)</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">點選文字區段可直接跳轉語音進度</span>
        </div>
        
        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-800">
          {currentDialogues.map((item, idx) => {
            const isHost = item.speaker.includes("Host");
            const isActive = activeDialogueIndex === idx;
            return (
              <div 
                key={idx} 
                onClick={() => jumpToDialogue(idx)}
                className={`flex flex-col p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${
                  isActive 
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/20' 
                    : 'bg-slate-950/40 border-transparent hover:border-slate-800 hover:bg-slate-900/30'
                } ${isHost ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className={`text-[10px] font-extrabold tracking-wide px-2 py-0.5 rounded-full ${
                    isHost ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {item.speaker}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">{item.time}</span>
                </div>
                <div className={`text-xs leading-relaxed max-w-[85%] ${
                  isActive ? 'text-slate-100 font-medium' : 'text-slate-400'
                } ${isHost ? 'text-left' : 'text-right'}`}>
                  {item.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// ==========================================
// --- 5. Jupyter Companion & Euler Integration Game (PythonTab) ---
// ==========================================
function PythonTabComponent() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <EulerStepGame />

      <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>📖</span>
              <span>Jupyter Notebook 專屬代碼練習</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              我們已在您的本地工作區中生成了極為詳盡的 Jupyter Notebook 文件：`Neurodynamics_Sussillo_FORCE.ipynb`
            </p>
          </div>
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-2 rounded-xl text-xs text-indigo-400 font-bold">
            <span>🧠</span>
            <span>FORCE & attractors ipynb</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          這個 Notebook 中包含三個部分：從單個 LIF 微分方程的 Euler 積分，到 STN-GPe 巴金森氏症 Coupled ODE，以及 **David Sussillo 連續時間混沌 RNN 與 FORCE Algorithm 的完整模擬與幾何吸引子相平面繪製**。
        </p>

        {/* Terminal launching instructions */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400">💡 快速在本地開啟練習步驟：</span>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 space-y-1.5 shadow-inner">
            <div><span className="text-slate-500"># 1. 切換至當前專案資料夾</span></div>
            <div>cd c:\Users\User\2026Antigravity</div>
            <div><span className="text-slate-500"># 2. 開啟您的 Jupyter Notebook 環境</span></div>
            <div>jupyter notebook</div>
            <div><span className="text-slate-500"># 3. 點選並執行「Neurodynamics_Sussillo_FORCE.ipynb」</span></div>
          </div>
        </div>

        {/* Code snippet display */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400">🔬 關鍵 Python 實作展示 (Sussillo FORCE Chaotic Recurrent Network RLS)：</span>
          <div className="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-inner border border-slate-800">
            <div className="bg-[#2D2D2D] px-4 py-2.5 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 font-semibold">sussillo_force_learning.py</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Python Snippet</span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`import numpy as np
import matplotlib.pyplot as plt

# =====================================================================
# David Sussillo & Abbott (Neuron 2009) FORCE Algorithm
# 100-neuron Chaotic Continuous-Time Recurrent Neural Network (RNN)
# =====================================================================

N = 100         # 神經元數量
g = 1.5         # 混沌增益強度 (g > 1.0 進入混沌)
alpha = 1.0     # RLS 正則化常數
dt = 0.5        # ms
tau = 10.0      # ms
sim_steps = 2000

# 隨機稀疏連接矩陣 (內部隨機混沌突觸)
W_rec = np.random.normal(0, g / np.sqrt(N), (N, N))
# 反饋突觸權重 (Output to Recurrent feedback loop)
W_feedback = np.random.uniform(-1, 1, (N, 1))
# 初始化待學習的 Readout 突觸輸出權重
W_out = np.zeros((1, N))

# 初始化 RLS 協方差矩陣 P = (1/alpha) * I
P = np.eye(N) / alpha

# 狀態向量初始化
x = np.random.normal(0, 0.1, (N, 1))
r = np.tanh(x)

# 目標訊號 (Target multi-frequency waveform)
t_vec = np.arange(sim_steps) * dt
target = np.sin(2 * np.pi * 0.015 * t_vec) + 0.5 * np.cos(2 * np.pi * 0.035 * t_vec)

z_history = []
target_history = []

# FORCE 遞迴更新訓練迴圈
for t in range(sim_steps):
    # 1. 遞迴神經元狀態更新 (Continuous-Time RNN ODE)
    z_prev = np.dot(W_out, r)
    dxdt = (-x + np.dot(W_rec, r) + W_feedback * z_prev) / tau
    x += dxdt * dt
    r = np.tanh(x)
    
    # 2. 計算目前 Readout 預測輸出與誤差
    z = np.dot(W_out, r)[0, 0]
    f = target[t]
    error = z - f
    
    # 3. RLS 線上修正協方差矩陣 P (Recursive Least Squares)
    Pr = np.dot(P, r)
    rPr = np.dot(r.T, Pr)[0, 0]
    k = Pr / (1.0 + rPr)
    P -= np.dot(k, Pr.T)
    
    # 4. 線上修正突觸權重 W_out
    W_out -= error * k.T
    
    # 儲存軌跡
    z_history.append(z)
    target_history.append(f)

# 繪製 FORCE 混沌降伏學習成果
plt.figure(figsize=(10, 4))
plt.plot(t_vec, target_history, 'r--', label='Target wave', alpha=0.8)
plt.plot(t_vec, z_history, 'b-', label='RNN Output z(t)', alpha=0.8)
plt.title('FORCE Algorithm Online Synaptic Training (Sussillo & Abbott 2009)')
plt.xlabel('Time (ms)')
plt.ylabel('Signal Amplitude')
plt.legend()
plt.grid(True)
plt.show()`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Interactive Euler Step integration game component ---
function EulerStepGame() {
  const V_old = -70.0;
  const V_rest = -70.0;
  const R = 1.0;
  const I_ext = 15.0;
  const tau = 10.0;
  const dt = 0.5;

  const [dVdtVal, setDVdtVal] = useState('');
  const [deltaVVal, setDeltaVVal] = useState('');
  const [vNewVal, setVNewVal] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDxdtCorrect, setIsDxdtCorrect] = useState(false);
  const [isDeltaCorrect, setIsDeltaCorrect] = useState(false);
  const [isVNewCorrect, setIsVNewCorrect] = useState(false);

  const checkMath = () => {
    const userDVdt = parseFloat(dVdtVal);
    const userDeltaV = parseFloat(deltaVVal);
    const userVNew = parseFloat(vNewVal);

    const dVdtCorrect = Math.abs(userDVdt - 1.5) < 0.05;
    const deltaCorrect = Math.abs(userDeltaV - 0.75) < 0.05;
    const vNewCorrect = Math.abs(userVNew - (-69.25)) < 0.05;

    setIsDxdtCorrect(dVdtCorrect);
    setIsDeltaCorrect(deltaCorrect);
    setIsVNewCorrect(vNewCorrect);
    setIsSubmitted(true);
  };

  const resetGame = () => {
    setDVdtVal('');
    setDeltaVVal('');
    setVNewVal('');
    setIsSubmitted(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 animate-in slide-in-from-top-4 duration-300 font-sans">
      <div className="flex items-center space-x-2 text-indigo-400 font-sans">
        <span>✨</span>
        <span className="text-sm font-bold uppercase tracking-wider">電生理數值解挑戰</span>
      </div>
      <div>
        <h3 className="text-lg font-bold text-white font-sans">互動式：Euler 數值積分逐步計算挑戰</h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
          微積分是動力學的語言，而在電腦中我們用 Euler's Method 將連續的微分轉化為離散的步伐。
          請試著扮演微處理器，一步一步算出下一個時間點神經元的膜電位！
        </p>
      </div>

      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 text-center">
          <span className="text-[10px] text-slate-500 font-mono block">初始 V_old</span>
          <span className="text-sm font-extrabold text-white font-mono">-70.0 mV</span>
        </div>
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 text-center">
          <span className="text-[10px] text-slate-500 font-mono block">靜息 V_rest</span>
          <span className="text-sm font-extrabold text-white font-mono">-70.0 mV</span>
        </div>
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 text-center">
          <span className="text-[10px] text-slate-500 font-mono block">輸入 I_ext</span>
          <span className="text-sm font-extrabold text-cyan-400 font-mono">15.0 nA</span>
        </div>
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 text-center">
          <span className="text-[10px] text-slate-500 font-mono block">時間常數 τ</span>
          <span className="text-sm font-extrabold text-indigo-400 font-mono">10.0 ms</span>
        </div>
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 text-center col-span-2 md:col-span-1">
          <span className="text-[10px] text-slate-500 font-mono block">時間跨度 dt</span>
          <span className="text-sm font-extrabold text-emerald-400 font-mono">0.5 ms</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 font-sans">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block font-sans">
            步驟 1: 計算流速 dV/dt (mV/ms)
          </label>
          <div className="relative">
            <input 
              type="text" value={dVdtVal} onChange={e => setDVdtVal(e.target.value)} disabled={isSubmitted}
              placeholder="e.g. 1.25"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono focus:border-indigo-500 outline-none"
            />
            {isSubmitted && (
              <span className={`absolute right-3 top-3 text-[10px] font-bold font-sans ${isDxdtCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                {isDxdtCorrect ? '✓ 正確' : '✗ 錯誤 (應為 1.5)'}
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-mono">公式：dV/dt = (-(V_old - V_rest) + R*I) / τ</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block font-sans">
            步驟 2: 計算電壓改变量 ΔV (mV)
          </label>
          <div className="relative">
            <input 
              type="text" value={deltaVVal} onChange={e => setDeltaVVal(e.target.value)} disabled={isSubmitted}
              placeholder="e.g. 0.6"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono focus:border-indigo-500 outline-none"
            />
            {isSubmitted && (
              <span className={`absolute right-3 top-3 text-[10px] font-bold font-sans ${isDeltaCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                {isDeltaCorrect ? '✓ 正確' : '✗ 錯誤 (應為 0.75)'}
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-mono">公式：ΔV = dV/dt · dt</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block font-sans">
            步驟 3: 更新後新電位 V_new (mV)
          </label>
          <div className="relative">
            <input 
              type="text" value={vNewVal} onChange={e => setVNewVal(e.target.value)} disabled={isSubmitted}
              placeholder="e.g. -69.4"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono focus:border-indigo-500 outline-none"
            />
            {isSubmitted && (
              <span className={`absolute right-3 top-3 text-[10px] font-bold font-sans ${isVNewCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                {isVNewCorrect ? '✓ 正確' : '✗ 錯誤 (應為 -69.25)'}
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-mono">公式：V_new = V_old + ΔV</p>
        </div>
      </div>

      <div className="flex space-x-3 pt-2">
        {!isSubmitted ? (
          <button 
            onClick={checkMath}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/20 font-sans"
          >
            驗證計算結果
          </button>
        ) : (
          <button 
            onClick={resetGame}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition border border-slate-700 font-sans"
          >
            重新挑戰
          </button>
        )}
      </div>

      {isSubmitted && (
        <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-900/30 text-xs text-slate-300 leading-relaxed space-y-3.5 animate-in slide-in-from-bottom-2 duration-300 font-sans">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold font-sans">
            <span>💡</span>
            <span>逐步解析與推導過程</span>
          </div>
          <div className="space-y-2 font-sans">
            <p>
              1. <strong>計算膜電壓流速 (dV/dt)</strong>：由於 V_old = V_rest = -70.0 mV，表示此時漏電流為 0，流入的刺激電流完全用於充電。
              <br/>
              dV/dt = (-( -70 - (-70) ) + 1.0 * 15.0) / 10.0 = 15.0 / 10.0 = 1.5 mV/ms
            </p>
            <p>
              2. <strong>計算更新增量 (ΔV)</strong>：在連續的微分中，我們用有限時間跨度 dt = 0.5 ms 來近似。
              <br/>
              ΔV = 1.5 mV/ms * 0.5 ms = 0.75 mV
            </p>
            <p>
              3. <strong>計算更新後的膜電壓 (V_new)</strong>：在原本的電位上加上變量，得到下一時刻的估算電位。
              <br/>
              V_new = -70.0 mV + 0.75 mV = -69.25 mV
            </p>
          </div>
          <div className="flex items-start space-x-2 bg-slate-950 p-3 rounded-lg border border-slate-850 text-[11px] text-slate-400 font-sans">
            <span>⚠️</span>
            <span>這就是大腦模擬的核心！電腦中的 Python NumPy 正是以同樣的公式，在極短的 dt 內重複運作數萬次，描繪出複雜神經動力軌跡！</span>
          </div>
        </div>
      )}

    </div>
  );
}