# Scheduled Task Definition — 07:55 Confirmation

## Task name

`daily-decision-confirm-0755`

## Schedule

Daily at `07:55` in `Asia/Taipei`.

## Self-contained prompt

Use the Codex skill at `C:\Users\YangminRoom1\2026 Daily algorithm\.codex\skills\daily-decision-brief\SKILL.md` to finalize today's Morning Decision Brief.

Work from `C:\Users\YangminRoom1\2026 Daily algorithm` as the project root. Read `AGENTS.md`, the skill instructions and all three routed references, `briefs/YYYY-MM-DD-draft.md` when present, and all files under `state/`. Read the newest delivered report from `KT_chu_GPT_bot` through the authenticated Telegram Web session without sending messages, invoking commands, or changing remote state. Record the displayed report date and delivery status. If today's expected report is late or inaccessible, continue using the latest explicitly dated report only when appropriate and mark Telegram `stale`, `missing`, or `unavailable`; never delay indefinitely or imply freshness.

Combine unresolved committed tasks, explicit Gmail obligations, confirmed inferred items, today's manual check-in when current, opted-in opportunities, and zero or one justified Research Follow-up Task. Apply the Priority Hierarchy without a weighted score. Produce exactly one Focus Task, at most three ordered Must-Do Tasks, disposition recommendations, awaiting-confirmation items, opportunity/research sections, visible source status, and explanations for non-obvious overrides. Never infer task completion from silence, read state, or omission.

Save `briefs/YYYY-MM-DD.md`, update local state and successful source checkpoints, then run `python .codex/skills/daily-decision-brief/scripts/validate_daily_artifacts.py briefs/YYYY-MM-DD.md state/tasks.md`. Fix failures before presenting the brief. If manual input is missing, mark it missing and clearly state that time/energy fit is provisional rather than fabricating a reliable full-day plan.
