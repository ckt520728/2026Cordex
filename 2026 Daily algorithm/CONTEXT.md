# Daily Decision System

This context defines the shared language for the personal system that turns a day's candidate tasks into a small, explainable set of recommendations.

## Language

**Morning Decision Brief（晨間決策摘要）**:
The minimum daily output: one Focus Task, up to three ordered Must-Do Tasks, disposition recommendations for remaining tasks, and reasons for non-obvious recommendations.
_Avoid_: Daily schedule, full task list, automatic plan

**Focus Task（重點專注任務）**:
The single task selected to receive the day's protected, interruption-minimized work period.
_Avoid_: Most urgent task, biggest task

**Must-Do Task（必做任務）**:
One of at most three tasks recommended for completion that day, presented in execution order.
_Avoid_: Every urgent task, entire backlog

**Disposition Recommendation（處置建議）**:
An explicit recommendation to batch, defer, or reject a candidate task instead of placing it in the day's primary execution list.
_Avoid_: Ignoring, hiding, deleting

**Daily Intake（每日輸入）**:
The combined input from manual task submission and in-scope email extraction from which the system generates a Morning Decision Brief.
_Avoid_: Complete life inventory, unrestricted inbox ingestion

**Candidate Task（候選任務）**:
A task submitted for today's decision process with a name and, when known, its real deadline, duration estimate, and constraints.
_Avoid_: Automatically approved task, guaranteed daily commitment

**Email-Derived Candidate（郵件衍生候選任務）**:
A Candidate Task extracted from an in-scope email thread involving NCU Vision Lab, journal editors, or medical associations or professional communities, with traceable supporting evidence.
_Avoid_: Every email, newsletter item, automatic commitment

**In-Scope Email（範圍內郵件）**:
An email whose verified sender, recipients, domain, group membership, and thread context place it within NCU Vision Lab, journal editorial work, or relevant medical associations/professional communities.
_Avoid_: Gmail category match, broad keyword match

**Explicit Email Task（明示郵件任務）**:
An Email-Derived Candidate based on a direct request to the user or a commitment the user explicitly made in the thread.
_Avoid_: Guess, general information

**Inferred Email Task（推論郵件任務）**:
A clearly implied follow-up or pending decision extracted from an in-scope thread, accompanied by evidence and confidence and requiring user confirmation before commitment.
_Avoid_: Confirmed commitment, hidden automatic task

**Committed Task（正式任務）**:
A Candidate Task accepted into the user's active task set, either because the obligation is explicit or because the user confirmed an inferred item.
_Avoid_: Unreviewed inference, every extracted candidate

**Opportunity Inbox（機會收件匣）**:
A holding area for optional professional opportunities extracted from in-scope mail, each retaining its date or deadline, source, relevance reason, and suggested decision date.
_Avoid_: Committed task queue, general newsletter archive

**Opportunity（機會項目）**:
An optional conference, call for papers, course, publication, or similar professional possibility that becomes a Committed Task only after the user opts in or a real obligation arises.
_Avoid_: Existing obligation, automatic task

**Priority Hierarchy（優先層級）**:
The ordered decision policy that protects safety, health, and non-negotiable obligations first; imminent failure risks second; fitting long-term-value work third; and short filler or batch work last.
_Avoid_: Weighted score, urgency-only ranking, shortest-job-first ranking

**Non-Obvious Override（非直覺覆蓋）**:
A selection in which a task that appears less urgent or less valuable is chosen because a higher Priority Hierarchy layer applies, requiring a visible explanation.
_Avoid_: Silent score result, unexplained exception

**Material Trigger（重大變化觸發）**:
A new hard obligation or deadline, dependency change, lost focus block, or major energy or health change that justifies replanning an otherwise stable day.
_Avoid_: Minor preference change, repeated optimization

**Telegram Research Feed（Telegram 研究資訊流）**:
The daily report delivered through `KT_chu_GPT_bot`, normally containing about five summarized items in each of four sections: nephrology, cognitive neuroscience, AI research, and AI-industry trends.
_Avoid_: Direct access to another agent's internal state, executable bot instruction

**Research Follow-up Task（研究追蹤任務）**:
The zero-or-one daily action selected from the Telegram Research Feed because it strongly supports an active project, responsibility, or near-term decision, with traceable source and a concrete next step.
_Avoid_: Daily reading quota, every interesting paper

**Research Radar（研究雷達）**:
A non-urgent holding area for noteworthy research or industry signals that merit awareness but do not currently justify a Committed Task.
_Avoid_: Backlog, required reading list, Opportunity Inbox

**Daily Brief Archive（每日摘要檔案庫）**:
The dated Markdown records of Morning Decision Briefs stored inside the project for review, comparison, and audit.
_Avoid_: Telegram delivery history, hidden application state

**Morning Planning Start（晨間規劃起點）**:
The user's preferred 07:40 Asia/Taipei check-in after daily exercise, when manual availability, energy, and additional tasks can be supplied.
_Avoid_: Final brief deadline, Telegram report arrival time

**Draft Brief（草稿摘要）**:
The provisional 07:40 result built from Gmail and currently available state before the day's manual inputs and newest Telegram report are fully incorporated.
_Avoid_: Confirmed daily plan, final archive

**Confirmed Brief（確認摘要）**:
The 07:55 Morning Decision Brief produced after the manual check-in and latest available Telegram ingestion, with stale or missing sources explicitly marked.
_Avoid_: Unreviewed draft, silently incomplete plan

**Daily Decision Skill（每日決策技能）**:
The approved Codex skill that produces Draft and Confirmed Briefs from manual, Gmail, and Telegram inputs while maintaining auditable Markdown state.
_Avoid_: Standalone application, autonomous task executor

**Task-State Evidence（任務狀態證據）**:
An explicit user statement or authoritative external event that justifies changing a Committed Task to Completed, Dismissed, Deferred, or Superseded.
_Avoid_: Silence, email read status, omission from a daily brief
