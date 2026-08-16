# Quality Checklist

## Content integrity

- [ ] Every factual claim has an identified source.
- [ ] Publication titles, authors, years, venues, and links are verified.
- [ ] Counts are computed from canonical records, not repeated by hand.
- [ ] Inferred tags are marked or reviewed by a domain owner.
- [ ] Impact metrics include source and retrieval date.
- [ ] Demonstrations state their purpose and limitations.

## Information architecture

- [ ] The opening states the central research question in plain language.
- [ ] Each section answers a distinct visitor question.
- [ ] Concepts, demonstrations, and publications cross-link coherently.
- [ ] Every audience has a clear next action.
- [ ] Long pages provide landmarks and deep links.

## Interaction

- [ ] Search, facets, count, reset, URL state, and empty state agree.
- [ ] Active selections are perceivable without color alone.
- [ ] Keyboard, pointer, and touch paths all work.
- [ ] Modal focus enters, stays inside, closes with Escape, and returns.
- [ ] Loading, error, empty, and offline states are intentional.
- [ ] Motion respects `prefers-reduced-motion`.

## Accessibility

- [ ] Use semantic landmarks, headings, lists, links, buttons, and form labels.
- [ ] Provide a skip link and visible focus indicators.
- [ ] Maintain WCAG AA contrast for text and controls.
- [ ] Ensure interactive targets are approximately 44 by 44 CSS pixels where practical.
- [ ] Provide text alternatives for diagrams and meaningful images.
- [ ] Announce dynamic result-count changes appropriately.
- [ ] Test at 200% zoom and with keyboard-only navigation.

## Responsive behavior

- [ ] Test representative widths from 320 px through wide desktop.
- [ ] Avoid clipped bilingual labels and long publication titles.
- [ ] Reflow maps and side panels into a meaningful reading order.
- [ ] Keep filters usable without consuming the entire mobile viewport.
- [ ] Avoid horizontal scrolling except for intentionally scrollable data views.

## Performance

- [ ] Keep the initial document independent of large PDFs and datasets.
- [ ] Lazy-load media and noncritical visualizations.
- [ ] Limit font weights and third-party dependencies.
- [ ] Use responsive images and reserve dimensions to prevent layout shift.
- [ ] Measure with realistic corpus size and a mid-range mobile profile.

## Privacy and security

- [ ] Do not treat JavaScript passcodes, hidden markup, or obscured URLs as access control.
- [ ] Keep private documents behind authenticated authorization.
- [ ] Avoid collecting experiment or visitor data by default.
- [ ] If collecting data, obtain appropriate consent and document retention and purpose.
- [ ] Sanitize user-provided search or rendered content.
- [ ] Review document metadata and repository history before publishing files.

## Maintainability

- [ ] Store content separately from rendering logic.
- [ ] Use stable IDs and a documented schema.
- [ ] Derive navigation, filters, and statistics from records.
- [ ] Add tests for filtering, language state, links, and long/missing content.
- [ ] Document the update owner and workflow in the project itself.
