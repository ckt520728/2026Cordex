---
name: build-research-lab-explorer
description: Design, build, or audit interactive research-lab and academic portfolio websites that turn publications, methods, brain regions, projects, or other scholarly material into an explorable narrative. Use for lab websites, PI portfolios, publication explorers, bilingual academic sites, interactive research demos, evidence-rich recruitment pages, or redesigns of static publication lists.
---

# Build Research Lab Explorer

Turn a research archive into a guided experience: orient visitors, let them interact with the ideas, connect concepts to evidence, and provide a clear next action. Preserve scholarly credibility while making the work approachable.

## Start with the evidence

1. Inspect the available lab profile, publication corpus, datasets, methods, teaching material, brand assets, and target stack.
2. Identify the primary audiences and the one action each should take: understand, explore, verify, join, collaborate, or contact.
3. Distinguish verified facts from inferred metadata. Never invent metrics, affiliations, citations, findings, or publication tags.
4. Record missing or stale information before building. Use visible “last updated” context when freshness matters.

Read [references/design-patterns.md](references/design-patterns.md) before choosing the information architecture or visual system.

## Design the journey

Build a layered path rather than a flat brochure:

1. **Orient:** State the lab's central question in plain language. Pair it with a compact proof layer such as verified paper, year, method, or impact counts.
2. **Engage:** Offer a low-friction interaction that embodies the research. Keep it optional, brief, keyboard- and touch-operable, and clearly label demonstrations as educational rather than diagnostic.
3. **Explain:** Use a domain map, timeline, process diagram, or concept explorer. Selecting an element should update nearby explanatory content.
4. **Verify:** Connect concepts and demonstrations to searchable primary outputs. Preserve direct links, complete titles, dates, and useful metadata.
5. **Act:** End with audience-specific next steps such as reading, joining, collaborating, or contacting.

Use progressive disclosure: summary first, details on demand, source at the point of verification.

## Model content before components

Define structured records for publications, projects, people, methods, concepts, and demonstrations. Keep content data separate from presentation code even when producing a single-file prototype.

For each publication, prefer stable fields such as:

```text
id, title, authors, year, venue, language, topics[], methods[], regions[],
abstract, doi, pdf_url, project_url, verified_at
```

Derive filters and counts from these records. Do not hand-maintain duplicate totals in headings, cards, and filter labels. Give every item a stable identifier so maps, demos, search results, and citations can deep-link to one another.

## Build a restrained visual system

- Use one dark anchoring color, one warm emphasis color, one cool interaction color, semantic status colors, and quiet neutrals.
- Pair an editorial display face for major headings and numbers with a highly legible UI sans-serif for controls and body copy.
- Reuse a small set of radii, spacing steps, shadows, borders, and container widths as tokens.
- Reserve strong color for hierarchy and state. Do not assign decorative colors that imply false categories.
- Prefer diagrams, data, and meaningful interaction over generic laboratory imagery.
- Keep cards structurally consistent while varying section rhythm through background, scale, and content density.

Adapt the palette and typography to the lab's identity; do not copy the source site's branding by default.

## Make interactions earn their place

- Link exploratory views: selecting a region, method, year, or theme should reveal an explanation and optionally filter the evidence library.
- Keep search, topic filters, method filters, reset state, result count, and empty state synchronized.
- Encode state in the URL when users may share or revisit a filtered view.
- Use hover only as enhancement. Provide visible focus, keyboard operation, and touch targets of at least 44 CSS pixels where practical.
- Respect `prefers-reduced-motion`; animate state changes lightly and never make motion necessary for comprehension.
- For bilingual sites, localize content, labels, search aliases, dates, metadata, and accessible names—not only visible navigation text.
- Give modals focus trapping, an accessible name, Escape handling, focus restoration, and background scroll control.

## Implement for the actual scale

- Use static HTML for a small, rarely updated corpus; use a generator or content pipeline when updates recur; use indexed/server-backed search only when corpus size or query complexity requires it.
- Lazy-load heavy media and documents. Avoid shipping large PDFs or full datasets in the initial page payload.
- Prefer semantic HTML and native controls before custom widgets. Add ARIA only where native semantics are insufficient.
- Generate metadata, counts, and navigation from structured data. Test with long titles, missing fields, Chinese and English text, narrow screens, keyboard-only input, and no-results queries.
- Treat browser-side passcodes as presentation gates, not security. Protect private material with server- or platform-level authorization.

## Review and hand off

Read [references/quality-checklist.md](references/quality-checklist.md) for audits or before declaring implementation complete.

Deliver:

- the audience and content model;
- the page journey and interaction map;
- the visual tokens and component rules;
- the implemented artifact or actionable specification;
- verification results for content integrity, accessibility, responsiveness, performance, privacy, and link behavior;
- assumptions and unresolved content gaps.

Keep provenance explicit. Credit inspiration when appropriate, but reproduce the transferable system rather than distinctive copy, branding, data, or artwork.
