# Changelog

## 0.2.0 — 2026-08-03

### Added

- `write-public-blog/references/author-voice-contract.md`: binds an author voice profile
  (`ckt520728/claude-skills` → `voice-profile/`) to the blog skill. Covers the hard rules,
  the opening formula, the concede-then-patch pivot, header and citation mechanics, hedging
  density, banned vocabulary, an 11-point voice audit, and the known AI failure modes.
- An **anti-fabrication boundary** in the skill, the blog contract, and the outline: the
  voice profile requires a first-hand observation, and the model may never invent one.
  Permitted sources are the author in-session, an on-topic observation already documented in
  the voice profile, or an unquantified general scene. Otherwise the slot is left empty,
  reported, and its insertion point named.
- A first-hand-observation source table in `blog-outline.md` that forces the provenance of
  that material to be recorded before drafting.

### Changed

- `write-public-blog/SKILL.md`: voice is now a first-class requirement alongside language.
  Added steps for voice binding, identity anchoring, opening in the reader's language,
  writing the inference out between steps, the pivot, and the voice audit.
- Blog citations are now **author–year in prose with no inline `[n]` markers**; the full
  DOI reference list stays at the end. The academic manuscript keeps its own citation style.
- **Removed the disclaimer mandate.** Step 14 previously required a non-diagnostic
  disclaimer; a long disclaimer paragraph is rejected by the voice profile. At most one
  sentence of limitation in the author's own voice. A factual caveat describing a simulation
  is not a disclaimer and may stay.
- `blog-outline.md`: restructured to the voice-compliant shape — identity anchor, scene
  opening, declarative H2 headers, a first-hand-observation section, take-away bullets. The
  terminology table is now explicitly a **working artifact** that must not survive into the
  published article, correcting a template that previously put it at the top of the page.
- `blog-contract.md`: added the Voice and anti-fabrication sections; the pre-publication
  audit now runs the language audit and the voice audit together.
- Author surnames identifying cited papers are allowlisted in the Chinese-dominance audit.
- Tables capped at two per article; binary contrasts go in prose.

### Preserved

- Claim-ledger authority, evidence hierarchy, Gate 3 approval, and publication boundaries
  remain unchanged. Evidence outranks voice: voice governs how a supported claim is phrased,
  never which claims may be made.

## 0.1.1 — 2026-07-13

### Changed

- Strengthened `write-public-blog` from a general Chinese-first preference into an executable Traditional-Chinese language contract.
- Added a required first-use terminology table and Chinese-dominance audit.
- Defined an English allowlist for model/trial names, generic drug names, genes/proteins, biomarkers, units, and established acronyms.
- Required later occurrences of general research vocabulary to use Chinese or the chosen acronym.
- Extended the language policy to headings, figures, captions, tables, metadata, tags, and homepage cards.
- Added a 240-Chinese-character narrative paragraph guideline.
- Added a research-blog override to `article-writer` so it does not force fabricated first-person experience, English-heavy prose, or mandatory code blocks.
- Added the Taiwan diabetes blog language-revision case study and measured before/after audit.

### Preserved

- Claim-ledger authority, evidence hierarchy, Gate 3 approval, and publication boundaries remain unchanged.
