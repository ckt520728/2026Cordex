# 2026-06-04 Hermes Agent Blog author hallucination and publishing workflow update

## Summary

During a Hermes Agent Blog drafting run in `D:\Hermes agent setup pitfalls`, Codex produced a polished personal-site Blog draft from local DOCX, HTML slides, and a later-provided PDF deck, but hallucinated the article author as `許育瑞 醫師`. The correct author was `朱國大 醫師`.

This was not sourced from `kidney-cognition-lab`, the DOCX, the PDF, or existing memory. Follow-up searches confirmed the live/local site repo used `朱國大` throughout and contained no `許育瑞`.

## Exact source and output paths

- Source folder: `D:\Hermes agent setup pitfalls`
- Original draft: `D:\Hermes agent setup pitfalls\踩完 20 個坑後的真心話：在 Windows 上部署 Hermes Agent 的自動化實踐指南.docx`
- HTML slide source: `D:\Hermes agent setup pitfalls\Hermes-Agent-踩坑教學簡報_4.html`
- PDF slide source: `C:\Users\User\2026 Hermes\Hermes-Agent-踩坑教學簡報_v2_2026-05-31.pdf`
- Blog draft: `D:\Hermes agent setup pitfalls\hermes-agent-windows-blog.html`
- Rendered Blog figures: `D:\Hermes agent setup pitfalls\hermes-blog-assets\pdf-hermes-three-layers.png`, `pdf-hermes-model-routing.png`, `pdf-hermes-origin-routing.png`, `pdf-hermes-gas-architecture.png`
- Preview image: `D:\Hermes agent setup pitfalls\hermes-blog-preview-pdf.png`
- Website repo inspected: `C:\Users\User\Documents\github-repos\kidney-cognition-lab`

## What worked

- `pypdf` successfully read the PDF page count and text headings.
- PyMuPDF installed into a local temp dependency folder and rendered PDF pages to 1920x1080 PNGs.
- PDF pages 5, 10, 13, and 22 were good Blog figure candidates.
- Edge headless could render the final HTML preview.

## Failure

Codex initially filled an author block with:

```html
<strong>許育瑞 醫師</strong>
```

The user corrected that the article should be by `朱國大 醫師`.

Codex then made a second mistake by claiming the false name came from the existing `kidney-cognition-lab` Blog template. Evidence search showed that was false.

## Root cause

This was a metadata hallucination:

- author name was treated as a template filler instead of high-risk metadata
- no source evidence existed for the generated name
- post-error RCA was given before repo verification

## Durable rules

- Never infer author, physician name, role, institution, date, source attribution, or image provenance.
- If author is absent in source files, use `作者待確認` or ask the user.
- Copy Blog layout structure only; do not copy or invent identity fields.
- Before finalizing a Blog artifact, run a metadata checklist:
  - author
  - title
  - date
  - source files
  - image source/page
  - target repo
  - URL slug
  - publish status
- Before explaining an error cause, search evidence first. Do not provide plausible RCA without verification.

## Skill created

The reusable workflow was packaged as `personal-site-blog-publisher`, intended for turning local DOCX/PDF/PPTX/HTML slide materials into Traditional Chinese personal website Blog articles with figure extraction, metadata checks, optional website publishing, Obsidian sync, memory update, and GitHub sync.

