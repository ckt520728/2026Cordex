---
name: travel-guide
description: Research, fact-check, write, package, and quality-assure evidence-based travel guides from itinerary pages, screenshots, PDFs, notes, or destination lists. Use when Codex needs to normalize a multi-day itinerary; create a cultural, historical, architectural, food, or destination guide; distinguish legends from documented history; build a direct-source registry; verify every named stop is covered; or export a sourced Markdown guide as a portable PDF.
---

# Travel Guide

Turn an itinerary into a useful, sourced guide while keeping historical claims, current logistics, and promotional language clearly separated.

## Guardrails

1. Preserve the user's route and named stops unless explicitly asked to redesign them.
2. Never invent an exact venue, attraction, date, price, opening hour, reservation rule, or accessibility claim.
3. Browse for current logistics and cited facts. Prefer direct institutional pages; use search results only to discover direct URLs.
4. Label uncertain itinerary items as `ambiguous`, optional stops as `optional`, replacements as `substitute`, and travel-only entries as `transit`.
5. Separate foundation tradition, surviving fabric, restoration or reconstruction, and current presentation.
6. Mark folklore and disputed interpretations explicitly. Do not convert tourism superlatives into facts.
7. Timestamp volatile information and advise rechecking it near departure.

Read [references/research-standards.md](references/research-standards.md) before researching historical or cultural claims. Read [references/pdf-release-checklist.md](references/pdf-release-checklist.md) whenever PDF delivery is requested.

## Workflow

### 1. Define the deliverable

Confirm or infer:

- audience, language, trip dates, and desired depth;
- whether the route is fixed or may be optimized;
- required formats such as Markdown, PDF, or both;
- whether practical details must reflect a specific travel date.

Make conservative assumptions when these do not materially change the result. State them in the guide.

### 2. Capture and normalize the itinerary

Extract every day, destination, named attraction, hotel move, optional stop, and substitute. Preserve the source wording, then record a normalized name and status:

| Day | Source wording | Normalized place | Status | Notes |
|---|---|---|---|---|
| 1 | Example | Canonical name | exact | City arrival |

Resolve variants through official destination or heritage pages. If several venues match, retain the generic term and request confirmation rather than guessing.

### 3. Build an evidence ledger

Research in batches by region or theme. For each important claim, record the claim, direct source URL, publisher, publication or update date when available, evidence class, confidence, and intended use.

Use this hierarchy:

1. UNESCO, government heritage inventories, museums, archives, and peer-reviewed scholarship.
2. Universities, established cultural institutions, and reputable reference works.
3. Official attraction pages for visitor logistics and the operator's own claims.
4. Reputable journalism for context or recent changes.
5. Travel blogs and aggregators only as discovery leads or clearly attributed experience reports.

Do not cite a search-results page. Open and cite the underlying page.

### 4. Write for the traveler

Start from [assets/guide-template.md](assets/guide-template.md) when no house format exists. For each day include:

- route and interpretive theme;
- concise historical or cultural context;
- one section for every named stop;
- what to observe on site;
- evidence-calibrated caveats;
- dated practical notes only when verified;
- inline links or numbered sources.

Prefer a small number of memorable cross-trip themes over disconnected encyclopedia entries. Explain why adjacent stops belong together.

### 5. Run editorial QA

Check that:

- every itinerary day and named stop appears in the guide;
- all direct factual claims have suitable support;
- construction date is not confused with surviving material;
- reconstruction, relocation, restoration, and scenic-area additions are disclosed;
- folklore, etymology, and superlatives are labeled or removed;
- live logistics are timestamped;
- no source link is a search-results page;
- UTF-8 text contains no replacement characters or mojibake.

Use the bundled audit for deterministic checks:

```powershell
python scripts/audit_travel_guide.py --guide guide.md --required-terms required-places.txt --expected-days 14
```

Create `required-places.txt` as UTF-8, one required stop per line. Omit `--expected-days` when the guide is not organized by days. A nonzero exit code means the release gate failed.

### 6. Package the artifacts

Deliver only useful project files:

- `guide.md` - final guide;
- `guide.pdf` - when requested;
- `itinerary.md` - normalized coverage list;
- `research.md` - evidence ledger and synthesis notes;
- `sources.md` - direct source registry;
- `handoff.md` - assumptions, unresolved ambiguities, and dated logistics;
- reproducibility scripts when the output is generated.

Do not include browser caches, rendered QA pages, contact sheets, or temporary HTML unless the user asks for them.

### 7. Release a portable PDF

Use the available PDF skill or a stable local renderer. Preserve clickable source links, embed fonts, and avoid machine-specific absolute paths. Run structural, text, link, and all-page visual checks from [references/pdf-release-checklist.md](references/pdf-release-checklist.md).

### 8. Hand off clearly

Report output paths, source count, coverage result, volatile facts requiring recheck, unresolved ambiguities, PDF page size and count, font embedding, link count, visual QA result, and checksums for final artifacts.
