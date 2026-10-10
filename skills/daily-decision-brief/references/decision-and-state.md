# Decision and State Policy

## Candidate-to-commitment gate

1. Combine unresolved committed tasks, manual candidates, explicit email tasks, confirmed inferred email tasks, opted-in opportunities, and at most one research follow-up candidate.
2. Keep unconfirmed inferred items in the confirmation section, outside the committed queue.
3. Keep optional opportunities and research signals outside the committed queue.
4. Preserve source reference and evidence for every extracted item.

## Priority Hierarchy

Evaluate layers in order; do not collapse them into a weighted score:

1. Safety, health, and non-negotiable obligations.
2. Prevention of imminent deadline, dependency, or relationship failure.
3. Highest long-term value that fits current energy and available focus time.
4. Short tasks used only as fillers or batches.

Choose the Focus Task from the highest applicable layer that needs protected attention. Choose at most three Must-Do Tasks in execution order. A quick task must not displace a higher-layer task merely because it is easy to finish.

For a non-obvious override, state which higher layer controlled the decision.

## Task record

Each row in `state/tasks.md` must retain:

- Stable task ID (`T-YYYYMMDD-NN`).
- Title and current status.
- Source type and source reference.
- Short evidence or explicit user statement.
- `explicit` or `inferred`; inferred items also record confidence and confirmation evidence.
- Real deadline, duration estimate, constraints, and dependencies when known.
- First-seen and last-reviewed dates.
- Transition evidence for non-active states.

Allowed statuses: `Candidate`, `Committed`, `Completed`, `Dismissed`, `Deferred`, `Superseded`.

## State transitions

- `Candidate -> Committed`: explicit obligation, or user confirmation of an inferred item/opportunity/research follow-up.
- `Committed -> Completed|Dismissed|Deferred|Superseded`: explicit user statement or authoritative external event only. Record the evidence and date.
- Silence, Gmail read state, and omission from a brief are never transition evidence.
- A Deferred task keeps its original identity and evidence; record the review date rather than creating a duplicate.

Carry unresolved tasks forward. Show age, approaching deadlines, and repeated deferral as decision context, not as automatic proof of priority.

## Replanning

Preserve the Confirmed Brief unless one of these occurs:

- New hard obligation or deadline.
- Dependency change.
- Loss of at least one planned focus block.
- Major energy or health change.
- The single routine midday review.

Urgent Material Triggers may override the once-daily routine limit. Record what changed and which prior recommendation was replaced. Avoid repeated marginal optimization.
