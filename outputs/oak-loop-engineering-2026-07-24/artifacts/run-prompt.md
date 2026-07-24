# L1 cycle prompt - Oak loop over loop-engineering-upstream

Run exactly one report-only cycle of `oak-loop-engineering` against:

`C:\Users\YangminRoom1\2026 Claude Practice\loop-engineering-upstream`

State lives at:

`C:\Users\YangminRoom1\2026 Claude Practice\l1-run\option-ledger.md`

1. **Halt.** If `loop-pause-all: true`, stop and report `paused`.
2. **Read.** Load the parent reward, baseline, Features, SubTasks, Options, Models,
   calibration history, gate decisions, and attempt counts.
3. **Construct Features with read-only probes.** Run callable detectors/Options:
   - `node tools/loop-audit/dist/cli.js . --suggest`
   - `node scripts/validate-registry.mjs` only if root `node_modules` resolves `yaml`
   - `node scripts/check-loop-init-sync.mjs` only if root `node_modules` resolves `yaml`
   - `node ../l1-run/verify-committed-tools-runtime.mjs .`
   - `git log --oneline -10` and read-only clean-tree checks
4. **Predict before calling.** For every Option write the terminal state, reward,
   duration/cost, touched paths/external effects, failure modes, and success probability.
5. **Compare and update online.**
   - Record component-wise surprise. For binary outcomes, record Brier error.
   - Update the Model and its confidence/update-rate from this interaction.
   - Root-cause mismatch. Never hide it with a silent retry.
   - If a fix would mutate the target, log it as a proposed Option and stop there.
   - At 3 same-target corrections, emit `ESCALATE_HUMAN`.
   - Any absolute gate or human-only judgment emits `ESCALATE_HUMAN`.
6. **Advance FC-STOMP only with evidence.** A Feature needs a detector and predictive
   use. A SubTask preserves the parent reward. An Option has termination and rollback.
   A Model predicts consequences. Planning compares utility with the current baseline.
7. **Never self-promote or self-demote.** Only a recorded human decision changes an
   Option's `proposed`, `gated`, or `allowlisted` status. Keep verifying gated Options;
   escalate any regression.
8. **Write state.** Append planning and interaction evidence, update calibration, append
   one line to `loop-run-log.md`, and write a 2-3 line human digest.
9. **Stop.** Take no further action.

Hard rules: no push, install, edit, commit, workflow change, or write outside `l1-run/`.
If an operation might mutate the target, treat it as mutating and escalate.
