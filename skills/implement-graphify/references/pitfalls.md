# Graphify 導入陷阱與處置

## 安裝與 Codex

| 陷阱 | 表現與原因 | 處置 |
|---|---|---|
| Clone source 就當成安裝完成 | `python -m graphify --help` 可用，但 extraction 因缺少 `tree-sitter` 失敗 | 使用 `uv tool install graphifyy`，並驗證真實 extraction |
| Package／command 混淆 | PyPI package 是 `graphifyy`，command 才是 `graphify` | 使用 `uvx --from graphifyy graphify ...`；正式安裝用 `uv tool` |
| Plain `pip` 環境錯置 | skill 記錄的 interpreter 找不到 package | Windows 優先 isolated `uv tool` 或 `pipx` |
| 用 `uvx` 安裝 persistent hook | hook 指向 uv cache executable | 先 persistent install，再裝 project skill／hook |
| 升級後 hook 失效 | hook 仍指向舊 interpreter | 升級後重跑 `graphify hook install` |
| Ambient Python 低於 3.10 | CLI 或 dependencies 無法使用 | 用 `uv tool install --python 3.12 graphifyy[chinese]` 明確選 interpreter |
| Target 是 Graphify source checkout | Published package 與 local source 結果混淆 | 先選 published pilot 或 developer validation；不得混用 |
| 期待 Codex hook 強制 query-first | Codex 仍直接讀檔 | Codex hook 是 no-op；真正 guidance 在 `AGENTS.md`，需新 session 行為測試 |
| `AGENTS.md` 宣稱 graph 存在但 artifact 缺失 | Agent 依賴不存在的 graph | 比對 `AGENTS.md` 與 `graphify-out/graph.json`，修正 stale integration |
| PowerShell 使用 `/graphify .` | 被當成路徑 | PowerShell 用 `graphify .`；Codex skill invocation 用 `$graphify` |

## Privacy 與 extraction

| 陷阱 | 表現與原因 | 處置 |
|---|---|---|
| 認為所有 extraction 都 local | Docs／PDF／images 可能送到 LLM provider | 第一階段明確 `--code-only`；semantic 指定 backend |
| 依賴 backend auto-detection | 資料送到非預期 provider | 敏感工作明確使用 local Ollama 或停用 semantic |
| 把 ignore 當去識別化 | PHI／PII 仍可能進 corpus | 先限定 corpus；ignore 不是 DLP、de-identification 或 IRB compliance |
| 認為 prompt-injection 防護完整 | 不受信任文件可能影響 semantic pass | 重要結論回讀來源；不要宣稱完全防護 |
| 用複雜 `.graphifyignore` 否定規則達成 AST-only | Glob／negation 行為可能不符預期 | 直接使用 `--code-only` |

## Query 與維護

| 陷阱 | 表現與原因 | 處置 |
|---|---|---|
| 把 query 當 embedding search | 同義詞、縮寫、中文問題找不到 seed | 用 exact symbol／module／file；安裝 `chinese` extra |
| Query 結果 truncated | 問題過廣或 token budget 太低 | 先縮小問題，再提高 `--budget` |
| Directed path 不存在 | Edge direction 與提問方向不同 | 先 `explain`，必要時才用 `--undirected` |
| 把 `INFERRED`／`AMBIGUOUS` 當事實 | Resolution 或 LLM inference 被誤當確認 | 回讀 source；`AMBIGUOUS` 需人工審查 |
| 期待 Graphify 分析 EEG signal | Graphify 不處理 EDF／FIF／BDF signal | Signal analysis 仍用 MNE／Python；Graphify 只追蹤 code/docs |
| 刪除後 update 被 shrink guard 擋住 | 工具避免壞 graph 覆寫 | 確認 refactor 與 tests 後才使用 `--force` |
| README 與 source 不一致 | 快速迭代造成 logging／network 說法漂移 | 以 installed version source/tests 加實測為準 |
| 過早啟用 hooks／MCP／global graph | Staleness 與 integration failure 難歸因 | 依序 code-only → query-first → update → hooks → MCP/global |

## EEG／臨床 pilot 問題

1. Raw EEG loader 如何進入 preprocessing？
2. Subject-level train/test split 在哪裡建立？
3. Artifact rejection 與 filter 參數如何流入 training？
4. Prediction output 如何進入 metric reporting？
5. 修改某 preprocessing function 會影響哪些 tests 與 modules？

至少四題命中正確 source file，且每題完成 source verification，才進入 hooks 或 mixed-docs 階段。
