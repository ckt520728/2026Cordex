from __future__ import annotations

import sys
from pathlib import Path

import fitz
from PIL import Image, ImageDraw, ImageOps
from pypdf import PdfReader


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: verify_pdf.py INPUT.pdf RENDER_DIR")

    pdf_path = Path(sys.argv[1]).resolve()
    render_dir = Path(sys.argv[2]).resolve()
    render_dir.mkdir(parents=True, exist_ok=True)

    reader = PdfReader(str(pdf_path))
    doc = fitz.open(pdf_path)
    # PyMuPDF preserves the embedded Traditional Chinese ToUnicode map more
    # consistently than pypdf for Chromium-generated subset fonts.
    extracted = "".join(page.get_text() for page in doc)
    external_links = 0
    annotation_links = 0
    font_names: set[str] = set()
    page_sizes: set[tuple[int, int]] = set()
    clipping_issues: list[tuple[int, tuple[float, float, float, float]]] = []
    rendered_paths: list[Path] = []

    for index, page in enumerate(doc):
        rect = page.rect
        page_sizes.add((round(rect.width), round(rect.height)))
        for font in page.get_fonts(full=True):
            font_names.add(str(font[3]))
        for link in page.get_links():
            annotation_links += 1
            if link.get("uri"):
                external_links += 1
        for block in page.get_text("blocks"):
            x0, y0, x1, y1 = block[:4]
            if x0 < -1 or y0 < -1 or x1 > rect.width + 1 or y1 > rect.height + 1:
                clipping_issues.append((index + 1, (x0, y0, x1, y1)))
        pix = page.get_pixmap(matrix=fitz.Matrix(1.35, 1.35), alpha=False)
        out = render_dir / f"page-{index + 1:03d}.png"
        pix.save(out)
        rendered_paths.append(out)

    thumb_w = 360
    thumb_h = 510
    label_h = 28
    cols = 3
    rows_per_sheet = 4
    per_sheet = cols * rows_per_sheet
    for sheet_index in range((len(rendered_paths) + per_sheet - 1) // per_sheet):
        batch = rendered_paths[sheet_index * per_sheet : (sheet_index + 1) * per_sheet]
        sheet = Image.new("RGB", (cols * thumb_w, rows_per_sheet * (thumb_h + label_h)), "white")
        draw = ImageDraw.Draw(sheet)
        for slot, path in enumerate(batch):
            image = Image.open(path).convert("RGB")
            image.thumbnail((thumb_w - 16, thumb_h - 16))
            canvas = Image.new("RGB", (thumb_w, thumb_h), "#e8e4de")
            x = (thumb_w - image.width) // 2
            y = (thumb_h - image.height) // 2
            canvas.paste(image, (x, y))
            canvas = ImageOps.expand(canvas, border=1, fill="#8b8178")
            col = slot % cols
            row = slot // cols
            px = col * thumb_w
            py = row * (thumb_h + label_h)
            sheet.paste(canvas, (px, py))
            draw.text((px + 8, py + thumb_h + 5), f"Page {sheet_index * per_sheet + slot + 1}", fill="black")
        sheet.save(render_dir / f"contact-sheet-{sheet_index + 1:02d}.png")

    required_terms = [
        "山西晉情大全覽 14 天",
        "雲岡石窟",
        "五臺山",
        "平遙古城",
        "永樂宮",
        "殷墟",
        "慕田峪長城",
    ]
    missing_terms = [term for term in required_terms if term not in extracted]

    print(f"FILE_BYTES={pdf_path.stat().st_size}")
    print(f"PAGES={len(doc)}")
    print(f"PAGE_SIZES={sorted(page_sizes)}")
    print(f"TEXT_CHARS={len(extracted)}")
    print(f"ANNOTATION_LINKS={annotation_links}")
    print(f"EXTERNAL_LINKS={external_links}")
    print(f"FONTS={sorted(font_names)}")
    print(f"MISSING_REQUIRED_TERMS={missing_terms}")
    print(f"CLIPPING_ISSUES={clipping_issues}")


if __name__ == "__main__":
    main()
