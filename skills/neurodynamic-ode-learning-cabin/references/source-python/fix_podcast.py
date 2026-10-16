# -*- coding: utf-8 -*-
import io

print("Starting fix_podcast.py...")

with io.open("ode.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 尋找 PodcastTabComponent 的定義起點
start_marker = "function PodcastTabComponent() {"
start_idx = content.find(start_marker)
if start_idx == -1:
    print("Error: Could not find function PodcastTabComponent()!")
    exit(1)

# 尋找 PodcastTabComponent 內部的第一個 return (
end_marker = "return ("
end_idx = content.find(end_marker, start_idx)
if end_idx == -1:
    print("Error: Could not find return ( inside PodcastTabComponent!")
    exit(1)

print(f"Found component from character {start_idx} to {end_idx}")

# 我們要寫入的 100% 完美、完整的宣告區段代碼
correct_declarations = """function PodcastTabComponent() {
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
        text: "這給了我們解釋人類多工認知機制的鑰匙。當大腦在前額葉進行複雜決策時，不同任務的動力學軌跡被完美放置在互相正交的低維子空間中。工程師們就像同一個突觸網絡中畫了多套正交的向量場。當大腦切換外部輸入信號時，微分方程的相平面發生微小平移，調用平行正交的幾何基元去運算，這徹底防止了任務間的災難性遺忘，為多工認知和持續學習提供了終極的幾何學解釋！",
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
        setIsPlaying(false);
        setIsGeneratingPodcast(false);
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

  // Watch isPlaying to control Speech engine safely
  useEffect(() => {
    try {
      if (isPlaying) {
        speakLine(activeDialogueIndex, true);
      } else {
        if (synthRef.current) {
          synthRef.current.pause();
        }
      }
    } catch (e) {
      // silent
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
      setIsPlaying(false);
    } else {
      try {
        if (synthRef.current && synthRef.current.paused) {
          synthRef.current.resume();
          setIsPlaying(true);
        } else {
          setIsPlaying(true);
        }
      } catch (e) {
        setIsPlaying(true); 
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

  """

new_content = content[:start_idx] + correct_declarations + content[end_idx:]

with io.open("ode.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully fixed PodcastTabComponent in ode.tsx!")
