#!/usr/bin/env python3
"""Audit a Markdown travel guide for coverage and release-blocking issues."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse


DAY_RE = re.compile(r"^##\s+(?:Day\s*|第\s*)(\d+)(?:\s*天)?\b", re.IGNORECASE | re.MULTILINE)
LINK_RE = re.compile(r"\[[^\]]+\]\((https?://[^)\s]+)\)")
SEARCH_HOSTS = {"google.com", "www.google.com", "bing.com", "www.bing.com"}
MOJIBAKE_MARKERS = ("\ufffd", "Ã", "Â", "â€™", "â€œ", "â€")


def read_utf8(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        raise ValueError(f"not valid UTF-8: {path}") from exc


def load_required_terms(path: Path | None) -> list[str]:
    if path is None:
        return []
    terms = []
    for raw in read_utf8(path).splitlines():
        term = raw.strip()
        if term and not term.startswith("#"):
            terms.append(term)
    return terms


def is_search_result(url: str) -> bool:
    parsed = urlparse(url)
    host = parsed.netloc.lower().split(":", 1)[0]
    return host in SEARCH_HOSTS and parsed.path.rstrip("/") in {"/search", "/url"}


def audit(guide: str, required_terms: list[str], expected_days: int | None) -> dict[str, object]:
    days = [int(value) for value in DAY_RE.findall(guide)]
    unique_days = sorted(set(days))
    links = sorted(set(LINK_RE.findall(guide)))
    missing_terms = [term for term in required_terms if term.casefold() not in guide.casefold()]
    search_links = [url for url in links if is_search_result(url)]
    mojibake = [marker for marker in MOJIBAKE_MARKERS if marker in guide]
    duplicate_days = sorted(day for day in unique_days if days.count(day) > 1)

    failures: list[str] = []
    if expected_days is not None:
        expected = list(range(1, expected_days + 1))
        if unique_days != expected:
            failures.append(f"day coverage differs: expected {expected}, found {unique_days}")
    if duplicate_days:
        failures.append(f"duplicate day headings: {duplicate_days}")
    if missing_terms:
        failures.append(f"missing required terms: {missing_terms}")
    if search_links:
        failures.append(f"search-result links are not direct sources: {search_links}")
    if mojibake:
        failures.append(f"possible mojibake markers: {mojibake}")

    return {
        "pass": not failures,
        "days": unique_days,
        "day_heading_count": len(days),
        "required_term_count": len(required_terms),
        "missing_required_terms": missing_terms,
        "unique_http_links": len(links),
        "search_result_links": search_links,
        "mojibake_markers": mojibake,
        "failures": failures,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--guide", type=Path, required=True, help="UTF-8 Markdown guide")
    parser.add_argument(
        "--required-terms",
        type=Path,
        help="UTF-8 file containing one required place or phrase per line",
    )
    parser.add_argument("--expected-days", type=int, help="Expected consecutive day count")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        guide = read_utf8(args.guide)
        terms = load_required_terms(args.required_terms)
    except (OSError, ValueError) as exc:
        print(json.dumps({"pass": False, "error": str(exc)}, ensure_ascii=False, indent=2))
        return 2

    result = audit(guide, terms, args.expected_days)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["pass"] else 1


if __name__ == "__main__":
    sys.exit(main())
