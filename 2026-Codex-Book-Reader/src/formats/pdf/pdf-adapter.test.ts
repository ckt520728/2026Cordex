import { describe, expect, it } from "vitest";

import { PdfFormatAdapter, type PdfLoader } from "./pdf-adapter";

function task() { return { signal: new AbortController().signal }; }
function source() {
  return {
    fileName: "renal.pdf",
    declaredMediaType: "application/pdf",
    bytes: new Blob(["%PDF fake"], { type: "application/pdf" }),
    limits: { maxBytes: 1_000, maxExpandedBytes: 1_000, maxResourceCount: 100 },
  } as const;
}

function loader(pages: string[]): PdfLoader {
  return async () => ({
    numPages: pages.length,
    metadata: { title: "腎臟圖譜", author: "林醫師" },
    pages: pages.map((text) => ({ text })),
  });
}

describe("PdfFormatAdapter", () => {
  it("保持 document page model 並逐頁導覽", async () => {
    const opened = await new PdfFormatAdapter({ loader: loader(["第一頁", "第二頁腎小球"]) }).open(source(), task());
    expect(opened.ok).toBe(true);
    if (!opened.ok) return;
    expect(opened.value.capabilities.pageModel).toBe("document-pages");
    expect(opened.value.snapshot()).toMatchObject({ label: "1 / 2", excerpt: "第一頁" });
    expect(await opened.value.navigate({ kind: "next" }, task())).toMatchObject({ ok: true, value: { label: "2 / 2" } });
  });

  it("由 adapter-owned Render Surface 呈現 PDF 原始頁面與 selectable Text Layer", async () => {
    const host = document.createElement("div");
    const selectionTokens: Array<string | null> = [];
    const customLoader = (async () => ({
      numPages: 1,
      metadata: { title: "含圖表的 PDF" },
      pages: [{ text: "Figure 2.1 可見光譜" }],
      renderPage: async (
        pageIndex: number,
        target: HTMLElement,
        _zoom: number,
        onSelectionChange: (selection: { token: string; text: string } | null) => void,
      ) => {
        const canvas = document.createElement("canvas");
        canvas.setAttribute("aria-label", `PDF 第 ${pageIndex + 1} 頁`);
        const textLayer = document.createElement("div");
        textLayer.className = "pdf-text-layer";
        textLayer.textContent = "Figure 2.1 可見光譜";
        target.replaceChildren(canvas, textLayer);
        onSelectionChange({ token: "pdf:0:0:10", text: "Figure 2.1" });
      },
    })) as PdfLoader;

    const opened = await new PdfFormatAdapter({ loader: customLoader }).open(source(), task());
    if (!opened.ok) throw new Error(opened.error.message);

    expect("renderCurrent" in opened.value).toBe(true);
    const result = await opened.value.renderCurrent(
      {
        element: host,
        onSelectionChange: (selection) => selectionTokens.push(selection?.token ?? null),
      },
      task(),
    );

    expect(result.ok).toBe(true);
    expect(host.querySelector("canvas")).toHaveAccessibleName("PDF 第 1 頁");
    expect(host.querySelector(".pdf-text-layer")).toHaveTextContent("Figure 2.1 可見光譜");
    expect(selectionTokens).toEqual(["pdf:0:0:10"]);
  });

  it("有 Text Layer 時提供搜尋並跳至命中頁", async () => {
    const opened = await new PdfFormatAdapter({ loader: loader(["封面", "腎小球過濾率"]), }).open(source(), task());
    if (!opened.ok) throw new Error(opened.error.message);
    const hits = await opened.value.search({ text: "腎小球" }, task());
    expect(hits).toMatchObject({ ok: true, value: [{ excerpt: "腎小球過濾率", location: { payload: { pageIndex: 1 } } }] });
  });

  it("掃描型 PDF 明示搜尋與 Highlight unavailable", async () => {
    const opened = await new PdfFormatAdapter({ loader: loader(["", ""]) }).open(source(), task());
    if (!opened.ok) throw new Error(opened.error.message);
    expect(opened.value.capabilities.search).toMatchObject({ support: "unavailable", reason: "document-has-no-text-layer" });
    expect(opened.value.capabilities.highlight).toMatchObject({ support: "unavailable", reason: "document-has-no-text-layer" });
    expect(await opened.value.search({ text: "腎臟" }, task())).toMatchObject({ ok: false, error: { code: "unsupported-format" } });
  });

  it("提供章節目錄（TOC）與頁碼跳轉", async () => {
    const customLoader: PdfLoader = async () => ({
      numPages: 3,
      metadata: { title: "Personality Psychology", author: "Cambridge" },
      pages: [
        { text: "Contents\nPart I. Foundation Issues" },
        { text: "Chapter 1. Conceptual issues\nDetailed content" },
        { text: "Chapter 2. Biological bases\nDetailed content" },
      ],
      outline: [
        { label: "Part I. Foundation Issues (第 1 頁)", pageIndex: 0 },
        { label: "Chapter 1. Conceptual issues (第 2 頁)", pageIndex: 1 },
        { label: "Chapter 2. Biological bases (第 3 頁)", pageIndex: 2 },
      ],
    });

    const opened = await new PdfFormatAdapter({ loader: customLoader }).open(source(), task());
    if (!opened.ok) throw new Error(opened.error.message);
    const outlineResult = await opened.value.outline(task());
    expect(outlineResult.ok).toBe(true);
    if (!outlineResult.ok) return;
    expect(outlineResult.value).toHaveLength(3);
    expect(outlineResult.value[0].label).toBe("Part I. Foundation Issues (第 1 頁)");
    expect(outlineResult.value[1].label).toBe("Chapter 1. Conceptual issues (第 2 頁)");
    expect(outlineResult.value[1].location.payload).toMatchObject({ pageIndex: 1 });
  });
});
