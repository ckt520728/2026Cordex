# Option Ledger — loop-engineering-upstream (L1 report-only)

Plastic memory / world-model for the OaK loop watching
`../loop-engineering-upstream`. **Level: L1 (report-only)** — the loop may perceive
(read-only) and *propose* Options and log predictions; it does **not** run any Option
that mutates the repo. Update at the end of every cycle.

Kill switch: set `loop-pause-all: true` here to halt.
`loop-pause-all: false`

---

## Reward spec

- **Trusted / auto-scored signals:**
  - `node tools/loop-audit/dist/cli.js . --suggest` → readiness score + exit 0
  - `node scripts/validate-registry.mjs` → exit 0 (patterns/registry.yaml valid)
  - `node scripts/check-loop-init-sync.mjs` → exit 0
  - `npm run test:tools` → all green (after deps installed)
- **Escalated / human-only judgments:** registry.yaml *semantic* changes, docs prose,
  safety-policy edits, anything under `.github/workflows/` (release/publish, NPM_TOKEN).
- **Surprise (TD-error) threshold that forces L2/human:** any command exit-code or
  module-resolution result that differs from the written prediction.
- **Attempt cap (self-corrections before escalate):** 3
- **Path denylist (never auto-edit — always escalate):** `.env*`, `**/secrets/**`,
  `.github/workflows/**`, `auth/`, `payments/`; **no `git push`**, no publish.
- **Command denylist:** **`npm audit fix` is forbidden** — it rewrites `package-lock.json`,
  converting the clean `install_deps_root` Option into a scope violation. Never gate any
  decision on `npm audit` output either; it is non-deterministic (online vs `--offline`
  reported different vulnerability counts for an identical package set).
- **Daily token budget / kill switch:** 1 cheap perceive pass/day; `loop-pause-all` above.

## Maintenance cadence

- **Prune/reset every:** 7 cycles (end of the L1 week)
- **Last maintenance pass:** —

---

## Options

`status`: `proposed` → `gated` → `allowlisted` (L1 → L2 → L3). Nothing graduates without a
human digest + regression pass. The loop itself may **never** self-promote — it flags a
candidate and stops; only a recorded human decision moves a status.

## Gate decisions (audit trail)

| date | option | from → to | evidence | approved by |
|------|--------|-----------|----------|-------------|
| 2026-07-24 | `audit_loop_readiness` | proposed → **gated (L2)** | 4/4 consecutive prediction matches (avg_surprise 0, attempt_count 0); regression re-run at gate: exit 0 ✓, `Score: 100/100` matches `/Score: \d+\/100/` ✓; scope check clean (0 porcelain entries) | human (Dr. Chu) |
| 2026-07-24 | `install_deps_tools` | proposed → **REJECTED** (stays proposed, attempt_count=1) | **Independent checker**, isolated worktree. Functional claim TRUE (both commands exit 1 → exit 0; regression PASS) but rejected on scope + side effects: initiation named 4 subpackages, only 3 are required; **the regression test itself modifies 13 tracked files** (builds into deliberately-committed `tools/*/dist/`); dirt is sticky (CRLF/autocrlf phantom — content identical, `git status` disagrees, doesn't self-clear); no cleanup path defined. Rework required. | human (Dr. Chu) |
| 2026-07-24 | `repo_healthcheck` | **NOT GATED** — precondition unmet | Gate condition was "both atoms green". `install_deps_root` green, `install_deps_tools` REJECTED → composition cannot inherit approval. Also inherits the tracked-write flaw: a healthcheck that dirties 13 tracked files defeats its own purpose. Redesign required. | human (Dr. Chu) |
| 2026-07-24 | `install_deps` → `install_deps_root` | proposed → **gated (L2)** | **Independent checker** (separate agent, default-REJECT stance) verified in an isolated detached worktree: baseline both scripts exit 1 `ERR_MODULE_NOT_FOUND: yaml` → after `npm ci` (exit 0) both exit 0; regression test PASS; **no tracked file changed** (`git status --porcelain` empty, `package-lock.json` md5 identical, `node_modules` gitignored); install did not escape to main tree; idempotent + offline-reproducible. Verdict **APPROVE** with 5 binding constraints. | human (Dr. Chu) |

**What L2 means for `audit_loop_readiness`:** it is now a trusted, verified Option — the
loop may rely on its result and use it as an atom when composing higher-order Options
(it is the first atom of the `repo_healthcheck` order-2 candidate). It remains read-only,
so "acting" carries no mutation risk; it still runs inside the wrapper's allowlist. It does
**not** advance to L3 — that needs sustained clean runs plus an explicit allowlisting
decision.

**Checker caveat (honest note):** the skill mandates maker ≠ checker. Here the regression
test was re-run by the same actor that authored the Option, with the human as the
approving gate. That is weaker than an independent checker sub-agent. Acceptable for a
read-only Option with a mechanical pass/fail test; for the first *mutating* Option
(`install_deps`) an independent checker is required, not optional.

### Option: audit_loop_readiness
- **version:** v1
- **status:** **gated (L2)** — promoted 2026-07-24, see Gate decisions below
- **order:** 1
- **initiation (when valid to call):** repo root present; `tools/loop-audit/dist/cli.js` exists
- **steps:** `node tools/loop-audit/dist/cli.js . --suggest`
- **termination (done when):** prints a Score line and exits 0
- **predicted effect (world-model):** integer score 0–100, a level (L0–L3), exit 0
- **regression test:** exit 0 AND output matches `/Score: \d+\/100/`
- **signal:** hit_count=5, success_rate=1.0, avg_surprise=0, attempt_count=0
- **worktree:** not required (read-only)
- **notes / corrections:** cycle 1 predicted correctly (100/100, L3). cycle 2 matched
  again (100/100, L3, exit 0). cycle 3 matched a third time (100/100, L3, exit 0) —
  **3/3 cycles hit, promotion threshold reached.** Per L1 rules this stays `status:
  proposed` regardless — graduation to L2 requires a human digest + regression pass,
  which has not happened yet. Flagging for human review rather than self-promoting.
  cycle 4 matched a fourth consecutive time (100/100, L3, exit 0) — still awaiting the
  human decision on L2 promotion; no self-promotion taken.
  **2026-07-24 — GATED TO L2 by human decision.** Regression test re-run independently at
  gate time: exit 0 ✓, output matched `/Score: \d+\/100/` ✓ (`Score: 100/100`), scope check
  clean (`git status --porcelain` = 0 entries, no side effects). Prediction record at gate:
  4/4 consecutive matches, avg_surprise 0, attempt_count 0.
  cycle 5 (post-gate, verified as L2): matched again (100/100, L3, exit 0) — no
  regression, signal continues to hold.

### Option: validate_registry
- **version:** v2
- **status:** proposed (blocked)
- **order:** 1
- **initiation (when valid to call):** `node_modules/` present with `yaml` resolvable  ← added by cycle-1 surprise (v1 lacked this)
- **steps:** `node scripts/validate-registry.mjs`
- **termination (done when):** exits 0
- **predicted effect (world-model):** registry valid, exit 0
- **regression test:** exit 0
- **signal:** hit_count=1, success_rate=0.0, avg_surprise=HIGH, attempt_count=1
- **worktree:** not required (read-only) once deps exist
- **notes / corrections:** cycle 1 mispredicted — actual `ERR_MODULE_NOT_FOUND: yaml`.
  Root cause is NOT the registry; it's a missing prerequisite. Bumped to v2 with the
  `node_modules present` initiation condition. Blocked on `install_deps`. cycle 2: initiation
  still not met (`node_modules/` absent) — not called, no change to signal. cycle 3: same,
  still blocked (`node_modules/` absent) — not called, no change to signal. cycle 4: same,
  still blocked (`node_modules/` absent) — not called, no change to signal. cycle 5: same,
  still blocked (`node_modules/` absent) — not called, no change to signal.

### Option: check_loop_init_sync
- **version:** v2
- **status:** proposed (blocked)
- **order:** 1
- **initiation:** `node_modules/` present with `yaml` resolvable
- **steps:** `node scripts/check-loop-init-sync.mjs`
- **termination (done when):** exits 0
- **predicted effect:** loop-init starters in sync, exit 0
- **regression test:** exit 0
- **signal:** hit_count=1, success_rate=0.0, avg_surprise=HIGH, attempt_count=1
- **worktree:** not required once deps exist
- **notes / corrections:** same shared root cause as `validate_registry` (missing deps),
  not a distinct defect. Blocked on `install_deps`. cycle 2: initiation still not met
  (`node_modules/` absent) — not called, no change to signal. cycle 3: same, still
  blocked (`node_modules/` absent) — not called, no change to signal. cycle 4: same,
  still blocked (`node_modules/` absent) — not called, no change to signal. cycle 5: same,
  still blocked (`node_modules/` absent) — not called, no change to signal.

### Option: install_deps_root  ← discovered by cycle-1 surprise; renamed at gate
- **version:** v2 (renamed from `install_deps` — see constraint 3)
- **status:** **gated (L2)** — promoted 2026-07-24 after independent checker APPROVE
- **order:** 1
- **initiation:** `package.json` present; `node_modules/` absent or `yaml` unresolvable
- **steps:** `npm ci` (repo **root only**) — installs `yaml`, `ajv`
- **termination (done when):** `yaml` resolves; `validate_registry` exits 0
- **predicted effect (world-model):** after `npm ci`, both blocked Options above exit 0
  — **VERIFIED 2026-07-24**: exit 1 (`ERR_MODULE_NOT_FOUND: yaml`) → exit 0 for both.
- **regression test:** `node scripts/validate-registry.mjs` exits 0 (checker confirmed this
  is a *meaningful* gate: real schema validation with genuine `process.exit(1)` paths, and
  read-only — it imports only `readFile, readdir, stat`)
- **signal:** hit_count=1, success_rate=1.0, avg_surprise=0, attempt_count=0
- **worktree:** **required** — verified in an isolated detached worktree; the install did
  **not** escape to the main tree. `node_modules/` is gitignored (`.gitignore:29`), so it
  cannot dirty the tree; `package-lock.json` md5 unchanged before/after.
- **L2 constraints (from the checker — these are binding):**
  1. **Never chain into `npm audit fix`.** There is a real high-severity dev-only vuln
     (`fast-uri` via `ajv`), but `audit fix` would **rewrite `package-lock.json`** and turn
     this clean Option into a scope violation. Deny it explicitly.
  2. **Never gate on `npm audit` output** — it is non-deterministic: the online run reported
     "1 high severity vulnerability", the `--offline` run reported "found 0" for the
     identical package set.
  3. **Scope is root-only.** Renamed `install_deps` → `install_deps_root` because the old
     name implied "install all dependencies". The four `tools/*` subpackages still have no
     `node_modules`, so `npm run test:tools` / `build:tools` would still fail.
  4. **Network-dependent in the general case.** The ~1–2s install here was cache-warm;
     a cold cache needs `registry.npmjs.org`. Do not assume it is fast or offline-safe.
  5. **Destructive to an existing install** — `npm ci` deletes `node_modules` before
     installing (by design). Additive it is not.
- **notes / corrections:** was the L1→L2 boundary in action — the loop *found* the fix at
  cycle 1 but correctly refused to apply it unattended for 5 cycles. Checker also confirmed
  it is **idempotent** (second `npm ci` → exit 0, tree clean) and **reproducible offline**
  once the cache is warm.

### Option: install_deps_tools  ← REJECTED at gate 2026-07-24
- **version:** v2 (corrected after REJECT; v1 scope was wrong)
- **status:** **proposed — REJECTED, needs rework before re-gating**
- **order:** 1
- **initiation (CORRECTED):** any of `tools/{loop-audit,loop-init,loop-cost}/node_modules`
  absent. **`goal-audit` removed** — it participates in neither `test:tools` nor
  `build:tools` (it appears only in two release workflows).
- **steps (CORRECTED — must be explicit):** `npm ci` in **each of the three** subpackages
  above. **`npm ci`, never `npm install`** — `npm install` can rewrite the subpackage
  `package-lock.json` files; `npm ci` left all four untouched.
- **root install is NOT a prerequisite** (checker verified: root `node_modules` stayed
  absent and both commands still passed). This contradicts the earlier assumption.
- **predicted effect:** `npm run test:tools` and `npm run build:tools` become runnable
  — **functionally CONFIRMED**: both went exit 1 → exit 0 (loop-init 6/6, loop-cost 7/7).
- **regression test:** `npm run test:tools` exits 0 — **PASSES, but see blocker 1**
- **signal:** hit_count=1, success_rate=1.0 (functional), avg_surprise=0, **attempt_count=1**
- **worktree:** **required** (mutating) — verified; main tree untouched, no leak.
- **BLOCKERS (why REJECT despite the functional claim being true):**
  1. **Its own regression test mutates tracked files.** `test:tools` runs `npm run build`
     inside each subpackage, and build output is **deliberately committed** (root
     `.gitignore` un-ignores `tools/*/dist/`). Running it leaves **13 tracked files**
     reported modified (`loop-audit/dist` ×6, `loop-cost/dist` ×4 + `registry.json`,
     `loop-init/dist` ×2). An Option that cannot be verified without writing to tracked
     paths breaks any clean-tree precondition, `git diff --exit-code` gate, or auto-commit.
  2. **The dirt is sticky and does not self-clear.** On this machine it is a phantom:
     `core.autocrlf=true` + no `.gitattributes` means checkout smudged `dist/*` to CRLF and
     `tsc` rewrote LF, so sizes differ while content is byte-identical to HEAD (`git diff`
     empty, `git hash-object` == index blob). Committing would change nothing — but
     `git status` disagrees permanently until `git add` or `git checkout --`.
  3. **Underspecified blast radius.** v1 read as a pure install; it is not, once the stated
     regression test runs.
  4. **No cleanup/undo path was defined.** Correct undo:
     `git checkout -- tools/loop-audit/dist tools/loop-cost/dist tools/loop-cost/registry.json tools/loop-init/dist`
     plus `rm -rf tools/*/node_modules`.
- **Rework required before re-gating:** either (a) pick a regression test that does not
  build into tracked paths, or (b) make cleanup part of the Option's termination condition
  and declare the tracked-`dist/` writes as *expected dirt* with an explicit allowance.
- **Caveats for later:** version drift is a genuine risk — `loop-audit`/`loop-init` pin
  `typescript ^6` / `@types/node ^26` while `loop-cost`/`goal-audit` pin `typescript ^5` /
  `@types/node ^20`, and different compilers emit into **committed** `dist/`, so another
  machine could produce real committable diffs. `loop-cost`'s build also needs a POSIX
  `chmod` on PATH (fine under Git Bash; fails under `cmd.exe` *after* already rewriting
  `dist/`). Network-dependent (~8s warm cache), no vendored fallback.

### Option (order 2, candidate): repo_healthcheck  ← Phase-4 recursion seed
- **status:** **NOT GATED — blocked; requires redesign** (was "blocked on install_deps_tools")
- **composes (CORRECTED TWICE):**
  `install_deps_root` (for `validate_registry` / `check_loop_init_sync`) **+**
  `install_deps_tools` (for `test:tools` — *independent of root*, not sequential) →
  { `validate_registry`, `check_loop_init_sync`, `npm run test:tools`, `audit_loop_readiness` }
- **predicted effect:** one command → full green health signal for the repo — **UNTESTED**
- **signal:** hit_count=0 — the order-2 Option itself has never been run
- **why it is not gated (2026-07-24):** the gate condition "both atoms green" is **not met**.
  `install_deps_root` is gated (L2); `install_deps_tools` was **REJECTED**. Composition
  cannot inherit approval from its atoms.
- **design flaw inherited from the rejected atom:** including `npm run test:tools` means
  *this healthcheck dirties 13 tracked files every time it runs*. A "healthcheck" that
  leaves the working tree reported-dirty is self-defeating — it would break the very
  clean-tree signal a health check exists to provide. Redesign needed, not just a re-gate.
- **notes:** first higher-order Option, and a useful negative result. Two successive
  world-model corrections arrived **from checkers rather than runtime surprises**:
  (1) root install does not unblock `test:tools`; (2) root install is not even a
  prerequisite for it — the two atoms are independent, not sequential. Do not build until
  the `test:tools` tracked-write problem is solved at the atom level.

---

## Cycle log

| cycle | option called | predicted state | actual state | TD-error | action taken |
|------:|---------------|-----------------|--------------|:--------:|--------------|
| 1 | audit_loop_readiness | score 0–100, exit 0 | 100/100, L3, exit 0 | 0 (match) | reinforce; promotion candidate |
| 1 | validate_registry | valid, exit 0 | ERR_MODULE_NOT_FOUND: yaml | HIGH | root-caused → proposed `install_deps`; added initiation cond (v2) |
| 1 | check_loop_init_sync | in sync, exit 0 | ERR_MODULE_NOT_FOUND: yaml | HIGH | same shared root cause; blocked on `install_deps` |
| 2 | audit_loop_readiness | score 0–100, exit 0 | 100/100, L3, exit 0 | 0 (match) | reinforce; 2/3 cycles toward promotion |
| 2 | validate_registry | (not called — initiation unmet) | `node_modules/` still absent | — | skipped, still blocked on `install_deps` |
| 2 | check_loop_init_sync | (not called — initiation unmet) | `node_modules/` still absent | — | skipped, still blocked on `install_deps` |
| 3 | audit_loop_readiness | score 0–100, exit 0 | 100/100, L3, exit 0 | 0 (match) | reinforce; 3/3 — promotion threshold reached, flagged for human review |
| 3 | validate_registry | (not called — initiation unmet) | `node_modules/` still absent | — | skipped, still blocked on `install_deps` |
| 3 | check_loop_init_sync | (not called — initiation unmet) | `node_modules/` still absent | — | skipped, still blocked on `install_deps` |
| 4 | audit_loop_readiness | score 0–100, exit 0 | 100/100, L3, exit 0 | 0 (match) | reinforce; 4/4 consecutive hits, promotion decision still pending human |
| 4 | validate_registry | (not called — initiation unmet) | `node_modules/` still absent | — | skipped, still blocked on `install_deps` |
| 4 | check_loop_init_sync | (not called — initiation unmet) | `node_modules/` still absent | — | skipped, still blocked on `install_deps` |
| 5 | audit_loop_readiness | score 0–100, exit 0 | 100/100, L3, exit 0 | 0 (match) | reinforce; first post-gate cycle, L2 signal holds — no regression |
| 5 | validate_registry | (not called — initiation unmet) | `node_modules/` still absent | — | skipped, still blocked on `install_deps` |
| 5 | check_loop_init_sync | (not called — initiation unmet) | `node_modules/` still absent | — | skipped, still blocked on `install_deps` |

**Cycle 1 summary (for the human digest):** 1 Option predicted correctly and is a
promotion candidate; 2 mispredicted with an identical, benign root cause (deps never
installed), which the loop correctly diagnosed and turned into one prerequisite Option
(`install_deps`) rather than 2 unrelated "fixes." Nothing was mutated. No escalation
needed beyond the standing "install deps?" decision, which waits for L2.

**Cycle 2 summary (for the human digest):** `audit_loop_readiness` matched again
(100/100, L3) — now 2/3 toward the promotion threshold. `validate_registry` and
`check_loop_init_sync` remain blocked: `node_modules/` is still absent in the target
repo, so their v2 initiation condition correctly prevented a repeat failed call (no new
surprise generated). No new commits in the target repo since cycle 1
(`5800705` still HEAD). Nothing was mutated; no escalation triggered.

**Cycle 3 summary (for the human digest):** `audit_loop_readiness` matched a third
consecutive time (100/100, L3, exit 0) — **3/3 hit, promotion threshold reached.** It
stays `status: proposed` per L1 rules (no self-promotion); this is now a concrete
decision point for a human to move it to L2 with an explicit gate. `validate_registry`
and `check_loop_init_sync` remain correctly blocked — `node_modules/` is still absent,
so no repeat failed call and no new surprise. No new commits in the target repo
(`5800705` still HEAD, unchanged since cycle 1). Nothing was mutated; no escalation
triggered.

**Cycle 4 summary (for the human digest):** `audit_loop_readiness` matched a fourth
consecutive time (100/100, L3, exit 0) — the promotion decision from cycle 3 is still
outstanding and unactioned by a human. `validate_registry` and `check_loop_init_sync`
remain correctly blocked — `node_modules/` is still absent in the target repo, so no
repeat failed call and no new surprise. No new commits in the target repo (`5800705`
still HEAD, unchanged since cycle 1). Nothing was mutated; no escalation triggered.

**Cycle 5 summary (for the human digest):** first cycle since `audit_loop_readiness` was
gated to L2 — it matched again (100/100, L3, exit 0), confirming the gate held and no
regression appeared post-promotion. `validate_registry` and `check_loop_init_sync`
remain correctly blocked — `node_modules/` is still absent in the target repo. No new
commits in the target repo (`5800705` still HEAD, unchanged since cycle 1). Nothing was
mutated; no escalation triggered.

---

## Archive (pruned Options — kept for audit, not called)

<!-- none yet -->

---

## FC-STOMP correction - 2026-07-24

The primary Oak specification uses Feature Construction -> SubTask -> Option -> Model ->
Planning. The earlier ledger jumped from a failed probe directly to dependency Options.
This section repairs that missing chain without erasing the audit history above.

### Feature: committed_dist_runs_without_tool_installs

- **detector:** all three `tools/{loop-audit,loop-init,loop-cost}/node_modules` directories
  are absent, then each package's committed-dist test is called directly with
  `node --test test/*.test.mjs`.
- **exploratory evidence:** isolated pristine worktree at `5800705`; before any install,
  loop-audit 11/11, loop-init 6/6, and loop-cost 7/7 passed (24/24 total); tracked tree
  remained clean.
- **predictive use:** distinguishes "committed runtime is healthy" from "source toolchain
  can rebuild dist." The former does not require subpackage dependencies.
- **status:** verified once; needs repeated Model trials before a gate.

### SubTask: verify_committed_tools_cleanly

- **parent reward preserved:** detect runtime regressions with exit status and no target
  mutation.
- **terminal Feature bonus:** all 24 committed-dist tests pass.
- **risk/cost:** no install, network, build, or tracked write.
- **attempt cap:** 3; any unexpected write or failure escalates.

### Option: verify_committed_tools_runtime

- **version:** v1
- **status:** proposed (L1)
- **order:** 1
- **initiation:** committed `dist/` and package test files exist.
- **policy:** run `node ../l1-run/verify-committed-tools-runtime.mjs .`; it invokes each
  package's exact committed-dist test and verifies the clean-tree contract. Do not run
  `npm test` because that prepends a build.
- **termination:** 24/24 pass, all exits 0, `git status --porcelain` empty.
- **rollback/cleanup:** none expected; on any write, reject and discard the worktree.
- **regression test:** the policy itself plus clean-tree assertion.
- **worktree:** not required after gate (read-only); used for discovery/verification.

### Model: verify_committed_tools_runtime@v1

- **pre-trial prediction:** success probability 0.90; 24/24 tests pass; duration under
  2 seconds; zero repository changes; no network or external effect.
- **trial 1 evidence:** isolated pristine worktree at `5800705`, with all 3 subpackage
  `node_modules` absent: 24/24 passed, 1.324 seconds, `git status --porcelain` 0 entries.
  No package manager or network-capable command ran.
- **component surprise:** terminal=0, duration=0, scope=0, external-effect=0.
- **calibration:** predicted `p=0.90`, observed `y=1`; Brier error
  `(0.90 - 1)^2 = 0.01`.
- **confidence/update-rate:** 0.625 / 0.25. Update rule:
  `confidence_next = confidence + rate * (y - confidence)`; retain the rate until
  repeated evidence supports changing it.
- **pre-registered trial 2:** `p=0.93`, 24/24, under 2 seconds, clean tree, no package
  manager/network command.
- **pre-registered trial 3:** `p=0.95`, 24/24, under 2 seconds, clean tree, no package
  manager/network command.
- **trial 2 evidence:** 24/24, 1.286 seconds, clean tree; Brier
  `(0.93 - 1)^2 = 0.0049`.
- **trial 3 evidence:** 24/24, 1.279 seconds, clean tree; Brier
  `(0.95 - 1)^2 = 0.0025`.
- **three-trial calibration summary:** 72/72 assertions passed; mean duration 1.296
  seconds; mean Brier error 0.0058; 0 repository changes; no worktree leaked to the
  main clone.
- **confidence after trial 3:** 0.7891 using the recorded update rule. The 3/3 evidence
  streak is useful, but the update equation was written after trial 1. Under the revised
  skill this is exploratory evidence, not a valid promotion series.
- **predeclared calibration contract v2:** scope is Windows/Node 24, commit `5800705`,
  committed `dist/` present, all 3 subpackage `node_modules` absent. Run 3 independent
  detached-worktree trials with `p=0.95`. Require 24/24, <=2.5 seconds, 0 status entries,
  mean Brier <=0.01, plus 2/2 negative fixtures (missing target and dirty tree) rejected.
  Use `c0=0.50`, `alpha=0.25`, `c_next=c+alpha*(y-c)`. Any field mismatch is HIGH
  surprise. Even a passing series only flags independent checker/human review.
- **v2 trial results:** 3/3 passed (24/24 each), durations 1.430/1.443/1.391 seconds,
  all with 0 status entries. Mean 1.421 seconds; mean Brier 0.0025; final confidence
  0.7891 under the predeclared equation.
- **v2 negative fixtures:** missing target rejected (exit 1, 0 tests); dirty target
  rejected (exit 1, 24 tests, 1 status entry). Result 2/2 rejected as required.
- **v2 verdict:** the complete predeclared contract passed. Flag
  `verify_committed_tools_runtime` for independent checker/human L2 gate. Status remains
  `proposed`; this actor does not approve it.

### Disposition of install_deps_tools

`install_deps_tools` remains REJECTED and is now archived for the healthcheck SubTask.
It may be relevant only to a distinct source-build/release SubTask. Source builds write
committed `dist/` and must run in a disposable worktree with their own Model and cleanup;
they do not belong in a clean, recurring runtime healthcheck.

### repo_healthcheck v2 planning hypothesis

Compose `audit_loop_readiness`, `verify_committed_tools_runtime`, and, only when root
dependencies satisfy initiation, `validate_registry` plus `check_loop_init_sync`.
Compared with the old baseline (`npm ci` in 3 tools plus `npm run test:tools`), this plan
predicts 3 fewer installs, no network/build, no 13-file status dirt, and sub-2-second
runtime. It stays proposed until the new Model receives repeated calibrated trials;
composition inherits no approval.
