---
name: multi-agent-research-pipeline
description: "Use when the user wants to execute a research project using a multi-agent architecture — from literature review and computational modeling to simulation, data analysis, clinical trial design, and paper/grant writing. v2.7 integrates Robin Architecture (Ghareeb et al. 2026, Nature) on top of v2.6's AI Scientist executable loop: (8) Crow/Falcon Literature Split — anti-hallucination two-layer retrieval reduces fabricated citations from 44.5% to ~0%; (9) Finch Sandboxed Data Analysis Protocol — Docker + minimal tool surface (edit_cell + submit_answer) for experiment.py execution; (10) BTL Tournament Ranking — pairwise Bradley-Terry-Luce comparison replaces absolute LLM scoring for seed idea and candidate ranking; (11) Parallel Trajectories + Consensus Filter — N independent analysis runs with ≥50% agreement threshold; (12) ReAct Self-Healing Loop Protocol — error injection and retry loop prevents error cascade in multi-step pipelines. All v2.6 AI Scientist artifacts (experiment.py, claim ledger, reproducibility judge) remain required. Depends on: academic-paper-review, arxiv, execute_code, delegate_task."
version: 2.7.0
author: OWL + Kwota
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [research, multi-agent, pipeline, ai-scientist, executable-discovery, reproducibility, claim-ledger, evidence-audit, crow-falcon-split, finch-protocol, btl-tournament, parallel-trajectories, react-self-healing, robin-architecture]
    related_skills: [academic-paper-review, arxiv, writing-plans, requesting-code-review]
    inspired_by:
      - "Sakana AI Scientist: executable template loop with experiment.py, plot.py, baseline run, paper generation, and review."
      - "Webb, Mondal & Momennejad (2025). Nat Commun 16:8633. MAP architecture."
      - "Villa et al. (2025). Intell-Based Med 12:100274. Arkangel AI."
      - "Alkhamissi et al. (2026). ICLR. Mixture of Cognitive Reasoners (MiCRo). https://cognitive-reasoners.epfl.ch/"
      - "Binhuraib et al. (2025). Topoformer: brain-like topographic organization in transformer language models through spatial querying and reweighting. arXiv 2510.18745."
      - "Ghareeb et al. (2026). A multi-agent system for automating scientific discovery. Nature. Robin Architecture: Crow/Falcon/Finch agent decoupling + BTL tournament + Aviary/Jupyter sandbox."
  model_assignment:
    router:              haiku
    agent1_compute:      opus
    agent6a_crow:        haiku      # NEW v2.7 — broad parallel API retrieval
    agent6b_falcon:      opus       # NEW v2.7 — deep synthesis from crow citation list ONLY
    agent6_lit:          haiku      # DEPRECATED alias; backward compatible with v2.6
    agent2_sim:          sonnet
    agent2_search:       haiku
    agent3_data:         sonnet
    agent4_clinical:     opus
    agent5_synthesis:    opus
    agent7_monitor:      haiku
    agent8_reflector:    opus
    agent9_reproducible: sonnet
    judge_a:             opus
    judge_b:             opus
    btl_judge:           opus       # NEW v2.7 — pairwise comparison judge for BTL tournament
  ai_scientist_mode:                # From v2.6 — UNCHANGED
    enabled: true
    required_artifacts:
      - experiment.py
      - plot.py
      - prompt.json
      - seed_ideas.json
      - run_0/final_info.json
      - results/claim_ledger.csv
      - reports/evidence_bound_report.md
    execution_policy:
      run_llm_written_code: isolated_only
      allow_host_execution: false
      require_container_or_sandbox: true
    claim_policy:
      default_claim_type: hypothesis
      forbid_unbacked_observed_results: true
      require_claim_ledger: true
      require_output_path_for_numeric_claims: true
  monitor_strictness:
    phase_1.5:  3
    phase_2.2:  3
    phase_2.6:  4
    phase_3.5:  5
    phase_4.5:  5
    phase_5e:   5
    phase_6:    5
  cognitive_faculties:              # From v2.5 — UNCHANGED
    enabled: true
    faculties: [language, logic, social, world]
    steering_dir: examples/cognitive_faculty_steering.md
    probes_dir: examples/cognitive_probes/
    phase_schedule_file: examples/faculty_phase_schedule.md
    flow_tracking_file: faculty_flow.jsonl
    suppression_enabled: true
    suppression_snippets_file: examples/faculty_suppression_snippets.md
    intensity_mode: continuous
    intensity_buckets:
      suppress: 0.0
      light:    0.3
      medium:   0.6
      strong:   0.85
      max:      1.0
  handoff_repair:                   # From v2.5 — UNCHANGED
    mode: auto
    max_repairs_per_handoff: 1
    repair_budget_fraction: 0.15
  project_calibration:              # From v2.5 — UNCHANGED
    enabled: true
    project_id: <set_at_phase_0>
    calibration_file: project_faculty_calibration.yaml
    min_runs_before_override: 3
  faculty_ablation:
    enabled: false
    mode: factorial_2x2
    factorial_pair: [social, world]
    metric_for_delta: reproducibility_score
  alignment_scoreboard:
    enabled: true
    rubric_file: examples/alignment_scoreboard.md
    output_file: alignment_scoreboard_results.md
    include_topographic_locality: true
    include_reproducibility_gate: true
    include_hallucination_rate: true  # NEW v2.7 — metric #10
  schemas:
    executable_template: examples/executable_discovery_template.md
    claim_ledger: examples/claim_ledger_example.md
    run_output_contract: examples/run_output_contract_example.md
  domain_priming:
    enabled: false
    cases_per_agent: 3
  stage2_routing:
    mode: top1
  cost_budget_usd: null
  router_memory_file: router_memory.jsonl
  cost_telemetry_file: cost_log.jsonl
  # ── Robin Architecture Upgrades (v2.7) ────────────────────────────────────
  crow_falcon_split:            # NEW v2.7 — Robin: decoupled retrieval/synthesis
    enabled: true
    crow_model: haiku
    falcon_model: opus
    max_crow_calls_per_phase: 45
    hallucination_guard: strict # falcon FORBIDDEN from synthesizing from model weights
  finch_protocol:               # NEW v2.7 — Robin: sandboxed ReAct data analysis
    enabled: true
    sandbox: docker             # docker | none  (none = dev/test ONLY)
    sandbox_image: research-env:v1.0
    allowed_tools: [edit_cell, submit_answer]
    react_max_iterations: 12
    error_feedback: true
  btl_tournament:               # NEW v2.7 — Robin: BTL pairwise ranking
    enabled: true
    min_candidates: 3
    pairings_per_candidate: 4
    model: opus
    phases: [phase_2_ideas, phase_4_candidates]
  parallel_trajectories:        # NEW v2.7 — Robin: Finch 8-trajectory consensus
    enabled: false              # opt-in; n_trajectories× cost
    n_trajectories: 8
    consensus_threshold: 0.5
    phases: [phase_4_runs, phase_5_analysis]
  react_loop:                   # NEW v2.7 — Robin: self-healing code generation loop
    max_iterations: 12
    error_feedback: true
    cascade_guard: true         # halt + escalate if 3 consecutive iterations = identical error
---

# Multi-Agent Research Pipeline (v2.7)

Executable, evidence-disciplined, and now operationally robust. v2.6 enforced what counts as evidence; v2.7 hardens *how* that evidence is retrieved and computed.

> **v2.7 — What changed since v2.6**
> Five Robin Architecture upgrades (Ghareeb et al. 2026, *Nature*):
>
> 8. **Crow/Falcon Literature Split** — `agent6_lit` split into `agent6a_crow` (haiku: broad API retrieval → `citation_library.json`) and `agent6b_falcon` (opus: deep synthesis from verified citations only). `hallucination_guard: strict` enforces zero weight-based claims. Robin ablation: fabricated citation rate 44.5% → **~0%**.
> 9. **Finch Sandboxed Data Analysis Protocol** — `agent3_data` executes inside Docker with only `edit_cell` + `submit_answer`. AI writes code to analyze data; it does not read data into context. Operationalizes v2.6's `execution_policy.require_container_or_sandbox` at the protocol layer.
> 10. **BTL Tournament Ranking** — Replaces absolute LLM scoring (1–10) at Phase 2 (idea ranking) and Phase 4 (candidate run ranking) with Bradley-Terry-Luce pairwise comparisons. Robin: pairwise BTL outperforms human expert ranking panels on consistency.
> 11. **Parallel Trajectories + Consensus Filter** — Optionally spawn N parallel `agent3_data` instances. Accept findings with ≥50% trajectory agreement. (opt-in; N× cost)
> 12. **ReAct Self-Healing Loop Protocol** — Error injection retry (up to 12 iterations) + `cascade_guard` (3 consecutive identical errors → escalate). Robin BixBench: multi-step accuracy 15.3% with no self-healing; self-healing approaches single-step ceiling 47.9%.

## When to Use

Same as v2.6, plus: use v2.7 when the project involves medical literature retrieval, clinical data analysis, or multi-step computational pipelines where error cascades are a known failure mode.

## Core Rule *(from v2.6, unchanged)*

**No output path, no observed claim.**

| Claim type | Meaning | Allowed language |
|---|---|---|
| `observed` | Directly computed from data by this run | "we observed", "analysis showed" |
| `derived` | Calculated from observed outputs | "derived estimate", "computed from" |
| `simulated` | From synthetic/simulated data | "simulation suggests" |
| `literature` | Supported by Crow-verified source | "prior work reports" |
| `hypothesis` | Mechanistic proposal | "we hypothesize" |
| `unsupported` | Not supported in this run | "not supported by current artifacts" |

## Architecture Overview (v2.7)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ORCHESTRATOR                                              ║
║                                                                              ║
║  Phase 0       Intake + evidence boundary                                    ║
║  Phase 0.5     Router + project template decision                            ║
║  Phase 1       Literature + source audit  ←── v2.7: Crow/Falcon split       ║
║  Phase 2       Idea generation + BTL ranking  ←── v2.7: BTL Tournament      ║
║  Phase 3       Executable template build  ←── v2.7: Finch Protocol          ║
║  Phase 4       Baseline + candidate runs  ←── v2.7: Parallel Trajectories   ║
║  Phase 5       Analysis, plotting, claim ledger  ←── v2.7: ReAct Self-Heal  ║
║  Phase 5e      Alignment + reproducibility scoreboard (10 metrics)           ║
║  Phase 6       Evidence-bound report + independent review                    ║
║                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │ Phase 1 — LITERATURE LAYER (v2.7 Crow/Falcon)                       │     ║
║  │   agent6a_crow (haiku) → citation_library.json [verified refs]      │     ║
║  │   agent6b_falcon (opus) → evidence_report.json [from JSON ONLY]     │     ║
║  │   hallucination_guard=strict: every claim needs citation_id         │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │ Phase 2 — IDEA RANKING LAYER (v2.7 BTL Tournament)                  │     ║
║  │   seed_ideas.json: N candidates → random pairings → btl_judge       │     ║
║  │   BTL model → global ranking → ranked_candidates.json               │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │ Phase 3/4/5 — DATA ANALYSIS LAYER (v2.7 Finch + ReAct)             │     ║
║  │   agent3_data → Docker sandbox (research-env:v1.0)                  │     ║
║  │   Tools: edit_cell, submit_answer ONLY                              │     ║
║  │   ReAct: Thought → edit_cell → Observation → (self-heal) → ...     │     ║
║  │   cascade_guard: same error × 3 → escalate                         │     ║
║  │   [optional] 8× parallel trajectories → 50% consensus filter        │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                                                              ║
║  Hard gate: claim ledger + reproducibility audit before report finalizes.    ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## Required Project Layout *(from v2.6, unchanged)*

```text
<project-dir>/
├── README.md
├── prompt.json
├── seed_ideas.json
├── experiment.py
├── plot.py
├── data/
│   ├── README.md
│   ├── raw_schema.json
│   ├── derived_schema.json
│   └── synthetic/
├── run_0/
│   ├── final_info.json
│   └── metrics.json
├── runs/<idea_id>/
│   ├── final_info.json
│   └── metrics.json
├── figures/
│   └── figure_manifest.json
├── results/
│   ├── claim_ledger.csv
│   ├── evidence_audit.md
│   ├── reproducibility_report.md
│   └── scoreboard.json
└── reports/
    ├── evidence_bound_report.md
    └── reviewer_report.md
```

---

## The Seven AI Scientist Work Items *(from v2.6, unchanged)*

1. **`experiment.py`** — executable entrypoint; `--data`, `--out_dir`, `--config`, `--seed`.
2. **`plot.py`** — figure generation; writes `figure_manifest.json`.
3. **`run_0/final_info.json`** — baseline result; required before any candidate run.
4. **Data schemas** — `data/raw_schema.json` + `data/derived_schema.json`.
5. **Claim typing** — all claims in `results/claim_ledger.csv` with type + artifact_path.
6. **Evidence-bound report** — `reports/evidence_bound_report.md` with `[claim_id | type | artifact]` tags.
7. **Reproducibility judge** — Agent 9 file, rerun, claim ledger, and language audit.

---

## 8. Crow/Falcon Literature Split *(NEW — Robin Architecture)*

### Why This Matters

Robin's ablation: when a single LLM both retrieves and synthesizes, fabricated citations appear in **44.5%** of all claimed references. With two-layer Crow + Falcon architecture, hallucination rate drops to **~0%**.

**Iron rule: Never let an LLM recall medical literature from internal model weights.**

This upgrade mechanically enforces v2.6's Agent 6 guideline (*"distinguish primary source evidence from NotebookLM synthesis"*).

### Protocol

```
Phase 1, Step A — Crow (agent6a_crow, haiku):
  Tools: PubMed API, Semantic Scholar API, internal knowledge base
  Output: citation_library.json
    { "citation_id": "C-001", "title": "...", "pmid": "...",
      "abstract": "...", "verified": true }

Phase 1, Step B — Falcon (agent6b_falcon, opus):
  Input: citation_library.json ONLY (no retrieval tools)
  Output: evidence_report.json
    { "claim": "...", "evidence_ids": ["C-001", "C-007"],
      "claim_type": "literature" }
```

**Hallucination Guard (strict):** Post-output check scans `evidence_report.json` for claims without `evidence_ids`. Any found → reject + respawn Falcon. Logs to `hallucination_rate_log.jsonl`. Feeds v2.6's `results/evidence_audit.md`.

### Configuration

```yaml
crow_falcon_split:
  enabled: true
  crow_model: haiku
  falcon_model: opus
  max_crow_calls_per_phase: 45
  hallucination_guard: strict   # strict | warn | off
```

---

## 9. Finch Sandboxed Data Analysis Protocol *(NEW — Robin Architecture)*

### The Agentic Harness Paradigm

v2.6 sets `execution_policy.require_container_or_sandbox: true`. v2.7 makes this concrete: Agent 3 always operates inside Docker via exactly two tools. AI does not *read* data — AI *writes code* to analyze data.

Robin benchmark: base LLM = **1.6%** accuracy on biomedical data tasks. Finch = **22.8%**.

### Protocol

```
Input: raw data + analysis prompt
  → Docker sandbox (research-env:v1.0; Python, R, pandas, DESeq2, ...)
  → agent3_data (Finch mode):
      Tools: edit_cell | submit_answer  (ONLY)
      ReAct loop:
        Thought → Action(edit_cell) → Observation → ...
        On error: inject error → retry (max 12 iter)
        cascade_guard: same error × 3 → escalate
      submit_answer: { "finding": "...", "claim_type": "observed",
                       "artifact_path": "run_0/metrics.json" }
  → Output lands in metrics.json → claim_ledger.csv → evidence_bound_report.md
```

**NEVER set `sandbox: none` in production.**

---

## 10. BTL Tournament Ranking *(NEW — Robin Architecture)*

Absolute LLM scoring (1–10) introduces positional bias and cross-call inconsistency. Robin's solution: pairwise Bradley-Terry-Luce comparison.

### Protocol

```
N candidates (seed_ideas.json or runs/<idea_id>/)
  → pairings_per_candidate × N/2 random pairings
  → btl_judge (opus): "A vs B — which has stronger design?" → A | B | tie
  → BTL model MLE: β_1...β_N from all pairwise outcomes
  → ranked_candidates.json: { "rank": 1, "btl_score": 2.34, "win_rate": 0.87 }
```

| Phase | BTL use |
|-------|---------|
| Phase 2 (Idea Generation) | Rank `seed_ideas.json`; top idea advances to Phase 3 |
| Phase 4 (Candidate Runs) | Rank completed runs by quality metrics |

```yaml
btl_tournament:
  enabled: true
  min_candidates: 3
  pairings_per_candidate: 4
  model: opus
  phases: [phase_2_ideas, phase_4_candidates]
```

---

## 11. Parallel Trajectories + Consensus Filter *(NEW — Robin Architecture)*

Robin ran **8 independent Finch trajectories** and accepted only findings present in **≥50%** of trajectories.

```yaml
parallel_trajectories:
  enabled: false              # opt-in; N× cost multiplier
  n_trajectories: 8
  consensus_threshold: 0.5
  phases: [phase_4_runs, phase_5_analysis]
```

| n_trajectories | Cost | Recommended for |
|---|---|---|
| 3 | 3× | Exploratory / budget runs |
| 5 | 5× | Standard clinical analysis |
| 8 | 8× | Pre-publication / regulatory |

---

## 12. ReAct Self-Healing Loop Protocol *(NEW — Robin Architecture)*

Robin BixBench: single-step accuracy **47.9%** vs multi-step **15.3%**. Gap = error cascades.

```
agent3_data executes code:
  Success → continue
  Error → inject error message as context → retry (iter +1)
  cascade_guard: last 3 observations = identical error → STOP → escalate
  max_iterations reached → submit "PARTIAL" → claim_type forced to hypothesis
```

When cascade_guard fires: v2.6's `claim_policy.forbid_unbacked_observed_results` applies; `run_0/final_info.json` status = `failed`; reproducibility_report records failure.

```yaml
react_loop:
  max_iterations: 12
  error_feedback: true
  cascade_guard: true
```

---

## Updated Phase Details (v2.7)

**Phase 1** — Crow retrieves → `citation_library.json`. Falcon synthesizes from JSON → `evidence_report.json`. Guard post-check → `results/evidence_audit.md`.

**Phase 2** — Agent 1 generates `seed_ideas.json`. BTL Tournament ranks them. `ranked_candidates.json` created. Top idea(s) advance.

**Phase 3** — Agent 3 builds `experiment.py` in Finch mode (Docker, `edit_cell` only). ReAct Self-Healing active. Dry-run must succeed before Phase 3 gate passes.

**Phase 4** — Baseline run first. Candidate runs for top BTL-ranked ideas. If `parallel_trajectories.enabled`: N parallel runs → consensus filter.

**Phase 5** — Agent 3 (Finch mode) post-run analysis. All errors trigger ReAct retry. Every finding writes to `claim_ledger.csv` with `artifact_path`.

**Phase 5e** — 10-metric Alignment Scoreboard. Metric #10: Hallucination Rate (target ≤ 2%). Hard reproducibility gates from v2.6 unchanged.

**Phase 6** — Agent 5 writes evidence-bound report. Agent 9 audits. Final status: `AI_SCIENTIST_PASS | PROPOSAL_ONLY | DATA_UNAVAILABLE | FAILED_REPRODUCIBILITY`.

---

## Updated Output Files (v2.7)

```text
<project-dir>/
├── (all v2.6 files)
├── citation_library.json               # NEW — Crow retrieval output
├── evidence_report.json                # NEW — Falcon synthesis (claim-linked)
├── hallucination_rate_log.jsonl        # NEW — hallucination guard log
├── ranked_candidates.json              # NEW — BTL tournament output
├── consensus_findings.json             # NEW — parallel trajectory consensus
├── trajectory_agreement_matrix.json    # NEW — per-finding trajectory votes
└── react_cascade_log.jsonl             # NEW — cascade guard triggers
```

---

## Quality Control Checklist (v2.7 additions)

*(All v2.6 items still apply.)*

- [ ] Crow ran before Falcon: `citation_library.json` exists with `"verified": true` entries.
- [ ] Hallucination rate ≤ 2%: `hallucination_rate_log.jsonl` confirms.
- [ ] Finch sandbox active: `finch_protocol.sandbox = docker` in non-dev runs.
- [ ] Tool surface restricted: `agent3_data` used only `edit_cell` and `submit_answer`.
- [ ] BTL tournament ran (N ≥ 3): `ranked_candidates.json` exists with `btl_score`.
- [ ] No absolute scoring in BTL-enabled phases: no "rate 1–10" in judge prompts.
- [ ] Consensus filter applied: `consensus_findings.json` exists (if parallel_trajectories enabled).
- [ ] No cascade without review: `react_cascade_log.jsonl` is empty or annotated.
- [ ] No partial output as observed: no `agent3_data` output has `"PARTIAL"` + `claim_type: observed`.

---

## Common Pitfalls (v2.7)

*(v2.6 pitfalls renumbered 43–48.)*

**43.** Proposal language leaks into results → downgrade to `hypothesis`. *(v2.6 #37)*
**44.** NotebookLM synthesis treated as raw evidence → cite underlying source. *(v2.6 #38)*
**45.** Synthetic data supports empirical conclusions → all synthetic = `simulated`. *(v2.6 #39)*
**46.** Empty figures directory passes writing phase → Agent 9 requires `figure_manifest.json`. *(v2.6 #40)*
**47.** Baseline run skipped → create `run_0` first. *(v2.6 #41)*
**48.** Agent 5 upgrades weak claims → A5 can only preserve or downgrade. *(v2.6 #42)*

**49. (NEW)** Asking Falcon to retrieve before Crow runs → Falcon has no retrieval tools; Crow ALWAYS runs first.

**50. (NEW)** `sandbox: none` in production → Phase 0 config validation must block this: if `sandbox == "none"` AND `project_id != "dev"`, raise error and halt.

**51. (NEW)** BTL with fewer than `min_candidates` → hard guard; fewer candidates = direct selection, not BTL.

**52. (NEW)** `consensus_threshold: 1.0` → unanimous agreement across 8 stochastic LLMs = zero findings. Max recommended: 0.75 high-stakes, 0.5 standard.

**53. (NEW)** ReAct cascade on a structural data problem → `cascade_guard` log includes diagnosis: *"Likely schema mismatch — verify column names before retrying."*

**54. (NEW)** Absolute scoring in BTL-enabled run → add prompt linting at Phase 0: error on "1–10", "score", "rate" in judge prompts when BTL enabled.

---

## Verification Commands (v2.7)

```bash
# Crow/Falcon hallucination rate
jq '[.[] | select((.evidence_ids // []) | length == 0)] | length' evidence_report.json
jq '{total: .total_claims, unverified: .unverified_claims, rate: .hallucination_rate}' \
  hallucination_rate_log.jsonl | tail -1

# BTL top-ranked ideas
jq 'sort_by(.rank) | .[:5]' ranked_candidates.json

# Consensus filter
jq '{included: .included, excluded: .excluded, threshold: .threshold}' consensus_findings.json

# ReAct cascade guard
jq 'length' react_cascade_log.jsonl

# Finch tool surface (only edit_cell + submit_answer)
jq -r '.tool_name' agent3_data_trace.jsonl | sort | uniq -c

# v2.6 verifications (unchanged)
python experiment.py --data data/ --out_dir run_0 --config prompt.json --seed 20260609
python plot.py --run_dir run_0 --out_dir figures
python -m json.tool run_0/final_info.json
python -m json.tool figures/figure_manifest.json
python - <<'PY'
import csv, pathlib
rows = list(csv.DictReader(open('results/claim_ledger.csv', encoding='utf-8')))
bad = [r for r in rows if r['claim_type'] == 'observed' and not pathlib.Path(r['artifact_path']).exists()]
print('bad_observed_claims=', len(bad))
if bad: raise SystemExit(1)
PY
```

---

## Related Skills

Same as v2.6. Additionally:
- `academic-paper-review` — use alongside Crow/Falcon to audit source papers.
- `arxiv` — primary Crow retrieval source for preprint literature.

---

## Changelog

### v2.7.0 (2026-06-21) — Robin Architecture Integration

Five upgrades from Ghareeb et al. 2026 (*Nature*) Robin multi-agent system, integrated on top of v2.6's AI Scientist executable loop. Core theme: **verifiable retrieval + sandboxed computation + statistical ranking**.

8. **Crow/Falcon Literature Split** — hallucination rate 44.5% → ~0%.
9. **Finch Sandboxed Data Analysis Protocol** — Docker + `edit_cell` + `submit_answer`; operationalizes v2.6 execution policy.
10. **BTL Tournament Ranking** — pairwise comparison at Phase 2 + Phase 4; eliminates positional bias.
11. **Parallel Trajectories + Consensus Filter** — N parallel runs + ≥50% agreement (opt-in).
12. **ReAct Self-Healing Loop Protocol** — error injection retry + cascade_guard.

Scoreboard: metric #10 Hallucination Rate added (target ≤ 2%).
Backward compatible: all Robin upgrades opt-out-able to reproduce v2.6.

### v2.6.0 (2026-06-09) — AI Scientist-style Executable Discovery Loop

Seven required artifacts: experiment.py, plot.py, run_0/final_info.json, data schemas, claim typing, evidence-bound report, reproducibility judge.

### v2.5.0 — Self-correcting + Project-adaptive Faculty Layer
### v2.4.0 — Schedule + Flow + Ablation + Suppression + Scoreboard
### v2.3.0 — Cognitive Faculty Layer + Reflector + Priming + Probes
### v2.2.0 — Adaptive Monitor + Memory + Ensemble + Self-consistency + Telemetry
### v2.1.0 — Router + Few-shot + Cost-aware + Tree Search
### v2.0.0 — Monitor + Judge + Refusal
### v1.0.0 — Six agents, four stages.

---

## Future Work (v2.8+ backlog)

- **Robin Lab-in-the-loop blocking gate** — formal human sign-off with mandatory visualization artifacts (Volcano plot, JSON evidence list) before clinical recommendations exit the pipeline.
- **Crow multi-source weighting** — different retrieval sources carry different confidence weights; Falcon synthesizes with source-weighted evidence.
- **Finch error pattern library** — per-project `error_pattern_library.json`; inject known errors as "avoid these mistakes" context before new trajectories.
- **BTL cross-run stability** — Kendall's τ across independent judge sets as ranking stability metric.
- **Hierarchical calibration** — per-project AND per-sub-domain (project: dementia × sub: elderly_cohort).
- **Reflector ensemble** — pair Agent 8 with a second adversarial Reflector; compare findings.
- **Faculty-aware Router** — Router takes a faculty profile of user intent and routes accordingly.
