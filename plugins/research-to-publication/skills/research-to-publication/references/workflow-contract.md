# Workflow contract

## State directories

`sources/` stores canonical inputs and registries. `analysis/phase-1/` stores source analyses. `analysis/phase-2/` stores adjudication. `paper/` and `blog/` store deliverables. `RESEARCH_STATE.md` records status, decisions, gates, and blockers.

## Gates

| Gate | Required approval |
|---|---|
| 1 | question, scope, author, audience, outputs, canonical sources |
| 2 | primary evidence set, atomic claims, unresolved evidence gaps |
| 3 | manuscript and blog content |
| 4 | external publication and deployment verification |

## Evidence hierarchy

1. Primary paper, dataset, code, supplement, or publisher metadata.
2. Source-level analysis grounded in primary evidence.
3. NotebookLM cross-paper synthesis with cited source set.
4. Phase-two cross-source inference.
5. Hypothesis or idea.

Never silently move a claim upward in this hierarchy.
