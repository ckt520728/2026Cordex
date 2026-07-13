---
name: write-public-blog
description: Translate an approved academic synthesis into a fluent Traditional-Chinese public article with Chinese-first terminology, calibrated claims, concrete examples, and accessible visuals. Use after the academic evidence state is stable and before publication approval.
---

# Write Public Blog

Read `references/blog-contract.md` and `references/traditional-chinese-language-policy.md`, then use `assets/blog-outline.md`.

1. Confirm the public reader, target length, tone, and publication destination.
2. Invoke `$article-writer` to create and pause at an outline unless the user explicitly requested one-shot drafting.
3. Before drafting, make a terminology table with: `中文標準寫法`, `首次中英對照`, `後續寫法`, and `保留英文理由`.
4. Lead with the conclusion and one concrete problem.
5. Rebuild the argument for public comprehension; do not translate paragraph by paragraph.
6. Write narrative prose in natural Traditional Chinese. At first necessary use, write `中文（English, acronym）`; afterward use the Chinese term or the established acronym, not repeated English prose.
7. Keep English only for the allowlist in the language policy: proper model/trial names, generic drug names, genes/proteins, standard biomarkers, units, and established statistical acronyms. Bibliographic titles remain in their source language.
8. Translate generic research vocabulary after first definition, including population, outcome, time horizon, calibration, validation, evidence, mechanism, marker, benefit, safety, and framework.
9. Keep each narrative paragraph within 240 Chinese characters unless a table, reference, code block, or verbatim quotation requires otherwise.
10. Apply the same language rules to the title, subtitle, headings, captions, callouts, metadata, tags, and homepage card—not only the body.
11. Run a Chinese-dominance pass before content approval: inspect every narrative sentence containing three or more non-whitelisted English lexical items, translate it or record why it must remain English, and check that English first-use definitions are not repeated later.
12. Use examples to explain evidence boundaries, not to imply nonexistent validation.
13. Ensure every strong claim is no stronger than the approved ledger; confirm all numbers and citations against the academic manuscript after language editing.
14. Include references, author identity, disclosure, and a non-diagnostic disclaimer when appropriate.
15. Report the language audit with the draft: retained-English categories, corrected dense-English examples, paragraph-length result, and any justified exceptions.
16. Stop for explicit content approval before invoking publication.

The evidence ledger, the language policy, and this skill override generic article-writing suggestions that would introduce unsupported facts, fabricated first-person experience, English-heavy technical prose, or mandatory code blocks.

## Completion check

- The article reads naturally aloud in Traditional Chinese without code-switching every clause.
- A domain expert can still identify every model, drug, trial, biomarker, and statistical measure precisely.
- The first-use term table matches the final article.
- Later occurrences use Chinese or the chosen acronym consistently.
- References and evidence strength are unchanged by language editing.
