# Graphify repository 分析與 Agentic AI 升級指南

> 分析對象：`ckt520728/graphify` branch `v8`，commit `09a34ad87a6c522757da1bfb8c2c209e523a4e55`  
> 分析日期：2026-08-09（Asia/Taipei）  
> 證據邊界：repository source code、repository 內官方文件、GitHub repository/compare API。沒有把專案自述或 benchmark 當成獨立外部驗證。

## 結論先行

Graphify 最適合被定位成 **Agentic AI 的持久化 codebase map 與 context router**：先以 knowledge graph 找出相關 symbol、file、community 與 dependency path，再讓 agent 只讀命中的原始碼並驗證。它不是 source code、test suite、dataset validation、實驗追蹤或一般 vector RAG 的替代品。Graphify 本身也明確使用 graph traversal 而非 embeddings/vector store，並將邊標記為 `EXTRACTED`、`INFERRED` 或 `AMBIGUOUS`；因此後兩者只能視為導航線索，不能直接升格為事實。[README：graph 而非 vector index](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L29-L33) [ARCHITECTURE：confidence labels](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/ARCHITECTURE.md#L50-L56)

對目前以 Codex、Python、EEG Machine Learning 與臨床研究為主的工作方式，最值得採用的是：

1. 先在**不含病人資料的 code-only repository** 做 project-scoped Codex 安裝。
2. 以 local AST 建 graph，避免一開始就讓 docs/PDF 進入 cloud LLM。
3. 架構問題先 `query/path/explain`，再回讀 `source_file` 與 line 驗證。
4. 修改程式前查 dependency path；修改與 test 後執行 `graphify update .`。
5. 用自己的 ground-truth 問題做 A/B validation，不直接採信 repository 自家 benchmark。

不建議把原始 EEG、EDF/BDF/FIF、臨床 CSV、病歷、受試者 metadata、識別碼或任何 PHI/PII 放入一般 Graphify semantic extraction。其敏感檔名過濾是 useful guardrail，不是 de-identification、DLP 或 IRB-compliant data governance；`.gitignore`/`.graphifyignore` 與明確限定 corpus 才是第一道控制。[detect.py：敏感檔案判定](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/detect.py#L98-L130) [README：ignore 規則](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L405-L405)

## 1. Repository 身分、fork 與上游關係

- GitHub metadata 顯示 `ckt520728/graphify` 是 `Graphify-Labs/graphify` 的 fork；fork 與 source repository 的 default branch 都是 `v8`。[fork metadata API](https://api.github.com/repos/ckt520728/graphify) [upstream metadata API](https://api.github.com/repos/Graphify-Labs/graphify)
- 2026-08-09 查詢 compare API 時，`Graphify-Labs/graphify:v8...ckt520728:v8` 為 `identical`，`ahead_by=0`、`behind_by=0`。也就是目前 fork 沒有自有功能升級，實質上是與上游同步的鏡像。[GitHub compare API](https://api.github.com/repos/Graphify-Labs/graphify/compare/v8...ckt520728:v8)
- 本地 clone 目前只有 `origin=https://github.com/ckt520728/graphify.git`，沒有名為 `upstream` 的 remote。這是本次 local Git metadata 的唯讀檢查結果；它不影響使用 Graphify，但不利於之後明確區分「自己的 fork」與「官方 upstream」。
- package metadata 的 Homepage、Repository 與 Issues 均指向 `Graphify-Labs/graphify`，也證實真正 upstream/產品擁有者是 Graphify Labs，而非目前 fork。[pyproject.toml](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/pyproject.toml#L47-L49)

建議未來若要在 fork 開始客製化，先經使用者授權後加入：

```powershell
git remote add upstream https://github.com/Graphify-Labs/graphify.git
git fetch upstream
git log --oneline --left-right upstream/v8...origin/v8
```

成功標準是 `git remote -v` 同時顯示 `origin` 與 `upstream`，且每次同步前明確檢查 ahead/behind；不要把直接修改 upstream mirror 與自己的產品化變更混在同一 branch。

## 2. 架構與資料流

### 2.1 核心 pipeline

核心資料流是：

```text
corpus
  → detect()
  → extract()
  → build_graph()
  → cluster()
  → analyze()
  → report()
  → export()
  → graphify-out/{graph.json, GRAPH_REPORT.md, graph.html, ...}
```

官方 architecture 文件把每個 stage 放在獨立 module，以 Python dict 與 NetworkX graph 傳遞資料：`detect.py` 過濾檔案；`extract.py` 產生 nodes/edges；`build.py` 建 graph；`cluster.py` 分 communities；`analyze.py` 找 god nodes、surprises、questions；`report.py` 產生 Markdown；`export.py` 產生 JSON、HTML、Obsidian 等輸出。[ARCHITECTURE：pipeline](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/ARCHITECTURE.md#L3-L11) [ARCHITECTURE：module responsibilities](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/ARCHITECTURE.md#L13-L31)

每個 node 至少帶有 ID、human-readable label、`source_file` 與 `source_location`；edge 帶有 source、target、relation 與 confidence。這使 agent 能從 subgraph 回到檔案位置，但 schema 只提供 provenance pointer，並不等於該 claim 已經由 test 或 domain expert 驗證。[ARCHITECTURE：extraction schema](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/ARCHITECTURE.md#L33-L48)

### 2.2 Structural 與 semantic extraction

- Code 走 tree-sitter AST structural extraction；code-only corpus 不需要 LLM 或 API key，並可完全 local。[README：local AST](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L29-L33)
- Docs、PDF、images 與 transcript 走 semantic extraction；headless CLI 會把文字組成 LLM prompt，images 視 backend capability 以 structured refs/像素送入模型。[llm.py：semantic dispatch](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/llm.py#L1727-L1837)
- Semantic corpus 預設依 token budget 分 chunks，預設 concurrency 為 4；output 截斷時會遞迴 split/retry，預設最大 depth 3，一個 chunk 最多可能擴張為 8 次 extraction。失敗 chunk 會被記錄並跳過，不一定讓整體立刻 abort。[llm.py：chunking、retry、failed chunk](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/llm.py#L2229-L2273)
- Ollama 與 `claude-cli` 預設強制 sequential，分別避免單 GPU VRAM 壓力與多個 CLI process 爭用 session state。[llm.py：local/CLI concurrency guards](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/llm.py#L2320-L2328)

### 2.3 Query path

建好 graph 後，agent 不必重讀整個 repository。Codex skill 規定：若 `graphify-out/graph.json` 已存在，而且問題是 codebase 自然語言問題，就直接進 `graphify query`，不要重建 graph；`path` 查兩個 concept 的 shortest path，`explain` 聚焦單一 concept。[skill-codex.md：fast path](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/skill-codex.md#L49-L63) [skill-codex.md：query/path/explain](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/skill-codex.md#L38-L42)

這種 query 是 graph vocabulary matching 加 traversal，不是 embedding semantic search。因此同義詞、縮寫與中文分詞可能漏掉 seed node；對 EEG repository 應優先用精確 symbol、module、class、config key 或檔名，必要時安裝 `chinese` extra。[README：Chinese segmentation extra](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L245-L270)

## 3. Windows、CLI 與 Codex 的實際安裝法

### 3.1 建議的最小安裝

PyPI package 名稱是 `graphifyy`（雙 `y`），安裝後 command 才叫 `graphify`。Windows 建議用 `uv tool` 隔離環境；plain `pip` 容易讓 skill 記住的 interpreter 與實際 package 所在環境不同。[README：package 與 install](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L157-L170) [README：interpreter mismatch](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L197-L203)

```powershell
# 1. 安裝隔離的 CLI
uv tool install graphifyy

# 2. 確認 command 可用
graphify --version

# 3. 在目標 repository root 做 project-scoped Codex 安裝
graphify install --project --platform codex

# 4. 先做 code-only baseline
graphify extract . --code-only --timing

# 5. 查詢，不要立刻重掃整個 repository
graphify query "EEG preprocessing 如何連到 model training？" --budget 2000
graphify path "preprocess" "train"
graphify explain "Dataset"
```

PowerShell 要執行 `graphify .`，不能照其他 agent UI 的 slash command 寫 `/graphify .`；Codex 對 skill 的顯式 invocation 是 `$graphify`。[README：PowerShell](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L180-L199) [README：Codex invocation](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L236-L240)

### 3.2 兩種 Codex 安裝命令不要混淆

`graphify install --project --platform codex` 是較完整、較可審查的 project-scoped 路徑：實作會複製 Codex skill 到 `./.codex/skills/graphify/SKILL.md`、更新 `AGENTS.md`，並加入 `.codex` 相關檔案的 git-add hint。[install.py：Codex skill destination](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/install.py#L325-L337) [install.py：project install](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/install.py#L1547-L1571)

相對地，`graphify codex install` 主要是在目前 project 的 `AGENTS.md` 注入 always-on 規則並註冊 hook；它不是同一個「複製 project skill bundle」流程。[install.py：per-platform command dispatch](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/install.py#L2259-L2272)

Codex 的 `.codex/hooks.json` `PreToolUse` entry 是**刻意 no-op**：實作註解與輸出都說 Codex Desktop 不接受該 hook 的 `additionalContext`，因此真正讓 Codex query-first 的機制是 `AGENTS.md`，不是 hook 強制攔截。[install.py：Codex hook 實作](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/install.py#L1421-L1453) [README：Codex always-on 說明](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L305-L315)

因此不要把「hook 已安裝」誤認成「agent 一定先查 graph」。驗證方式應是新開一個 Codex session，問一個架構問題，確認實際先執行 `graphify query`，並檢查回答是否回讀命中的原始碼。

README 宣稱 Codex parallel semantic extraction 需要在 `~/.codex/config.toml` 的 `[features]` 設定 `multi_agent = true`。[README：Codex parallel extraction](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L236-L236) 這是容易隨 Codex release 漂移的 host 設定；在改 config 前應先以目前 Codex config schema/官方文件驗證，不建議盲目加入未知 key。Code-only AST baseline 不依賴這項設定。

## 4. Local、LLM、privacy 與 cost

### 4.1 何時資料會離開本機

| Corpus/模式 | 是否需要 LLM | 主要資料路徑 | 建議 |
|---|---:|---|---|
| Source code + `--code-only` | 否 | local tree-sitter AST | 作為第一階段 baseline |
| Docs/PDF/images，`--backend ollama` | 是 | local loopback Ollama；若 URL 非 loopback，可能送到 LAN/remote | 明確指定 URL 並核對 stderr warning |
| Docs/PDF/images，cloud backend | 是 | corpus 內容送到 provider endpoint | 僅限可外傳資料，先確認契約與 data residency |
| Agent skill semantic extraction | 是 | 進入目前 IDE/agent session 所用模型 | 不能因為沒有另外填 API key 就視為 local |
| `ingest <URL>` | 不一定 | 主動 network fetch | 只抓明確指定 URL |

README 清楚說 code 是 local AST，而 docs/PDF/images 會送至 agent model 或 headless backend。[README：privacy/data residency](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L536-L542) 原始碼也證實 semantic text 被組成 `user_msg` 後 dispatch 至 Claude、Bedrock、Azure 或 OpenAI-compatible endpoint。[llm.py：backend dispatch](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/llm.py#L1781-L1837)

Backend auto-detection 的實作順序是 Gemini → Kimi → Claude → OpenAI → DeepSeek → Azure → Bedrock → Ollama；存在 paid cloud key 時會優先於 Ollama。對資料駐留有要求的 corpus，不可只設 `OLLAMA_BASE_URL` 後依賴 auto-detection，必須顯式傳 `--backend ollama`。[llm.py：backend priority](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/llm.py#L2816-L2846)

Ollama 只有指向 loopback 才能稱為 fully local。若指向非 loopback host，Graphify 只 warning；遇到 link-local/cloud metadata 才 hard fail。也就是 LAN endpoint 仍會收到整個 corpus。[llm.py：Ollama endpoint validation](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/llm.py#L2769-L2813)

### 4.2 Prompt injection 與 custom provider

Semantic extraction 會把不受信任的 source text 放入 LLM context。Graphify 以 `<untrusted_source>`、SHA-256 與 known sentinel neutralization 降低 prompt injection 風險；官方 security 文件也承認這不可能保證完全防止 injection。[llm.py：untrusted wrapper](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/llm.py#L523-L569) [SECURITY：prompt injection threat](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/SECURITY.md#L29-L40)

Project-local `./.graphify/providers.json` 可控制 corpus 與 API key 的目的地，原始碼因此預設不載入，只有 `GRAPHIFY_ALLOW_LOCAL_PROVIDERS=1` 才 opt in；這個 gate 不應為了方便而全域開啟。[llm.py：custom provider exfiltration gate](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/llm.py#L227-L298)

### 4.3 Cost 的正確解讀

Graphify 會記錄 semantic extraction 的 input/output token，並以 backend table 做 USD estimate；但公式只是 token 數乘上程式碼中寫死的單價。[llm.py：pricing table](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/llm.py#L100-L211) [llm.py：cost formula](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/llm.py#L2734-L2739)

因此報告中的 `$0` 只表示 Graphify pricing table 為 0（例如 Ollama 或 subscription-based `claude-cli`），不代表 electricity、GPU、subscription、cache write、gateway markup 或 agent session token 是零。Azure pricing 註解更明說使用不同 deployment 時可能 mis-estimate。[llm.py：Azure estimate caveat](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/llm.py#L182-L203)

降低成本的順序應是：先 `--code-only` → incremental `update` → 限制 corpus → `--token-budget` → 降低 `--max-concurrency` → 最後才考慮 `--mode deep`。不要把 deep mode 當預設。

### 4.4 Query log 與輸出檔 privacy

目前原始碼顯示 query logging 是 opt-in：只有 `GRAPHIFY_QUERY_LOG=<path>` 或 `GRAPHIFY_QUERY_LOG_ENABLE=1` 才寫入；記錄包含 question 與 corpus path，full response 還要另開 `GRAPHIFY_QUERY_LOG_RESPONSES`。[querylog.py](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/querylog.py#L15-L35) [querylog.py：record fields](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/querylog.py#L43-L78)

但 README privacy 段落又寫成「every query ... is logged」並要求 opt out，與 README environment table 及上述實作矛盾。[README：environment table 說預設關閉](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L526-L529) [README：privacy 段落的矛盾敘述](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L536-L543) 應以當版 source code 與實際環境變數驗證，不應只看單一 README 段落。

`graph.json`、`GRAPH_REPORT.md`、HTML 與 wiki 可能保留 symbol、source path、comments、rationale 與 semantic summary。即使原始檔未 commit，graph output 也可能洩漏 project/clinical context；public push 前必須把這些視為衍生敏感資料審查。

## 5. 常見 failure modes 與驗證方式

| Failure mode | 表現 | 原因/風險 | 建議驗證與處置 |
|---|---|---|---|
| Package/command 混淆 | `No solution found`、command not found | package 是 `graphifyy`，command 是 `graphify`；PATH 未更新 | `uv tool install graphifyy`、`uv tool update-shell`、重開 shell |
| Interpreter mismatch | `ModuleNotFoundError: graphify` | plain pip 與 skill 記錄的 Python 不同 | 優先 uv/pipx；核對 `graphify-out/.graphify_python` |
| PowerShell slash | path not recognized | `/graphify` 被當路徑 | shell 中用 `graphify .` |
| Graph 不合理縮小 | 舊 node 殘留或拒絕覆寫 | shrink guard 保護既有 good graph | 先查 extraction failure；只有確定刪檔/refactor 才用 `--force` |
| Partial extraction | incomplete、failed chunks | API、parser、file read 或 context failure | 看 stderr、failed chunk count、node/edge count；不要輕易 `--allow-partial` |
| Invalid/truncated JSON | `Unterminated string` | model output cap | 降 `--token-budget` 或提高 output cap，再查是否完整 |
| Ollama OOM/context | hollow response、VRAM error | chunk/context 太大 | 降 `GRAPHIFY_OLLAMA_NUM_CTX`、token budget、concurrency |
| Stale graph | query 回傳已刪除/舊 symbol | hooks 只維護 AST；docs 需 semantic update | code 改後 `graphify update .`；docs 改後顯式 semantic update |
| Vocabulary miss | query 找不到已知概念 | 非 embedding search、同義詞/中文 segmentation | 改用精確 symbol/file，或安裝 `[chinese]` |
| Graph 過大 | HTML 難開、agent context 過多 | node 數 > 5000 | `--no-viz`、`query --budget`、縮小 corpus |

README 提供的官方 troubleshooting 涵蓋 package/PATH、PowerShell、shrink/partial guards、Ollama 與 JSON truncation。[README：安裝 failure modes](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L547-L573) [README：extraction failure modes](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L575-L605)

特別注意：semantic `failed_chunks` 會被 log 並 skip，而非保證整體 abort。因此 exit code 成功仍不能當成 extraction 完整的充分證據；至少要檢查 stderr、`failed_chunks`、graph health、node/edge count 與五個 ground-truth queries。[llm.py：failed chunks semantics](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/llm.py#L2271-L2279)

## 6. 對臨床研究與 EEG ML repository 的適用性

### 適用

1. **追蹤 code pipeline**：從 `load_raw`/preprocessing、artifact rejection、feature extraction、dataset split、model、evaluation 到 export 的 symbol dependency path。Python 是支援的 AST language，且 graph node 帶 source location。[README：支援的 code 類型](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L334-L348) [ARCHITECTURE：node provenance](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/ARCHITECTURE.md#L35-L48)
2. **找 leakage risk 的結構線索**：例如 normalization 是否在 train/test split 前、subject-level split function 是否被 evaluation path 使用、cross-validation 是否共用 cache。Graphify 可快速定位路徑，但 leakage 是否真的發生仍須回讀 code、執行 test 與資料稽核。
3. **PR/change impact 導航**：修改 preprocessing 或 model API 前先看 neighbors/path/affected community，縮小 code review 範圍。CLI 也提供 PR dashboard、triage 與 conflicts commands。[README：PR commands](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L759-L766)
4. **跨 repository 導航**：可把 preprocessing library、training repo、serving repo 登記到 global graph，適合多 repo research stack。[README：global graph](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L754-L757)
5. **決策記憶**：`save-result` 與 `reflect` 可保存某次 graph-based Q&A 是 useful、dead end 或 corrected，形成可回溯的 work-memory overlay。[README：work memory](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L666-L672)

### 不適用或不能單獨完成

1. **不能分析 EEG signal 本身**：官方支援表列 code/docs/Office/PDF/image/video，但沒有 EDF、BDF、FIF、EEGLAB `.set`、NumPy `.npy`、MATLAB `.mat`、Parquet 或臨床資料庫檔作為 signal/dataset analysis format。[README：支援格式](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L334-L349)
2. **不能取代 Jupyter/runtime provenance**：Graphify 的 security model 明確不執行 source code；因此它不知道 notebook cell 是否按序執行、實際 tensor shape、random seed、CUDA nondeterminism、data drift 或 metric 是否可重現。[SECURITY：不執行 source code](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/SECURITY.md#L43-L48)
3. **不能取代 W&B/DVC/Hugging Face dataset card**：graph 描述 code/document relationships，不負責 experiment runs、artifact version、dataset checksum、license、cohort inclusion/exclusion 或 model calibration。
4. **不能作臨床證據綜合的唯一真相來源**：semantic edges 可能是 LLM inference，`AMBIGUOUS` 本來就要求 human review。[ARCHITECTURE：AMBIGUOUS](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/ARCHITECTURE.md#L50-L56)
5. **不能保證 PHI compliance**：敏感 filename filter 不會理解所有欄位值、DICOM header、自由文字病歷或 re-identification risk。

> 此為 AI 對工具與臨床研究工作流適配性的判斷，請自行驗證；尤其涉及 PHI/PII、IRB、資料使用契約與 cloud provider data residency 時，應以機構規範與法遵審查為準。

## 7. 建議的 Agentic AI 升級工作流

### Phase 1：非敏感 code-only pilot

```powershell
Set-Location <EEG_REPO_ROOT>
graphify install --project --platform codex
graphify extract . --code-only --timing
```

驗證：

- `graphify-out/graph.json`、`GRAPH_REPORT.md` 存在且可 UTF-8 讀取。
- detection 沒有意外納入 data/secret 路徑。
- stderr 沒有 incomplete extraction 或 graph health warning。
- graph node/edge count 非零且符合 repository 規模。
- 不設定任何 cloud backend，以 network monitor 或隔離環境確認 code-only build 無 outbound LLM request。

### Phase 2：把 graph 變成 agent 的「先縮小、後驗證」入口

對每個問題採用固定 loop：

```text
自然語言問題
  → graphify query --budget 1500-3000
  → 檢查 EXTRACTED / INFERRED / AMBIGUOUS
  → 回讀命中的 source_file + source_location
  → 執行相關 test / runtime check
  → 形成有 source evidence 的回答
```

推薦的五個 ground-truth 問題：

1. EEG raw data 從哪個 loader 進入 preprocessing？
2. subject-level train/validation/test split 在哪裡形成，哪些 module 使用它？
3. filtering/ICA/artifact rejection 的參數由哪個 config 控制？
4. model output 如何流到 metric、calibration 與 report？
5. 修改一個 preprocessing function 會影響哪些 tests、training entry points 與 downstream artifacts？

成功標準：至少 4/5 題命中正確檔案；每個重要結論均能回讀 source 驗證；沒有把 `INFERRED`/`AMBIGUOUS` 當成 confirmed fact；相對於 raw repo browsing，讀入 agent context 的檔案數明顯下降。

### Phase 3：納入修改與 review loop

```powershell
# 修改前
graphify query "<change question>" --budget 2000
graphify path "<changed symbol>" "<downstream symbol>"

# 修改、執行 repository 原生 tests 後
graphify update .

# 再查一次，確認 graph 與 code 同步
graphify explain "<changed symbol>"
```

Repository 的 always-on 規則也要求修改 code 後執行 `graphify update .`，且說明這是 AST-only、無 API cost。[always_on/agents-md.md](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/always_on/agents-md.md#L7-L12)

### Phase 4：mixed docs 只在 governance 通過後

若要納入 protocol、README、paper notes 或 model cards：

1. 先建立 `.graphifyignore`，明確排除 `data/`、`participants/`、`clinical/`、raw exports、keys、local config 與任何可能包含 PHI/PII 的路徑。
2. 先把 corpus file list 給人審查。
3. 若必須 local semantic extraction，顯式使用 `--backend ollama`，確認 URL 是 loopback，並降低 concurrency/token budget。
4. 若使用 cloud，事先記錄 provider、endpoint、region、model、允許的 files、token budget 與 data-retention policy。
5. graph outputs 仍需當成衍生敏感資料管理，不自動推到 public GitHub。

## 8. 文件漂移與應保留的質疑

1. **Query logging 自相矛盾**：README environment table 與 source code說預設 OFF，但 privacy 段落說每次 query 都會 log。當版實作支持 opt-in OFF；未來 upgrade 後要重新驗證。[README](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/README.md#L526-L543) [querylog.py](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/querylog.py#L15-L31)
2. **Security 文件的 network 敘述過窄**：SECURITY.md 說 graph analysis 只有 `ingest` 會 network call，但 semantic extraction source 明確支援多個 cloud endpoints。這句只能套用 local/core graph operations，不能套用 docs/PDF/images 的完整 CLI flow。[SECURITY.md](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/SECURITY.md#L23-L25) [llm.py](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/llm.py#L100-L211)
3. **Architecture 的 side-effect 敘述只適用核心 pipeline**：ARCHITECTURE.md 說沒有 `graphify-out/` 外 side effects，但 installer 會寫 `AGENTS.md`、`.codex/`，global graph/query log 也可寫 user directory。因此不能把該句泛化到整個 CLI。[ARCHITECTURE.md](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/ARCHITECTURE.md#L7-L11) [install.py](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/graphify/install.py#L1547-L1571)
4. **Repository 自家 benchmark 不是 EEG/clinical external validation**：任何 token reduction 或 speed claim 都應在自己的 repository，以相同問題、相同 agent/model、相同 context budget 做 A/B test，並同時評估正確率與 source verification，不只看 token 數。
5. **本次 repository 沒有 `graphify-out/GRAPH_REPORT.md`**：雖然 root `AGENTS.md` 指示架構問題先讀該檔，但 clone 中不存在 `graphify-out/`，所以本次分析依 primary source raw files 完成。這也示範一個實務原則：graph 缺失或 stale 時，要安全 fallback 到 source code，而不是假裝 graph 已存在。[AGENTS.md](https://github.com/ckt520728/graphify/blob/09a34ad87a6c522757da1bfb8c2c209e523a4e55/AGENTS.md#L1-L7)

## 最終建議

現在最有價值的下一步不是修改這個 fork，而是選一個不含敏感資料的 EEG Python repository 做兩週 pilot：先建立 code-only graph，固定使用 query-first/source-verify/test/update loop，記錄五個 ground-truth 問題的召回率、誤導率、context tokens、完成時間與 graph stale events。只有 pilot 證明能降低 context 成本且不犧牲正確性，再決定是否把 Graphify 納入所有研究 repo、啟用 hooks/global graph，或 fork 出自己的 clinical-research hardening branch。
