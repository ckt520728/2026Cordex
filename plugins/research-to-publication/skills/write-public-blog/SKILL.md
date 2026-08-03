---
name: write-public-blog
description: Translate an approved academic synthesis into a fluent Traditional-Chinese public article in the author's own voice, with Chinese-first terminology, calibrated claims, concrete examples, and accessible visuals. Use after the academic evidence state is stable and before publication approval.
---

# Write Public Blog

Read `references/blog-contract.md`, `references/traditional-chinese-language-policy.md`, and
`references/author-voice-contract.md`, then use `assets/blog-outline.md`.

Language correctness and author voice are separate requirements. An article can pass the
Chinese-dominance audit and still read like an anonymous medical blog. Both audits must pass.

## Workflow

1. Confirm the public reader, target length, tone, publication destination, and **which
   voice profile is bound** for this author.
2. Invoke `$article-writer` to create and pause at an outline unless the user explicitly
   requested one-shot drafting.
3. Before drafting, make a terminology table with: `中文標準寫法`, `首次中英對照`,
   `後續寫法`, and `保留英文理由`. This table is a **working artifact for the writer**;
   it never appears as a section of the published article.
4. Ask the author for the first-hand observation the voice contract requires, naming the
   section it will go into. Do this before drafting, not after.
5. Open by establishing who is speaking, then enter in the reader's language with a
   concrete scene. Never open on a definition or a terminology table.
6. Lead with the conclusion and one concrete problem.
7. Rebuild the argument for public comprehension; do not translate paragraph by paragraph.
8. Write the inference out between steps. Sections end by naming the question the next
   section answers; headers alone do not carry the argument.
9. Write narrative prose in natural Traditional Chinese. At first necessary use, write
   `中文（English, acronym）`; afterward use the Chinese term or the established acronym,
   not repeated English prose.
10. Keep English only for the allowlist in the language policy: proper model/trial names,
    generic drug names, genes/proteins, standard biomarkers, units, and established
    statistical acronyms. Bibliographic titles remain in their source language.
11. Translate generic research vocabulary after first definition, including population,
    outcome, time horizon, calibration, validation, evidence, mechanism, marker, benefit,
    safety, and framework.
12. Keep each narrative paragraph within 240 Chinese characters unless a table, reference,
    code block, or verbatim quotation requires otherwise.
13. Apply the same language and voice rules to the title, subtitle, headings, captions,
    callouts, metadata, tags, and homepage card—not only the body.
14. Include at least one concede-then-patch pivot: accept the mainstream account, then name
    what it drops, then synthesise.
15. Cite by author and year in the prose. **Blog articles carry no inline `[n]` markers**;
    the full reference list with DOI hyperlinks goes at the end.
16. Run a Chinese-dominance pass before content approval: inspect every narrative sentence
    containing three or more non-whitelisted English lexical items, translate it or record
    why it must remain English, and check that English first-use definitions are not
    repeated later. Author surnames identifying cited papers are allowlisted.
17. Run the voice audit in `references/author-voice-contract.md`. Report pass/fail per check.
18. Use examples to explain evidence boundaries, not to imply nonexistent validation.
19. Ensure every strong claim is no stronger than the approved ledger; confirm all numbers
    and citations against the academic manuscript after language editing.
20. Close with an evidence-based synthesis and at most five take-away bullets. Include
    references, author identity, and disclosure. **Do not add a disclaimer paragraph** — at
    most one sentence of limitation in the author's own voice.
21. Report both audits with the draft: retained-English categories, corrected dense-English
    examples, paragraph-length result, justified exceptions, and the voice checklist result.
22. Stop for explicit content approval before invoking publication.

## Anti-fabrication boundary

The voice contract requires a first-hand observation. The model **never invents one**.
No fabricated case, case count, patient detail, or clinical anecdote may be written under a
named author's byline, for any reason, including satisfying this skill's own checklist.

Permitted sources are: an observation the author gives in this session; an observation
already documented in the bound voice profile and genuinely on-topic; or a general
unquantified scene that claims nothing about specific patients or numbers. If only the last
is available, record it as an open item, name the exact insertion point, and let the author
supply the real case.

The evidence ledger, the language policy, the voice contract, and this skill override
generic article-writing suggestions that would introduce unsupported facts, fabricated
first-person experience, English-heavy technical prose, or mandatory code blocks.

## Completion check

- The article reads naturally aloud in Traditional Chinese without code-switching every clause.
- A domain expert can still identify every model, drug, trial, biomarker, and statistical
  measure precisely.
- The first-use term table matches the final article and appears nowhere inside it.
- Later occurrences use Chinese or the chosen acronym consistently.
- References and evidence strength are unchanged by language editing.
- The reader learns who is speaking before the argument starts.
- Zero occurrences of `你`; every H2 is declarative; no disclaimer paragraph; at most two tables.
- Every element of the first-hand observation is real, or the slot is honestly empty.
