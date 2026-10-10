# Output and Verification Contract

## File names

- Draft: `briefs/YYYY-MM-DD-draft.md`
- Confirmed: `briefs/YYYY-MM-DD.md`

Create `briefs/` lazily on the first run.

## Required frontmatter

```yaml
---
date: YYYY-MM-DD
phase: draft | confirmed
generated_at: ISO-8601 timestamp with Asia/Taipei offset
timezone: Asia/Taipei
gmail_status: current | stale | missing | unavailable
telegram_status: current | stale | missing | unavailable
manual_status: current | missing
---
```

## Required Markdown contract

Use these level-two headings exactly; content may be `None` when allowed:

```markdown
# Morning Decision Brief — YYYY-MM-DD

## Source Status

## Focus Task
- **Task:** [T-ID] Title
  - **Why:** ...
  - **Protected block:** ...
  - **Source:** ...

## Must-Do Tasks
### 1. [T-ID] Title
- **Why:** ...
- **Time:** ...
- **Source:** ...

## Disposition Recommendations

## Awaiting Confirmation

## Opportunity Inbox

## Research Follow-up Task
- **Task:** [T-ID or candidate ID] Title
  - **Why relevant:** ...
  - **Next action:** ...
  - **Estimated time:** ...
  - **Source:** ...

## Research Radar

## Replan Triggers

## Manual Check-in
```

Rules:

- A Confirmed Brief has exactly one Focus Task. A Draft may say `None — awaiting manual check-in`.
- Use zero to three numbered level-three Must-Do items.
- Use zero or one `**Task:**` item in Research Follow-up Task.
- Every selected task includes a source and rationale. Do not display private email text beyond the minimum excerpt needed for evidence.
- Awaiting Confirmation lists inferred items with confidence and source evidence; they are not Must-Do Tasks.
- Source Status includes actual data dates and explains stale/missing/unavailable inputs.
- Manual Check-in shows the three answers or states what is missing.

## Validation

Before presenting a brief, run:

```powershell
python .codex/skills/daily-decision-brief/scripts/validate_daily_artifacts.py <brief-path> state/tasks.md
```

Fix validation failures; never claim a brief is confirmed when the validator fails.

## Acceptance scenarios

Exercise at least these cases before declaring version 1 ready:

1. Hard editorial deadline versus attractive long-term research.
2. Inferred lab follow-up without explicit commitment.
3. Medical-association event announcement with an optional registration deadline.
4. Telegram report with twenty interesting but non-actionable items.
5. Low energy and loss of the planned focus block.
6. Missing Gmail, late Telegram, and absent manual check-in independently.
7. A carried task that is silent for several days.
8. An authoritative submission confirmation that completes a task.

The seven-day usability criterion remains a live pilot gate: no more than five minutes of manual review per day and at least five of seven briefs rated helpful.
