---
name: publish-lab-blog
description: Publish an explicitly approved self-contained Traditional-Chinese research blog to the kidney-cognition-lab homepage, register its homepage card and sitemap entry, push safely, verify deployment, and optionally mirror a snapshot. Use only after content approval.
---

# Publish Lab Blog

Read `references/publishing-contract.md` before any external write.

1. Verify explicit publication approval.
2. Clone or update the real `ckt520728/kidney-cognition-lab` repository and confirm `main`.
3. Study the current richest article template and newest homepage card; do not guess house style.
4. Add one self-contained `blog/<slug>.html` with inline SVG or canvas assets.
5. Add the newest card at the top of `#panel-lecture .teach-grid`.
6. Add the URL to `sitemap.xml` and update homepage `lastmod`.
7. Verify public citation metadata against primary publisher or repository records.
8. Render desktop and mobile layouts; reject horizontal overflow.
9. Commit only the article, homepage, and sitemap changes; synchronize before pushing.
10. Verify the article and homepage on Vercel and GitHub Pages by status and expected content.
11. Mirror only when the requested connector has write permission; report snapshot semantics and failures.

Do not publish drafts, infer author metadata, overwrite unrelated changes, or report success from HTTP status alone.
