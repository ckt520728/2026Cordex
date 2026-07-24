# Rollout ladder and failure-mode guards

Apply the loop-engineering L1/L2/L3 ladder to an Oak loop that grows Features,
SubTasks, Options, and Models. Never let a newly learned artifact start at L3.

## L1 - report-only

Construct read-only Features and propose SubTasks, Options, and Models. Log
counterfactual plans; do not invoke state-changing Options.

Read-only Options may run at L1 only when their initiation and zero-mutation contracts
are mechanically checkable. Bounded local parsing may consume budgeted CPU and remain
read-only. Paid/external/unbounded compute, external state change, or a triggered retry
is not read-only.

Minimum zero-mutation evidence: exact executable/argv, read-only target filesystem,
network denied, telemetry/cache/child-process behavior disabled or monitored, complete
stdout/stderr/exit capture, and before/after target plus external-state attestations.

- Ground every Feature in a detector and raw observation.
- Preserve the parent reward when posing a SubTask.
- Predict outcome, cost, and side effects.
- Compare proposed planning utility with the primitive/current baseline.

Graduation requires repeated Feature and termination evidence, a calibrated Model, and a
predicted improvement in reward or planning utility without expanded risk.
Predeclare sample count, representative strata, update equation, and thresholds; a
post-hoc streak is not a calibration plan.
The human owner chooses these risk-specific values before trial 1. If they are missing,
promotion is blocked; the skill does not invent universal defaults.

## L2 - assisted

Act only behind a human gate.

- Maker proposes an Option invocation/edit and its Model prediction.
- Independent checker defaults to REJECT, runs the full regression union, checks scope,
  and reproduces the terminal state in an isolated worktree.
- Human approves the action and records the decision.

Graduation requires an explicit allowlist, representative calibrated runs, positive
planning utility, a tested rollback/cleanup or irreversible-action contract, regression
coverage, and a human who can explain the artifact.

## L3 - unattended

Run allowlisted Options only. Immediately stop and return to L2/human review on:

- prediction error above a field's surprise threshold;
- regression failure or unpredicted side effect;
- a decision outside the written reward;
- budget, kill-switch, denylist, or attempt-cap trigger.

## Guard 1 - catastrophic forgetting

Every Option carries a test for its termination and side-effect contract. The regression
union contains all active Option tests plus the parent loop's existing checks.

Keep `v(n-1)` until `v(n)` leaves the union green. Conflicting Options require
escalation, not overwrite.

## Guard 2 - loss of plasticity

On a fixed cadence:

- archive Options and Features with near-zero use or decayed predictive value;
- lower low-signal confidence/update parameters so new candidates can compete;
- retain an auditable record and calibration history.

An ever-growing ledger is unhealthy.

## Guard 3 - ambiguous reward

Write the parent reward before the loop runs.

- Auto-score closed-world signals: tests, CI, lint, types, benchmark, diff scope.
- Escalate open-world judgment: API/product choices, customer communication, prose
  quality, or semantics not covered by a deterministic rule.

Use a bounded terminal-Feature bonus for a SubTask. It must preserve the parent reward
and cannot override safety gates.

## Guard 4 - absolute path/action gates

An Option that would touch these areas emits `ESCALATE_HUMAN`:

```text
.env  .env.*  **/secrets/**  **/credentials/**  **/*_key*  **/*_secret*
auth/**  payments/**  billing/**  **/migrations/**
.terraform/**  k8s/production/**
```

Also gate security/authz, PII, supply-chain changes, push/publish, production systems,
large diffs, and a third failed same-target attempt.

## Guard 5 - bounded resources and shutdown

- **Attempt cap:** at most 3 same-target corrections, followed by a full-trail handoff.
- **Budget:** run a cheap Feature probe before costly Options; pause and log on exceed.
- **Kill switch:** one documented state flag halts every level immediately.
- **Isolation:** one disposable worktree per mutating attempt; clean up on reject.
- **Evidence:** retain raw observations by hash/reference; declare retention, access, and
  redaction. Append delayed labels without rewriting the original prediction.
- **Durable state:** authorize a separate append-only loop-owned sink. Writes to that
  sink are state maintenance, not target mutation. If the task does not authorize it,
  emit a stateless report and make no continual-learning claim.
- **Irreversible actions:** use pre-action gates, stop/cancel, compensation, and cost
  caps. Never describe consumed compute or sent messages as rolled back.

## Guard 6 - comprehension debt

A human reads a periodic digest of every new or edited Feature, SubTask, Option, and
Model: what changed, why, prediction/calibration, side effects, and planning benefit.
Nothing graduates past L2 until a human can explain it.

## Maker/checker split

- **Maker:** constructs Features, poses SubTasks, proposes/edits Options and Models, and
  writes predictions.
- **Checker:** independently runs the regression union, verifies scope and calibration,
  compares planning utility with baseline, and defaults to REJECT.
- Never use the same actor for both roles in one gate.
