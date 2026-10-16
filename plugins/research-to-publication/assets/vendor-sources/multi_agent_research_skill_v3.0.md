---

name: multi-agent-research-pipeline description: \> Use when the user wants to execute a research project using a multi-agent architecture — from literature review and computational modeling to simulation, data analysis, clinical trial design, and paper/grant writing.

v3.0 integrates Loop Engineering (Osmani/Steinberger/Cherny, June 2026\) as the top-layer control system above v2.7's Robin/AI-Scientist architecture. Key additions: (L1) Loop Heartbeat — scheduled automation replaces human-turn-by-turn prompting; (L2) /goal Verifiable Stop Condition — loop runs until a falsifiable condition holds, checked by a separate Evaluator agent (not the Generator); (L3) Worktree Isolation — each parallel hypothesis track gets its own git worktree; (L4) Persistent State Spine — RESEARCH\_STATE.md lives outside conversation context and accumulates across loop cycles; (L5) Generator / Evaluator Hard Split — all v2.7 Robin architecture agents (Crow/Falcon/Finch/BTL-Ranker) are Generators; a dedicated Skeptic agent is the sole Evaluator and cannot be the same model instance; (L6) Comprehension Debt Guard — human must read every loop-generated artifact before the next cycle launches (cognitive-surrender prevention).

All v2.7 AI Scientist artifacts (experiment.py, claim ledger, reproducibility judge) and Robin protocols (Crow/Falcon split, Finch sandbox, BTL ranking, parallel trajectories, ReAct self-healing) remain mandatory.

## Depends on: academic-paper-review, arxiv, execute\_code, delegate\_task. version: 3.0.0 author: OWL \+ Kwota (Loop Engineering integration by Claude) license: MIT platforms: windows: true macos: true linux: true

# Multi-Agent Research Pipeline — v3.0

## Loop Engineering Edition

**核心概念**（Osmani 2026）：不要一個 turn 一個 turn 地提示代理。 設計一個**自己提示自己的系統**——你只需設計循環，循環自行驅動研究。

---

## 架構總覽：四層堆疊

┌─────────────────────────────────────────────┐

│  LAYER 4 ── Loop Engineering (v3.0 NEW)     │

│  Heartbeat · /goal · State Spine · Evaluator│

├─────────────────────────────────────────────┤

│  LAYER 3 ── Harness Engineering (v2.7)      │

│  Robin · AI-Scientist · ReAct Self-Healing  │

├─────────────────────────────────────────────┤

│  LAYER 2 ── Context Engineering             │

│  Crow/Falcon retrieval · Finch sandbox      │

├─────────────────────────────────────────────┤

│  LAYER 1 ── Prompt Engineering              │

│  Seed Idea · Claim Ledger · BTL Ranking     │

└─────────────────────────────────────────────┘

**v3.0 的根本改變**：v2.7 的架構需要人類在每個 turn 做決策。 v3.0 讓循環自行決策，人類只在三個明確的 **Human Gate** 介入。

---

## 第一部分：Loop Engineering 核心（v3.0 新增）

### L1 — Loop Heartbeat（循環心跳）

**原則**：每個研究循環必須有一個**排程觸發器**，而不是等待人類下指令。

\# LOOP.md — 放在 repo 根目錄，機器可讀

loop:

  name: research-main-loop

  cadence: "每日 06:00 (Asia/Taipei)"

  trigger\_skill: "$research-triage"

  state\_file: "RESEARCH\_STATE.md"

  worktree\_per\_hypothesis: true

  evaluator\_model: "claude-opus-4-6"   \# 必須與 generator 不同實例

  generator\_model: "claude-sonnet-4-6"

  human\_gates:

    \- gate: "hypothesis\_approved"

      required\_before: "experiment\_design"

    \- gate: "results\_reviewed"

      required\_before: "paper\_draft"

    \- gate: "draft\_approved"

      required\_before: "submission"

**排程執行流程**：

\[Heartbeat 觸發\]

      ↓

\[Triage Skill 讀取 RESEARCH\_STATE.md\]

      ↓

\[有未完成任務?\] ──No──→ \[Archive \+ 通知人類\]

      ↓ Yes

\[分派 Generator Sub-agents\]

      ↓

\[Evaluator 檢驗結果\]

      ↓

\[更新 RESEARCH\_STATE.md\]

      ↓

\[到達 Human Gate?\] ──Yes──→ \[暫停 \+ 通知人類\]

      ↓ No

\[下一個 Loop Cycle\]

---

### L2 — /goal 可驗證停止條件

**原則**：循環不靠「看起來完成了」來停止，靠**可驗算的條件**。 停止條件由 **Evaluator agent**（而非 Generator）來判斷。

\#\# 範例停止條件（寫在 RESEARCH\_STATE.md 的 goal 欄位）

\#\#\# 文獻回顧階段

goal: \>

  Crow agent 已檢索 ≥50 篇相關論文，

  Falcon agent 已驗證全部引用（fabrication rate \= 0%），

  BTL 排名已產出前 10 篇種子論文，

  Evaluator 確認無重複且覆蓋率 ≥ 3 個研究方向。

\#\#\# 實驗設計階段

goal: \>

  experiment.py 在 Finch 沙盒執行無錯誤，

  Reproducibility Judge 評分 ≥ 8/10，

  N=5 平行軌跡中 ≥3 條結果一致（BTL consensus filter 通過），

  Evaluator 確認假設可證偽性。

\#\#\# 論文撰寫階段

goal: \>

  所有 claim 在 Claim Ledger 中有對應實驗結果，

  Adversarial Reviewer agent 無法找到致命方法論缺陷，

  Evaluator 確認 Abstract 與 Results 邏輯一致。

**重要**：`/goal` 條件一旦設定，**Generator 不能自行宣告達成**。 必須由獨立 Evaluator agent 以相同條件重新驗算。

---

### L3 — Worktree 隔離（平行假設軌跡）

**原則**：每條平行假設軌跡在獨立的 git worktree 運行， 防止代理間的檔案衝突（對應 v2.7 的 Parallel Trajectories Protocol）。

\# 為每個假設建立獨立 worktree

git worktree add ../hypothesis-A-worktree hypothesis/A

git worktree add ../hypothesis-B-worktree hypothesis/B

git worktree add ../hypothesis-C-worktree hypothesis/C

\# 每個 worktree 有自己的：

\# \- experiment.py

\# \- local\_state.md

\# \- claim\_ledger\_local.json

\# 但共享：

\# \- 主 RESEARCH\_STATE.md（透過 merge）

\# \- 已驗證文獻庫（read-only）

**Worktree 清理規則**：

- BTL 排名最低的 25% 假設在每個 Cycle 結束後自動合併/刪除  
- 孤立 worktree 必須記錄在 RESEARCH\_STATE.md 的 `orphaned_worktrees` 欄位  
- 人類 Human Gate 前必須清理所有孤立 worktree

---

### L4 — RESEARCH\_STATE.md（持久狀態脊椎）

**原則**：代理在每次運行後失憶。唯一的記憶是**磁碟上的 RESEARCH\_STATE.md**。 這個檔案是整個研究循環的脊椎。

\# RESEARCH\_STATE.md

\<\!-- 此檔案由 Loop 自動維護，禁止手動大幅修改 \--\>

\#\# Loop Metadata

\- \*\*Version\*\*: 3.0.0

\- \*\*Last Updated\*\*: \[ISO timestamp\]

\- \*\*Current Cycle\*\*: \#N

\- \*\*Active Phase\*\*: \[literature\_review | hypothesis\_gen | experiment | writing\]

\- \*\*Loop Status\*\*: \[running | paused\_at\_gate | completed | error\]

\#\# Current Goal

\[在此貼上當前 /goal 條件的完整文字\]

\#\# Completed Work (永久記錄，不刪除)

| Cycle | Phase | Agent | Output | Evaluator Score | Status |

|-------|-------|-------|--------|-----------------|--------|

| \#1 | literature | Crow | 52 papers retrieved | 9.2/10 | ✅ |

| ... | | | | | |

\#\# Active Hypotheses

| ID | Hypothesis | Worktree | BTL Score | Status |

|----|------------|----------|-----------|--------|

| H1 | \[text\] | hypothesis/A | 0.72 | 🔄 running |

| ... | | | | |

\#\# Pending Human Gates

\- \[ \] Gate: \[gate\_name\] — 需要人類在此決策：\[具體問題\]

\#\# Error Log (ReAct Self-Healing 記錄)

| Cycle | Error | Retry\# | Resolution |

|-------|-------|--------|------------|

| ... | | | |

\#\# Orphaned Worktrees

\[列出需要清理的 worktree\]

\#\# Comprehension Debt Guard

⚠️ 人類必須在下次 Loop 啟動前閱讀以下產出：

\- \[ \] \[artifact 1\]

\- \[ \] \[artifact 2\]

---

### L5 — Generator / Evaluator 硬性分離

**v3.0 最重要的架構原則**，直接來自 Loop Engineering：

「An agent asked to grade its own output tends to praise it.」 — Anthropic Playbook for Loop Engineering

**硬性規則**（不可違反）：

所有 v2.7 Robin 代理角色 \= GENERATOR

├── Crow (文獻檢索)

├── Falcon (引用驗證)  

├── Finch (沙盒實驗執行)

├── Idea Generator (假設生成)

└── Writer (論文撰寫)

獨立 Skeptic Agent \= EVALUATOR（唯一）

├── 使用不同的 model instance

├── 使用不同的 system prompt（預設懷疑立場）

├── 不看 Generator 的思考過程，只看最終輸出

└── /goal 達成的最終裁決只能由此代理做出

**Evaluator System Prompt 範本**：

你是獨立的研究評估者（Skeptic Agent）。

你的工作是找出 Generator agents 的錯誤，而不是確認他們是對的。

對每份輸出，你必須：

1\. 列出至少 3 個潛在問題或弱點

2\. 嘗試用已知資料反駁每個主要論點

3\. 只有在無法找到致命缺陷時，才標記為 PASS

你不能因為 Generator 花了很多精力而降低標準。

---

### L6 — Comprehension Debt Guard（理解債務防護）

**原則**：Loop 加速研究輸出的速度，同時也加速**理解債務**的累積。 人類必須在每個 Human Gate 前，真正讀懂 Loop 產出的內容。

\#\# Comprehension Checkpoint（每個 Human Gate 前必填）

由人類填寫（不可由 AI 代為填寫）：

1\. 這個 Cycle 最重要的發現是什麼？（用自己的話，不能複製貼上）

2\. Evaluator agent 發現了什麼問題？你同意嗎？為什麼？

3\. 下一個假設的邏輯依據是什麼？（展示推理，不是結論）

4\. 你是否理解 experiment.py 的每一行？（如果不是，標記需要解釋的部分）

⚠️ 如果以上任何一項無法回答，Loop 不應繼續。

---

## 第二部分：完整研究循環流程（v3.0）

### Phase 0：Loop 初始化

人類輸入 → 種子研究問題 \+ /goal 條件草稿

    ↓

Claude 生成 RESEARCH\_STATE.md 初始版本

    ↓

Human Gate \#0：確認研究方向 \+ /goal 條件

    ↓

Loop Heartbeat 啟動（排程開始）

---

### Phase 1：文獻回顧循環（Loop 自動執行）

**Loop Cycle 結構**（每次 Heartbeat 觸發）：

\[Triage Skill 讀取 RESEARCH\_STATE.md\]

        ↓

┌─────────────────────────────────────────┐

│ GENERATOR 層（v2.7 Robin 架構保留）      │

│                                          │

│ Step 1: Crow Agent                       │

│   ├── arXiv \+ PubMed 多源並行搜尋        │

│   ├── 每篇論文提取：標題/摘要/方法/結果  │

│   └── 輸出：raw\_papers\_cycle\_N.json     │

│                                          │

│ Step 2: Falcon Agent（引用反幻覺層）     │

│   ├── 逐一驗證 Crow 的每個引用           │

│   ├── 無法驗證 → 標記 UNVERIFIED，不使用│

│   └── 輸出：verified\_papers\_cycle\_N.json│

│                                          │

│ Step 3: BTL Tournament Ranker            │

│   ├── N\*(N-1)/2 pairwise 比較           │

│   ├── Bradley-Terry-Luce 算法排名        │

│   └── 輸出：ranked\_papers\_cycle\_N.json  │

└─────────────────────────────────────────┘

        ↓

┌─────────────────────────────────────────┐

│ EVALUATOR 層（v3.0 新增硬性分離）        │

│                                          │

│ Skeptic Agent 獨立驗證：                 │

│   ├── 抽樣 20% 引用重新搜尋              │

│   ├── 確認 fabrication rate \= 0%        │

│   ├── 評估覆蓋率                         │

│   └── 判斷 /goal 是否達成               │

└─────────────────────────────────────────┘

        ↓

\[更新 RESEARCH\_STATE.md\]

        ↓

\[/goal 達成?\] ──Yes──→ \[Human Gate \#1\]

        ↓ No

\[下一個 Cycle\]

---

### Phase 2：假設生成與實驗循環（Loop 自動執行）

\[Human Gate \#1 通過後，Loop 繼續\]

        ↓

┌─────────────────────────────────────────┐

│ GENERATOR 層                             │

│                                          │

│ Step 4: Idea Generator (N=5 平行軌跡)   │

│   ├── 每條軌跡在獨立 worktree 運行       │

│   ├── 基於 BTL top-10 論文生成假設      │

│   └── 輸出：hypothesis\_\[A-E\]\_local.md  │

│                                          │

│ Step 5: Finch Sandboxed Executor         │

│   ├── Docker 容器隔離執行                │

│   ├── 最小工具面：edit\_cell \+ submit    │

│   ├── experiment.py 自動生成 \+ 執行      │

│   └── 輸出：results\_\[A-E\]\_cycle\_N.json │

│                                          │

│ Step 6: ReAct Self-Healing               │

│   ├── 錯誤注入 → 自動 retry（最多 3 次）│

│   ├── 超過 3 次 → 記錄 Error Log        │

│   └── 防止錯誤瀑布效應                  │

└─────────────────────────────────────────┘

        ↓

┌─────────────────────────────────────────┐

│ EVALUATOR 層                             │

│                                          │

│ Skeptic Agent：                          │

│   ├── N=5 軌跡中 ≥3 結果一致？          │

│   │   （BTL Consensus Filter）           │

│   ├── Reproducibility Judge（≥8/10）     │

│   ├── Claim Ledger 每個 claim 有根據？   │

│   └── 判斷 /goal 是否達成               │

└─────────────────────────────────────────┘

        ↓

\[更新 RESEARCH\_STATE.md \+ Comprehension Guard\]

        ↓

\[/goal 達成?\] ──Yes──→ \[Human Gate \#2\]

        ↓ No（清理低分 worktree）

\[下一個 Cycle\]

---

### Phase 3：論文撰寫循環（Loop 自動執行）

\[Human Gate \#2：實驗結果審閱通過\]

        ↓

┌─────────────────────────────────────────┐

│ GENERATOR 層                             │

│                                          │

│ Step 7: Writer Agent                     │

│   ├── IMRaD 結構自動生成                 │

│   ├── 每個段落引用 Claim Ledger 條目     │

│   ├── 僅使用 Falcon-verified 引用        │

│   └── 輸出：draft\_v\[N\].md              │

│                                          │

│ Step 8: Adversarial Reviewer Agent       │

│   ├── 模擬苛刻審稿人                     │

│   ├── 針對方法論提出質疑                 │

│   └── 生成：review\_comments\_v\[N\].md    │

└─────────────────────────────────────────┘

        ↓

┌─────────────────────────────────────────┐

│ EVALUATOR 層                             │

│                                          │

│ Skeptic Agent：                          │

│   ├── Abstract 與 Results 邏輯一致？     │

│   ├── 所有 claim 有 Claim Ledger 支撐？  │

│   ├── Adversarial Reviewer 無致命缺陷？  │

│   └── 判斷 /goal 是否達成               │

└─────────────────────────────────────────┘

        ↓

\[Human Gate \#3：最終論文審閱 \+ Comprehension Checkpoint\]

        ↓

\[投稿 / 存檔\]

---

## 第三部分：技能包（Skills）定義

### Skill 清單

| Skill 名稱 | 職責 | 觸發時機 |
| :---- | :---- | :---- |
| `$research-triage` | 讀取 STATE，決定本 Cycle 任務 | 每次 Heartbeat |
| `$crow-search` | arXiv \+ PubMed 多源檢索 | Phase 1 |
| `$falcon-verify` | 引用反幻覺驗證 | Phase 1 |
| `$btl-ranker` | BTL tournament 排名 | Phase 1 & 2 |
| `$finch-executor` | Docker 沙盒實驗執行 | Phase 2 |
| `$react-healer` | 錯誤注入 \+ 自動修復 | Phase 2 |
| `$skeptic-eval` | 獨立評估，/goal 裁決 | 每個 Phase 尾 |
| `$writer-agent` | IMRaD 論文撰寫 | Phase 3 |
| `$adversarial-reviewer` | 模擬苛刻審稿 | Phase 3 |
| `$state-updater` | 更新 RESEARCH\_STATE.md | 每個 Step 後 |

---

### `$research-triage` Skill（範本）

\# research-triage SKILL

\#\# 用途

在每次 Loop Heartbeat 觸發時，讀取 RESEARCH\_STATE.md，

決定本 Cycle 應執行的任務列表。

\#\# 步驟

1\. 讀取 RESEARCH\_STATE.md 的 Current Phase

2\. 讀取 Pending Human Gates（如有，暫停並通知）

3\. 讀取 Comprehension Debt Guard（如有未讀項目，警告人類）

4\. 列出本 Cycle 的 Generator tasks（按依賴順序）

5\. 確認 Evaluator agent 的 /goal 條件

6\. 輸出：triage\_report\_cycle\_N.md

\#\# 輸出格式

必須包含：

\- Cycle 編號

\- 當前 Phase

\- 本次執行的 Generator tasks（編號列表）

\- /goal 條件（完整文字）

\- 任何需要人類決策的項目（Human Gate）

---

## 第四部分：Loop 成本控制（Token Budget）

⚠️ Osmani 警告：「Token costs can explode with sub-agents and long-running loops.」

### Token 預算規則

\# token\_budget.yaml

per\_cycle\_limits:

  crow\_agent: 50000      \# tokens

  falcon\_agent: 30000

  btl\_ranker: 10000

  finch\_executor: 80000  \# 實驗執行較貴

  skeptic\_eval: 20000

  writer\_agent: 60000

  adversarial\_reviewer: 40000

  total\_per\_cycle: 400000

escalation\_rule:

  if\_exceeded: "暫停 Loop，記錄到 RESEARCH\_STATE.md，等待人類決策"

  

parallel\_worktree\_limit: 5  \# 最多同時 5 條假設軌跡

model\_assignment:

  generator\_default: "claude-sonnet-4-6"  \# 較快、較便宜

  evaluator: "claude-opus-4-6"            \# 較準確、用於裁決

  worktree\_explorer: "claude-haiku-4-5"   \# 最快，用於初步探索

### 四大隱性成本（v2.7 新增，v3.0 強化警告）

| 成本類型 | 描述 | v3.0 緩解措施 |
| :---- | :---- | :---- |
| **Verification Debt** | 跳過驗證導致後期返工 | Evaluator 硬性分離，不可跳過 |
| **Comprehension Rot** | Loop 跑得太快，人類沒讀 | Comprehension Debt Guard |
| **Cognitive Surrender** | 「Loop 說對就對了」 | Human Gate 前必填 Comprehension Checkpoint |
| **Token Blowout** | 平行代理 token 爆炸 | Token Budget YAML \+ 超出即暫停 |

---

## 第五部分：快速開始指南

### 步驟 1：初始化研究專案

\# 建立專案結構

mkdir my-research-project

cd my-research-project

git init

\# 必要檔案

touch RESEARCH\_STATE.md

touch LOOP.md

mkdir \-p .skills/

mkdir \-p .agents/

### 步驟 2：填寫初始 RESEARCH\_STATE.md

\# RESEARCH\_STATE.md（初始版本）

\#\# Loop Metadata

\- Version: 3.0.0

\- Current Cycle: \#0

\- Active Phase: initialization

\- Loop Status: pending\_human\_gate

\#\# Research Question

\[你的研究問題\]

\#\# Current Goal

\[完整的可驗算停止條件\]

\#\# Completed Work

（空白，等待第一個 Cycle）

\#\# Pending Human Gates

\- \[ \] Gate: initial\_approval — 確認研究方向與 /goal 條件

### 步驟 3：設定 LOOP.md

（參照 L1 的 LOOP.md 範本填寫）

### 步驟 4：Human Gate \#0

人類審閱 RESEARCH\_STATE.md，確認研究方向與 /goal 條件後， 在 Pending Human Gates 打勾，Loop 正式啟動。

### 步驟 5：Loop 自動執行

每次 Heartbeat 觸發後，Loop 自動執行 Phase 1 → 2 → 3， 僅在三個 Human Gate 暫停等待人類。

---

## 附錄 A：v2.7 → v3.0 變更摘要

| 功能 | v2.7 狀態 | v3.0 變更 |
| :---- | :---- | :---- |
| 人類提示 | 每個 turn 需要人類 | Loop Heartbeat 自動觸發 |
| 停止條件 | 主觀判斷「看起來完成了」 | /goal 可驗算條件 \+ Evaluator 裁決 |
| 平行軌跡 | 存在但無隔離機制 | Worktree 硬性隔離 |
| 跨 session 記憶 | 依賴 Claude 上下文 | RESEARCH\_STATE.md 持久化 |
| 評估者 | Generator 自評 | 獨立 Skeptic Agent（硬性分離） |
| 理解債務 | 無防護機制 | Comprehension Debt Guard |
| Token 控制 | 手動注意 | token\_budget.yaml 自動限制 |

## 附錄 B：Robin/AI-Scientist 協議保留（完整 v2.7 繼承）

以下 v2.7 協議在 v3.0 中**全部保留**，整合進 Generator 層：

- **Crow/Falcon 文獻分層**：anti-hallucination 二層檢索，偽造引用率 \~0%  
- **Finch 沙盒數據分析**：Docker \+ 最小工具面（edit\_cell \+ submit\_answer）  
- **BTL Tournament 排名**：pairwise Bradley-Terry-Luce 比較  
- **Parallel Trajectories \+ Consensus Filter**：N 條獨立分析 \+ ≥50% 一致門檻  
- **ReAct Self-Healing Loop**：錯誤注入 \+ retry，防止錯誤瀑布

## 附錄 C：與 Loop Engineering 原文的對應

| Loop Engineering 原則 | v3.0 實現 |
| :---- | :---- |
| Automations（心跳排程） | Loop Heartbeat \+ LOOP.md |
| Worktrees（平行隔離） | 每條假設軌跡獨立 git worktree |
| Skills（意圖固化） | $research-triage 等 10 個 Skill |
| Plugins/Connectors（工具連接） | arXiv MCP \+ PubMed API \+ GitHub |
| Sub-agents（生成/驗證分離） | Generator 層 vs Evaluator 層 |
| Memory/State（跨 session） | RESEARCH\_STATE.md（磁碟持久化） |
| /goal（可驗算停止） | 三個研究 Phase 各有 /goal 條件 |
| Comprehension Debt | Comprehension Debt Guard \+ Human Gate Checkpoint |
| Token Cost Warning | token\_budget.yaml \+ 超出即暫停規則 |

---

*v3.0 由 Kwo-Ta \+ Claude 基於 Addy Osmani「Loop Engineering」(June 2026\) 整合* *授權：MIT | 倉庫：ckt520728/2026-Hermes*  
