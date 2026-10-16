---
title: Daily Decision Brief Skill - Implementation Wrap-up and Pitfalls
date: 2026-10-10
tags:
  - codex
  - skill
  - task-management
  - decision-support
  - pitfalls
---

# Daily Decision Brief Skill - Implementation Wrap-up and Pitfalls

## Outcome

Built a project-scoped Codex skill that converts a manual check-in, selected Gmail communications, and the daily `KT_chu_GPT_bot` Telegram research report into an auditable daily decision brief.

The workflow now supports:

- 07:40 manual check-in and Gmail draft.
- 07:55 Telegram ingestion and confirmed brief.
- Evidence-preserving task-state updates.
- Material-trigger replanning.
- End-of-day shutdown with unresolved-task carryover.

The skill enforces one Focus Task, no more than three Must-Do Tasks, and no more than one Research Follow-up Task. Optional professional notices remain in an Opportunity Inbox, while interesting but non-actionable research remains in Research Radar.

## Architecture

- `SKILL.md`: routing and invariants.
- `references/source-extraction.md`: Gmail, Telegram, and manual-input rules.
- `references/decision-and-state.md`: priority hierarchy and evidence-based transitions.
- `references/output-and-verification.md`: Morning Decision Brief contract.
- `references/end-of-day.md`: shutdown and carryover contract.
- `scripts/validate_daily_artifacts.py`: deterministic structural checks.
- `tests/test_validate_daily_artifacts.py`: seven unit tests.
- `schedules/0740-draft.md` and `schedules/0755-confirm.md`: self-contained automation definitions.

## Pitfalls Encountered

1. **A skill is not a scheduler.** The skill defines how Codex should act when invoked; it does not run itself at a particular time. The 07:40 and 07:55 prompts are ready, but activation needs a supported scheduled-task interface. Claim no task IDs until that interface returns them.
2. **Project-scoped discovery depends on context.** A skill under a project's `.codex/skills/` is most reliably discovered when Codex opens that project as the working folder.
3. **Telegram delivery is not agent-state access.** The bot-delivered report is readable via Telegram Web, but the originating agent's hidden state is not. Browser auth can expire and should degrade to `unavailable`, never fabricated freshness.
4. **Source timing forced a two-stage workflow.** Preferred planning time is 07:40; the Telegram report arrives about 07:48. Hence a Gmail/manual draft at 07:40 and a final brief at 07:55, with stale/missing status if Telegram is late.
5. **Broad Gmail searches create false positives.** Keywords retrieve social notifications and newsletters. Reliable extraction needs verified senders/domains, recipient context, and complete threads.
6. **Interesting information is not automatically a task.** About twenty items arrive daily; allow zero or one research follow-up, the rest to Research Radar.
7. **Inferred responsibility must remain reversible.** A group email asking "everyone" to act does not assign the user personally; require evidence, confidence, and confirmation.
8. **Silence is not completion evidence.** Terminal transitions require a direct user statement or authoritative external confirmation; end-of-day carries unresolved work forward.
9. **Provenance must not become false precision.** An early checkpoint recorded an unobserved exact read time; it was corrected to date-level evidence.
10. **Windows console encoding affected validation.** Unicode punctuation in `SKILL.md` triggered a CP950 failure in validation scripts; replacing em dashes with ASCII hyphens fixed it.
11. **Safe editing can fail operationally.** Patch attempts stalled on stale sandbox helper processes; edits were retried and verified by readback. A stalled edit must never be reported as saved.
12. **Publishing needs a privacy boundary.** The skill, generic schedules, tests, and sanitized wrap-up are fit for GitHub; live task state and email-derived records are not.
13. **Verify the repository's real default branch.** The first packaging attempt assumed `main`; the authoritative default is `master`.

## Verification

- Official Codex skill validation passed.
- Seven deterministic tests passed.
- Eight acceptance scenarios audited, including missing sources, inferred obligations, silent carryover, and authoritative completion evidence.
- The first live Morning Decision Brief passed the artifact validator.

## First End-of-Day Result

No explicit completion evidence was available for the two editorial tasks, so neither was marked complete. The newer time-sensitive response remains the provisional first action for the next work period, followed by verification of the older journal submission status. Optional opportunities and research signals remain outside the active queue.

## Next Improvements

1. Install the 07:40 and 07:55 tasks when a supported scheduler is available.
2. Complete the seven-day pilot: manual review at or below five minutes and at least five of seven briefs rated helpful.
3. Add authoritative calendar intake only after defining a similarly strict commitment and privacy boundary.
