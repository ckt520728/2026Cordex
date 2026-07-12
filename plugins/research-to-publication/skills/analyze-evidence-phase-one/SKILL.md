---
name: analyze-evidence-phase-one
description: "Run phase-one research analysis across registered PDFs, structured data, and NotebookLM cross-paper syntheses: triage sources, analyze primary papers deeply, extract atomic claims, and preserve provenance. Use after corpus ingestion and before multi-agent synthesis."
---

# Analyze Evidence Phase One

Read `references/phase-one-methods.md`. Use registered local sources before web retrieval.

## Routing

- Structured CSV, Excel, JSON, Parquet, or SQLite: apply the zero-invented-number rules.
- Single primary paper: apply concept, evidence, experiment, interpretation, critique, and implication layers.
- Mixed notes or extracted text: organize without promoting summaries to evidence.
- NotebookLM cross-paper Markdown: preserve its question and relational structure, then decompose conclusions into atomic claims.

## Workflow

1. Triage every registered source by relevance, source type, access completeness, and evidence role.
2. Select core papers for full analysis; use targeted verification for peripheral papers.
3. Write one analysis file per primary source under `analysis/phase-1/sources/`.
4. Write one relational analysis per NotebookLM synthesis under `analysis/phase-1/syntheses/`.
5. Add only atomic, falsifiable claims to `claim-ledger.csv`.
6. Attach source IDs, evidence location, claim type, confidence, and verification status.
7. Record conflicts without resolving them prematurely.

## Gate

Do not begin Phase 2 until core sources are available, high-impact claims are grounded in primary sources, and unresolved items are visible.
