# Daily Algorithm — Project Handoff

Last updated: 2026-10-10 (Asia/Taipei)

## Goal

Generate a daily algorithm that helps the user manage and make decisions about tasks. The system should operationalize bounded rationality while remaining usable, explainable, and sensitive to human values and changing real-world conditions.

## Current phase

**Version 1 implemented; activation and seven-day pilot remain.** Discovery closed after the user confirmed shared understanding and accepted the implementation plan and rubric.

## Initialization status

- [x] Inspected the working folder.
- [x] Read `personal-daily-os-skill.md`.
- [x] Read `生活演算法.md`.
- [x] Read `演算法之美.md`.
- [x] Read the local `grill-with-docs`, `grilling`, and `domain-modeling` instructions and their documentation formats.
- [x] Read the specified `Thariq_finding_unknown` skill pack: map-vs-territory, blindspot-pass, reference-anchor, decision-first-plan, deviation-log, comprehension-quiz, and verify-with-rubric.
- [x] Created `AGENTS.md` and this handoff.
- [x] Complete the one-question-at-a-time discovery interview.
- [x] Created `CONTEXT.md` after the first output concept was confirmed.
- [x] Define an acceptance rubric before implementation.
- [x] Produce a decision-first implementation plan and receive user approval.
- [x] Implement and verify the approved system, except for scheduler activation and the live seven-day pilot.

## Known knowns (supported by the brief and references)

- The system's subject is daily task management and task decision support.
- The conceptual frame is computational bounded rationality: time, attention, working memory, and information are limited.
- Candidate techniques include optimal stopping, exploration/exploitation, satisficing/search-over-sort, LRU, scheduling/batching, Bayesian calibration, regularization, constraint relaxation/simulated annealing, exponential backoff, and computational kindness.
- The references propose a morning review, protected focus work, batched interruptions, and evening review.
- The references also explicitly warn about non-stationarity, reductionism, unquantifiable emotion, and overfitting life to the algorithmic metaphor.
- The intended user-facing language is presumed to be Traditional Chinese because the brief and references are predominantly Chinese; this is a reversible working assumption, not yet a confirmed product decision.

## Map vs. territory gaps

### Ambiguities in the instructions (known unknowns)

1. **Primary output:** Is the system a daily ranked task list, a time-blocked schedule, a conversational recommendation, a reusable skill, an executable app/script, or some combination?
2. **Task source:** Will tasks be entered manually, read from an existing task/calendar system, or both?
3. **Decision authority:** Should the system only recommend, or may it automatically schedule, defer, or reject tasks?
4. **Optimization target:** What should win when urgency, importance, energy, long-term value, commitments, and wellbeing conflict?
5. **Planning horizon:** Is the main unit today, the next seven days, or a rolling multi-horizon plan?
6. **Available signals:** Which fields reliably exist for a task—deadline, duration, importance, energy, context, dependency, recurrence, emotional resistance, or something else?
7. **Replanning policy:** What events should trigger recalculation, and how much schedule churn is acceptable?
8. **Safety/value boundaries:** Which categories must never be deprioritized solely by a score?
9. **Success measure:** How will the user tell after one or two weeks that the algorithm is helping rather than adding overhead?

### Domain edge cases to test later (candidate unknown unknowns)

- A short urgent task conflicts with the day's only high-energy window for an important deep task.
- A task is important but has no deadline and is repeatedly crowded out by urgent work.
- Several tasks have hard deadlines but uncertain durations or hidden dependencies.
- The user begins the day with unusually low energy or loses most of the planned day to an interruption.
- A task's emotional or relational importance cannot be represented safely by a numeric score.
- The queue is overloaded: completing everything is impossible, so the system must expose what will be dropped or renegotiated.
- The environment changes after a decision, invalidating a fixed 37% threshold or prior ranking.
- The cost of replanning exceeds the expected benefit of a marginally better schedule.

### Tacit standards to elicit (unknown knowns)

- What a “good day” feels like to the user, beyond task throughput.
- The user's tolerance for structure, notifications, data entry, and schedule changes.
- Existing non-negotiable routines, health needs, family duties, and communication expectations.
- The user's preferred balance between ambitious guidance and psychologically gentle fallback modes.

These are candidates only. The user must confirm which are real; discard false positives.

## Extracted reference semantics

What should transfer from the references:

- Route different decision problems to different heuristics instead of forcing one universal ranking formula.
- Account for the computational cost of deciding and reorganizing, not only the nominal value of tasks.
- Protect focus by batching interruptions and limiting context switching.
- Prefer robust satisficing rules under noise; make assumptions and boundary conditions visible.
- Use time horizon to adjust exploration versus exploitation.
- Provide graceful overload behavior, including explicit deferral, rejection, or renegotiation.

What should not transfer without validation:

- Fixed clock times such as 08:00, 11:30, 16:30, or 21:00.
- A universal 90-minute focus block or universal 25–50 minute minimum.
- Literal application of the 37% rule where options are reversible, the population is unknown, or distributions change.
- Treating health, relationships, ethics, or emotion as mere optimization variables.
- The draft pseudocode's internally inconsistent quick-task rule (`duration <= 2 minutes` versus protected focus and SJF) without an explicit interruption-cost policy.

## Decision log

- **2026-10-10 — Daily output confirmed:** The user accepted a **Morning Decision Brief** as the minimum useful daily output. It contains one protected focus task, up to three ordered must-do tasks, tasks recommended for batching/deferral/rejection, and a brief reason for each non-obvious recommendation.
- **2026-10-10 — Manual intake initially confirmed, then expanded:** Candidate tasks may be supplied through a short manual Daily Intake. Each task may include its name, real deadline, duration estimate, and constraints.
- **2026-10-10 — Hybrid intake confirmed:** The user added Gmail as a required source. The system must extract candidate tasks from email communications involving (1) NCU Vision Lab, (2) journal editors, and (3) medical associations or professional communities, then combine them with manually entered tasks.
- **Environment evidence:** The connected Gmail tool was detected and a read-only label-list operation completed successfully. Email-based extraction is technically available in this environment.
- **Email safety boundary:** Extraction is read-only and must never send mail automatically. A message is not automatically a task merely because it comes from an in-scope source; the thread must contain a user-relevant request, commitment, decision, follow-up, or dated action.
- **2026-10-10 — Email extraction threshold confirmed:** Extract both explicit requests/promises and clearly implied follow-ups/decisions. Label each item **Explicit** or **Inferred**, attach the source thread and supporting evidence, and assign confidence. An Inferred Email Task requires user confirmation before becoming a Committed Task.
- **2026-10-10 — Email scan policy confirmed:** The first run scans the preceding 30 days of in-scope threads. Later runs process only messages received or changed since the last successful run while carrying unresolved email-derived tasks forward until completed, dismissed, or superseded.
- **Read-only mailbox observation:** A 30-day sample confirmed relevant NCU Vision Lab group/direct correspondence, journal editorial action mail, and medical-association/community notices. It also showed that broad keyword searches and Gmail categories include unrelated social notifications and general newsletters, so source identity plus thread/content evidence must determine scope.
- **Observed domain distinction:** Lab/editorial threads commonly contain obligations or response deadlines; association/community mail often advertises optional meetings, submissions, publications, or education opportunities. Treating every such notice as a task would overload the decision brief.
- **2026-10-10 — Opportunity handling confirmed:** Optional professional notices such as conferences, calls for papers, courses, and new publications go to a separate **Opportunity Inbox** with their date/deadline, source, relevance reason, and suggested decision date. They become Committed Tasks only when the user opts in or the underlying message imposes a real obligation.
- **2026-10-10 — Priority Hierarchy confirmed:** Choose the Focus Task and Must-Do Tasks by (1) protecting safety, health, and non-negotiable obligations; (2) preventing imminent deadline, dependency, or relationship failure; (3) selecting the highest long-term-value work that fits current energy and available focus time; and (4) using short tasks only as fillers or batches. Explain non-obvious overrides rather than hiding them in a weighted score.
- **2026-10-10 — Replanning policy confirmed:** Preserve the Morning Decision Brief unless a material trigger occurs: a new hard obligation/deadline, a dependency change, loss of at least one planned focus block, or a major energy/health change. Allow at most one routine midday replan; urgent material events may override this limit.
- **2026-10-10 — Telegram research source added:** Read the daily research report delivered by `KT_chu_GPT_bot`, covering nephrology, cognitive neuroscience, AI research, and AI-industry trends, as an additional source for task/opportunity extraction.
- **Telegram capability evidence:** No dedicated Telegram connector or native Telegram window was available. The user authenticated Telegram Web in Chrome using the iPhone app, and `KT_chu_GPT_bot` is now readable through the browser UI.
- **Agent-access boundary:** No connector exposing the originating ChatGPT agent's internal state or run history was found. Until such a connector exists, the Telegram-delivered report is the authoritative readable artifact.
- **Telegram safety boundary:** Read-only extraction is the default. Do not message the bot, invoke commands, alter subscriptions, or change Telegram account state as part of daily planning.
- **Read-only Telegram observation:** The bot delivers one long daily Brief, currently at approximately 07:48 Asia/Taipei, dated for the preceding research day. Each report has four stable sections—nephrology, cognitive neuroscience, AI research, and AI-industry trends—with approximately five summarized items per section (about twenty items total). Items often include journal, PMID, or arXiv identifiers but do not contain explicit next actions, duration estimates, or personal priorities.
- **Conversion risk:** Promoting all report items to tasks would create roughly twenty new tasks per day and overwhelm the Morning Decision Brief. A selection rule is required before research information can enter the committed task queue.
- **2026-10-10 — Research conversion confirmed:** Generate at most one **Research Follow-up Task** per daily Telegram report, and generate none when no item is actionable. Selection requires a strong match to an active project, clinical/research responsibility, or near-term decision. Include source, relevance reason, confidence, concrete next action, and estimated time. Place other noteworthy items in a non-urgent **Research Radar**; inferred follow-ups still require user confirmation before commitment.
- **2026-10-10 — Delivery and persistence confirmed:** Version 1 presents the Morning Decision Brief in ChatGPT/Codex and saves an auditable dated Markdown record inside this project. It does not send output to Telegram. Scheduled execution or outbound delivery may be considered only after validation.
- **2026-10-10 — Morning planning time confirmed:** The user prefers to begin daily planning at **07:40 Asia/Taipei**, immediately after daily exercise when leisure time is available.
- **Timing conflict found:** The observed `KT_chu_GPT_bot` report normally arrives at approximately 07:48, about eight minutes after the preferred planning start. A 07:40 final brief would therefore omit the new report unless the bot delivery moves earlier or the finalization step waits.
- **2026-10-10 — Two-stage morning workflow confirmed:** At 07:40, scan Gmail and request three manual inputs: available time/fixed commitments, current energy, and additional tasks. At 07:55, ingest the latest Telegram report and produce the Confirmed Brief. If the report is late, finalize at 07:55 using the latest available report and mark the research source stale/missing rather than delaying indefinitely.
- **2026-10-10 — Implementation form confirmed:** Build version 1 as a new, normally discoverable Codex skill plus scheduled tasks for the 07:40 check-in and 07:55 finalization. Do not build a standalone app. The skill owns the decision algorithm, extraction rules, output contract, and verification rubric; Markdown files hold durable state and daily outputs.
- **Skill-creator requirements:** Keep `SKILL.md` concise and route substantial schemas/policies to focused references; create only resources with concrete value; generate consistent UI metadata; run the bundled `quick_validate.py`; verify meaningful behavior, not only file syntax.
- **2026-10-10 — Task-state transitions confirmed:** Never infer completion from silence, read status, or absence from today's brief. Change a Committed Task to **Completed**, **Dismissed**, **Deferred**, or **Superseded** only from an explicit user statement or authoritative external evidence; record the evidence. Otherwise carry the task forward with aging/escalation information.
- **2026-10-10 — Acceptance rubric confirmed:** The user accepted the eight-part rubric covering obligation recall, traceability, inference gating, output limits, visible reasoning/source status, evidence-preserving state, safe degradation, and a seven-day usability pilot.
- **2026-10-10 — Discovery gate closed:** The user confirmed shared understanding. Implementation is authorized under `PLAN.md`; changes to confirmed user-facing decisions must return to the user.
- These decisions confirm the design. Implementation and verification are now in progress.

## Assumption / deviation log

- **Assumption:** The two requested filenames are exactly `AGENTS.md` and `handoffs.md` in the project root.
- **Assumption:** `handoffs.md` can serve as the initial deviation log to avoid multiplying files during discovery.
- **Deviation:** The specified finding-unknowns resource is a seven-skill GitHub pack rather than one installed local skill. Its README and all seven `SKILL.md` files were read from the named repository and applied as a methodology.
- **Conservative choice:** No `CONTEXT.md`, ADR, plan, code, automation, or integration was created before a relevant term or decision was confirmed.
- **Deviation corrected:** The Telegram setup checkpoint initially contained an unobserved exact read time (`07:55`). It now records only the observed date and explicitly states that the exact time was not recorded.
- **Environment limitation:** The accepted 07:40 and 07:55 task definitions are complete, but this environment exposes no scheduled-task creation API. They are not claimed as installed, and no task IDs were invented.

## Implementation status

- [x] Decision-first implementation plan created in `PLAN.md`.
- [x] Skill initialized and written.
- [x] Runtime state files created.
- [x] 07:40 and 07:55 scheduled-task prompts written.
- [x] Official skill validation passed.
- [x] Behavioral/scenario verification passed; see `VERIFICATION.md`.
- [ ] Scheduled tasks installed with authoritative task IDs.
- [ ] Seven-day usability pilot passed.

## Current limitation

The scheduled-task creation tool described by the `schedule` skill is not exposed in the current tool environment. Create and validate self-contained schedule definitions now; install them only when a supported scheduled-task interface is available.

## Exact next action

Install the two scheduled tasks when a supported scheduler interface becomes available, then run the seven-day usability pilot and record daily review time/helpfulness.
