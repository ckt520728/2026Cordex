---
name: synthesize-evidence-phase-two
description: Run phase-two adversarial multi-agent synthesis over phase-one analyses and a claim ledger, including grounding checks, evidence-family deduplication, contradiction resolution, consensus filtering, and calibrated synthesis. Use after primary-source verification and before manuscript drafting.
---

# Synthesize Evidence Phase Two

Read `references/phase-two-protocol.md`. Agents analyze artifacts; they do not replace missing evidence.

## Required passes

1. **Grounding:** verify each claim against registered primary evidence.
2. **Independent lenses:** run methodological, conceptual, empirical, and translational critiques.
3. **Evidence-family audit:** detect claims that reuse the same dataset, benchmark, or upstream citation.
4. **Contradiction resolution:** compare conflicting claims pairwise; distinguish real conflict from scope, definition, population, or timescale differences.
5. **Consensus filter:** retain agreement only when independently grounded; preserve minority findings as uncertain rather than deleting them.
6. **Synthesis:** create supported conclusions, contested conclusions, gaps, and hypotheses with explicit claim IDs.

## Prohibitions

- Do not run the vendor PHCSSM workflow directly; it contains paper-specific content.
- Do not treat model agreement as evidence.
- Do not let the generator be the sole evaluator.
- Do not require simulation artifacts when the project is a narrative evidence synthesis.
- Use loop automation only when the user explicitly requests a persistent autonomous run.

## Outputs

Write `analysis/phase-2/synthesis.md`, `analysis/phase-2/contradictions.md`, and an updated claim ledger. No manuscript prose before the ledger passes its gate.
