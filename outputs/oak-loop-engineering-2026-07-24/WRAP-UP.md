# Oak Loop Engineering Upgrade - Wrap-up

**Date:** 2026-07-24  
**Target:** <https://github.com/ckt520728/loop-engineering>  
**Canonical skill in this repository:** `skills/oak-loop-engineering/`

## Objective

Upgrade loop engineering from a repeating static pipeline into a system that can improve
its abstractions, skills, predictions, and planning from first-hand runtime evidence,
using Richard Sutton's Oak architecture and continuous-learning direction.

The result is an installable Claude Code skill plus a report-only dogfood harness and
calibrated Option evidence.

## Final architecture

The early implementation used:

```text
Perceive -> Encapsulate -> Predict/Update -> Recurse
```

That is useful as an operational mnemonic, but it is not the most precise current
description of Sutton's Oak architecture. The final skill uses the RLC 2025 progression:

```text
Feature Construction -> SubTask -> Option -> Model -> Planning
                       F C - S T O M P
```

It also carries three architectural invariants:

1. Every learned artifact updates continually from first-hand interaction.
2. Every Feature, Option, and Model has a predeclared confidence/update contract.
3. Recursive growth is claimed only when an Option Model improves planning against a
   baseline.

The implementation keeps a strict source boundary:

- **Sutton/Oak:** continual learning, adaptive learning rates, FC-STOMP, temporally
  abstract Options, Option Models, and planning.
- **Software-loop adaptation:** Markdown state, test-based reward, Brier calibration,
  worktrees, L1/L2/L3, maker/checker, budgets, denylist, and human gates.

Document-based confidence updates are explicitly an engineering analogue; they are not
presented as Sutton's exact meta-gradient algorithm.

## What was delivered

### Canonical skill

`skills/oak-loop-engineering/`

- `SKILL.md` - operational FC-STOMP workflow and safety contract.
- `references/oak-loop.md` - primary-source architecture mapping.
- `references/rollout.md` - L1/L2/L3 rollout and failure-mode guards.
- `references/option-ledger.template.md` - durable FC-STOMP ledger template.
- `scripts/validate_skill.ps1` - target-format and CP950-safe validator.

### Evidence bundle

`outputs/oak-loop-engineering-2026-07-24/artifacts/`

- `handoff.md` - authoritative final handoff.
- `option-ledger.md` - full learning trail and calibration record.
- `loop-run-log.md` - append-only execution history.
- `run-prompt.md` - one FC-STOMP report-only cycle.
- `run-l1-cycle.ps1` - allowlisted unattended wrapper.
- `register-l1-task.ps1` - optional Windows Task Scheduler registration.
- `verify-committed-tools-runtime.mjs` - deterministic read-only Option runner.

Runtime logs and downloaded tool installers were intentionally excluded.

## Real recursive-learning result

The first dependency hypothesis was:

```text
install tool dependencies -> npm test -> repository health signal
```

Independent verification rejected it. The test commands prepend builds, and the builds
write into committed `dist/` paths. On this Windows checkout they left 13 tracked paths
reported dirty.

FC-STOMP produced a better abstraction:

### Feature

`committed_dist_runs_without_tool_installs`

The committed tool runtimes can be tested without installing subpackage dependencies.

### SubTask

`verify_committed_tools_cleanly`

Verify runtime behavior without network access, builds, package-manager calls, or target
mutation.

### Option

`verify_committed_tools_runtime`

Run the exact committed-dist tests for:

- `tools/loop-audit`
- `tools/loop-init`
- `tools/loop-cost`

Then assert that the repository remains clean.

### Model and calibration

The authoritative v2 contract was declared before execution:

- Windows and Node 24
- target commit `5800705`
- committed `dist/` present
- all three tool `node_modules` absent
- three independent positive trials
- two negative fixtures
- predicted success probability `p=0.95`
- 24/24 tests, at most 2.5 seconds, zero status entries
- mean Brier error at most 0.01

Results:

| Trial | Tests | Seconds | Status entries | Brier |
|------:|------:|--------:|---------------:|------:|
| v2-1 | 24/24 | 1.430 | 0 | 0.0025 |
| v2-2 | 24/24 | 1.443 | 0 | 0.0025 |
| v2-3 | 24/24 | 1.391 | 0 | 0.0025 |

Negative fixtures:

- Missing target: rejected with exit 1 and zero tests.
- Dirty target: rejected with exit 1, 24 tests, and one detected status entry.

The Option remains `proposed`. Passing evidence flags it for independent checker and
human L2 review; it does not self-promote.

## Encountered pitfalls

### 1. Secondary shorthand was mistaken for the primary architecture

The four-phase mnemonic was conceptually useful but omitted Oak's explicit Feature
Construction, reward-respecting SubTask, Option Model, and Planning stages.

**Correction:** Make FC-STOMP the architectural contract and keep the four phases only
as a mnemonic.

### 2. Successful procedure was confused with recursive capability growth

A command sequence can work repeatedly without helping planning.

**Correction:** Require measured planning utility: fewer decisions, tool calls, tokens,
time, or cost at equal or lower risk. An Option without planning benefit remains a
procedure, not evidence of recursive growth.

### 3. Dependency scope was assumed instead of measured

Root dependencies and `tools/*` dependencies are independent. Root `npm ci` does not
prepare the tool packages, and the committed runtime tests did not need tool installs at
all.

**Correction:** Treat dependency presence as a Feature to test, not a prerequisite to
assume.

### 4. The regression command mutated the repository

`npm run test:tools` invokes package builds before tests. Because the repository commits
generated `dist/`, a health check wrote tracked paths.

**Correction:** Separate committed-runtime verification from source-build/release
verification. The latter must stay in a disposable worktree.

### 5. CRLF and Git status produced phantom dirt

With `core.autocrlf=true` and no repository `.gitattributes`, TypeScript rewrote
generated output with different line endings. Blob content could normalize to the index
while `git status` still reported changes.

**Correction:** Do not use a build-prepending test as a clean-tree health signal. Treat
generated-output and line-ending behavior as part of the Option Model.

### 6. A functional result was incorrectly treated as sufficient for approval

The rejected install Option made the tests pass, but its scope, cleanup, and side effects
were unacceptable.

**Correction:** Checker defaults to REJECT and verifies termination, regression union,
scope, side effects, rollback or irreversible-action contract, and planning utility.

### 7. Calibration rules were initially chosen after observing a result

The first three predictions were recorded before action, but the confidence update
equation was written after trial 1.

**Correction:** Treat that series as exploratory. Run a new series with equation,
minimum sample count, strata, thresholds, and negative fixtures declared before trial 1.

### 8. Success/failure could not always be known immediately

CI flakiness and other real-world labels often require later root-cause resolution or
human adjudication.

**Correction:** Record unresolved outcomes as unknown. Append delayed ground truth to
the original trace; never rewrite the prediction. Historical data can seed a prior but
does not count as a first-hand current-run trial.

### 9. "Read-only" was underspecified

A command may avoid source edits while still using network, telemetry, caches, child
processes, paid compute, or external state.

**Correction:** Pin executable and argv, mount the target read-only, deny network, disable
or monitor telemetry/cache/children, capture complete output/exit, and compare
before/after target and external-state attestations. Bounded local parsing is read-only
but still budgeted.

### 10. Durable learning state needs separate authority

If the only authorized action is a read command, the loop may not automatically have
permission to persist its ledger.

**Correction:** Require an explicitly authorized append-only loop-owned state sink.
Without it, emit a stateless report and make no continual-learning claim.

### 11. Irreversible external actions cannot be "rolled back"

Consumed CI compute, sent messages, or created external records may be impossible to
undo.

**Correction:** Use a pre-action gate, stop/cancel where available, compensation, cost
cap, and evidence-preservation contract. Never claim rollback when none exists.

### 12. Raw evidence creates retention and privacy obligations

Storing full command output in a ledger can leak credentials or sensitive content.

**Correction:** Store hashes and references, define retention/access/redaction, quarantine
unexpected secrets, and keep raw sensitive payloads out of the ledger.

### 13. The generic skill validator rejected target-specific frontmatter

The target `loop-engineering` skill format uses `user_invocable: true`, while the generic
Codex validator does not allow that key.

**Correction:** Preserve the target format and add a deterministic target-format
validator rather than weakening compatibility to satisfy the wrong schema.

### 14. Windows CP950 broke validation on UTF-8 punctuation

The generic validator read files with the host encoding and crashed on typographic
dashes and arrows.

**Correction:** Keep the distributable skill ASCII-clean and validate this property.

### 15. PowerShell selected `npm.ps1`, which execution policy blocked

Calling `npm` directly selected the PowerShell shim and produced a script-execution
policy error.

**Correction:** Use `npm.cmd` when an npm invocation is truly required. In this case the
larger correction was to remove the unnecessary install entirely.

### 16. Headless permission configuration had non-obvious behavior

- A settings-file allow list did not preapprove tools in `claude -p`.
- `--allowedTools` did.
- Non-allowed tools were denied rather than hanging.
- `Edit(path)` matched file writes; `Write(path)` did not.
- An external state directory also required `--add-dir`.
- Deny rules overrode allow rules.

**Correction:** Keep the effective allow/deny policy as explicit wrapper arguments and
validate with a dry run.

### 17. Shell working-directory composition made the allowlist too broad

Allowing `cd package && node --test ...` required brittle compound-command permissions.

**Correction:** Encapsulate the exact read-only behavior in
`verify-committed-tools-runtime.mjs` and allowlist one deterministic command.

### 18. Same-actor verification is weaker than an independent checker

A mechanical read-only regression can be repeated by the maker, but mutation gates and
promotion decisions need an independent skeptical pass.

**Correction:** Keep maker and checker distinct, give the checker a default-REJECT
stance, and never let the loop change its own status.

## Validation summary

- Target-format validation passed.
- Skill package remained under 500 lines in `SKILL.md`.
- Skill package is ASCII-clean.
- Source and installed copies matched by SHA-256.
- Three PowerShell scripts parsed with zero errors.
- Node helper passed syntax checking.
- Committed-runtime Option passed 24/24 tests and a clean-tree assertion.
- Positive and negative calibration fixtures passed the predeclared contract.
- Two independent forward tests produced complete FC-STOMP designs without mutation.
- A follow-up audit returned 4/4 PASS for compute semantics, durable state authority,
  zero-mutation attestation, and human-approved calibration thresholds.

## Primary sources

- Richard S. Sutton, "The Oak Architecture: A Vision of SuperIntelligence from
  Experience," RLC 2025:
  <https://rl-conference.cc/2025/schedule.html>
- Richard S. Sutton, Michael Bowling, Patrick M. Pilarski, "The Alberta Plan for AI
  Research":
  <https://arxiv.org/abs/2208.11173>
- Richard S. Sutton et al., "Reward-Respecting Subtasks for Model-Based Reinforcement
  Learning":
  <https://arxiv.org/abs/2202.03466>
- David Silver and Richard S. Sutton, "Welcome to the Era of Experience":
  <https://storage.googleapis.com/deepmind-media/Era-of-Experience%20/The%20Era%20of%20Experience%20Paper.pdf>

## Next gate

Run an independent checker against `verify_committed_tools_runtime`. If it reproduces
the positive and negative contract and a human approves, record:

```text
proposed -> gated (L2)
```

Do not gate the higher-order `repo_healthcheck` until every executable atom is
independently gated and the composed Option has its own Model, calibration record,
scope check, and planning comparison.
