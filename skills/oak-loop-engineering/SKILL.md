---
name: oak-loop-engineering
description: >
  Design and operate software-agent loops that improve from runtime experience using
  Richard Sutton's Oak architecture: continual learning, adaptive learning rates, and
  the FC-STOMP progression from Features to SubTasks, Options, Models, and Planning.
  Use for CI sweepers, PR babysitters, triage/fix loops, repository maintainers, and
  other recurring workflows that should acquire reusable skills and better predictions
  across runs instead of repeating a static pipeline. Includes L1/L2/L3 rollout,
  maker/checker verification, worktree isolation, budgets, and human safety gates.
user_invocable: true
---

# Oak Loop Engineering

Build a loop that improves its action library and predictive model from first-hand
execution evidence. A static loop repeats a pipeline. An Oak loop continually constructs
abstractions that make later learning and planning faster.

Keep the source boundary explicit:

- **Sutton / Oak:** continual learning in every component; learned adaptation rates;
  the five-stage **FC-STOMP** progression; temporally abstract Options and their Models;
  planning with those Models.
- **Software-loop adaptation:** files as durable state, tests as partial reward,
  confidence/calibration fields in place of neural step sizes, and L1/L2/L3,
  maker/checker, worktree, path, and budget gates.

Do not describe the software adaptation as a literal implementation of Sutton's learning
algorithm. Read `references/oak-loop.md` for provenance and the exact mapping. Read
`references/rollout.md` before enabling any mutation.

## Three architectural invariants

1. **Learn continually.** Update the ledger after every interaction, not in a later
   training phase. Preserve the raw observation that caused each update. Authorize a
   separate loop-owned append-only state sink; if no durable sink is authorized, label
   the run stateless and do not claim continual learning.
2. **Adapt how fast each item learns.** Maintain a per-Feature, Option, and Model
   confidence/update-rate. Increase it when recent evidence is informative; decrease it
   when predictions oscillate or evidence is sparse. In a document-based loop this is a
   calibrated engineering analogue of Oak's learned per-weight step sizes.
3. **Grow abstractions through FC-STOMP.** Do not jump directly from repeated commands
   to a promoted skill. Complete Feature Construction, SubTask, Option, Model, and
   Planning evidence in order.

## FC-STOMP: the outer growth loop

### F - construct a Feature

Detect a reusable, grounded distinction in the live environment: an error signature,
repository state, dependency condition, diff shape, latency band, or other observation
that changes what should happen next.

Record:

- a deterministic detector or probe;
- evidence examples and counterexamples;
- the state transition or outcome it helps predict;
- novelty relative to existing Features.

Reject Features that are merely labels with no detector or predictive use.

### ST - pose a reward-respecting SubTask

Turn the Feature into a bounded subproblem. Preserve the parent loop's reward and safety
constraints, then add a terminal bonus for reaching the Feature-defined state. Never
invent a proxy reward that can overpower the parent objective or a denylist.

Write initiation evidence, terminal test, reward terms, maximum attempts, and escalation
condition before trying to solve the SubTask.

### O - learn and gate an Option

Package a successful behavior into an Option: a policy (steps or decision rule) and a
termination condition. Also record its initiation contract so the software loop knows
when it is valid to call.

Promote only when repeated trials show:

- the termination test passes;
- the parent reward is preserved;
- scope and side effects match prediction;
- the regression union remains green;
- an independent checker can reproduce the result.

Run every code-mutating trial in a disposable worktree. A proposed Option starts at L1;
it never self-promotes.

### M - learn an Option Model

Before every invocation, predict the Option's consequences. Model more than pass/fail:

- termination state and cumulative reward;
- duration and token/compute cost;
- paths and external systems touched;
- likely failure modes;
- uncertainty or confidence.

Execute, compare prediction with reality, record component-wise surprise, and update the
Model immediately. A wrong prediction is learning evidence, not permission for a silent
retry. Cap same-target corrections at 3, then emit `ESCALATE_HUMAN`.

### P - plan with Option Models

Use learned Models to compare candidate Options and primitive actions. Select an Option
only when its predicted value, risk, and cost improve on a recorded baseline. Log what
the planner chose and why.

Measure **planning utility**, not just Option success: fewer decisions, fewer tool calls,
lower cost/latency, or higher reward at equal risk. An Option that works but never helps
planning remains a tested procedure; it is not evidence of recursive growth.

Feed Model predictions and planning outcomes back into Feature construction. Existing
Options become callable actions for higher-order SubTasks. This closes recursion:

`Feature -> SubTask -> Option -> Model -> Planning -> new higher-level Feature`.

## The inner online update

For every called Option:

1. Observe the current state and verify initiation.
2. Write the predicted result, cost, side effects, and uncertainty.
3. Execute only at the Option's authorized level.
4. Compare every predicted field with evidence.
5. Update the Model, confidence/update-rate, counters, and raw trace in the same cycle.
6. Re-plan or escalate; never conceal surprise with an unlogged retry.

Use a simple calibration score where possible. For binary outcomes, record the predicted
probability and Brier error `(p - y)^2`. For numeric outcomes, record a normalized
absolute error. Keep qualitative `LOW/MEDIUM/HIGH` surprise only when no defensible
numeric scale exists.

Before trial 1, declare the update equation, surprise threshold, minimum sample count,
and representative state strata. Do not choose them after seeing results. Treat
unresolved outcomes as unknown, not failure or success. Append delayed ground truth
(later CI outcome, root-cause resolution, or human adjudication) to the original trace;
never rewrite the prediction. Historical evidence may seed a prior, but does not count
as a first-hand current-run trial.

The skill supplies no universal sample count or threshold. The human owner must approve
values appropriate to the reward, risk, and deployment strata before they govern
promotion. Missing values block promotion rather than defaulting silently.

## Promotion and recursion gates

An Option may move:

- **proposed (L1) -> gated (L2):** human gate, independent checker, reproducible
  termination, side-effect check, and full regression union.
- **gated (L2) -> allowlisted (L3):** sustained calibrated predictions, explicit
  allowlist, human comprehension digest, tested rollback/cleanup or irreversible-action
  contract, and positive planning utility versus baseline.

Only `gated` or `allowlisted` Options may be composed into an executable higher-order
Option. Proposed Options may appear in a plan as hypotheses but cannot lend approval to
their composition.

For report/read Options, the regression union includes deterministic fixtures for valid
input, schema/command failure, missing fields, collisions/duplicates, complete coverage,
and zero mutation.

## Non-negotiable safety

- Version Options and retain the prior version until the regression union passes.
- Prune/archive stale Options and reset low-signal confidence on a fixed cadence.
- Auto-score only closed-world signals. Escalate ambiguous product, semantic, or social
  judgment.
- Treat `.env*`, secrets, credentials, auth, payments, billing, migrations, and
  production infrastructure as absolute human gates.
- Set an attempt cap, daily budget, single kill switch, and append-only run log.
- Retain raw evidence by hash/reference with a declared retention, access-control, and
  redaction policy. Never place secrets or sensitive payloads directly in the ledger.
- For a read-only contract, pin executable and argv; use a read-only target filesystem;
  deny network; disable or monitor telemetry, caches, and child processes; capture
  stdout/stderr/exit; and compare before/after target and external-state attestations.
  Bounded local parsing uses compute and must fit the budget, but is still read-only.
  Paid, external, state-changing, or unbounded compute is not read-only.
- Do not claim rollback for an irreversible external action. Define a pre-action gate,
  stop/cancel path where available, compensation, cost cap, and evidence-preservation
  contract instead.
- Require a human-readable digest before any Option reaches L3.
- Keep maker and checker independent. The checker defaults to REJECT.

## Minimal start

1. Copy `references/option-ledger.template.md` to `STATE/option-ledger.md`.
2. Fill the parent reward, denylist, budget, baselines, and maintenance cadence.
3. Start at L1 with one read-only Feature probe.
4. Complete one FC-STOMP row end to end; do not create a library of speculative Options.
5. Gate the first mutation at L2 in a disposable worktree.
6. Permit recursive composition only after the atoms have learned Models and demonstrate
   planning utility.

## Failure patterns

- Repeated commands promoted without a Feature, SubTask, or Model.
- Pass/fail called a world model while cost and side effects remain unpredicted.
- Successful Option assumed useful without a planning baseline.
- Confidence raised without calibration evidence.
- Proxy reward overriding the parent objective or denylist.
- Maker approving its own Option.
- Fresh or unread Option reaching L3.
- Surprise hidden by retry; more than 3 corrections on one target.
