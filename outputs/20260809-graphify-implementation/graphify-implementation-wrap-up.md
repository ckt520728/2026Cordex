---
title: Graphify 導入分析與 Skill 實作 Wrap-up
date: 2026-08-09
tags:
  - Graphify
  - Agentic AI
  - Codex
  - Knowledge Graph
  - EEG
category: Agentic AI Implementation
---

# Graphify 導入分析與 Skill 實作 Wrap-up

## 結論

Graphify 適合作為 Agentic AI 的持久化 codebase map 與 scoped context router，但不能取代原始碼、tests、EEG signal analysis、臨床證據審查或 Notion knowledge base。

建議採漸進式導入：先在不含 PHI／PII 的 repository 做 `--code-only` pilot，證明 query precision 與 source verification 有效後，再啟用 hooks、global graph、MCP 或 approved semantic extraction。

本次已建立可重複使用的 Codex skill：`implement-graphify`。成功標準不是「CLI 可以啟動」，而是 graph 可解析、node／edge 非零、固定問題能命中正確 source、重要結論完成原始碼驗證，且 generated diff 經人工檢查。

## 驗證基線

- Repository：`ckt520728/graphify`，fork 自 `Graphify-Labs/graphify`。
- 分支：`v8`。
- Fork 與 upstream：當時 `ahead 0 / behind 0`。
- 驗證 commit：`09a34ad87a6c522757da1bfb8c2c209e523a4e55`。
- PyPI package／CLI：`graphifyy 0.9.37`／`graphify`。
- Windows 最小實測：5 個 Python files 產生 73 nodes、134 edges、5 communities。
- 已驗證 `query`、`path --undirected`、`explain`、`affected`。
- 未修改或 push 使用者的 GitHub fork。

## 遭遇的陷阱

### 1. Source clone 不等於完成安裝

`python -m graphify --help` 可以成功，但 extraction 隨後因缺少 `tree-sitter` 失敗。Source 可被 import 不代表 runtime dependencies 齊全；必須用正式 package install 加真實 extraction 驗證。

### 2. Package 與 command 名稱不同

PyPI package 是 `graphifyy`，command 是 `graphify`。正式安裝用 `uv tool install graphifyy`；暫時執行需寫成 `uvx --from graphifyy graphify ...`。

### 3. `uvx` 不適合 persistent skill／hook

暫存 project install 會讓 `.codex/hooks.json` 指向 uv cache 裡的 executable。應先用 `uv tool install` 建立 persistent environment，再裝 project skill 與 hooks。

### 4. Codex hook 不強制 query-first

Graphify 的 Codex `PreToolUse` hook 是刻意 no-op；真正 guidance 來自 `AGENTS.md`。不能用「hook 已安裝」當成功證據，必須以新 session 的實際行為驗證。

### 5. PowerShell invocation 不同

PowerShell 使用 `graphify .`。`/graphify .` 是部分 agent UI syntax；Codex 顯式 skill invocation 使用 `$graphify`。

### 6. Privacy 邊界必須明確

Code-only AST extraction 可完全本機；docs、PDF、images 可能送到 LLM provider。敏感研究不可依賴 backend auto-detection，必須明確使用 `--code-only`，或在治理通過後指定 local Ollama。

Ignore 規則與敏感副檔名偵測都不是 de-identification、DLP 或 IRB compliance。Raw EEG、subject metadata、臨床 CSV、病歷與識別碼不應進入一般 semantic corpus。

### 7. Query 不是 embedding search

Graphify 主要依 graph vocabulary matching 與 traversal。模糊同義詞、縮寫與中文問題可能找不到 seed；應優先使用 exact symbol、module、config key 或 filename，中文可安裝 `chinese` extra。

### 8. Token budget 會截斷結果

實測 `--budget 800` 找到 56 nodes，但只顯示 39 nodes。遇到 truncation 應先縮小問題，再提高 budget，避免重新放大 context。

### 9. `path` 預設保留方向

Directed path 失敗不代表兩節點完全無關。應先用 `explain` 檢查 edge direction，必要時才用 `--undirected`。

### 10. 文件可能落後 source

本次發現 README 的 query logging 說法前後不一致。涉及 privacy、network、hook 與 backend 時，應以 installed version 的 source/tests 加實測為準。

### 11. Benchmark 不可直接外推 EEG research

官方 code-intelligence benchmark 題目數有限。是否改善 token 與正確率，必須在自己的 EEG repository 以相同 agent、model、context budget 與固定 ground-truth questions 做 A/B pilot。

## 安全導入順序

```text
Preflight
  → persistent uv tool install
  → project-scoped Codex install
  → code-only graph
  → query-first + source verification
  → repository tests + graphify update
  → manual pilot 通過
  → hooks
  → approved semantic／global graph／MCP
```

不要一開始同時啟用 hooks、MCP、global graph 與 mixed-doc extraction；否則 staleness、privacy 與 integration failure 難以歸因。

## Forward-test 補充發現

Fresh-agent read-only 測試確認 skill 能阻止未授權 install／semantic extraction／commit／push，並保留既有 untracked 文件。同時發現 ambient Python 3.9 不符 Graphify 需求，因此 skill 已改為在必要時明確使用 `uv tool install --python 3.12`。

若 target 恰為 Graphify 自身 source checkout，必須先選擇 published package pilot 或 local developer validation；兩種模式不得混用。Forward test 也發現 `AGENTS.md` 可能宣稱 graph 存在，但 `graphify-out/graph.json` 實際缺失，因此 integration instruction 與 artifact 必須交叉驗證。

## Skill 交付內容

```text
C:\Users\User\.codex\skills\implement-graphify\
├── SKILL.md
├── agents\openai.yaml
├── scripts\Test-GraphifyPreflight.ps1
└── references\pitfalls.md
```

Skill 包含成功標準、安全 gate、Windows persistent installation、project-scoped Codex integration、code-only baseline、query-first/source-verify、tests/update loop、semantic extraction gate、clinical/EEG guardrails 與 read-only PowerShell preflight。

## 下一步

選一個不含敏感資料的 EEG Python repository，使用 `$implement-graphify` 執行兩週 pilot。固定五個 ground-truth questions，記錄 source-file recall、錯誤 edge、context tokens、完成時間與 stale-graph events。至少四題命中且所有重要回答通過 source verification，才擴大到其他研究 repository。

> 此為 AI 對工具與臨床研究工作流適配性的判斷，請自行驗證；PHI／PII、IRB、資料使用契約與 data residency 應以機構規範為準。
