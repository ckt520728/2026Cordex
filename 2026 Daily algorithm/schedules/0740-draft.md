# Scheduled Task Definition — 07:40 Draft

## Task name

`daily-decision-draft-0740`

## Schedule

Daily at `07:40` in `Asia/Taipei`.

## Self-contained prompt

Use the Codex skill at `C:\Users\YangminRoom1\2026 Daily algorithm\.codex\skills\daily-decision-brief\SKILL.md` to prepare today's Draft Brief.

Work from `C:\Users\YangminRoom1\2026 Daily algorithm` as the project root. Read `AGENTS.md`, the skill instructions and routed references, and all files under `state/`. Scan Gmail read-only for in-scope NCU Vision Lab, journal-editorial, and medical-association/professional-community threads. On the first successful run scan the preceding 30 days; afterward use `state/source-checkpoints.md` for an incremental scan. Read complete relevant threads. Extract explicit obligations, keep inferred items awaiting confirmation with evidence/confidence, and route optional notices to the Opportunity Inbox. Do not send, draft, archive, label, or otherwise mutate email.

Reset `state/today-checkin.md` for today's date with status `missing` unless it already contains a current response for today. Create `briefs/YYYY-MM-DD-draft.md` using the required contract. It may leave the Focus Task provisional because manual input is missing. Mark Gmail, Telegram, and manual source status honestly; do not read or command Telegram during this 07:40 step. Run `python .codex/skills/daily-decision-brief/scripts/validate_daily_artifacts.py briefs/YYYY-MM-DD-draft.md state/tasks.md` and fix structural failures.

Present a concise link to the draft and request exactly three inputs: today's available time/fixed commitments, current energy, and additional manual tasks. If the user responds through `$daily-decision-brief`, update `state/today-checkin.md` without inventing missing facts.
