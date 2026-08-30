import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";

import { EpubFormatAdapter } from "./epub-adapter";

function task() {
  return { signal: new AbortController().signal };
}

function epub(chapterBody: string, navLabel = "第一章") {
  const files = {
    "META-INF/container.xml": strToU8(`<?xml version="1.0"?>
      <container xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles>
      </container>`),
    "EPUB/package.opf": strToU8(`<?xml version="1.0"?>
      <package xmlns="http://www.idpf.org/2007/opf" version="3.0">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:title>腎臟生理學</dc:title><dc:creator>王醫師</dc:creator><dc:language>zh-TW</dc:language>
        </metadata>
        <manifest>
          <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
          <item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
        </manifest>
        <spine><itemref idref="c1"/></spine>
      </package>`),
    "EPUB/nav.xhtml": strToU8(`<html xmlns="http://www.w3.org/1999/xhtml"><body>
      <nav epub:type="toc" xmlns:epub="http://www.idpf.org/2007/ops"><ol><li><a href="chapter1.xhtml">${navLabel}</a></li></ol></nav>
    </body></html>`),
    "EPUB/chapter1.xhtml": strToU8(`<html xmlns="http://www.w3.org/1999/xhtml"><body>${chapterBody}</body></html>`),
  };
  return new Blob([zipSync(files)], { type: "application/epub+zip" });
}

function source(bytes: Blob) {
  return {
    fileName: "renal.epub",
    declaredMediaType: "application/epub+zip",
    bytes,
    limits: { maxBytes: 5_000_000, maxExpandedBytes: 10_000_000, maxResourceCount: 100 },
  } as const;
}

function pathTraversalEpub() {
  const files = {
    "META-INF/container.xml": strToU8(`<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`),
    "EPUB/package.opf": strToU8(`<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>越界測試</dc:title></metadata><manifest><item id="outside" href="../../outside.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="outside"/></spine></package>`),
    "outside.xhtml": strToU8("<html><body>不得越界讀取</body></html>"),
  };
  return new Blob([zipSync(files)], { type: "application/epub+zip" });
}

const PNG_1X1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function pngBytes(): Uint8Array {
  const binary = atob(PNG_1X1);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function epubWithFigure(chapterBody: string) {
  const files = {
    "META-INF/container.xml": strToU8(`<?xml version="1.0"?>
      <container xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles>
      </container>`),
    "EPUB/package.opf": strToU8(`<?xml version="1.0"?>
      <package xmlns="http://www.idpf.org/2007/opf" version="3.0">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>圖表測試</dc:title></metadata>
        <manifest>
          <item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
          <item id="fig1" href="images/figure1.png" media-type="image/png"/>
        </manifest>
        <spine><itemref idref="c1"/></spine>
      </package>`),
    "EPUB/chapter1.xhtml": strToU8(`<html xmlns="http://www.w3.org/1999/xhtml"><body>${chapterBody}</body></html>`),
    "EPUB/images/figure1.png": pngBytes(),
  };
  return new Blob([zipSync(files)], { type: "application/epub+zip" });
}

function epubWithContentsPage() {
  const files = {
    "META-INF/container.xml": strToU8(`<?xml version="1.0"?>
      <container xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles><rootfile full-path="content.opf" media-type="application/oebps-package+xml"/></rootfiles>
      </container>`),
    "content.opf": strToU8(`<?xml version="1.0"?>
      <package xmlns="http://www.idpf.org/2007/opf" version="3.0">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>目錄測試</dc:title></metadata>
        <manifest>
          <item id="toc" href="Text/content.xhtml" media-type="application/xhtml+xml"/>
          <item id="c1" href="Text/Ch01.xhtml" media-type="application/xhtml+xml"/>
        </manifest>
        <spine><itemref idref="toc"/><itemref idref="c1"/></spine>
      </package>`),
    "Text/content.xhtml": strToU8(`<html xmlns="http://www.w3.org/1999/xhtml"><body>
      <div><h1><span id="pvii"></span>Contents</h1></div>
      <div><a href="Ch01.xhtml#Ch01">1 U.S.-China relations in the maritime security domain</a></div>
    </body></html>`),
    "Text/Ch01.xhtml": strToU8(`<html xmlns="http://www.w3.org/1999/xhtml"><body>
      <div><h1 id="Ch01"><span id="p3"></span>1 Maritime security</h1></div>
      <p>本章討論海上安全。</p>
    </body></html>`),
  };
  return new Blob([zipSync(files)], { type: "application/epub+zip" });
}

function renderHost() {
  const element = document.createElement("article");
  document.body.append(element);
  return { element, onSelectionChange: () => {} };
}

describe("EpubFormatAdapter", () => {
  it("由 packaged EPUB 讀取 metadata、spine 文字與 TOC", async () => {
    const opened = await new EpubFormatAdapter({ pageSize: 40 }).open(
      source(epub("<h1>第一章</h1><p>腎臟調節體液與電解質。</p>")),
      task(),
    );

    expect(opened.ok).toBe(true);
    if (!opened.ok) return;
    expect(opened.value.metadata).toMatchObject({ title: "腎臟生理學", authors: ["王醫師"] });
    expect(opened.value.snapshot().excerpt).toContain("腎臟調節體液與電解質");
    expect(await opened.value.outline(task())).toMatchObject({
      ok: true,
      value: [{ label: "第一章" }],
    });
  });

  it("支援全文搜尋與可序列化位置導覽", async () => {
    const opened = await new EpubFormatAdapter({ pageSize: 20 }).open(
      source(epub(`<p>${"前段文字。".repeat(10)}腎小球過濾。${"後段文字。".repeat(10)}</p>`)),
      task(),
    );
    if (!opened.ok) throw new Error(opened.error.message);

    const hits = await opened.value.search({ text: "腎小球" }, task());
    expect(hits.ok).toBe(true);
    if (!hits.ok) return;
    const moved = await opened.value.navigate({ kind: "location", location: hits.value[0].location }, task());
    expect(moved).toMatchObject({ ok: true, value: { excerpt: expect.stringContaining("腎小球") } });
  });

  it.each([
    ["script", "<script>window.top.indexedDB.deleteDatabase('x')</script><p>正文內容</p>"],
    ["remote resource", "<img src='https://tracker.example/pixel.png'/><p>正文內容</p>"],
    ["nested frame", "<iframe srcdoc='<p>x</p>'></iframe><p>正文內容</p>"],
  ])("自動淨化（Sanitize）並移除 %s，安全呈現正文", async (_label, body) => {
    const opened = await new EpubFormatAdapter().open(source(epub(body)), task());
    expect(opened.ok).toBe(true);
    if (!opened.ok) return;
    const excerpt = opened.value.snapshot().excerpt;
    expect(excerpt).toContain("正文內容");
    expect(excerpt).not.toContain("deleteDatabase");
    expect(excerpt).not.toContain("<script");
    expect(excerpt).not.toContain("<iframe");
  });

  it("Render Surface 不建立 event handler、form、危險連結或 remote resource", async () => {
    const opened = await new EpubFormatAdapter().open(
      source(epub(`<form action="https://collector.example"><button>送出</button></form><a href="javascript:alert(1)" onclick="alert(2)">危險連結</a><img src="https://tracker.example/pixel.png" onerror="alert(3)"/><p>安全正文</p>`)),
      task(),
    );
    if (!opened.ok) throw new Error(opened.error.message);
    const element = document.createElement("article");
    const rendered = await opened.value.renderCurrent({ element, onSelectionChange: () => undefined }, task());

    expect(rendered.ok).toBe(true);
    expect(element).toHaveTextContent("安全正文");
    expect(element.querySelector("script, form, iframe, frame, a, img, object, embed")).toBeNull();
  });

  it("渲染 EPUB 內嵌圖片，並保留文字 offset 不變", async () => {
    const opened = await new EpubFormatAdapter({ pageSize: 400 }).open(
      source(epubWithFigure('<p>圖表如下。</p><img src="images/figure1.png" alt="圖 7.1 中美軍事交流頻率"/><p>說明文字。</p>')),
      task(),
    );

    expect(opened.ok).toBe(true);
    if (!opened.ok) return;
    const host = renderHost();
    const rendered = await opened.value.renderCurrent(host, task());
    expect(rendered.ok).toBe(true);

    const image = host.element.querySelector("img");
    expect(image).not.toBeNull();
    expect(image?.getAttribute("alt")).toBe("圖 7.1 中美軍事交流頻率");
    expect(image?.getAttribute("src") ?? "").toMatch(/^(?:data:image\/png;base64,|blob:)/);

    // Render Surface 的 text content 長度必須與來源文字一致，Highlight offset 才不會位移。
    expect(host.element.textContent).toBe(opened.value.snapshot().excerpt);

    await opened.value.close();
    host.element.remove();
  });

  it("圖片檔案遺失或為 remote resource 時不建立 img，也不影響文字", async () => {
    const opened = await new EpubFormatAdapter({ pageSize: 400 }).open(
      source(epubWithFigure('<p>前言。</p><img src="images/missing.png" alt="遺失"/><img src="https://example.com/track.png" alt="遠端"/>')),
      task(),
    );

    expect(opened.ok).toBe(true);
    if (!opened.ok) return;
    const host = renderHost();
    await opened.value.renderCurrent(host, task());

    expect(host.element.querySelector("img")).toBeNull();
    expect(host.element.textContent).toContain("前言。");

    await opened.value.close();
    host.element.remove();
  });

  it("書中 Contents 頁的章節連結可點擊並導覽到該章", async () => {
    const opened = await new EpubFormatAdapter({ pageSize: 400 }).open(
      source(epubWithContentsPage()),
      task(),
    );

    expect(opened.ok).toBe(true);
    if (!opened.ok) return;

    const element = document.createElement("article");
    document.body.append(element);
    let requested: number | undefined;
    const rendered = await opened.value.renderCurrent(
      {
        element,
        onSelectionChange: () => {},
        onInternalLink: (location) => {
          const payload = location.payload as { offset?: number };
          requested = payload.offset;
        },
      },
      task(),
    );
    expect(rendered.ok).toBe(true);

    const link = element.querySelector("a.reader-link");
    expect(link).not.toBeNull();
    expect(link?.textContent).toContain("1 U.S.-China relations in the maritime security domain");

    // Render Surface 的文字長度不受連結影響，Highlight offset 才不會位移。
    expect(element.textContent).toBe(opened.value.snapshot().excerpt);

    link?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(requested).toBeGreaterThan(0);

    const navigated = await opened.value.navigate(
      { kind: "location", location: { kind: "logical-location", format: "epub", codec: { namespace: "epub-text-offset", version: 1 }, payload: { offset: requested ?? 0 }, progression: 0 } },
      task(),
    );
    expect(navigated.ok).toBe(true);
    if (navigated.ok) expect(navigated.value.excerpt).toContain("1 Maritime security");


    await opened.value.close();
    element.remove();
  });

  it("目錄項目顯示書中自帶的印刷頁碼", async () => {
    const opened = await new EpubFormatAdapter({ pageSize: 400 }).open(
      source(epubWithContentsPage()),
      task(),
    );

    expect(opened.ok).toBe(true);
    if (!opened.ok) return;
    const outline = await opened.value.outline(task());
    expect(outline.ok).toBe(true);
    if (!outline.ok) return;

    expect(outline.value.map((item) => item.pageLabel)).toEqual(["第 vii 頁", "第 3 頁"]);

    await opened.value.close();
  });

  it("拒絕越出 EPUB package root 的 spine path traversal", async () => {
    const opened = await new EpubFormatAdapter().open(source(pathTraversalEpub()), task());
    expect(opened).toMatchObject({ ok: false, error: { code: "corrupt-publication" } });
  });
});
