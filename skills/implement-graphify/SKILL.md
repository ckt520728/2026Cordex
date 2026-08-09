---
name: implement-graphify
description: 安全安裝、設定、試行、維護及排除 Codex Graphify 問題。當使用者要求在 repository 導入 Graphify、建立 code-only knowledge graph、加入 query-first Codex integration、設定 hooks 或 MCP、評估臨床或 EEG 研究 privacy、更新 stale graph，或診斷 installation、query、path、interpreter、extraction failure 時使用。
---

# Implement Graphify

## 目標

把 Graphify 當成 scoped context router：先 query，再從 source 驗證重要主張，執行 repository 原生 tests，並在 code change 後更新 graph。不得把 graph output 當成 source truth。

## Guardrails

1. 寫入前先明確指出 target repository 與可量測的成功標準。
2. 修改前讀取適用的 `AGENTS.md`，並檢查 `git status --short`。
3. 保留無關變更，逐一審查 generated diff。
4. 除非使用者明確授權 governance-approved local path，否則 PHI、PII、raw EEG、subject metadata、clinical tables、credentials 與 private corpora 不得進入 semantic extraction。
5. 第一階段使用 `--code-only`；敏感資料不得依賴 backend auto-detection。

診斷 failures、啟用 semantic extraction／hooks，或處理臨床／EEG repository 時，讀取 [references/pitfalls.md](references/pitfalls.md)。

## Workflow

### 1. Preflight

成功標準：CLI 已安裝；`graph.json` 可解析且 nodes／edges 非零；五個 ground-truth questions 至少四題找到正確 source；重要回答均由 raw source 驗證；generated changes 僅限核准檔案。

執行 bundled read-only check：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/Test-GraphifyPreflight.ps1 -RepoPath . -Mode CodeOnly
```

執行 docs／PDF／image extraction 前使用 `-Mode Semantic`。若遭阻擋，停止並只回報 aggregate counts。

### 2. Persistent installation

```powershell
python --version
uv --version
uv tool install graphifyy[chinese]
graphify --version
```

要求 Python 3.10+；ambient Python 低於需求時，明確使用 `uv tool install --python 3.12 graphifyy[chinese]`。Package 是 `graphifyy`，command 是 `graphify`。中文 query 使用 `chinese` extra。Persistent skill／hook installation 不得使用 `uvx`，因為它可能內嵌 transient cache executable path。

若 target repository 是 Graphify 自身 source checkout，先鎖定模式：一般導入預設測試 published persistent package；只有使用者要驗證目前 checkout 時，才使用該 repository 的 developer installation。不得混用兩者的版本或解讀結果。

### 3. Project-scoped Codex integration

執行 `graphify install --project --platform codex`，再檢查 `git status --short` 與 `git diff -- AGENTS.md .codex`。

預期新增 `.codex/skills/graphify/`、`.codex/hooks.json` 與 `AGENTS.md` 的 Graphify section。保留既有 instructions。Codex query-first 主要依靠 `AGENTS.md`；generated `PreToolUse` hook 是刻意的 no-op。未經授權不得 commit 或 push。

### 4. 建立並驗證 local baseline

執行 `graphify extract . --code-only`。驗證 `graphify-out/graph.json` 存在、可解析為 UTF-8 JSON，且 `nodes`／`edges` 非零。只有確實需要 broad report／visualization 時才執行 `graphify cluster-only .`。

### 5. 先 query，再驗證 source

依問題選用 `graphify query`、`graphify explain`、`graphify path` 或 `graphify affected`。優先使用 exact symbols、modules、config keys 與 filenames。Directed path 失敗時，先檢查 direction，再考慮 `--undirected`。Output truncated 時，先縮小問題，再提高 `--budget`。開啟回傳的 source locations，驗證每個重要結論。

### 6. 維護 code change

修改前執行 `affected`。修改後執行 repository-native tests、`graphify update .`、重跑相關 query，並檢查 git status／diffs。只有確認合法 deletion／refactor 導致 graph shrinkage 時，才可使用 `graphify update . --force`。

Manual pilot 通過後才安裝 hooks。執行 `graphify hook install` 與 `graphify hook status`；Graphify upgrade 後重新安裝 hooks。

### 7. 管制 semantic extraction

要求 explicit authorization、bounded corpus 與 named backend。核准的 local processing 使用 `graphify extract . --backend ollama --max-concurrency 1`。確認 Ollama 在本機，且 corpus 排除 prohibited data。不得宣稱 prompt-injection protection 完整，或 Graphify 提供 regulatory compliance。

### 8. Hand-off

回報 repository、Graphify version、install scope、extraction mode、artifact paths、node／edge counts、question results、source verification、tests、changed files、remaining risks 與 commit／push status。以 UTF-8 readback、size 與 SHA-256 驗證 reusable files。只有成功標準全部通過才標記完成。
