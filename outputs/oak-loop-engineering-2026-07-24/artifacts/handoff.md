# Handoff - Oak loop-engineering skill

**Updated:** 2026-07-24  
**Owner:** Dr. Chu  
**Goal:** Upgrade `https://github.com/ckt520728/loop-engineering` with Richard
Sutton-inspired recursive autonomous evolution and continuous learning.

## Current deliverable

`oak-loop-engineering/` is the source of truth and an installable Claude Code skill:

```text
oak-loop-engineering/
  SKILL.md
  references/
    oak-loop.md
    rollout.md
    option-ledger.template.md
  scripts/
    validate_skill.ps1
```

The working validation run is under `l1-run/`. The target is the clean, throwaway
`loop-engineering-upstream/` clone at commit
`580070512b222e1dd00a7867b419237a5cffc808`.

## Architecture upgrade completed

The original build used a four-phase shorthand:

`Perceive -> Encapsulate -> Predict/Update -> Recurse`

The current skill follows Sutton's primary RLC 2025 Oak description:

`Feature Construction -> SubTask -> Option -> Model -> Planning (FC-STOMP)`

It now enforces three Oak invariants:

1. every artifact updates continually from first-hand interaction;
2. each Feature/Option/Model has a calibrated confidence/update-rate (an explicit
   software analogue, not a claim to implement Sutton's meta-gradient algorithm);
3. recursion occurs only after an Option has a learned Model that improves planning.

Important corrections:

- A repeated command is not yet an Option. It needs a grounded Feature, a
  reward-respecting SubTask, termination evidence, an Option Model, and planning utility.
- Knowledge is an Option Model, not merely a log or pass/fail prediction. It covers
  terminal state, reward, time/cost, side effects, failure modes, and uncertainty.
- Option success is insufficient. Promotion requires utility versus a primitive/current
  baseline.
- Binary Model predictions use Brier error; numeric predictions use normalized error.
- Primary-source provenance and the software-adaptation boundary are explicit in
  `references/oak-loop.md`.

## Safety retained

- L1 report-only -> L2 human-gated -> L3 allowlisted.
- Independent maker/checker, checker defaults to REJECT.
- Disposable worktrees for mutations.
- Versioned Options and a regression union.
- Absolute path/action gates, 3-attempt cap, budget, kill switch, and append-only log.
- Periodic prune/reset and a human comprehension digest before L3.

## Real learning result

Earlier work correctly REJECTED `install_deps_tools`: `npm run test:tools` builds into
committed `dist/` and left 13 tracked paths reported dirty.

The FC-STOMP pass found a deeper correction:

- **Feature:** committed tool runtimes work without subpackage installs.
- **SubTask:** verify committed tool behavior without mutation.
- **Option:** `verify_committed_tools_runtime` calls
  `node --test test/*.test.mjs` in loop-audit, loop-init, and loop-cost; it never invokes
  the build-prepending `npm test`.
- **Model:** predicted 24/24 passes, under 2 seconds, clean tree, no package-manager or
  network command.
- **Planning:** removes 3 installs, network dependence, builds, and 13-file status dirt
  from the recurring healthcheck path.

The first three prediction trials matched, but the confidence update equation was
written after trial 1. The revised skill correctly treats those as exploratory rather
than promotion evidence.

The replacement v2 contract was fully predeclared: Windows/Node 24, commit `5800705`,
no tool `node_modules`, 3 independent positive trials, 2 negative fixtures, `p=0.95`,
24/24, <=2.5 seconds, clean tree, mean Brier <=0.01.

| trial | tests | seconds | status entries | Brier |
|------:|------:|--------:|---------------:|------:|
| v2-1 | 24/24 | 1.430 | 0 | 0.0025 |
| v2-2 | 24/24 | 1.443 | 0 | 0.0025 |
| v2-3 | 24/24 | 1.391 | 0 | 0.0025 |

Mean duration: 1.421 seconds. Mean Brier: 0.0025. Missing-target and dirty-tree fixtures
were both rejected as specified. The main clone remained pristine and all trial
worktrees were removed. The Option remains `proposed`; the passing contract flags it for
an independent checker/human L2 gate but does not self-promote it.

`install_deps_tools` is archived for this healthcheck SubTask. A separate source-build
or release SubTask may still need tool dependencies, but it must expect committed-dist
writes and stay isolated.

## Validation

- All skill files are ASCII-clean for the Windows CP950 environment.
- `scripts/validate_skill.ps1` passes the target Claude skill format (206 lines).
- The standard Codex `quick_validate.py` parses the package but rejects the
  target-repository-specific `user_invocable` frontmatter key. The field is intentionally
  retained because the folder guidance and target repo require that Claude Code format.
- Source and installed copies match by SHA-256 and the installed copy passes validation.
- `run-l1-cycle.ps1` and the registration script parse; the allowlist dry-run passes.
- `verify-committed-tools-runtime.mjs` passes `node --check` and its positive/negative
  contract tests.
- Two independent forward tests produced complete CI-flake and dependency-alert
  FC-STOMP designs without modifying anything. They exposed gaps around delayed ground
  truth, raw evidence, irreversible actions, calibration contracts, L1 read semantics,
  report fixtures, durable state authority, and zero-mutation attestation; all were
  added to the skill before final validation.
- The second forward tester re-read the revised package and returned 4/4 PASS on the
  previously ambiguous compute, durable-state, attestation, and threshold contracts.

## Primary sources

- Sutton, RLC 2025 Oak keynote:
  `https://rl-conference.cc/2025/schedule.html`
- Sutton, Bowling, Pilarski, *The Alberta Plan for AI Research*:
  `https://arxiv.org/abs/2208.11173`
- Sutton et al., *Reward-Respecting Subtasks for Model-Based Reinforcement Learning*:
  `https://arxiv.org/abs/2202.03466`
- Silver and Sutton, *Welcome to the Era of Experience*:
  `https://storage.googleapis.com/deepmind-media/Era-of-Experience%20/The%20Era%20of%20Experience%20Paper.pdf`

## Next gate

Use an independent checker on `verify_committed_tools_runtime`. If it reproduces the
three-part contract (24/24, under the declared threshold, clean tree) and a human approves,
record `proposed -> gated (L2)`. Do not gate the higher-order `repo_healthcheck v2` until
each executable atom is independently gated.
