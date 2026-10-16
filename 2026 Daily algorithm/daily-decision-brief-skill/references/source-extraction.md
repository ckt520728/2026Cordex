# Source Extraction

## Manual check-in

At 07:40, request only:

1. Available time and fixed commitments.
2. Current energy (`low`, `medium`, or `high`, with optional note).
3. Additional manual tasks.

Write the response to `state/today-checkin.md`. Do not invent missing duration, deadline, constraints, or energy fit. A missing response leaves the draft provisional.

## Gmail

Scope task extraction to threads involving:

- NCU Vision Lab, including verified lab-group and direct correspondence.
- Journal editors or editorial offices.
- Medical associations and relevant professional communities.

Use verified correspondents/domains, group addresses, recipients, and thread context. Do not rely on broad keywords, Gmail importance, or category labels alone.

### Scan policy

- First successful run: scan the preceding 30 days.
- Later runs: scan messages received or changed since the checkpoint in `state/source-checkpoints.md`.
- Carry unresolved email-derived items forward until Completed, Dismissed, Deferred, or Superseded with evidence.
- Read the complete relevant thread, not only its newest message.
- Advance a checkpoint only after the scan and local-state write both succeed.

### Classification

- **Explicit Email Task:** a direct request to the user or a commitment the user made.
- **Inferred Email Task:** a clearly implied follow-up or pending decision. Record a short evidence excerpt, source link/thread identifier, and confidence (`low`, `medium`, `high`). Keep it uncommitted until the user confirms it.
- **Opportunity:** an optional conference, call for papers, course, publication, or similar item. Store date/deadline, source, relevance, and suggested decision date in `state/opportunities.md`; do not add it to the task queue unless the user opts in or a real obligation exists.
- **Context only:** announcements, newsletters, acknowledgements, and background information without a user-relevant action.

Never send mail, create drafts, archive, label, or alter read state intentionally in this workflow.

## Telegram research feed

Read only the newest delivered report from `KT_chu_GPT_bot` (Telegram Web currently exposes it as `@KTchuGPT_bot`). Do not message the bot or assume access to the originating ChatGPT agent's internal state.

The observed report normally arrives around 07:48 Asia/Taipei and contains about five items in each section:

- Nephrology
- Cognitive neuroscience
- AI research
- AI-industry trends

At 07:55:

1. Prefer the report delivered since the preceding confirmed run.
2. Record its displayed report date and delivery time in the source checkpoint.
3. If it has not arrived, use the latest available report only when its date is explicit, and mark Telegram `stale`; otherwise mark it `missing` or `unavailable`.
4. Select zero or one Research Follow-up Task across the entire report. Require a strong match to an active project, clinical/research responsibility, or near-term decision. Record source, relevance, confidence, concrete next action, and estimated time.
5. Store other noteworthy signals in `state/research-radar.md`; do not create a reading backlog merely because an item is interesting.

## Failure behavior

- Continue with available sources.
- Surface missing/stale/unavailable status in the brief.
- Do not reuse old data without showing its date.
- Do not advance failed-source checkpoints.
