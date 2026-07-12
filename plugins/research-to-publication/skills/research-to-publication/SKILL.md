---
name: research-to-publication
description: Orchestrate an evidence-bound project from local PDFs and NotebookLM cross-paper Markdown through project initialization, phase-one source analysis, phase-two multi-agent synthesis, academic manuscript drafting, public Traditional-Chinese blog writing, approval, and optional homepage publication. Use when the user asks to run, resume, package, or audit the complete research-to-publication workflow.
---

# Research to Publication

Treat the project folder as the state spine. Read `references/workflow-contract.md` before acting.

## Required sequence

1. Invoke `$ingest-research-corpus` to initialize and register inputs.
2. Stop at Gate 1 until scope, author, audience, outputs, and canonical sources are approved.
3. Invoke `$analyze-evidence-phase-one`; create source-level analyses and atomic claims.
4. Stop at Gate 2 until the primary-source set and claim ledger are approved.
5. Invoke `$synthesize-evidence-phase-two`; resolve grounding, duplication, and contradictions.
6. Invoke `$write-academic-paper` from the approved ledger and synthesis only.
7. Invoke `$write-public-blog`, which uses `$article-writer` for outline-first long-form drafting, from the same approved evidence state.
8. Stop at Gate 3 for manuscript and blog content approval.
9. Invoke `$publish-lab-blog` only after explicit publication approval.
10. Record deployment verification and close Gate 4.

## Invariants

- Preserve source archives and PDFs unchanged.
- Treat NotebookLM Markdown as a synthesis artifact, never as primary evidence.
- Preserve many-to-many relations among questions, syntheses, sources, and claims.
- Separate `fact`, `source_interpretation`, `cross_source_inference`, and `hypothesis`.
- Do not strengthen a blog claim beyond the academic manuscript or claim ledger.
- Resume from existing state; never restart completed phases without cause.
- Keep external writes and publication behind explicit approval.

## Completion

Complete only when required outputs exist, validation passes, approvals are recorded, and every requested publication or mirror is verified or reported as blocked.
