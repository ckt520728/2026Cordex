# Daily Decision Skill — Decision-First Implementation Plan

## 1. Confirmed user-facing decisions

These decisions are load-bearing and must not be changed during implementation without returning to the user:

1. **Output:** A Morning Decision Brief with one Focus Task, at most three ordered Must-Do Tasks, disposition recommendations, and reasons for non-obvious choices.
2. **Inputs:** Manual tasks plus read-only extraction from Gmail (NCU Vision Lab, journal editors, medical associations/professional communities) and `KT_chu_GPT_bot` on Telegram.
3. **Email inference:** Extract explicit and clearly implied tasks. Inferred items require evidence, confidence, and user confirmation before commitment.
4. **Professional information:** Optional association/community items go to an Opportunity Inbox, not the active queue.
5. **Research information:** Produce zero or one Research Follow-up Task per Telegram report; other noteworthy items go to Research Radar.
6. **Priority:** Safety/health/non-negotiable obligations; imminent deadline/dependency/relationship risk; fitting long-term value; short filler/batch work.
7. **Replanning:** Only for material triggers, plus at most one routine midday replan.
8. **State:** Completion and other terminal transitions require explicit user evidence or authoritative external evidence. Silence and read status are not evidence.
9. **Timing:** 07:40 Draft Brief/check-in; 07:55 Confirmed Brief. Late Telegram data is marked stale/missing rather than delaying indefinitely.
10. **Delivery:** ChatGPT/Codex plus dated Markdown archive; no Telegram output in version 1.
11. **Implementation:** A new normally discoverable Codex skill with scheduled-task definitions, not a standalone app.

## 2. Acceptance rubric

Version 1 is ready for daily use only when representative tests demonstrate:

- No sampled hard obligation is missed.
- Every extracted or recommended item is traceable to a source or manual input.
- Inferred items never become committed without confirmation.
- Limits hold: one Focus Task, at most three Must-Do Tasks, at most one Research Follow-up Task.
- Priority explanations and stale/missing-source status are visible.
- State transitions preserve evidence and unresolved carryover.
- Gmail, Telegram, and manual-input failure modes degrade safely.
- During a seven-day pilot, manual review stays at or below five minutes per day and at least five briefs are rated helpful.

## 3. Mechanical implementation

1. Initialize `.codex/skills/daily-decision-brief/` with UI metadata, references, and scripts.
2. Write the skill entrypoint and focused references for source extraction, decision/state policy, and output/verification contracts.
3. Add deterministic validation for brief limits, evidence fields, and source-status disclosure.
4. Create initial Markdown state files and self-contained 07:40/07:55 scheduled-task prompts.
5. Run the official skill validator, script tests, and scenario-based rubric checks.
6. Record verification and any deviations in `handoffs.md`.
7. Install the two scheduled tasks when a scheduled-task API is available; do not claim installation before authoritative task IDs exist.
