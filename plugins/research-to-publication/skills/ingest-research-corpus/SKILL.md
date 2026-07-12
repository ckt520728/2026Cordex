---
name: ingest-research-corpus
description: Initialize a research project and register local primary PDFs, NotebookLM single-paper notes, and cross-paper synthesis Markdown with checksums and many-to-many provenance. Use when importing a research corpus, starting a research-to-publication project, or repairing its source registry.
---

# Ingest Research Corpus

Read `references/corpus-contract.md`. Use the bundled templates; do not invent a flat PDF-to-Markdown mapping.

## Workflow

1. Confirm the source folder and project root.
2. Initialize Git only when the project root is not already a repository.
3. Create the standard directories without modifying source originals.
4. Copy canonical inputs into `sources/primary/` and `sources/notebooklm/` only when authorized; otherwise register their absolute paths.
5. Compute SHA-256 for every canonical file.
6. Assign stable IDs: `P###` for primary sources, `Q###` for research questions or synthesis documents, and `CL###` for claims.
7. Populate `source-registry.csv`, `synthesis-registry.csv`, and `claim-ledger.csv`.
8. Validate with `scripts/validate_corpus.py <project-root>`.
9. Write scope and unresolved metadata to `RESEARCH_STATE.md`.

## Rules

- A synthesis may cite many sources; a source may support many syntheses.
- Preserve NotebookLM citations as provided. Never manufacture page numbers or DOI values.
- Prefer PDF plus NotebookLM Markdown. Markdown guides navigation; PDF anchors evidence.
- Mark missing PDFs, supplements, OCR failures, and uncertain source identity explicitly.
- Do not search online when the complete local primary source exists, except for version or metadata verification.
