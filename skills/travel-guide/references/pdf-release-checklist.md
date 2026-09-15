# Portable PDF release checklist

## Build

- Use A4 or Letter consistently, based on audience.
- Embed all fonts, including CJK subsets.
- Preserve selectable text and clickable external links.
- Add a descriptive title and language metadata when the renderer supports them.
- Use relative inputs and an output path chosen by the user.
- Do not include local filesystem links, temporary file URLs, or credentials.

## Structural QA

- Confirm the PDF opens without a password.
- Record PDF version, byte size, page count, and page dimensions.
- Confirm all pages have the expected size and orientation.
- Count link annotations and unique external URLs.
- Verify each used font is embedded.

## Text QA

- Extract text with a CJK-capable engine such as PyMuPDF.
- Verify the title, every day heading, and representative place names.
- Use a second extractor for structural corroboration, but treat missing CJK text as a warning until visually checked.
- Detect replacement characters, empty content pages, repeated headers, and truncated endings.

## Visual QA

- Render every page to images.
- Review an all-page contact sheet for blank pages, isolated paragraphs, bad page breaks, and inconsistent density.
- Inspect the cover, table of contents, densest pages, link-heavy pages, and final page at readable resolution.
- Check text boxes for clipping, overlap, and content outside margins.

## Release record

Record renderer and version, build command, verification command, source Markdown hash, PDF SHA-256, page count, external-link count, embedded fonts, and any accepted limitations.
