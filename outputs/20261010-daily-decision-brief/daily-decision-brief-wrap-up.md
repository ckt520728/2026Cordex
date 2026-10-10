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

### 1. A skill is not a scheduler

The skill defines how Codex should reason and act when invoked. It does not make itself run at a particular time. The 07:40 and 07:55 prompts are ready, but activation still requires a supported scheduled-task interface. No task IDs should be claimed until that interface returns them.

### 2. Project-scoped discovery depends on context

A skill stored under a project's `.codex/skills/` directory is most reliably discovered when Codex opens that project as the working folder. In an already-open session or a different working directory, explicit `$daily-decision-brief` invocation may not discover it until the project is reopened.

### 3. Telegram delivery is not agent-state access

The bot-delivered report is readable through Telegram Web, but the originating ChatGPT agent's hidden state and run history are not available. The delivered report must be treated as the transferable artifact. Browser authentication can expire and should degrade to `unavailable`, never to fabricated freshness.

### 4. Source timing forced a two-stage workflow

The preferred planning time is 07:40, while the observed Telegram report arrives around 07:48. Finalizing at 07:40 would systematically omit the new report. The robust solution is a Gmail/manual draft at 07:40 and a final brief at 07:55, with stale/missing status if Telegram is late.

### 5. Broad Gmail searches create false positives

Keywords such as “society,” “conference,” “review,” or “lab” retrieve social notifications, newsletters, and unrelated messages. Reliable extraction requires verified senders/domains, recipient context, and complete relevant threads. Gmail labels and unread status are not task semantics.

### 6. Interesting information is not automatically a task

The Telegram report contains roughly twenty items daily. Promoting them all would create an unusable backlog. The design therefore allows zero or one research follow-up when a report item strongly matches an active responsibility or near-term decision; other selected signals go to Research Radar.

### 7. Inferred responsibility must remain reversible

A group email may request that “everyone” read or explore something without assigning the user personally. Such items require evidence, confidence, and confirmation before commitment. This avoids converting ambient organizational context into personal obligations.

### 8. Silence is not completion evidence

An email thread going quiet, an unread flag disappearing, or a task being omitted from today's brief cannot justify marking it complete. Terminal transitions require a direct user statement or authoritative external confirmation. The end-of-day review therefore carries unresolved work forward instead of manufacturing closure.

### 9. Provenance must not become false precision

An early checkpoint recorded an exact Telegram read time that had not actually been observed. It was corrected to date-level evidence. Timestamps, deadlines, and source freshness should be recorded only at the precision supported by the source.

### 10. Windows console encoding affected validation

Unicode punctuation in `SKILL.md` triggered a Windows CP950 console failure in the bundled metadata/validation scripts. Replacing nonessential em dashes with ASCII hyphens preserved meaning and allowed official validation to complete.

### 11. Safe editing can fail operationally

Several patch attempts stalled because sandbox-setup helper processes remained alive. Only those stale helper processes were terminated; edits were retried with the safe patch mechanism and verified by readback. A stalled edit must never be reported as saved.

### 12. Publishing needs a privacy boundary

The reusable skill, generic schedule definitions, tests, and sanitized wrap-up are appropriate for GitHub. Live task state and detailed email-derived records are not. Repository publication should exclude `state/` and dated personal briefs unless the user explicitly requests their disclosure.

### 13. Verify the repository's real default branch

The first packaging attempt assumed `main`, but the repository's authoritative default branch is `master`. The failed fetch/switch changed no files. Publication was retried from `origin/master`; branch names should be read from repository metadata rather than guessed.

## Verification

- Official Codex skill validation passed.
- Seven deterministic tests passed.
- Eight acceptance scenarios were audited, including missing sources, inferred obligations, silent carryover, and authoritative completion evidence.
- The first live Morning Decision Brief passed the artifact validator.

## First End-of-Day Result

No explicit completion evidence was available for the two editorial tasks, so neither was marked complete. The newer time-sensitive response remains the provisional first action for the next work period, followed by verification of the older journal submission status. Optional opportunities and research signals remain outside the active queue.

## Next Improvements

1. Install the 07:40 and 07:55 tasks when a supported scheduler is available.
2. Complete the seven-day pilot: manual review at or below five minutes and at least five of seven briefs rated helpful.
3. Add authoritative calendar intake only after defining a similarly strict commitment and privacy boundary.
