---
name: personal-site-blog-publisher
description: Use when converting local DOCX/PDF/PPTX/HTML slide materials into a Traditional Chinese personal website Blog article, especially for the user's kidney-cognition-lab static site. Covers source extraction, article rewriting, PDF/slide image selection, metadata integrity checks, local preview, optional website publishing, Obsidian mirroring, memory note creation, and GitHub repo sync.
---

# Personal Site Blog Publisher

## Purpose

Turn local teaching or research materials into a publishable Blog article for the user's personal academic website, with figures, correct metadata, preview verification, and optional sync to Obsidian and GitHub.

## Success Criteria

- A polished Traditional Chinese Blog article exists as static HTML or Markdown.
- The article matches the existing personal site style.
- Figures are extracted or rendered from user-provided materials and have captions.
- Author, date, title, source paths, image attribution, and target URL slug are verified from evidence.
- Local preview or static render check passes.
- If publishing is requested, the website repo is updated, committed, pushed, and deployment status is checked.
- If Obsidian sync is requested, a discoverable note is created and relevant index/log files are updated when they exist.
- If memory update is requested, create a memory update note under `C:\Users\User\.codex\memories\extensions\ad_hoc\notes\`; do not directly edit core `MEMORY.md`.

## Hard Rule: Metadata Is Not Creative Text

Never invent or infer these fields:

- author name
- physician name
- title / role / institution
- source attribution
- publication date
- image provenance
- website target repo

If the source does not explicitly provide a field, use `待確認` or ask the user. Do not copy a person identity from another page just because the template came from that page.

Before finalizing, run a metadata checklist:

```text
author:
title:
date:
source files:
image source and page/slide:
target repo:
target section:
URL slug:
publish status:
```

## Workflow

### 1. Locate and Classify Sources

List local files first. Identify:

- existing article draft: DOCX / MD / TXT / HTML
- slide sources: PDF / PPTX / HTML
- website repo: usually `kidney-cognition-lab`, but verify current path and remote
- Obsidian vault: verify current vault path before writing

Do not assume the current folder is the publish target.

### 2. Extract Article Spine

For DOCX:

- read `word/document.xml` from the DOCX zip when a full Word parser is not needed
- preserve Traditional Chinese terms
- identify risky social-platform wording and convert to personal-site teaching/reflection tone

For PPTX:

- inspect `ppt/slides/slide*.xml` in the PPTX zip for slide titles and structure

For PDF:

- use `pypdf` for page count and quick text extraction
- render candidate pages with Poppler or PyMuPDF for visual fidelity

For HTML slides:

- use as structure reference
- do not trust screenshots if encoding or tags are visibly broken

### 3. Choose Figures

Prefer clean PDF-rendered pages over broken HTML screenshots.

Good Blog figures usually explain:

- overall concept map
- key mechanism or setting
- failure mode versus correct path
- final architecture or workflow

Captions must state source file and page/slide number when known.

### 4. Rewrite the Article

Use personal academic Blog tone:

- clear thesis
- clinical / research / engineering relevance
- practical lessons
- restrained language suitable for public sharing
- no exaggerated social media hooks
- no unsupported claims

Keep technical terms in English where appropriate, with Traditional Chinese explanation.

### 5. Build Static HTML

When targeting `kidney-cognition-lab`, reuse local Blog layout patterns:

- top bar with return link
- article header
- author block
- tags
- figure blocks
- callouts and tables when useful

Use the existing site style, but only copy structure. Do not copy author identity unless it is verified for the current article.

### 6. Verify Locally

At minimum:

- check all image paths exist
- search for forbidden or stale names
- render with browser headless or local preview when available
- inspect screenshot for broken text, missing images, overflow, or unreadable figures

Run text searches for author and high-risk metadata before final response.

### 7. Optional Website Publish

Only publish when explicitly requested.

Steps:

1. copy article and assets into the verified website repo
2. update `index.html` card in the requested section, often `#teaching`
3. update `sitemap.xml` if needed
4. run local checks
5. commit with Traditional Chinese commit message unless project convention differs
6. push
7. verify deployment status or live URL

### 8. Optional Obsidian Mirror

If asked to upload to Obsidian:

- verify vault path first
- create a dated note with source paths, outputs, lessons, and next steps
- update index/log files when they exist
- if index/log are garbled or missing, create a clearly named note and report the path

### 9. Optional Memory Update

If asked to update memory:

- create one small note under `C:\Users\User\.codex\memories\extensions\ad_hoc\notes\`
- include exact paths, outputs, errors, and reusable rules
- do not directly edit `MEMORY.md`

## Failure Patterns

### Author hallucination

Symptom: article author is filled even though no source file provides author.

Cause: model treated metadata as template filler.

Fix: remove unverified identity; set `待確認` or ask user; search source, repo, and memory before explaining cause.

### False RCA

Symptom: after a user reports an error, agent gives a plausible explanation without evidence.

Fix: run evidence search first, then explain. If no evidence supports the explanation, say so.

### Broken HTML slide screenshot

Symptom: screenshot contains mojibake or raw tags.

Fix: use PDF rendering or redraw a clean figure with explicit attribution.

## Final Response Checklist

Report:

- created/updated file paths
- verification performed
- publish status
- remaining manual decision, if any
- exact blockers or skipped steps

