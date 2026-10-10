#!/usr/bin/env python3
"""Validate structural and safety invariants for a daily brief and task state."""

from __future__ import annotations

import re
import sys
from pathlib import Path


REQUIRED_HEADINGS = [
    "Source Status",
    "Focus Task",
    "Must-Do Tasks",
    "Disposition Recommendations",
    "Awaiting Confirmation",
    "Opportunity Inbox",
    "Research Follow-up Task",
    "Research Radar",
    "Replan Triggers",
    "Manual Check-in",
]
ALLOWED_STATUSES = {
    "Candidate",
    "Committed",
    "Completed",
    "Dismissed",
    "Deferred",
    "Superseded",
}


def section(text: str, heading: str) -> str:
    match = re.search(
        rf"(?ms)^## {re.escape(heading)}\s*$\n(.*?)(?=^## |\Z)", text
    )
    return match.group(1) if match else ""


def frontmatter(text: str) -> dict[str, str]:
    match = re.match(r"\A---\s*\n(.*?)\n---\s*\n", text, re.S)
    if not match:
        return {}
    values: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            values[key.strip()] = value.strip()
    return values


def validate_brief(path: Path) -> list[str]:
    errors: list[str] = []
    text = path.read_text(encoding="utf-8")
    meta = frontmatter(text)
    phase = meta.get("phase")
    if phase not in {"draft", "confirmed"}:
        errors.append("frontmatter phase must be draft or confirmed")
    for key in ("date", "generated_at", "timezone", "gmail_status", "telegram_status", "manual_status"):
        if not meta.get(key):
            errors.append(f"missing frontmatter field: {key}")
    for key in ("gmail_status", "telegram_status"):
        if meta.get(key) not in {"current", "stale", "missing", "unavailable"}:
            errors.append(f"{key} has invalid value")
    if meta.get("manual_status") not in {"current", "missing"}:
        errors.append("manual_status has invalid value")
    for heading in REQUIRED_HEADINGS:
        if not re.search(rf"(?m)^## {re.escape(heading)}\s*$", text):
            errors.append(f"missing heading: {heading}")

    focus = section(text, "Focus Task")
    focus_tasks = re.findall(r"(?m)^- \*\*Task:\*\*", focus)
    if phase == "confirmed" and len(focus_tasks) != 1:
        errors.append("confirmed brief must contain exactly one Focus Task")
    if len(focus_tasks) > 1:
        errors.append("Focus Task section contains more than one task")
    if focus_tasks and ("**Why:**" not in focus or "**Source:**" not in focus):
        errors.append("Focus Task must include Why and Source")

    must_do = section(text, "Must-Do Tasks")
    must_items = re.findall(r"(?m)^###\s+\d+\.\s+", must_do)
    if len(must_items) > 3:
        errors.append("Must-Do Tasks exceeds three items")
    if must_items and (must_do.count("**Why:**") < len(must_items) or must_do.count("**Source:**") < len(must_items)):
        errors.append("each Must-Do Task must include Why and Source")

    research = section(text, "Research Follow-up Task")
    research_tasks = re.findall(r"(?m)^- \*\*Task:\*\*", research)
    if len(research_tasks) > 1:
        errors.append("Research Follow-up Task exceeds one item")
    if research_tasks:
        for field in ("**Why relevant:**", "**Next action:**", "**Estimated time:**", "**Source:**"):
            if field not in research:
                errors.append(f"Research Follow-up Task missing {field}")

    source_status = section(text, "Source Status")
    for source in ("Gmail", "Telegram", "Manual"):
        if source not in source_status:
            errors.append(f"Source Status must mention {source}")
    return errors


def validate_tasks(path: Path) -> list[str]:
    errors: list[str] = []
    text = path.read_text(encoding="utf-8")
    rows = [line for line in text.splitlines() if line.startswith("| T-")]
    for number, row in enumerate(rows, start=1):
        cells = [cell.strip() for cell in row.strip("|").split("|")]
        if len(cells) != 15:
            errors.append(f"task row {number} must have 15 columns")
            continue
        status, inference, confirmation, transition = cells[2], cells[6], cells[8], cells[14]
        if status not in ALLOWED_STATUSES:
            errors.append(f"task row {number} has invalid status: {status}")
        if inference == "inferred" and status == "Committed" and not confirmation:
            errors.append(f"task row {number}: inferred Committed task lacks confirmation evidence")
        if status in {"Completed", "Dismissed", "Deferred", "Superseded"} and not transition:
            errors.append(f"task row {number}: {status} task lacks transition evidence")
    return errors


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: validate_daily_artifacts.py BRIEF.md TASKS.md", file=sys.stderr)
        return 2
    brief, tasks = map(Path, sys.argv[1:])
    missing = [str(path) for path in (brief, tasks) if not path.is_file()]
    if missing:
        print("missing file(s): " + ", ".join(missing), file=sys.stderr)
        return 2
    errors = validate_brief(brief) + validate_tasks(tasks)
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    print("OK: daily brief and task state satisfy structural invariants")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
