from __future__ import annotations

import csv
import sys
from pathlib import Path


REQUIRED = {
    "source-registry.csv": [
        "source_id", "title", "authors", "year", "doi", "source_type",
        "local_path", "sha256", "access_status", "notes",
    ],
    "synthesis-registry.csv": [
        "analysis_id", "title", "research_question", "markdown_path",
        "source_ids", "analysis_modes", "verification_status", "notes",
    ],
    "claim-ledger.csv": [
        "claim_id", "claim_text", "claim_type", "supporting_source_ids",
        "opposing_source_ids", "evidence_location", "verification_status",
        "confidence", "evidence_family", "analysis_ids", "notes",
    ],
}


def read_rows(path: Path, fields: list[str]) -> list[dict[str, str]]:
    if not path.exists():
        raise ValueError(f"missing: {path}")
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames != fields:
            raise ValueError(f"invalid header: {path.name}")
        return list(reader)


def ids(value: str) -> set[str]:
    return {item.strip() for item in value.split(";") if item.strip()}


def validate(root: Path) -> list[str]:
    metadata = root / "sources" / "metadata"
    sources = read_rows(metadata / "source-registry.csv", REQUIRED["source-registry.csv"])
    syntheses = read_rows(metadata / "synthesis-registry.csv", REQUIRED["synthesis-registry.csv"])
    claims = read_rows(metadata / "claim-ledger.csv", REQUIRED["claim-ledger.csv"])
    errors: list[str] = []

    source_ids = {row["source_id"] for row in sources}
    analysis_ids = {row["analysis_id"] for row in syntheses}
    if len(source_ids) != len(sources):
        errors.append("duplicate source_id")
    if len(analysis_ids) != len(syntheses):
        errors.append("duplicate analysis_id")

    for row in sources:
        if not row["source_id"].startswith("P"):
            errors.append(f"invalid source_id: {row['source_id']}")
        local = row["local_path"]
        if local and not Path(local).is_absolute() and not (root / local).exists():
            errors.append(f"missing local source: {local}")

    for row in syntheses:
        unknown = ids(row["source_ids"]) - source_ids
        if unknown:
            errors.append(f"{row['analysis_id']} unknown sources: {sorted(unknown)}")

    allowed = {"fact", "source_interpretation", "cross_source_inference", "hypothesis"}
    for row in claims:
        if row["claim_type"] not in allowed:
            errors.append(f"{row['claim_id']} invalid claim_type")
        unknown_sources = (ids(row["supporting_source_ids"]) | ids(row["opposing_source_ids"])) - source_ids
        unknown_analyses = ids(row["analysis_ids"]) - analysis_ids
        if unknown_sources:
            errors.append(f"{row['claim_id']} unknown sources: {sorted(unknown_sources)}")
        if unknown_analyses:
            errors.append(f"{row['claim_id']} unknown analyses: {sorted(unknown_analyses)}")
    return errors


if __name__ == "__main__":
    project = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    problems = validate(project)
    if problems:
        print("INVALID")
        print("\n".join(f"- {problem}" for problem in problems))
        raise SystemExit(1)
    print("VALID")
