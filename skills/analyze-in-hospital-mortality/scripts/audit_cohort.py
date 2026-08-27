#!/usr/bin/env python3
"""Aggregate-only pre-model audit for a de-identified mortality cohort CSV."""

from __future__ import annotations

import argparse
import csv
import json
import math
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path


MISSING = {"", "na", "n/a", "nan", "null", "none", "."}
TRUE_VALUES = {"1", "true", "yes", "y", "dead", "death", "expired", "died"}
FALSE_VALUES = {"0", "false", "no", "n", "alive", "survived", "discharged"}


def is_missing(value: str | None) -> bool:
    return value is None or value.strip().lower() in MISSING


def parse_outcome(value: str | None) -> int | None:
    if is_missing(value):
        return None
    token = value.strip().lower()
    if token in TRUE_VALUES:
        return 1
    if token in FALSE_VALUES:
        return 0
    try:
        number = float(token)
    except ValueError:
        return None
    if number in (0.0, 1.0):
        return int(number)
    return None


def parse_date(value: str | None) -> datetime | None:
    if is_missing(value):
        return None
    token = value.strip()
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%Y-%m-%d %H:%M:%S", "%Y/%m/%d %H:%M"):
        try:
            return datetime.strptime(token, fmt)
        except ValueError:
            pass
    return None


def wilson_interval(events: int, total: int, z: float = 1.959963984540054) -> tuple[float, float]:
    if total == 0:
        return (math.nan, math.nan)
    p = events / total
    denominator = 1 + z * z / total
    center = (p + z * z / (2 * total)) / denominator
    half = z * math.sqrt((p * (1 - p) + z * z / (4 * total)) / total) / denominator
    return center - half, center + half


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv_path", type=Path)
    parser.add_argument("--outcome", required=True, help="Binary in-hospital mortality column")
    parser.add_argument("--id", help="Optional surrogate encounter/patient ID column")
    parser.add_argument("--admit-date", help="Optional admission/index date column")
    parser.add_argument("--discharge-date", help="Optional discharge/death date column")
    parser.add_argument("--json", type=Path, help="Optional aggregate JSON report path")
    args = parser.parse_args()

    with args.csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            raise SystemExit("CSV has no header")
        required = [args.outcome] + [x for x in (args.id, args.admit_date, args.discharge_date) if x]
        missing_columns = [name for name in required if name not in reader.fieldnames]
        if missing_columns:
            raise SystemExit(f"Missing required columns: {', '.join(missing_columns)}")
        rows = list(reader)

    n = len(rows)
    outcome_counts: Counter[int] = Counter()
    outcome_missing = 0
    outcome_invalid = 0
    for row in rows:
        raw = row.get(args.outcome)
        parsed = parse_outcome(raw)
        if parsed is None:
            if is_missing(raw):
                outcome_missing += 1
            else:
                outcome_invalid += 1
        else:
            outcome_counts[parsed] += 1

    valid_n = sum(outcome_counts.values())
    events = outcome_counts[1]
    non_events = outcome_counts[0]
    low, high = wilson_interval(events, valid_n)
    gate_pass = events > 0 and non_events > 0 and outcome_invalid == 0

    missingness = []
    for column in reader.fieldnames:
        count = sum(is_missing(row.get(column)) for row in rows)
        missingness.append({"column": column, "missing_n": count, "missing_pct": (100 * count / n if n else None)})
    missingness.sort(key=lambda item: (-item["missing_n"], item["column"]))

    report: dict[str, object] = {
        "file": args.csv_path.name,
        "rows": n,
        "columns": len(reader.fieldnames),
        "outcome": args.outcome,
        "valid_outcomes": valid_n,
        "events_deaths": events,
        "non_events_survivors": non_events,
        "outcome_missing": outcome_missing,
        "outcome_invalid": outcome_invalid,
        "mortality_rate": (events / valid_n if valid_n else None),
        "mortality_95ci_wilson": ([low, high] if valid_n else None),
        "predictor_model_gate": "PASS" if gate_pass else "STOP",
        "missingness": missingness,
    }

    if args.id:
        ids = [row.get(args.id, "").strip() for row in rows if not is_missing(row.get(args.id))]
        report["id_column"] = args.id
        report["id_missing"] = n - len(ids)
        report["duplicate_id_rows"] = len(ids) - len(set(ids))

    if args.admit_date and args.discharge_date:
        unparseable = 0
        negative_stays = 0
        for row in rows:
            admit_raw = row.get(args.admit_date)
            discharge_raw = row.get(args.discharge_date)
            if is_missing(admit_raw) or is_missing(discharge_raw):
                continue
            admit = parse_date(admit_raw)
            discharge = parse_date(discharge_raw)
            if admit is None or discharge is None:
                unparseable += 1
            elif discharge < admit:
                negative_stays += 1
        report["date_pairs_unparseable"] = unparseable
        report["negative_length_of_stay"] = negative_stays

    if not gate_pass:
        reasons = []
        if events == 0:
            reasons.append("no deaths/events")
        if non_events == 0:
            reasons.append("no survivors/non-events")
        if outcome_invalid:
            reasons.append("invalid non-binary outcome values")
        report["stop_reasons"] = reasons

    rendered = json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False)
    print(rendered)
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(rendered + "\n", encoding="utf-8")
    return 0 if gate_pass else 2


if __name__ == "__main__":
    sys.exit(main())
