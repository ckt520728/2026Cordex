from __future__ import annotations

import html
import re
import sys
from pathlib import Path

import markdown


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: build_guide_pdf.py INPUT.md OUTPUT.html")

    source = Path(sys.argv[1]).resolve()
    output = Path(sys.argv[2]).resolve()
    text = source.read_text(encoding="utf-8")
    text = text.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")

    title_match = re.match(r"^#\s+(.+?)\s*$", text, re.MULTILINE)
    title = title_match.group(1) if title_match else source.stem
    body_markdown = re.sub(r"^#\s+.+?\s*$", "", text, count=1, flags=re.MULTILINE).lstrip()
    # The opening source note is represented on the designed cover. Removing it
    # from the body prevents a one-note page before the first chapter.
    body_markdown = re.sub(r"^(?:>\s?.*(?:\n|$))+\s*", "", body_markdown)

    md = markdown.Markdown(
        extensions=["extra", "sane_lists", "toc"],
        extension_configs={"toc": {"permalink": False, "toc_depth": "2-3"}},
        output_format="html5",
    )
    body = md.convert(body_markdown)
    toc = md.toc

    document = f"""<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<style>
  @page {{ size: A4; margin: 17mm 16mm 18mm; }}
  * {{ box-sizing: border-box; }}
  html {{ font-size: 10.7pt; }}
  body {{
    margin: 0;
    color: #292724;
    background: #fff;
    font-family: "Microsoft JhengHei", "PingFang TC", "Noto Sans CJK TC", sans-serif;
    line-height: 1.68;
    letter-spacing: 0.012em;
  }}
  .cover {{
    height: 260mm;
    margin: -17mm -16mm -18mm;
    padding: 42mm 24mm 30mm;
    color: #fff;
    background:
      linear-gradient(145deg, rgba(58,34,24,.97), rgba(126,55,27,.92) 62%, rgba(196,128,48,.9)),
      #70351f;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    break-after: page;
  }}
  .cover-kicker {{
    font-size: 10.5pt;
    letter-spacing: .22em;
    color: #f4dfb8;
  }}
  .cover h1 {{
    margin: 14mm 0 6mm;
    font-family: "Microsoft JhengHei", sans-serif;
    font-size: 29pt;
    line-height: 1.25;
    letter-spacing: .055em;
    color: #fff;
  }}
  .cover .subtitle {{
    max-width: 135mm;
    font-size: 13pt;
    color: #f8ead4;
  }}
  .cover .meta {{
    border-top: 1px solid rgba(255,255,255,.42);
    padding-top: 6mm;
    font-size: 9.5pt;
    color: #f3dfc1;
  }}
  .toc-page {{ break-after: page; }}
  .toc-page h2 {{ break-before: auto; margin-top: 0; }}
  .toc ul {{ list-style: none; padding-left: 0; }}
  .toc ul ul {{ padding-left: 6mm; }}
  .toc li {{ margin: 1.2mm 0; }}
  .toc a {{ color: #6f351f; text-decoration: none; }}
  h2 {{
    break-before: page;
    margin: 0 0 7mm;
    padding: 0 0 3mm;
    border-bottom: 2px solid #a95b2e;
    color: #6c311f;
    font-size: 20pt;
    line-height: 1.32;
  }}
  h3 {{
    break-after: avoid;
    margin: 7mm 0 2.2mm;
    color: #7b4025;
    font-size: 14.2pt;
    line-height: 1.35;
  }}
  p {{ margin: 0 0 3.4mm; orphans: 3; widows: 3; }}
  ul, ol {{ margin: 1.5mm 0 4mm; padding-left: 7mm; }}
  li {{ margin: 1.1mm 0; }}
  strong {{ color: #4f2a1e; }}
  blockquote {{
    margin: 0 0 6mm;
    padding: 4mm 5mm;
    border-left: 4px solid #c17a3b;
    background: #f8f2e8;
    color: #554b42;
  }}
  blockquote p:last-child {{ margin-bottom: 0; }}
  hr {{
    border: 0;
    border-top: 1px solid #dcc8ae;
    margin: 7mm 0;
  }}
  a {{
    color: #8b3e20;
    text-decoration: underline;
    text-decoration-color: #c6987e;
    text-underline-offset: .12em;
    overflow-wrap: anywhere;
  }}
  code {{
    font-family: Consolas, monospace;
    font-size: .92em;
    background: #f4eee6;
    padding: 0 .25em;
  }}
  h2, h3, blockquote, li {{ page-break-inside: avoid; }}
  .closing-note {{
    margin-top: 8mm;
    padding: 5mm;
    background: #f7efe4;
    border: 1px solid #dfc3a0;
  }}
  @media print {{
    a {{ color: #6f351f; }}
    .cover {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
  }}
</style>
</head>
<body>
  <section class="cover">
    <div>
      <div class="cover-kicker">SHANXI - HISTORY - CULTURE</div>
      <h1>{html.escape(title)}</h1>
      <div class="subtitle">從北魏平城、五臺佛國與晉商金融，到河東信仰、明清堡寨及太行築路的長時段旅行閱讀</div>
    </div>
    <div class="meta">依鳳凰旅行社 14 天行程整理 · 繁體中文深度導覽版</div>
  </section>
  <section class="toc-page">
    <h2>目錄</h2>
    {toc}
  </section>
  <main>{body}</main>
</body>
</html>
"""
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(document, encoding="utf-8")


if __name__ == "__main__":
    main()
