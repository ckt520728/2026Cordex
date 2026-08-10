# Research Lab Explorer Design Patterns

## Purpose

Use these patterns to transform an academic archive into an accessible public interface. They were distilled from the public source and information architecture of the Chi-Hung Juan Lab Explorer, then generalized for reuse.

Source study:

- Live site: https://chihungjuan.github.io/juan-lab-explorer/
- Public source: https://github.com/ChihungJuan/juan-lab-explorer

Do not copy source text, institutional branding, private content, or publication files.

## The core pearl: an evidence loop

The strongest pattern is a closed loop:

```text
Research question → hands-on demonstration → conceptual explanation
        ↑                                      ↓
Next question or contact ← primary publication evidence
```

Most lab sites separate outreach from scholarship. An explorer makes them mutually reinforcing: a visitor feels the phenomenon, learns the mechanism, and can immediately inspect the supporting work.

## Transferable patterns

### 1. A thesis-led hero

Lead with the intellectual proposition, not the organizational chart. Use one sentence that a non-specialist can repeat accurately. Put verified proof points beneath it so the promise feels grounded.

Avoid vanity metrics. A small set of meaningful counts—years represented, accessible outputs, research themes, or methods—works better than a dense dashboard.

### 2. Research as an interaction

Convert a signature paradigm into a one- to three-minute demonstration. Use a modal or dedicated route with this sequence:

1. Explain the task and its limits.
2. Give a practice state.
3. Show progress during the task.
4. Return a simple result.
5. Explain what the lab studies and what the result cannot establish.
6. Link the relevant primary papers.

The demonstration is an explanatory device, not a diagnostic test. Avoid personalized health conclusions.

### 3. A visual index that controls the archive

Use a brain map, method map, timeline, topic constellation, geographic map, or process diagram as a navigational index. A selection should:

- show a concise explanation;
- reveal methods or related concepts;
- filter or link to the relevant outputs;
- expose the active state both visually and semantically.

This is stronger than a decorative illustration because it connects spatial or conceptual memory to evidence retrieval.

### 4. Faceted evidence retrieval

Offer full-text search plus a small number of high-value facets. Common facets include year, theme, method, brain region, population, language, project, and output type.

Use AND across different facet groups and clearly document OR versus AND within one group. Always show result count, active filters, reset, empty state, and stable links.

### 5. Multiple views of the same corpus

Reuse the same structured content to produce:

- a searchable library for precise retrieval;
- themes for conceptual synthesis;
- a timeline for development over time;
- methods for capability discovery;
- impact for external validation.

Each view should answer a different visitor question. Do not duplicate manually maintained content.

### 6. Bilingual parity

Treat languages as parallel information experiences. Translate explanatory copy and interface states, and add cross-language search aliases. Keep publication titles in their published language while optionally adding a clearly marked translation.

### 7. Scholarly warmth

Balance authority with approachability:

- dark, high-contrast anchors communicate seriousness;
- a warm accent guides attention and humanizes the interface;
- a cool accent signals interaction and discovery;
- editorial headings create a publication-like voice;
- compact sans-serif UI text keeps dense controls usable.

Keep decoration subordinate to evidence.

## Architecture blueprint

Use only sections that serve the audience:

1. Sticky identity and compact navigation
2. Thesis-led hero and verified proof points
3. Interactive demonstrations
4. Visual concept or domain map
5. Searchable, faceted evidence library
6. Research themes or narrative synthesis
7. Timeline or impact view
8. Methods, training, or facilities
9. Join, collaborate, or contact call to action
10. Provenance, privacy, and update metadata

## Common failure modes

- **Client-side password gate:** Anyone with source access can inspect client code or downloaded assets. Use real authentication for private content.
- **Monolithic document:** Inline data, styles, and logic make updates fragile. Separate records, rendering, and interaction state.
- **Filename as metadata:** Filenames are inconsistent and often incomplete. Curate canonical bibliographic records and validate identifiers.
- **Decorative interactivity:** Motion or maps that do not change understanding add cognitive cost. Every interaction should reveal, filter, compare, or verify.
- **Hover-dependent controls:** Touch and keyboard users lose functionality. Make click, keyboard, focus, and visible state first-class.
- **Partial localization:** Hiding and showing text spans does not cover metadata, search, accessible names, or layout expansion.
- **Unverified impact:** Citation and publication counts age quickly. Display source and retrieval date or omit them.
- **Overloaded landing page:** A long page needs landmarks, clear section rhythm, deep links, and a useful mobile navigation strategy.

## Selection guide

- Choose a **single-page explorer** for a curated corpus and strong linear story.
- Choose a **content-generated site** when lab members update people, projects, and publications regularly.
- Choose a **search application** when the corpus is large, filters must be shareable, or records have complex relationships.
- Choose a **separate demo route** when an interaction is long-running, stateful, safety-sensitive, or media-heavy.
