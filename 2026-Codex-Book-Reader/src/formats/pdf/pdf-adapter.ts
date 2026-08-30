import type {
  AdapterFailure,
  AnchorResolution,
  FormatAdapter,
  JsonValue,
  LogicalLocation,
  NavigationTarget,
  OutlineItem,
  PersistedAnchor,
  PointAnchor,
  PresentationSettings,
  ProbeResult,
  RangeAnchor,
  ReaderCapabilities,
  ReaderDecoration,
  ReaderEvent,
  ReaderRenderHost,
  ReaderSession,
  ReaderSnapshot,
  Result,
  SearchHit,
  SearchQuery,
  SelectionToken,
  TaskContext,
  UntrustedBookSource,
} from "../types";
import { collapseSpacedLetters, reconstructPdfPageText, type RawPdfTextItem } from "../text-layout";

const PDF_LOCATION_CODEC = { namespace: "pdf-page", version: 1 } as const;
const PDF_RANGE_CODEC = { namespace: "pdf-page-text-range", version: 1 } as const;

export interface LoadedPdf {
  numPages: number;
  metadata: { title?: string; author?: string };
  pages: Array<{ text: string }>;
  outline?: Array<{ label: string; pageIndex: number }>;
  renderPage?: (
    pageIndex: number,
    target: HTMLElement,
    zoom: number,
    onSelectionChange: (selection: SelectionToken | null) => void,
    signal?: AbortSignal,
  ) => Promise<void | (() => void)>;
  close?: () => Promise<void>;
}

export type PdfLoader = (bytes: Uint8Array, signal: AbortSignal) => Promise<LoadedPdf>;

interface PdfAdapterOptions {
  loader?: PdfLoader;
}

function fail(code: AdapterFailure["code"], message: string): Result<never> {
  return { ok: false, error: { code, message } };
}

function isObject(value: JsonValue): value is { readonly [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pdfLocation(pageIndex: number, pageCount: number): LogicalLocation {
  return {
    kind: "logical-location",
    format: "pdf",
    codec: PDF_LOCATION_CODEC,
    payload: { pageIndex },
    progression: pageCount <= 1 ? 0 : pageIndex / (pageCount - 1),
  };
}

function readPageIndex(location: LogicalLocation): number | undefined {
  if (location.format !== "pdf" || location.codec.namespace !== PDF_LOCATION_CODEC.namespace || !isObject(location.payload)) return undefined;
  const pageIndex = location.payload.pageIndex;
  return typeof pageIndex === "number" && Number.isInteger(pageIndex) ? pageIndex : undefined;
}

function textBoundaryAt(root: HTMLElement, offset: number): { node: Text; offset: number } | undefined {
  const view = root.ownerDocument.defaultView;
  if (!view) return undefined;
  const walker = root.ownerDocument.createTreeWalker(root, view.NodeFilter.SHOW_TEXT);
  let consumed = 0;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    const length = text.data.length;
    if (offset <= consumed + length) return { node: text, offset: Math.max(0, offset - consumed) };
    consumed += length;
  }
  return undefined;
}

function renderPdfDecorations(
  target: HTMLElement,
  pageIndex: number,
  decorations: readonly ReaderDecoration[],
): void {
  target.querySelector(".pdf-highlight-layer")?.remove();
  const frame = target.querySelector<HTMLElement>(".pdf-page-surface");
  const textLayer = frame?.querySelector<HTMLElement>(".pdf-text-layer");
  if (!frame || !textLayer) return;

  const highlightLayer = target.ownerDocument.createElement("div");
  highlightLayer.className = "pdf-highlight-layer";
  frame.append(highlightLayer);
  const frameRect = frame.getBoundingClientRect();

  for (const decoration of decorations) {
    if (decoration.kind !== "highlight" || decoration.anchor.format !== "pdf" || !isObject(decoration.anchor.payload)) continue;
    const payload = decoration.anchor.payload;
    if (payload.pageIndex !== pageIndex || typeof payload.start !== "number" || typeof payload.end !== "number") continue;
    const start = textBoundaryAt(textLayer, payload.start);
    const end = textBoundaryAt(textLayer, payload.end);
    if (!start || !end) continue;
    const range = target.ownerDocument.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    for (const rect of range.getClientRects()) {
      if (rect.width <= 0 || rect.height <= 0) continue;
      const mark = target.ownerDocument.createElement("span");
      mark.className = `pdf-highlight-overlay highlight-${decoration.color}`;
      mark.dataset.highlightId = decoration.id;
      mark.style.left = `${rect.left - frameRect.left}px`;
      mark.style.top = `${rect.top - frameRect.top}px`;
      mark.style.width = `${rect.width}px`;
      mark.style.height = `${rect.height}px`;
      highlightLayer.append(mark);
    }
  }
}

async function extractPdfOutline(
  document: any,
  pages: Array<{ text: string }>,
): Promise<Array<{ label: string; pageIndex: number }>> {
  const result: Array<{ label: string; pageIndex: number }> = [];

  try {
    const rawOutline = await document.getOutline();
    if (rawOutline && Array.isArray(rawOutline) && rawOutline.length > 0) {
      async function walkOutline(items: any[]) {
        for (const item of items) {
          if (!item) continue;
          let dest = item.dest;
          if (typeof dest === "string") {
            try {
              dest = await document.getDestination(dest);
            } catch {
              // Ignore dest lookup error
            }
          }

          let pageIndex: number | undefined;
          if (Array.isArray(dest) && dest.length > 0) {
            const ref = dest[0];
            if (typeof ref === "object" && ref !== null) {
              try {
                pageIndex = await document.getPageIndex(ref);
              } catch {
                // Ignore if ref fails
              }
            } else if (typeof ref === "number") {
              pageIndex = ref;
            }
          }

          if (pageIndex !== undefined && pageIndex >= 0 && pageIndex < pages.length && item.title) {
            const cleanTitle = collapseSpacedLetters(item.title.replace(/\s+/g, " ").trim());
            if (cleanTitle) {
              result.push({
                label: `${cleanTitle} (第 ${pageIndex + 1} 頁)`,
                pageIndex,
              });
            }
          }

          if (item.items && Array.isArray(item.items) && item.items.length > 0) {
            await walkOutline(item.items);
          }
        }
      }

      await walkOutline(rawOutline);
    }
  } catch {
    // If outline extraction fails, fall back to text heading detection
  }

  // If no embedded PDF outline found, scan top headings of pages
  if (result.length === 0) {
    const headingRegex =
      /^(?:(?:Part|Chapter|Section)\s+[0-9IVXLCDM\d]+|#+\s+|[0-9IVXLCDM]+\.\s+[A-Z\u4e00-\u9fa5]|Contents\b|Preface\b|List of\b|Editors['’]?\s+)/i;
    pages.forEach((page, pageIndex) => {
      const lines = page.text.split("\n").map((l) => l.trim()).filter(Boolean);
      for (const line of lines.slice(0, 3)) {
        if (headingRegex.test(line) && line.length < 80) {
          result.push({
            label: `${line} (第 ${pageIndex + 1} 頁)`,
            pageIndex,
          });
          break;
        }
      }
    });
  }

  // Fallback to page numbers if no headings detected
  if (result.length === 0) {
    pages.forEach((_, pageIndex) => {
      result.push({
        label: `第 ${pageIndex + 1} 頁`,
        pageIndex,
      });
    });
  }

  return result;
}

const defaultPdfLoader: PdfLoader = async (bytes, signal) => {
  // legacy build 內含 Iterator helpers 等 polyfill；modern build 在 Safari 會以
  // "Can't find variable: Iterator" 開啟失敗。
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // 自建 worker：先在 worker scope 安裝 Promise.withResolvers，
  // 否則 iOS 17.4 以前的 Safari 會以 "undefined is not a function" 開啟失敗。
  pdfjs.GlobalWorkerOptions.workerPort = new Worker(
    new URL("./pdf-worker.ts", import.meta.url),
    { type: "module" },
  );
  const loadingTask = pdfjs.getDocument({ data: bytes });
  signal.addEventListener("abort", () => loadingTask.destroy(), { once: true });
  const pdfDocument = await loadingTask.promise;
  const rawMetadata = await pdfDocument.getMetadata().catch(() => undefined);
  const info = rawMetadata?.info as { Title?: string; Author?: string } | undefined;
  const pages: Array<{ text: string }> = [];
  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const page = await pdfDocument.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = reconstructPdfPageText(content.items as RawPdfTextItem[]);
    pages.push({ text });
    page.cleanup();
  }

  const outline = await extractPdfOutline(pdfDocument, pages);

  return {
    numPages: pages.length,
    metadata: { title: info?.Title, author: info?.Author },
    pages,
    outline,
    renderPage: async (pageIndex, target, zoom, onSelectionChange, renderSignal) => {
      const page = await pdfDocument.getPage(pageIndex + 1);
      const baseViewport = page.getViewport({ scale: 1 });
      const availableWidth = Math.max(1, target.clientWidth - 32);
      const fitScale = Math.min(1, availableWidth / baseViewport.width);
      const viewport = page.getViewport({ scale: fitScale * zoom });
      const frame = globalThis.document.createElement("div");
      const canvas = globalThis.document.createElement("canvas");
      const textLayerElement = globalThis.document.createElement("div");
      const outputScale = Math.max(1, globalThis.devicePixelRatio || 1);
      const canvasContext = canvas.getContext("2d");
      if (!canvasContext) throw new Error("瀏覽器無法建立 PDF canvas。");

      frame.className = "pdf-page-surface";
      frame.style.width = `${viewport.width}px`;
      frame.style.height = `${viewport.height}px`;
      frame.style.setProperty("--scale-factor", `${viewport.scale}`);
      frame.style.setProperty("--total-scale-factor", `${viewport.scale}`);
      frame.style.setProperty("--user-unit", "1");
      canvas.className = "pdf-page-canvas";
      canvas.setAttribute("aria-label", `PDF 第 ${pageIndex + 1} 頁`);
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      textLayerElement.className = "pdf-text-layer textLayer";
      textLayerElement.style.setProperty("--scale-factor", `${viewport.scale}`);
      frame.replaceChildren(canvas, textLayerElement);
      target.replaceChildren(frame);

      const textContent = await page.getTextContent();
      const renderTask = page.render({
        canvas,
        canvasContext,
        viewport,
        transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
      });
      const textLayer = new pdfjs.TextLayer({
        textContentSource: textContent,
        container: textLayerElement,
        viewport,
      });
      const cancel = () => {
        renderTask.cancel();
        textLayer.cancel();
      };
      renderSignal?.addEventListener("abort", cancel, { once: true });
      try {
        await Promise.all([renderTask.promise, textLayer.render()]);
      } finally {
        renderSignal?.removeEventListener("abort", cancel);
      }

      const reportSelection = () => {
        const selection = globalThis.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          onSelectionChange(null);
          return;
        }
        const range = selection.getRangeAt(0);
        if (!textLayerElement.contains(range.startContainer) || !textLayerElement.contains(range.endContainer)) {
          onSelectionChange(null);
          return;
        }
        const prefix = range.cloneRange();
        prefix.selectNodeContents(textLayerElement);
        prefix.setEnd(range.startContainer, range.startOffset);
        const start = prefix.toString().length;
        const selectedText = range.toString();
        onSelectionChange({
          token: `pdf:${pageIndex}:${start}:${start + selectedText.length}`,
          text: selectedText,
        });
      };
      target.addEventListener("pointerup", reportSelection);
      target.addEventListener("keyup", reportSelection);
      target.ownerDocument.addEventListener("selectionchange", reportSelection);

      return () => {
        target.removeEventListener("pointerup", reportSelection);
        target.removeEventListener("keyup", reportSelection);
        target.ownerDocument.removeEventListener("selectionchange", reportSelection);
        textLayer.cancel();
        page.cleanup();
        target.replaceChildren();
      };
    },
    close: async () => {
      await loadingTask.destroy();
    },
  };
};

export class PdfFormatAdapter implements FormatAdapter {
  private readonly loader: PdfLoader;

  constructor(options: PdfAdapterOptions = {}) {
    this.loader = options.loader ?? defaultPdfLoader;
  }

  async probe(source: UntrustedBookSource, task: TaskContext): Promise<ProbeResult> {
    if (task.signal.aborted) return { match: false };
    return { match: source.fileName.toLocaleLowerCase().endsWith(".pdf") || source.declaredMediaType === "application/pdf", format: "pdf" };
  }

  async open(source: UntrustedBookSource, task: TaskContext): Promise<Result<ReaderSession>> {
    if (task.signal.aborted) return fail("aborted", "操作已取消。");
    if (source.bytes.size > source.limits.maxBytes) return fail("resource-limit", "PDF 檔案超過允許大小。");
    try {
      const loaded = await this.loader(new Uint8Array(await source.bytes.arrayBuffer()), task.signal);
      if (task.signal.aborted) return fail("aborted", "操作已取消。");
      if (loaded.numPages < 1 || loaded.pages.length !== loaded.numPages) return fail("corrupt-publication", "PDF 頁面資料無效。");
      if (loaded.numPages > source.limits.maxResourceCount) return fail("resource-limit", "PDF 頁數超過限制。");
      return { ok: true, value: new PdfReaderSession(source.fileName, loaded) };
    } catch (error) {
      if (task.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) return fail("aborted", "操作已取消。");
      return fail("corrupt-publication", error instanceof Error ? `無法開啟 PDF：${error.message}` : "無法開啟 PDF。");
    }
  }
}

class PdfReaderSession implements ReaderSession {
  readonly metadata;
  readonly capabilities: ReaderCapabilities;
  private pageIndex = 0;
  private zoom = 1;
  private closed = false;
  private decorations: readonly ReaderDecoration[] = [];
  private renderCleanup?: () => void;
  private renderTarget?: HTMLElement;
  private readonly activeSelections = new Map<string, string>();
  private readonly listeners = new Set<(event: ReaderEvent) => void>();

  constructor(fileName: string, private readonly publication: LoadedPdf) {
    const hasText = publication.pages.some((page) => page.text.trim().length > 0);
    const textCapability = hasText
      ? { support: "available" as const }
      : { support: "unavailable" as const, reason: "document-has-no-text-layer" as const };
    this.metadata = {
      title: publication.metadata.title || fileName.replace(/\.pdf$/i, ""),
      authors: publication.metadata.author ? [publication.metadata.author] : [],
    };
    this.capabilities = {
      search: textCapability,
      highlight: textCapability,
      outline: { support: "available" },
      typography: { support: "unavailable", reason: "format-does-not-support" },
      pageModel: "document-pages",
    };
  }

  snapshot(): ReaderSnapshot {
    return {
      location: pdfLocation(this.pageIndex, this.publication.numPages),
      label: `${this.pageIndex + 1} / ${this.publication.numPages}`,
      excerpt: this.publication.pages[this.pageIndex]?.text || "此頁沒有可擷取的 Text Layer。",
      progress: this.publication.numPages <= 1 ? 0 : this.pageIndex / (this.publication.numPages - 1),
      canGoPrevious: this.pageIndex > 0,
      canGoNext: this.pageIndex + 1 < this.publication.numPages,
    };
  }

  async navigate(target: NavigationTarget, task: TaskContext): Promise<Result<ReaderSnapshot>> {
    const unavailable = this.available(task); if (unavailable) return unavailable;
    if (target.kind === "next") this.pageIndex = Math.min(this.publication.numPages - 1, this.pageIndex + 1);
    else if (target.kind === "previous") this.pageIndex = Math.max(0, this.pageIndex - 1);
    else {
      const pageIndex = readPageIndex(target.location);
      if (pageIndex === undefined || pageIndex < 0 || pageIndex >= this.publication.numPages) return fail("stale-reference", "無法解析 PDF 頁面位置。");
      this.pageIndex = pageIndex;
    }
    const snapshot = this.snapshot(); this.emit({ type: "position-changed", snapshot }); return { ok: true, value: snapshot };
  }

  async search(query: SearchQuery, task: TaskContext): Promise<Result<readonly SearchHit[]>> {
    const unavailable = this.available(task); if (unavailable) return unavailable;
    if (this.capabilities.search.support === "unavailable") return fail("unsupported-format", "此 PDF 沒有 Text Layer，無法搜尋。");
    const needle = query.text.trim(); if (!needle) return { ok: true, value: [] };
    const hits: SearchHit[] = [];
    this.publication.pages.forEach((page, pageIndex) => {
      if (hits.length >= (query.limit ?? 100)) return;
      const found = page.text.indexOf(needle);
      if (found >= 0) hits.push({ id: `pdf-hit-${pageIndex}-${found}`, excerpt: page.text.slice(Math.max(0, found - 20), found + needle.length + 30), location: pdfLocation(pageIndex, this.publication.numPages) });
    });
    return { ok: true, value: hits };
  }

  async outline(task: TaskContext): Promise<Result<readonly OutlineItem[]>> {
    const unavailable = this.available(task); if (unavailable) return unavailable;
    const outlineItems = this.publication.outline || [];
    if (outlineItems.length > 0) {
      return {
        ok: true,
        value: outlineItems.map((item, index) => ({
          id: `pdf-outline-${index}`,
          label: item.label,
          location: pdfLocation(item.pageIndex, this.publication.numPages),
          children: [],
          pageLabel: `第 ${item.pageIndex + 1} 頁`,
        })),
      };
    }
    return {
      ok: true,
      value: this.publication.pages.map((_, pageIndex) => ({
        id: `pdf-page-${pageIndex + 1}`,
        label: `第 ${pageIndex + 1} 頁`,
        location: pdfLocation(pageIndex, this.publication.numPages),
        children: [],
      })),
    };
  }

  async capturePoint(target: LogicalLocation, task: TaskContext): Promise<Result<PointAnchor>> {
    const unavailable = this.available(task); if (unavailable) return unavailable;
    const pageIndex = readPageIndex(target); if (pageIndex === undefined) return fail("stale-reference", "無法建立 PDF Bookmark。");
    return { ok: true, value: { kind: "persisted-anchor", anchorKind: "point", format: "pdf", codec: PDF_LOCATION_CODEC, payload: { pageIndex }, fallback: { progression: target.progression } } };
  }

  async captureRange(selection: SelectionToken, task: TaskContext): Promise<Result<RangeAnchor>> {
    const unavailable = this.available(task); if (unavailable) return unavailable;
    if (this.capabilities.highlight.support === "unavailable") return fail("unsupported-format", "此 PDF 沒有 Text Layer，無法 Highlight。");
    const match = /^pdf:(\d+):(\d+):(\d+)$/.exec(selection.token); if (!match) return fail("stale-reference", "PDF 文字選取已失效。");
    const pageIndex = Number(match[1]); const start = Number(match[2]); const end = Number(match[3]);
    const renderedSelection = this.activeSelections.get(selection.token);
    if (renderedSelection !== selection.text && this.publication.pages[pageIndex]?.text.slice(start, end) !== selection.text) return fail("stale-reference", "PDF 文字選取已失效。");
    return { ok: true, value: { kind: "persisted-anchor", anchorKind: "range", format: "pdf", codec: PDF_RANGE_CODEC, payload: { pageIndex, start, end }, fallback: { progression: pdfLocation(pageIndex, this.publication.numPages).progression, exactQuote: selection.text } } };
  }

  async resolve(anchor: PersistedAnchor, task: TaskContext): Promise<Result<AnchorResolution>> {
    const unavailable = this.available(task); if (unavailable) return unavailable;
    if (anchor.format !== "pdf" || !isObject(anchor.payload)) return { ok: true, value: { status: "orphaned" } };
    const pageIndex = anchor.payload.pageIndex;
    if (typeof pageIndex !== "number" || pageIndex < 0 || pageIndex >= this.publication.numPages) return { ok: true, value: { status: "orphaned" } };
    return { ok: true, value: { status: "exact", location: pdfLocation(pageIndex, this.publication.numPages) } };
  }

  async setPresentation(settings: PresentationSettings, task: TaskContext): Promise<Result<ReaderSnapshot>> {
    const unavailable = this.available(task); if (unavailable) return unavailable;
    if (settings.kind !== "fixed-layout") return fail("unsupported-format", "PDF 只支援 fixed-layout 設定。");
    if (settings.zoom) this.zoom = Math.min(3, Math.max(.5, settings.zoom));
    return { ok: true, value: this.snapshot() };
  }
  async renderCurrent(
    host: ReaderRenderHost,
    task: TaskContext,
  ): Promise<Result<void>> {
    const unavailable = this.available(task); if (unavailable) return unavailable;
    if (!this.publication.renderPage) return fail("internal", "PDF Render Surface 尚未就緒。");
    this.renderCleanup?.();
    this.renderCleanup = undefined;
    this.renderTarget = host.element;
    this.activeSelections.clear();
    try {
      const cleanup = await this.publication.renderPage(
        this.pageIndex,
        host.element,
        this.zoom,
        (selection) => {
          if (selection) this.activeSelections.set(selection.token, selection.text);
          host.onSelectionChange(selection);
        },
        task.signal,
      );
      this.renderCleanup = cleanup || undefined;
      renderPdfDecorations(host.element, this.pageIndex, this.decorations);
      return { ok: true, value: undefined };
    } catch (error) {
      if (task.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) return fail("aborted", "操作已取消。");
      return fail("internal", error instanceof Error ? `無法呈現 PDF 頁面：${error.message}` : "無法呈現 PDF 頁面。");
    }
  }
  async setDecorations(items: readonly ReaderDecoration[], task: TaskContext): Promise<Result<void>> { const unavailable = this.available(task); if (unavailable) return unavailable; this.decorations = items; return { ok: true, value: undefined }; }
  subscribe(listener: (event: ReaderEvent) => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  async close(): Promise<void> {
    this.closed = true;
    this.renderCleanup?.();
    this.renderCleanup = undefined;
    this.renderTarget?.replaceChildren();
    this.renderTarget = undefined;
    this.activeSelections.clear();
    await this.publication.close?.();
    this.listeners.clear();
    this.decorations = [];
  }
  private emit(event: ReaderEvent) { this.listeners.forEach((listener) => listener(event)); }
  private available(task: TaskContext): Result<never> | undefined { if (task.signal.aborted) return fail("aborted", "操作已取消。"); if (this.closed) return fail("internal", "ReaderSession 已關閉。"); return undefined; }
}
