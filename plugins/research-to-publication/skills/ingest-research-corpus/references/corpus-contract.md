# Corpus contract

## Identity

- `P###`: primary source.
- `Q###`: research question or NotebookLM synthesis.
- `CL###`: atomic claim.

## Registries

`source-registry.csv`: `source_id,title,authors,year,doi,source_type,local_path,sha256,access_status,notes`

`synthesis-registry.csv`: `analysis_id,title,research_question,markdown_path,source_ids,analysis_modes,verification_status,notes`

`claim-ledger.csv`: `claim_id,claim_text,claim_type,supporting_source_ids,opposing_source_ids,evidence_location,verification_status,confidence,evidence_family,analysis_ids,notes`

Use semicolon-separated IDs inside a CSV cell. Relations are many-to-many.

## Standard tree

```text
sources/primary/
sources/notebooklm/single-paper/
sources/notebooklm/synthesis/
sources/metadata/
analysis/phase-1/sources/
analysis/phase-1/syntheses/
analysis/phase-2/
paper/figures/
blog/publish/
```
