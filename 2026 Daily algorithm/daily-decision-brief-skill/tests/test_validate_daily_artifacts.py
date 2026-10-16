from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "scripts" / "validate_daily_artifacts.py"
SPEC = importlib.util.spec_from_file_location("validator", SCRIPT)
assert SPEC and SPEC.loader
validator = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validator)


VALID_BRIEF = """---
date: 2026-10-10
phase: confirmed
generated_at: 2026-10-10T07:55:00+08:00
timezone: Asia/Taipei
gmail_status: current
telegram_status: stale
manual_status: current
---
# Morning Decision Brief — 2026-10-10

## Source Status
- Gmail: current, through 07:40
- Telegram: stale, report dated 2026-10-09
- Manual: current

## Focus Task
- **Task:** [T-20261010-01] Submit review
  - **Why:** Hard editorial deadline.
  - **Protected block:** 09:00–10:30
  - **Source:** Gmail thread editor-1

## Must-Do Tasks
### 1. [T-20261010-02] Prepare lab update
- **Why:** Dependency for lab meeting.
- **Time:** 30 minutes
- **Source:** Gmail thread lab-1

## Disposition Recommendations
None.

## Awaiting Confirmation
None.

## Opportunity Inbox
None.

## Research Follow-up Task
- **Task:** [R-20261010-01] Review CKD paper abstract
  - **Why relevant:** Matches active project.
  - **Next action:** Read abstract and record applicability.
  - **Estimated time:** 15 minutes
  - **Source:** Telegram report 2026-10-09

## Research Radar
None.

## Replan Triggers
Replan only if the submission dependency changes.

## Manual Check-in
Available 4 hours; medium energy; no additional tasks.
"""

TASK_HEADER = """# Task State

| ID | Title | Status | Source type | Source reference | Evidence | Inference | Confidence | Confirmation evidence | Deadline | Duration | Constraints/dependencies | First seen | Last reviewed | Transition evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
"""


class ValidatorTests(unittest.TestCase):
    def test_valid_artifacts_pass(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            brief = root / "brief.md"
            tasks = root / "tasks.md"
            brief.write_text(VALID_BRIEF, encoding="utf-8")
            tasks.write_text(TASK_HEADER, encoding="utf-8")
            self.assertEqual([], validator.validate_brief(brief))
            self.assertEqual([], validator.validate_tasks(tasks))

    def test_confirmed_brief_requires_focus(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            brief = Path(temp) / "brief.md"
            brief.write_text(
                VALID_BRIEF.replace(
                    "- **Task:** [T-20261010-01] Submit review\n  - **Why:** Hard editorial deadline.\n  - **Protected block:** 09:00–10:30\n  - **Source:** Gmail thread editor-1",
                    "None.",
                ),
                encoding="utf-8",
            )
            self.assertIn(
                "confirmed brief must contain exactly one Focus Task",
                validator.validate_brief(brief),
            )

    def test_must_do_limit_is_enforced(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            brief = Path(temp) / "brief.md"
            extra = """
### 2. [T-20261010-03] Two
- **Why:** Test.
- **Source:** Manual.
### 3. [T-20261010-04] Three
- **Why:** Test.
- **Source:** Manual.
### 4. [T-20261010-05] Four
- **Why:** Test.
- **Source:** Manual.
"""
            brief.write_text(
                VALID_BRIEF.replace("\n## Disposition Recommendations", extra + "\n## Disposition Recommendations"),
                encoding="utf-8",
            )
            self.assertIn("Must-Do Tasks exceeds three items", validator.validate_brief(brief))

    def test_research_follow_up_limit_is_enforced(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            brief = Path(temp) / "brief.md"
            second = """
- **Task:** [R-20261010-02] Review second paper
  - **Why relevant:** Also interesting.
  - **Next action:** Read abstract.
  - **Estimated time:** 10 minutes
  - **Source:** Telegram report 2026-10-09
"""
            brief.write_text(
                VALID_BRIEF.replace("\n## Research Radar", second + "\n## Research Radar"),
                encoding="utf-8",
            )
            self.assertIn(
                "Research Follow-up Task exceeds one item",
                validator.validate_brief(brief),
            )

    def test_source_status_must_disclose_each_input(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            brief = Path(temp) / "brief.md"
            brief.write_text(
                VALID_BRIEF.replace("- Telegram: stale, report dated 2026-10-09\n", ""),
                encoding="utf-8",
            )
            self.assertIn(
                "Source Status must mention Telegram",
                validator.validate_brief(brief),
            )

    def test_inferred_commitment_requires_confirmation(self) -> None:
        row = "| T-20261010-01 | Follow up | Committed | Gmail | thread-1 | implied request | inferred | high |  |  | 20m |  | 2026-10-10 | 2026-10-10 |  |\n"
        with tempfile.TemporaryDirectory() as temp:
            tasks = Path(temp) / "tasks.md"
            tasks.write_text(TASK_HEADER + row, encoding="utf-8")
            self.assertTrue(any("lacks confirmation evidence" in e for e in validator.validate_tasks(tasks)))

    def test_terminal_state_requires_evidence(self) -> None:
        row = "| T-20261010-01 | Submit | Completed | Gmail | thread-1 | direct ask | explicit |  |  | 2026-10-10 | 20m |  | 2026-10-10 | 2026-10-10 |  |\n"
        with tempfile.TemporaryDirectory() as temp:
            tasks = Path(temp) / "tasks.md"
            tasks.write_text(TASK_HEADER + row, encoding="utf-8")
            self.assertTrue(any("lacks transition evidence" in e for e in validator.validate_tasks(tasks)))


if __name__ == "__main__":
    unittest.main()
