import { describe, expect, it } from "vitest";

import {
  cleanStructuredDom,
  cleanStructuredText,
  collapseSpacedLetters,
  extractStructuredDom,
  extractStructuredDomText,
  reconstructPdfPageText,
  type RawPdfTextItem,
} from "./text-layout";

describe("collapseSpacedLetters", () => {
  it("還原被過度空格分開的作者名稱與章節標題", () => {
    const input =
      "1. Conceptual issues in personality theory S U S A N  C L O N I N G E R 3";
    const output = collapseSpacedLetters(input);
    expect(output).toBe("1. Conceptual issues in personality theory SUSAN CLONINGER 3");
  });

  it("還原多名作者與中間縮寫", () => {
    const input =
      "2. Personality psychology of situations S E T H  A.  W A G E R M A N  A N D  D A V I D  C.  F U N D E R 27";
    const output = collapseSpacedLetters(input);
    expect(output).toBe(
      "2. Personality psychology of situations SETH A. WAGERMAN AND DAVID C. FUNDER 27",
    );
  });

  it("還原長姓名與作者貢獻列表", () => {
    const input = "R I C H A R D  M.  R Y A N, University of Rochester";
    const output = collapseSpacedLetters(input);
    expect(output).toBe("RICHARD M. RYAN, University of Rochester");
  });
});

describe("reconstructPdfPageText", () => {
  it("根據 2D 座標重建多行目錄結構與頁碼", () => {
    const items: RawPdfTextItem[] = [
      { str: "Contents", transform: [1, 0, 0, 1, 50, 700], height: 16, width: 60 },
      { str: "List of Figures page ix", transform: [1, 0, 0, 1, 50, 670], height: 12, width: 120 },
      { str: "List of Tables xiii", transform: [1, 0, 0, 1, 50, 650], height: 12, width: 100 },
      { str: "Part I. Foundation Issues 1", transform: [1, 0, 0, 1, 50, 610], height: 14, width: 150 },
      { str: "1. Conceptual issues in personality theory ", transform: [1, 0, 0, 1, 50, 580], height: 11, width: 200 },
      { str: "S U S A N  C L O N I N G E R 3", transform: [1, 0, 0, 1, 260, 580], height: 11, width: 140 },
    ];

    const text = reconstructPdfPageText(items);
    expect(text).toContain("Contents");
    expect(text).toContain("List of Figures page ix");
    expect(text).toContain("Part I. Foundation Issues 1");
    expect(text).toContain("1. Conceptual issues in personality theory SUSAN CLONINGER 3");
    // 確認每行皆有清楚的分行或段落
    expect(text.split("\n").length).toBeGreaterThanOrEqual(4);
  });
});

describe("extractStructuredDomText", () => {
  it("保持 HTML/EPUB 章節之段落、標題、清單結構", () => {
    const html = `
      <div>
        <h1>Chapter 1. Foundations</h1>
        <p>This is the first paragraph with vital context.</p>
        <p>This is the second paragraph.</p>
        <ul>
          <li>First important point</li>
          <li>Second important point</li>
        </ul>
      </div>
    `;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const text = cleanStructuredText(extractStructuredDomText(doc.body || doc.documentElement));

    expect(text).toContain("Chapter 1. Foundations");
    expect(text).toContain("This is the first paragraph with vital context.");
    expect(text).toContain("• First important point");
    expect(text).toContain("• Second important point");
  });

  it("將 EPUB index 的連續短頁碼壓成同行，保留一般章節清單", () => {
    const html = `
      <nav>
        <ol>
          <li>Conclusion</li>
          <li>Index</li>
          <li>i</li><li>ii</li><li>iii</li><li>73</li><li>74</li><li>75</li>
        </ol>
      </nav>
    `;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const text = cleanStructuredText(extractStructuredDomText(doc.body));

    expect(text).toContain("• Conclusion");
    expect(text).toContain("• Index");
    expect(text).toContain("• i · ii · iii · 73 · 74 · 75");
    expect(text).not.toContain("• i\n• ii");
  });
});

describe("extractStructuredDom marks", () => {
  it("記錄 in-book 目錄連結與 id anchor 在清理後的正確 offset", () => {
    const html = `
      <div class="front">
        <h1 class="item"><span id="pvii"></span><b>Contents</b></h1>
        <div class="content_indent">
          <a id="bck_figures" href="figures.xhtml">List of figures</a>
        </div>
        <div class="content">
          <a href="Ch01.xhtml#Ch01">1 U.S.-China relations in the maritime security domain</a>
        </div>
      </div>
    `;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const cleaned = cleanStructuredDom(extractStructuredDom(doc.body));

    expect(cleaned.text).toBe(cleanStructuredText(extractStructuredDomText(doc.body)));

    const links = cleaned.marks.filter((mark) => mark.kind === "link");
    expect(links).toHaveLength(2);
    for (const link of links) {
      if (link.kind !== "link") continue;
      expect(cleaned.text.slice(link.start, link.end)).toBe(
        link.href === "figures.xhtml"
          ? "List of figures"
          : "1 U.S.-China relations in the maritime security domain",
      );
    }

    const anchors = cleaned.marks.filter((mark) => mark.kind === "anchor");
    expect(anchors.map((mark) => (mark.kind === "anchor" ? mark.id : ""))).toContain("pvii");
  });

  it("印刷頁碼 anchor 指向清理後文字的實際位置", () => {
    const html = `<div><p>before</p><p><span id="p23"></span>Chapter text starts here.</p></div>`;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const cleaned = cleanStructuredDom(extractStructuredDom(doc.body));

    const anchor = cleaned.marks.find((mark) => mark.kind === "anchor" && mark.id === "p23");
    expect(anchor).toBeDefined();
    if (!anchor) return;
    expect(cleaned.text.slice(anchor.start)).toContain("Chapter text starts here.");
    expect(cleaned.text.slice(0, anchor.start)).toContain("before");
  });
});
