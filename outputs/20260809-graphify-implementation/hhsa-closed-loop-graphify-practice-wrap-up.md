---
title: HHSA Closed-Loop Skill 的 Graphify 實作復盤與避坑指南
date: 2026-08-09
tags:
  - Graphify
  - HHSA
  - EEG
  - closed-loop
  - agentic-ai
  - reproducibility
category: Research/Projects/EEG Classification
source_folder: G:\我的雲端硬碟\Second Brain\知識庫\2026 Claude code\2026-08-06 HHSA Closed-Loop Skill
status: evidence-bounded-wrap-up
physical_stimulation: disabled
---

# HHSA Closed-Loop Skill 的 Graphify 實作復盤與避坑指南

## 結論

這次 Graphify 實作成功完成的是「skill bundle 與 audit harness 的程式結構導航」，不是 HHSA scientific source project 的重現驗證。

目前 canonical code-only graph 已改善為 10 nodes、19 edges，全部是 AST `EXTRACTED` relationships，沒有 self-loop；但 static audit 仍確認 10 個必要 source/test paths 全數缺失。因此既有文件中的 `102 passed`、5/5 ground truth 與 demo passed，只能保留為 `unverified_historical_record`，不能升級成目前可重現的證據。

Graphify 在此案例的正確角色是：

> 先縮小 agent 應讀取的範圍，再回到 source、tests 與 runtime evidence 做驗證。

它不是 scientific truth engine、遺失程式碼重建器、EEG signal analyzer，也不是 physical stimulation safety controller。

> 此為 AI 對研究軟體架構、證據完整性與安全邊界的判斷，請自行驗證。Physical stimulation 必須維持 disabled。

## 一、這個 folder 實際是什麼

工作資料夾主要包含：

- 可重用的 `hhsa-closed-loop-prototyping` skill。
- `audit_hhsa_project.py` static/core/full audit harness。
- HHSA architecture、validation、pitfalls 與 provenance 文件。
- 歷史 wrap-up 與測試數量紀錄。
- Graphify project-scoped Codex integration。
- Graphify canonical graph 與先前 semantic pilot cache。
- Source recovery status 與 static audit evidence。

它不包含完整 HHSA scientific implementation。重新執行 static audit 時，以下 10 個必要 paths 仍全數缺失：

```text
hhsa/emd.py
hhsa/holo.py
hhsa/instantaneous.py
closedloop/controller.py
closedloop/phase.py
closedloop/supervisor.py
closedloop/stimulator.py
closedloop/hardware.py
tests/
validate_ground_truth.py
```

同時還缺少：

- 可鎖定的 Git commit／branch／dirty state。
- `pyproject.toml`、`requirements.txt`、`uv.lock`、`poetry.lock` 或 `environment.yml`。
- 當次執行的 test logs、random seeds 與 generated artifacts。
- 可將歷史結果綁定至特定 source snapshot 的 provenance。

因此，本 folder 應被標記為：

```text
REUSABLE_SKILL_AND_AUDIT_HARNESS
SOURCE_PROJECT_MISSING
SCIENTIFIC_VALIDATION_NOT_REPRODUCIBLE
PHYSICAL_STIMULATION_DISABLED
```

## 二、本次 Graphify 實作成果

### 已完成

1. Graphify 0.9.37 已以 persistent `uv tool` 安裝，而不是依賴 transient `uvx` path。
2. 已建立 project-scoped Codex integration：`AGENTS.md`、`.codex/skills/graphify/` 與 `.codex/hooks.json`。
3. `.skill` archive 已解封，Graphify 才能讀取真正的 Python／Markdown source。
4. 首輪 code-only baseline 與 local semantic pilot 都曾執行。
5. 發現 semantic extraction 的 missing documents 與 hallucinated self-loop 後，沒有繼續把該 graph 當成可靠 canonical graph。
6. Canonical graph 已退回 deterministic code-only：10 nodes、19 edges、2 communities。
7. 本次重新解析 `graph.json` 確認：19/19 edges 為 `EXTRACTED`，0 self-loop。
8. 已建立 `HHSA_SOURCE_RECOVERY_STATUS.json` 與 static audit JSON，將缺件和歷史主張機器可讀化。
9. Audit script 已加入 alternate layout、Git provenance、dependency hashes、UTF-8 child-process handling 與 timeout normalization。

### 沒有完成，而且不應假裝完成

- 沒有找回真正的 `hhsa/` 與 `closedloop/` source。
- 沒有重新執行原始 102 tests。
- 沒有重新通過 5/5 synthetic ground truth。
- 沒有重新執行完整 closed-loop demo。
- 沒有驗證 real-time latency、phase error、jitter 或 hardware timing。
- 沒有建立 clinical efficacy 或 medical-device safety evidence。

## 三、遭遇的主要 pitfalls

### Pitfall 1：把 skill bundle 認成 scientific project

最初最大的分類錯誤，是看到完整的 skill、架構文件和歷史 wrap-up，便容易推斷 source code 也應存在。實際上 archive 只封裝操作規範、audit entry point 與 references。

改善方式：任何 Graphify extraction 前先做 repository identity preflight：

```text
實際 repository root？
是否為 Git repository？
核心 package 是否存在？
tests 是否存在？
dependency lockfile 是否存在？
歷史結果能否綁定 commit？
```

其中任一核心條件缺失，先降級證據狀態，不先做廣泛 semantic extraction。

### Pitfall 2：`.skill` archive 不等於可解析 source

Graphify 不會自動深入 `.skill` archive。若未解封，只能看見少量 wrapper documents，graph coverage 會被嚴重高估。

改善方式：

- 保留原始 `.skill` 作為發布 artifact。
- 解封到明確 source directory 後才做 extraction。
- 修改展開內容後重新 package，並比較 archive manifest／SHA-256。
- 不讓 archive 與解封 source 各自漂移成不同版本。

### Pitfall 3：把歷史 pass count 當成目前證據

`102 passed`、5/5 與 demo passed 沒有 matching source、commit、dependency state 或 raw logs。測試數量是歷史敘述，不是可重現結果。

改善方式：歷史紀錄統一標示：

```text
claim_status: unverified_historical_record
source_commit: unknown
dependency_hash: unknown
raw_log: unavailable
rerun_status: blocked_by_missing_source
```

不得依 wrap-up、plot、Graphify node 或測試名稱反向臆造 scientific implementation。

### Pitfall 4：small local LLM 的 semantic graph 不穩定

`llama3.2` semantic extraction 漏掉 2/5 文件，並生成原文不存在的 node/self-loop。`qwen2.5:3b` 在本機硬體與 Graphify long-context extraction 下，又無法達到可接受的日常 latency。

改善方式：semantic graph 必須同時通過：

- dispatched files 全部出現在 graph。
- 預先定義問題至少 4/5 命中正確 source。
- 沒有 unexplained self-loop、invented entity 或錯誤 provenance。
- runtime 符合預定更新頻率。
- backend 明確命名，且資料邊界已審查。

任何一項不通過，就維持上一版 verified graph 或退回 code-only。

### Pitfall 5：Graph query 命中率不等於 scientific correctness

首輪 query pilot 達到 4/5，canonical audit-code queries 後來達到 5/5；這只證明 Graphify 能定位 audit source，不代表 HHSA algorithm、ground truth 或 stimulation logic 正確。

改善方式：每一層證據分開驗證：

| 層級 | 問題 | 正確證據 |
| --- | --- | --- |
| Navigation | symbol／file 在哪裡？ | Graphify + source location |
| Software behavior | function 是否正確？ | unit/integration tests |
| Signal validity | HHSA peak／phase 是否正確？ | synthetic signals + false-PAC controls |
| Experiment validity | model 是否泛化？ | locked dataset + subject-level validation |
| Clinical validity | 是否具臨床效益？ | protocol + independent clinical evidence |
| Device safety | 是否可刺激人體？ | hardware interlock + device/ethics review |

### Pitfall 6：Codex hook 並不強制 query-first

`.codex/hooks.json` 的 `PreToolUse` hook 是 intentional no-op。真正影響 Codex 行為的是 `AGENTS.md`，所以「hook installed」不等於「agent 一定先查 graph」。

改善方式：在新 session 進行行為測試，確認 agent 對 codebase 問題先執行 `graphify query`，再回讀 source，而不是只檢查檔案是否存在。

### Pitfall 7：Graph 與文件的 coverage 不同

Canonical code-only graph 可靠描述 `audit_hhsa_project.py` 的 AST call structure，但不會自動回答 Markdown 中的 watchdog、interlock、latency 或 stimulation safety rules。

改善方式：

- Code 問題先查 code-only graph。
- Safety／protocol 問題直接回讀經審查的 Markdown source。
- 只有在 governance、coverage 與 hallucination gates 通過後，才建立 bounded semantic graph。
- No-match 不能被解讀為「概念不存在」。

### Pitfall 8：Graphify 不是 EEG signal analyzer

Graphify 不分析 EDF、FIF、BDF 的 waveform，也不知道 filter response、instantaneous phase、PAC false positive、sample drop 或 real-time jitter 是否正確。

改善方式：

- Signal processing 使用 MNE、SciPy、NumPy。
- Algorithm validation 使用 synthetic AM/PAC、non-sinusoidal controls 與 known ground truth。
- Runtime validation實測 timestamp、latency、jitter、gap handling 與 backlog。
- Graphify 只追蹤相關 code、config、tests 與 dependency paths。

### Pitfall 9：Clinical／EEG privacy 不能靠 ignore 規則保證

`.graphifyignore` 是 corpus filter，不是 de-identification、DLP、IRB approval 或 data-governance system。Semantic extraction 還可能把 documents 送到 auto-detected cloud provider。

改善方式：

- 第一階段固定 `--code-only`。
- 排除 raw EEG、PHI／PII、subject metadata、clinical tables、credentials。
- Semantic extraction 需先限定 corpus，再明確指定 local `ollama` 與 loopback endpoint。
- Graph outputs 也視為可能含敏感衍生資訊，不自動推到 public GitHub。

### Pitfall 10：Folder 沒有 Git 與 dependency provenance

目前 folder 不是 Git repository，也沒有 dependency file；即使未來突然出現 source，也無法知道是否與歷史結果屬於同一 snapshot。

改善方式：找回 source 後，先複製到新的 read-only recovery directory，記錄：

- 原始位置與取得日期。
- 全部檔案 hashes。
- Git remote、branch、commit 與 dirty state。
- Dependency lockfile hashes。
- Python／OS／hardware versions。
- 新舊測試結果差異，不覆寫歷史紀錄。

### Pitfall 11：Static audit 的 failure 是正確結果

本次 static audit 回傳 exit code 1，原因是核心 source paths 全數缺失。這不是 audit script 壞掉，而是 fail-closed 設計正常運作。

改善方式：不要為了得到綠色狀態建立空白 module、假的 tests 或 mock pass logs。對 evidence-bound workflow，誠實的 `fail` 比不可重現的 `pass` 更有價值。

## 四、Graphify 在 HHSA／EEG 研究的正確使用場景

### 適合使用

| 使用場景 | Graphify 操作 | 必要後續 |
| --- | --- | --- |
| 找 function／class／module | `query`、`explain` | 開啟 source location |
| 追蹤 preprocessing 到 model 的 dependency | `path` | 核對 edge direction 與 source |
| 修改 phase estimator 前找影響範圍 | `affected` | 執行相關 tests |
| 大型 Python repository 初步導航 | `extract --code-only` | 檢查 entry points、tests、configs |
| 跨 session 保存重要架構線索 | `save-result`／`reflect` | 保存 correction 與引用節點 |
| 審查過的技術文件關聯 | bounded semantic extraction | local backend + source verification |

### 不適合使用

| 任務 | 應使用的工具或證據 |
| --- | --- |
| 分析 EEG waveform | MNE／SciPy／NumPy |
| 證明 HHSA frequency／phase 正確 | synthetic ground truth 與 signal-level tests |
| 證明 classifier performance | locked dataset、subject-level split、external validation |
| 證明臨床有效性 | 原始研究、protocol、統計與獨立 replication |
| 核准 physical stimulation | device manual、interlock、倫理與合格人員 |
| 從文件重建遺失 source | 原始 repository、backup 或 release artifact |

## 五、未來標準工作流程

### Phase 0：先確認證據邊界

1. 鎖定真正 repository root。
2. 記錄 Git commit、dirty state 與 dependency hashes。
3. 排除 PHI／PII、raw EEG 與 credentials。
4. 預先寫五個可人工判分的 ground-truth questions。

### Phase 1：建立 deterministic baseline

```powershell
graphify extract . --code-only
```

驗證：`graph.json` 可解析、nodes／edges 非零、沒有意外 corpus、沒有 unexplained self-loop。

### Phase 2：Query-first，但回到 source

```powershell
graphify query '<exact symbol or filename>' --graph '.\graphify-out\graph.json'
graphify explain '<symbol>' --graph '.\graphify-out\graph.json'
graphify affected '<changed symbol>' --depth 3 --graph '.\graphify-out\graph.json'
```

每個重要回答都必須開啟命中的 source location。Query 無結果時改用 exact filename／symbol 或 `rg`，不能直接推論 code 不存在。

### Phase 3：執行 repository-native validation

```powershell
python audit_hhsa_project.py . --profile core --expected-commit <SHA> --json-output audit.json
```

Graphify 只縮小 context；ground truth、pytest 與 demo 才驗證行為。

### Phase 4：修改後同步

```powershell
graphify update .
```

修改前先查 `affected`，修改後依序執行 tests、update、重跑 query。只有確認合法 deletion／refactor 才使用 `--force`。

### Phase 5：Semantic extraction 需另行通過 gate

只有 Markdown／PDF relationships 真正重要，而且 corpus 已審查時，才執行：

```powershell
graphify extract . --backend ollama --max-concurrency 1
```

不得依賴 backend auto-detection；local endpoint、coverage、runtime、invented entities 與 provenance 必須逐項核對。

## 六、找回 source 後的完成定義

只有以下全部成立，才可將歷史紀錄升級為 current verified evidence：

1. Static audit pass，且 Git commit／dependency hashes 已記錄。
2. Synthetic ground-truth scenarios 全數 pass。
3. Pytest suite pass，並保存本次實際 test count 與 raw log。
4. Quick／full demo 的輸出變更已人工審查。
5. Graphify code-only 的五個預定問題至少四題命中正確 source。
6. 所有重要 graph answers 都回讀 source 驗證。
7. Physical stimulation 仍經獨立 hardware、ethics 與 qualified-personnel review。

## 七、下一步優先序

1. 從原始 `YangminRoom1` 工作站、磁碟備份、private repository 或 source archive 找回真正 project。
2. 對找回的唯一原始副本先做唯讀封存與 hashes，不直接修改。
3. 在新的 recovery working copy 執行 static audit。
4. 補齊 Git／dependency provenance 後才執行 core tests。
5. 建立真正 source repository 的 code-only graph，而不是繼續擴張本 skill bundle 的 semantic graph。
6. 對任何 real-time／stimulation work 維持 simulated or recording-only backend，直到獨立安全審查完成。

## 八、最終判讀

這次實作最重要的收穫，不是得到一張更大的 graph，而是建立了可靠的停止條件：當 source、tests 與 provenance 不存在時，agent 應停止升級主張，保留缺件紀錄，並把 Graphify 限定為 context router。

對未來 Agentic AI 工作，建議採固定循環：

```text
Preflight scope
→ code-only graph
→ query-first
→ source verification
→ repository-native tests
→ graph update
→ evidence-bound report
```

Graphify 的價值是降低搜尋範圍與 context cost；研究可信度仍來自 source、tests、ground truth、provenance 與獨立科學／安全審查。

## 本次復盤的驗證依據

- `HHSA_SOURCE_RECOVERY_STATUS.json`
- `audit-evidence/bundle-static-audit-2026-08-09.json`
- `2026-08-09_HHSA_Graphify_Analysis.md`
- `2026-08-09_HHSA_Graphify_Remediation_and_Runbook.md`
- `graphify-out/graph.json`
- `graphify-out/GRAPH_REPORT.md`
- `hhsa-closed-loop-prototyping/scripts/audit_hhsa_project.py`
- 本次重新執行的 static audit 與 graph JSON 統計檢查
