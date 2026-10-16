# Phase-two protocol

Adapted from the user's multi-agent research v2.7/v3.0 and PHCSSM workflow.

## Reusable v2.7 mechanisms

- Structured outputs to prevent error cascades.
- Broad retrieval separated from deep synthesis.
- Independent analysis trajectories.
- Grounding gate against the closed evidence corpus.
- Pairwise contradiction adjudication.
- Consensus plus explicit uncertainty.
- Self-healing only for missing artifacts or failed checks.

## Optional v3.0 mechanisms

Use persistent heartbeat, worktree isolation, and generator/evaluator separation only for explicitly autonomous, executable research loops. Narrative reviews do not require simulation code or scheduled loops.

## Generalization of PHCSSM workflow

Keep the schemas and gates. Replace the embedded paper, named agents, prompts, and topic-specific evaluation with registered corpus artifacts and project-defined lenses.

## Minimum adjudication record

For each conflict record `claim_a`, `claim_b`, source scope, conflict type, grounding status, ruling, confidence, dissent, and required follow-up.
