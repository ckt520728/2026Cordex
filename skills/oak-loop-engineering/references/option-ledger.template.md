# Oak Option Ledger - <project>

Durable evidence for the loop's Features, SubTasks, Options, Models, and planning
decisions. Update it at the end of every interaction. Keep raw run traces in a separate,
append-only log.

`loop-pause-all: false`

## Parent objective and reward

- **Parent objective:** <observable outcome>
- **Trusted closed-world reward:** <tests, CI, lint, benchmark, diff scope>
- **Human-only judgment:** <API/product/semantic/social choices>
- **Terminal-Feature bonus:** <bounded bonus; may not override parent reward>
- **Risk/cost penalties:** <tokens, latency, file count, external spend>
- **Absolute path/action gates:** `.env*`, secrets, credentials, auth, payments,
  billing, migrations, production infrastructure, push/publish
- **Attempt cap:** 3
- **Daily budget:** <cap>
- **Kill switch:** `loop-pause-all` above
- **Evidence policy:** <retention, access, redaction, hash/reference; no secrets in ledger>
- **Durable state authority:** <append-only sink and writer; or STATELESS/no learning>
- **Read-only attestation:** <exact argv, read-only FS, network/telemetry/cache/children,
  capture completeness, before/after target and external state>

## Baseline

- **Current primitive procedure:** <steps>
- **Reward/result:** <value>
- **Planning decisions/tool calls:** <count>
- **Tokens/time/cost:** <values>
- **Side effects/risk:** <scope>

## Maintenance

- **Prune/reset every:** <K cycles or weekly>
- **Last pass:** <date>
- **Confidence floor/reset rule:** <rule>

## Feature registry

### Feature: <feature_id>

- **version:** v1
- **detector/probe:** <deterministic check>
- **positive evidence:** <raw observation refs>
- **counterexamples:** <raw observation refs>
- **predictive use:** <transition/outcome it helps predict>
- **novelty vs existing Features:** <difference>
- **confidence/update-rate:** <calibrated value and rule>
- **status:** proposed | verified | archived

## SubTasks

### SubTask: <subtask_id>

- **parent Feature:** <feature_id>
- **initiation evidence:** <precondition>
- **terminal test:** <machine-checkable assertion>
- **reward:** <parent reward + bounded terminal bonus - costs>
- **attempt/escalation:** <cap and handoff>
- **allowed actions:** <scope>
- **status:** proposed | active | solved | archived

## Options

`status`: `proposed` (L1) -> `gated` (L2) -> `allowlisted` (L3). Only a recorded
human decision changes status.

### Option: <verb_noun>

- **version:** v1
- **status:** proposed
- **order:** 1
- **solves SubTask:** <subtask_id>
- **initiation contract:** <when valid>
- **policy/steps:** <decision rule or sequence>
- **termination condition:** <postcondition>
- **rollback/cleanup or irreversible-action contract:** <restore; or gate/cancel/
  compensate/cost-cap/evidence-preserve>
- **regression test:** <command/assertion>
- **worktree:** required if mutation occurs
- **signal:** trials=0, successes=0, same-target-attempts=0
- **checker/gate evidence:** <independent result and human decision>

## Option Models

### Model: <option_name>@v1

- **predicted terminal state:** <state>
- **predicted cumulative reward:** <value>
- **predicted time/tokens/cost:** <values>
- **predicted touched paths/external effects:** <scope>
- **predicted failure modes:** <list>
- **success probability:** <0..1>
- **ground-truth source/timing:** <immediate test, delayed outcome, human adjudication>
- **confidence/update-rate:** <value, predeclared equation, minimum n, state strata>
- **surprise/promotion thresholds:** <declared before trial 1>
- **human calibration approval:** <approver/date; missing blocks promotion>
- **calibration history:** <Brier/numeric errors with raw trace refs>

## Planning decisions

| cycle | state/Feature | candidates | chosen | predicted utility/risk | baseline | actual utility/risk | decision error |
|------:|---------------|------------|--------|------------------------|----------|---------------------|----------------|
| 1 | | | | | | | |

## Interaction log

| cycle | Option | prediction | evidence | component surprise | Model/update-rate change | next action |
|------:|--------|------------|----------|--------------------|--------------------------|-------------|
| 1 | | | | | | |

## Gate decisions

| date | artifact | transition | checker evidence | planning utility | approved by |
|------|----------|------------|------------------|------------------|-------------|

## Archive

Move pruned Features, SubTasks, Options, and Models here; never erase their audit trail.
