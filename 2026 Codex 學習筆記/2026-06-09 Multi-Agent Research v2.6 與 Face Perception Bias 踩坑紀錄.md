---
title: 2026-06-09 Multi-Agent Research v2.6 與 Face Perception Bias 踩坑紀錄
source:
  type: personal
  authors:
    - Kwota
    - Codex
  url: ''
  file: ''
  published: '2026-06-09'
date_ingested: '2026-06-09'
status: inbox
tags:
  - codex
  - ai-agent
  - multi-agent
  - ai-scientist
  - notebooklm
  - research-automation
  - troubleshooting
related:
  - '[[conversation-summary]]'
  - '[[AI_Agent_Research_Automation_概念與證據整理]]'
  - '[[2026-06-07 Hermes Agent skill v1.0 到 v2.5 演化全紀錄]]'
  - '[[2026-05-30 Hermes Agent Multi-Agent 安裝學習與踩坑紀錄]]'
---
# 2026-06-09 Multi-Agent Research v2.6 與 Face Perception Bias 踩坑紀錄

## 一句話結論

今天把 `Multi-Agent Research Skill v2.5` 從 proposal generator 升級成 `v2.6` 的 **AI Scientist-style executable discovery loop**，並用三個 NotebookLM notebook 重新執行 face perception bias 研究分析。最後產出一份可稽核的 evidence-bound report，但因缺少 trial-level behavioral data、EEG raw data、intervention raw data，結果只能標為 `PROPOSAL_ONLY_WITH_EXECUTABLE_EVIDENCE_AUDIT`，不能標為 `AI_SCIENTIST_PASS`。

## 今天完成的成果

### 1. 分析 Sakana AI Scientist 對研究的價值

先檢查 `sakanaai/ai-scientist` 的模式，確認它的核心不是「寫漂亮報告」，而是：

1. idea generation
2. novelty check
3. executable experiment
4. plot generation
5. baseline comparison
6. paper draft
7. independent review

對我的研究最重要的啟發是：agent 產出的每個研究 claim 都應該能追到 code、data、run output 或 claim ledger。

### 2. 評估原始 Multi-Agent Research v2.5 的 performance

原始資料夾：

`D:\Face perception bias`

原始 v2.5 報告優點：

- research framing 很強
- 臨床轉譯想像力強
- 能把 PSE/DS、RT dynamics、HDDM、EEG、iTBS、trial design 串成完整 proposal
- 有 agent outputs、cost log、faculty flow、alignment scoreboard

原始 v2.5 報告問題：

- 把「應該做的下一步分析」寫成「已完成結果」
- HDDM `z/v/a/t0` 與 BF/LOO-CV 沒有 local code 或 output 支撐
- posterior theta / DLPFC PAC 沒有 EEG analysis artifact
- iTBS correction 與 HEROIC-Face trial 被寫得太像已完成證據
- `figures`、`notes` 空資料夾造成 artifact completeness 不足
- README 有 encoding mojibake，降低可讀性與可保存性

### 3. 使用 NotebookLM 三個 notebook 做 evidence audit

使用的 notebook：

- `eae0be5a-f450-40fc-81df-644ca98eff80`
- `ebbfda60-44d6-47d0-9566-8b2a18b99322`
- `0c37b5aa-ceea-488e-8caa-168e865809d1`

三個 notebook 支持的層級：

| Claim | v2.6 判定 |
|---|---|
| PSE 較低、DS 無顯著組差 | observed/source-supported |
| low-ratio ambiguous faces AUC 較高 | observed/source-supported |
| 1500 ms Sad 條件 RT peak 左移、crossing point < 50% | observed/source-supported |
| Beck negative schema / appraisal theory 解釋 | derived |
| HDDM z/v/a/t0 | hypothesis，需要 trial-level raw data |
| ERP P1/P3 depression/anxiety attention bias | literature |
| posterior theta memory-driven mechanism | hypothesis，需要 EEG analysis |
| DLPFC PAC / closed-loop phase-locked stimulation | literature rationale，不是本研究完成結果 |
| iTBS sad bias correction | hypothesis/preliminary，需要 controlled raw data |
| HEROIC-Face trial 已證實效果 | unsupported |

## Multi-Agent Research Skill v2.6 升級

GitHub repo：

`https://github.com/ckt520728/2026-Hermes`

本地 repo：

`C:\tmp\2026-Hermes`

commit：

`1ada382 新增 multi-agent research skill v2.6：AI Scientist 可執行研究迴圈`

新增檔案：

- `multi_agent_research_skill_v2.6.md`
- `examples/executable_discovery_template.md`
- `examples/claim_ledger_example.md`
- `examples/run_output_contract_example.md`
- 更新 `examples/README.md`

v2.6 的七個硬要求：

1. `experiment.py`
2. `plot.py`
3. `run_0/final_info.json`
4. raw / derived data schema
5. expected vs observed claim typing
6. evidence-bound report
7. independent reproducibility judge / Agent 9

核心規則：

> No output path, no observed claim.

也就是說，沒有 artifact path 的 claim 不能寫成 observed result。

## Face Perception Bias v2.6 實作結果

最後產物位置：

`D:\Face perception bias\v2_6_ai_scientist_run`

主要報告：

`D:\Face perception bias\v2_6_ai_scientist_run\reports\evidence_bound_report.md`

核心產物：

- `experiment.py`
- `plot.py`
- `prompt.json`
- `seed_ideas.json`
- `data/raw_schema.json`
- `data/derived_schema.json`
- `data/notebook_evidence_claims.json`
- `run_0/final_info.json`
- `run_0/metrics.json`
- `results/claim_ledger.csv`
- `results/evidence_audit.md`
- `results/reproducibility_report.md`
- `results/scoreboard.json`
- `figures/claim_type_distribution.svg`
- `figures/figure_manifest.json`

執行結果：

- `experiment.py` 成功
- `plot.py` 成功
- JSON validation 通過
- claim ledger traceability 通過
- observed claims 均有 artifact path
- final status：`PROPOSAL_ONLY_WITH_EXECUTABLE_EVIDENCE_AUDIT`

claim counts：

| Type | Count |
|---|---:|
| observed | 3 |
| derived | 1 |
| literature | 2 |
| hypothesis | 3 |
| unsupported | 1 |

## 今天踩過的坑與修法

### 坑 1：工作目錄不是 Git repo

一開始所在資料夾：

`C:\Users\User\Documents\2026 Hermes agent`

不是 Git repo。真正 repo 在：

`C:\tmp\2026-Hermes`

修法：先用 `git rev-parse --is-inside-work-tree` 確認，再找 remote 指向 `ckt520728/2026-Hermes` 的 clone。

### 坑 2：本地 clone 落後，找不到 v2.5 skill

一開始 `C:\tmp\2026-Hermes` 沒有 `multi_agent_research_skill_v2.5.md`。

修法：`git pull --ff-only` 後取得 v2.5 與 examples。

### 坑 3：GitHub CLI token 失效，但 git push 可用

`gh auth status` 顯示 token invalid：

`The token in default is invalid.`

但 `git push origin main` 仍成功，代表 Git credential manager 還可用。以後不要只看 `gh auth status` 就判定不能 push。

### 坑 4：`git add` 被 `.git/index.lock` 權限擋住

錯誤：

`fatal: Unable to create 'C:/tmp/2026-Hermes/.git/index.lock': Permission denied`

修法：用 escalated git add。這是寫 Git metadata，不是檔案內容錯。

### 坑 5：canonical `multi_agent_research_skill.md` 不能覆寫

嘗試 `Copy-Item` / `Set-Content` 覆寫既有 canonical 檔案時出現：

`Access denied`

修法：保留 `multi_agent_research_skill_v2.6.md` 作為版本檔，更新 examples index；canonical 之後可單獨處理。

### 坑 6：NotebookLM evidence audit 會因 notebook 範圍不同而給出不同邊界

前兩本 notebook 明確支持行為層：PSE/DS、AUC、RT dynamics。

第三本 notebook 加入 ERP、HHSA/TMS、iTBS 初步材料，但也容易讓 agent 把 literature rationale 寫成本研究 completed result。

修法：所有 claim 必須走 claim typing：`observed / derived / literature / hypothesis / unsupported`。

### 坑 7：第一次 baseline run 無法建立 `run_0`

錯誤：

`PermissionError: [WinError 5] Access denied: 'run_0'`

修法：用 escalated execution 重跑 `experiment.py`，成功建立 `run_0/final_info.json`。

### 坑 8：第一次複製到 D 槽時 wildcard 被當成 literal path

目標資料夾建立了，但內容沒有複製進去。

修法：改用 `Copy-Item -Path (Join-Path $src '*') -Destination $dst -Recurse -Force`，再驗證目標檔案與 JSON。

### 坑 9：原始 README encoding mojibake

`D:\Face perception bias\README.md` 出現亂碼。這不代表研究本體錯，但代表交付層品質不足。

修法：v2.6 run 用 UTF-8 markdown 與 machine-readable JSON/CSV 保存。

## 可重用流程

下次要把 multi-agent research 變成 AI Scientist-style run，可以照這個順序：

1. 先做 NotebookLM / source evidence audit
2. 建立 claim typing table
3. 建立 `data/raw_schema.json` 和 `data/derived_schema.json`
4. 建立 `experiment.py`，即使暫時只是 evidence audit baseline
5. 建立 `plot.py` 與 `figure_manifest.json`
6. 寫 `results/claim_ledger.csv`
7. 寫 `reports/evidence_bound_report.md`
8. 用 reproducibility judge 檢查 required artifacts 與 claim traceability
9. final status 必須依資料狀態決定，不能因報告漂亮就標 `AI_SCIENTIST_PASS`

## 與既有筆記的連結

- 延續 [[AI_Agent_Research_Automation_概念與證據整理]] 對 research automation 的框架。
- 補上 [[2026-06-07 Hermes Agent skill v1.0 到 v2.5 演化全紀錄]] 之後的 v2.6 版本演化。
- 與 [[2026-05-30 Hermes Agent Multi-Agent 安裝學習與踩坑紀錄]] 同屬 agent workflow 實戰踩坑紀錄。
- 可作為 [[conversation-summary]] 的後續案例：從 agent synthesis 走向 executable discovery。

## 後續 TODO

- [ ] 把 `multi_agent_research_skill.md` canonical 檔案同步到 v2.6。
- [ ] 若取得 trial-level RT/choice data，改寫 `experiment.py` 執行 psychometric + RT refit。
- [ ] 若取得 EEG raw data，新增 posterior theta / PAC analysis module。
- [ ] 若取得 iTBS raw data，建立 sham/random/phase-locked arm 的 controlled analysis。
- [ ] 將 `D:\Face perception bias\v2_6_ai_scientist_run` 作為下一輪 AI Scientist loop 的 baseline template。
