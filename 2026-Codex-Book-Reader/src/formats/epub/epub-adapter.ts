import { strFromU8, unzipSync } from "fflate";

import {
  IMAGE_TOKEN_CAPACITY,
  cleanStructuredDom,
  extractStructuredDom,
  imageToken,
} from "../text-layout";

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
import { renderTextSurface, type RenderableImage, type RenderableLink } from "../text-render-surface";

const EPUB_LOCATION_CODEC = { namespace: "epub-text-offset", version: 1 } as const;
const EPUB_RANGE_CODEC = { namespace: "epub-text-range", version: 1 } as const;

function sanitizeEpubDom(document: Document): void {
  // 1. Remove dangerous active elements and scripts
  const dangerousTags = ["script", "iframe", "frame", "frameset", "object", "embed", "applet", "noscript"];
  for (const tag of dangerousTags) {
    for (const elem of elements(document, tag)) {
      elem.parentNode?.removeChild(elem);
    }
  }

  // 2. Clean attributes (remove event handlers, dangerous schemes, and remote resources)
  const allElements = Array.from(document.getElementsByTagName("*"));
  for (const elem of allElements) {
    const attrsToRemove: string[] = [];
    for (let i = 0; i < elem.attributes.length; i++) {
      const attr = elem.attributes[i];
      const name = attr.name.toLowerCase();
      const val = attr.value.trim().toLowerCase();

      // Remove on* event handlers
      if (name.startsWith("on")) {
        attrsToRemove.push(attr.name);
      }
      // Remove dangerous schemes
      if (
        (name === "href" || name === "src" || name === "action") &&
        (val.startsWith("javascript:") || val.startsWith("vbscript:") || val.startsWith("data:text/html"))
      ) {
        attrsToRemove.push(attr.name);
      }
      // Remove remote fetch resources (blocking remote tracking / fetch)
      if (
        (name === "src" || name === "poster" || name === "action" || name === "formaction") &&
        (val.startsWith("http://") || val.startsWith("https://") || val.startsWith("//"))
      ) {
        attrsToRemove.push(attr.name);
      }
    }
    for (const attrName of attrsToRemove) {
      elem.removeAttribute(attrName);
    }
  }
}

const XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";

const IMAGE_MEDIA_TYPES: Readonly<Record<string, string>> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
};

interface EpubImage {
  mediaType: string;
  bytes: Uint8Array;
  alt: string;
}

function imageMediaType(path: string, declared?: string): string | undefined {
  if (declared && declared.startsWith("image/")) return declared;
  const extension = path.toLocaleLowerCase().split(".").pop();
  return extension ? IMAGE_MEDIA_TYPES[extension] : undefined;
}

function imageHref(element: Element): string | undefined {
  const raw =
    element.getAttribute("src") ??
    element.getAttributeNS(XLINK_NAMESPACE, "href") ??
    element.getAttribute("xlink:href") ??
    element.getAttribute("href");
  const href = raw?.trim();
  if (!href) return undefined;
  // sanitizeEpubDom 已移除 remote src；此處再擋一次 remote 與 inline data。
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) return undefined;
  return href;
}

function base64(bytes: Uint8Array): string {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function createImageUrl(image: EpubImage): string {
  const bytes = new Uint8Array(image.bytes);
  if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
    return URL.createObjectURL(new Blob([bytes], { type: image.mediaType }));
  }
  return `data:${image.mediaType};base64,${base64(bytes)}`;
}

/** 書中自帶的印刷頁碼 anchor，例如 calibre 產出的 id="p23"、id="pvii"。 */
const PRINTED_PAGE_ID = /^p(?:age)?[-_]?([0-9]+|[ivxlcdm]+)$/i;

interface EpubLink {
  start: number;
  end: number;
  offset: number;
}

interface PrintedPage {
  offset: number;
  label: string;
}

interface EpubAdapterOptions {
  pageSize?: number;
}

interface ParsedEpub {
  title: string;
  authors: string[];
  language?: string;
  text: string;
  outline: Array<{ label: string; offset: number }>;
  images: EpubImage[];
  links: EpubLink[];
  printedPages: PrintedPage[];
}

function fail(code: AdapterFailure["code"], message: string): Result<never> {
  return { ok: false, error: { code, message } };
}

function isObject(value: JsonValue): value is { readonly [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizePath(path: string): string | undefined {
  const parts: string[] = [];
  for (const part of path.replace(/\\/g, "/").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (parts.length === 0) return undefined;
      parts.pop();
    } else {
      parts.push(part);
    }
  }
  return parts.join("/");
}

function resolvePath(baseFile: string, href: string): string | undefined {
  const withoutFragment = decodeURIComponent(href.split("#", 1)[0]);
  const base = baseFile.includes("/") ? baseFile.slice(0, baseFile.lastIndexOf("/") + 1) : "";
  return normalizePath(`${base}${withoutFragment}`);
}

function parseXml(text: string, mediaType: DOMParserSupportedType = "application/xml"): Document | undefined {
  try {
    const document = new DOMParser().parseFromString(text, mediaType);
    if (document.getElementsByTagName("parsererror").length === 0) {
      return document;
    }
    if (mediaType === "application/xhtml+xml" || mediaType === "application/xml") {
      const htmlDocument = new DOMParser().parseFromString(text, "text/html");
      if (htmlDocument.getElementsByTagName("parsererror").length === 0) {
        return htmlDocument;
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function elements(document: Document | Element, localName: string): Element[] {
  return Array.from(document.getElementsByTagName("*"))
    .filter((element) => element.localName.toLocaleLowerCase() === localName.toLocaleLowerCase());
}

function firstText(document: Document, localName: string): string | undefined {
  return elements(document, localName)[0]?.textContent?.trim() || undefined;
}

function epubLocation(offset: number, length: number): LogicalLocation {
  return {
    kind: "logical-location",
    format: "epub",
    codec: EPUB_LOCATION_CODEC,
    payload: { offset },
    progression: length === 0 ? 0 : Math.min(1, offset / length),
  };
}

function readOffset(location: LogicalLocation): number | undefined {
  if (
    location.format !== "epub" ||
    location.codec.namespace !== EPUB_LOCATION_CODEC.namespace ||
    !isObject(location.payload)
  ) return undefined;
  const offset = location.payload.offset;
  return typeof offset === "number" && Number.isInteger(offset) ? offset : undefined;
}

async function parseEpub(source: UntrustedBookSource): Promise<Result<ParsedEpub>> {
  let archive: Record<string, Uint8Array>;
  try {
    archive = unzipSync(new Uint8Array(await source.bytes.arrayBuffer()));
  } catch {
    return fail("corrupt-publication", "無法解開 EPUB。");
  }

  const entries = Object.entries(archive);
  if (entries.length > source.limits.maxResourceCount) {
    return fail("resource-limit", "EPUB resource 數量超過限制。");
  }
  const expandedBytes = entries.reduce((total, [, bytes]) => total + bytes.byteLength, 0);
  if (expandedBytes > source.limits.maxExpandedBytes) {
    return fail("resource-limit", "EPUB 解壓後大小超過限制。");
  }

  const read = (path: string) => {
    const bytes = archive[normalizePath(path) ?? ""];
    return bytes ? strFromU8(bytes) : undefined;
  };
  const container = read("META-INF/container.xml");
  const containerXml = container && parseXml(container);
  const rootFile = containerXml && elements(containerXml, "rootfile")[0]?.getAttribute("full-path");
  if (!rootFile) return fail("corrupt-publication", "EPUB 缺少有效 container.xml。");

  const opfText = read(rootFile);
  const opf = opfText && parseXml(opfText);
  if (!opf) return fail("corrupt-publication", "EPUB package document 無效。");

  const manifest = new Map<string, { href: string; properties: string }>();
  const declaredMediaTypes = new Map<string, string>();
  for (const item of elements(opf, "item")) {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    if (!id || !href) continue;
    manifest.set(id, { href, properties: item.getAttribute("properties") ?? "" });
    const resolved = resolvePath(rootFile, href);
    const mediaType = item.getAttribute("media-type");
    if (resolved && mediaType) declaredMediaTypes.set(resolved, mediaType);
  }
  const spineIds = elements(opf, "itemref")
    .map((item) => item.getAttribute("idref"))
    .filter((id): id is string => Boolean(id));
  if (spineIds.length === 0) return fail("corrupt-publication", "EPUB spine 為空。");

  let text = "";
  const images: EpubImage[] = [];
  const tokenByPath = new Map<string, string>();
  const starts = new Map<string, number>();
  const anchorOffsets = new Map<string, number>();
  const printedPages: PrintedPage[] = [];
  const pendingLinks: Array<{ start: number; end: number; path: string; href: string }> = [];
  for (const id of spineIds) {
    const entry = manifest.get(id);
    const path = entry && resolvePath(rootFile, entry.href);
    const xhtml = path && read(path);
    if (!path || !xhtml) return fail("corrupt-publication", `EPUB spine resource 遺失：${id}`);

    const document = parseXml(xhtml, "application/xhtml+xml");
    if (!document) return fail("corrupt-publication", `EPUB XHTML 無效：${path}`);

    // Sanitize DOM to purge active scripts, iframes, inline event handlers, and remote tracker tags
    sanitizeEpubDom(document);

    starts.set(path, text.length);
    const onImage = (element: Element): string | undefined => {
      const href = imageHref(element);
      const resolved = href ? resolvePath(path, href) : undefined;
      const bytes = resolved ? archive[resolved] : undefined;
      if (!resolved || !bytes) return undefined;
      const mediaType = imageMediaType(resolved, declaredMediaTypes.get(resolved));
      if (!mediaType) return undefined;
      const alt = element.getAttribute("alt")?.replace(/\s+/g, " ").trim() ?? "";
      const cached = tokenByPath.get(resolved);
      if (cached && !alt) return cached;
      if (images.length >= IMAGE_TOKEN_CAPACITY) return undefined;
      const token = imageToken(images.length);
      if (!token) return undefined;
      images.push({ mediaType, bytes, alt });
      if (!tokenByPath.has(resolved)) tokenByPath.set(resolved, token);
      return token;
    };
    const body = elements(document, "body")[0] || document.documentElement;
    const chapter = body
      ? cleanStructuredDom(extractStructuredDom(body, { onImage }))
      : { text: "", marks: [] };
    const base = text.length;
    for (const mark of chapter.marks) {
      if (mark.kind === "anchor") {
        anchorOffsets.set(`${path}#${mark.id}`, base + mark.start);
        const printed = PRINTED_PAGE_ID.exec(mark.id);
        if (printed) printedPages.push({ offset: base + mark.start, label: printed[1] });
        continue;
      }
      pendingLinks.push({ start: base + mark.start, end: base + mark.end, path, href: mark.href });
    }
    text += `${chapter.text}\n\n`;
  }

  const links: EpubLink[] = [];
  for (const pending of pendingLinks) {
    // 只解析 Book 內部連結；remote 與非 spine 目標維持純文字。
    if (/^[a-z][a-z0-9+.-]*:/i.test(pending.href) || pending.href.startsWith("//")) continue;
    const [rawPath, fragment] = pending.href.split("#", 2);
    const targetPath = rawPath ? resolvePath(pending.path, rawPath) : pending.path;
    if (!targetPath) continue;
    const offset = fragment !== undefined && fragment !== ""
      ? anchorOffsets.get(`${targetPath}#${decodeURIComponent(fragment)}`) ?? starts.get(targetPath)
      : starts.get(targetPath);
    if (offset === undefined) continue;
    links.push({ start: pending.start, end: pending.end, offset });
  }
  printedPages.sort((left, right) => left.offset - right.offset);

  const outline: Array<{ label: string; offset: number }> = [];
  // 1. Try EPUB 3 Navigation Document (nav)
  const navItem = [...manifest.values()].find((item) => item.properties.split(/\s+/).includes("nav"));
  const navPath = navItem && resolvePath(rootFile, navItem.href);
  const navText = navPath && read(navPath);
  const navDocument = navText && parseXml(navText, "application/xhtml+xml");
  if (navPath && navDocument) {
    sanitizeEpubDom(navDocument);
    for (const anchor of elements(navDocument, "a")) {
      const href = anchor.getAttribute("href");
      const path = href && resolvePath(navPath, href);
      const label = anchor.textContent?.replace(/\s+/g, " ").trim();
      const offset = path ? starts.get(path) : undefined;
      if (label && offset !== undefined) outline.push({ label, offset });
    }
  }

  // 2. Try EPUB 2 NCX Document (toc.ncx) if outline is empty
  if (outline.length === 0) {
    const ncxItem = [...manifest.values()].find((item) => item.href.endsWith(".ncx") || item.properties.includes("ncx"));
    const ncxPath = ncxItem && resolvePath(rootFile, ncxItem.href);
    const ncxText = ncxPath && read(ncxPath);
    const ncxDocument = ncxText && parseXml(ncxText, "application/xml");
    if (ncxPath && ncxDocument) {
      for (const navPoint of elements(ncxDocument, "navpoint")) {
        const textElem = elements(navPoint, "text")[0];
        const contentElem = elements(navPoint, "content")[0];
        const label = textElem?.textContent?.replace(/\s+/g, " ").trim();
        const src = contentElem?.getAttribute("src");
        const path = src && resolvePath(ncxPath, src);
        const offset = path ? starts.get(path) : undefined;
        if (label && offset !== undefined) outline.push({ label, offset });
      }
    }
  }

  if (outline.length === 0) {
    for (const [path, offset] of starts) outline.push({ label: path.split("/").at(-1) ?? "章節", offset });
  }

  return {
    ok: true,
    value: {
      title: firstText(opf, "title") ?? source.fileName.replace(/\.epub$/i, ""),
      authors: elements(opf, "creator").map((item) => item.textContent?.trim()).filter((v): v is string => Boolean(v)),
      language: firstText(opf, "language"),
      text: text.trimEnd(),
      outline,
      images,
      links,
      printedPages,
    },
  };
}

export class EpubFormatAdapter implements FormatAdapter {
  private readonly pageSize: number;

  constructor(options: EpubAdapterOptions = {}) {
    this.pageSize = options.pageSize ?? 1_200;
  }

  async probe(source: UntrustedBookSource, task: TaskContext): Promise<ProbeResult> {
    if (task.signal.aborted) return { match: false };
    return {
      match: source.fileName.toLocaleLowerCase().endsWith(".epub") || source.declaredMediaType === "application/epub+zip",
      format: "epub",
    };
  }

  async open(source: UntrustedBookSource, task: TaskContext): Promise<Result<ReaderSession>> {
    if (task.signal.aborted) return fail("aborted", "操作已取消。");
    if (source.bytes.size > source.limits.maxBytes) return fail("resource-limit", "EPUB 檔案超過允許大小。");
    const parsed = await parseEpub(source);
    if (task.signal.aborted) return fail("aborted", "操作已取消。");
    if (!parsed.ok) return { ok: false, error: parsed.error };
    return { ok: true, value: new EpubReaderSession(parsed.value, this.pageSize) };
  }
}

class EpubReaderSession implements ReaderSession {
  readonly metadata;
  readonly capabilities: ReaderCapabilities = {
    search: { support: "available" },
    highlight: { support: "available" },
    outline: { support: "available" },
    typography: { support: "available" },
    pageModel: "reflowable",
  };
  private offset = 0;
  private closed = false;
  private decorations: readonly ReaderDecoration[] = [];
  private renderCleanup?: () => void;
  private readonly imageUrls = new Map<number, string>();
  private readonly listeners = new Set<(event: ReaderEvent) => void>();

  constructor(private readonly publication: ParsedEpub, private pageSize: number) {
    this.metadata = { title: publication.title, authors: publication.authors, language: publication.language };
  }

  snapshot(): ReaderSnapshot {
    const length = this.publication.text.length;
    const safe = Math.min(this.offset, Math.max(0, length - 1));
    return {
      location: epubLocation(safe, length),
      label: `${Math.floor(safe / this.pageSize) + 1} / ${Math.max(1, Math.ceil(length / this.pageSize))}`,
      excerpt: this.publication.text.slice(safe, safe + this.pageSize),
      progress: length === 0 ? 0 : safe / length,
      canGoPrevious: safe > 0,
      canGoNext: safe + this.pageSize < length,
    };
  }

  async renderCurrent(host: ReaderRenderHost, task: TaskContext): Promise<Result<void>> {
    const unavailable = this.available(task); if (unavailable) return unavailable;
    this.renderCleanup?.();
    const snapshot = this.snapshot();
    this.renderCleanup = renderTextSurface({
      format: "epub",
      text: snapshot.excerpt,
      absoluteOffset: this.offset,
      decorations: this.decorations,
      host,
      resolveImage: (index) => this.imageFor(index),
      links: this.linksOnPage(this.offset, this.offset + snapshot.excerpt.length),
    });
    return { ok: true, value: undefined };
  }

  async navigate(target: NavigationTarget, task: TaskContext): Promise<Result<ReaderSnapshot>> {
    const unavailable = this.available(task); if (unavailable) return unavailable;
    const length = this.publication.text.length;
    if (target.kind === "next") this.offset = Math.min(length, this.offset + this.pageSize);
    else if (target.kind === "previous") this.offset = Math.max(0, this.offset - this.pageSize);
    else {
      const offset = readOffset(target.location);
      if (offset === undefined || offset < 0 || offset > length) return fail("stale-reference", "無法解析 EPUB 閱讀位置。");
      this.offset = offset;
    }
    const snapshot = this.snapshot(); this.emit({ type: "position-changed", snapshot });
    return { ok: true, value: snapshot };
  }

  async search(query: SearchQuery, task: TaskContext): Promise<Result<readonly SearchHit[]>> {
    const unavailable = this.available(task); if (unavailable) return unavailable;
    const needle = query.text.trim(); if (!needle) return { ok: true, value: [] };
    const hits: SearchHit[] = []; let from = 0;
    while (hits.length < (query.limit ?? 100)) {
      if (task.signal.aborted) return fail("aborted", "操作已取消。");
      const found = this.publication.text.indexOf(needle, from); if (found < 0) break;
      hits.push({ id: `epub-hit-${found}`, excerpt: this.publication.text.slice(Math.max(0, found - 20), found + needle.length + 30), location: epubLocation(found, this.publication.text.length) });
      from = found + Math.max(1, needle.length);
    }
    return { ok: true, value: hits };
  }

  async outline(task: TaskContext): Promise<Result<readonly OutlineItem[]>> {
    const unavailable = this.available(task); if (unavailable) return unavailable;
    return {
      ok: true,
      value: this.publication.outline.map((item, index) => ({
        id: `epub-outline-${index}`,
        label: item.label,
        location: epubLocation(item.offset, this.publication.text.length),
        children: [],
        pageLabel: this.pageLabelFor(item.offset),
      })),
    };
  }

  async capturePoint(target: LogicalLocation, task: TaskContext): Promise<Result<PointAnchor>> {
    const unavailable = this.available(task); if (unavailable) return unavailable;
    const offset = readOffset(target); if (offset === undefined) return fail("stale-reference", "無法建立 EPUB Bookmark。");
    return { ok: true, value: { kind: "persisted-anchor", anchorKind: "point", format: "epub", codec: EPUB_LOCATION_CODEC, payload: { offset }, fallback: { progression: target.progression } } };
  }

  async captureRange(selection: SelectionToken, task: TaskContext): Promise<Result<RangeAnchor>> {
    const unavailable = this.available(task); if (unavailable) return unavailable;
    const match = /^epub:(\d+):(\d+)$/.exec(selection.token); if (!match) return fail("stale-reference", "文字選取已失效。");
    const start = Number(match[1]); const end = Number(match[2]);
    if (this.publication.text.slice(start, end) !== selection.text) return fail("stale-reference", "文字選取已失效。");
    return { ok: true, value: { kind: "persisted-anchor", anchorKind: "range", format: "epub", codec: EPUB_RANGE_CODEC, payload: { start, end }, fallback: { progression: this.publication.text.length ? start / this.publication.text.length : 0, exactQuote: selection.text, prefix: this.publication.text.slice(Math.max(0, start - 24), start), suffix: this.publication.text.slice(end, end + 24) } } };
  }

  async resolve(anchor: PersistedAnchor, task: TaskContext): Promise<Result<AnchorResolution>> {
    const unavailable = this.available(task); if (unavailable) return unavailable;
    if (anchor.format !== "epub" || !isObject(anchor.payload)) return { ok: true, value: { status: "orphaned" } };
    const value = anchor.anchorKind === "point" ? anchor.payload.offset : anchor.payload.start;
    if (typeof value !== "number" || value < 0 || value > this.publication.text.length) return { ok: true, value: { status: "orphaned" } };
    return { ok: true, value: { status: "exact", location: epubLocation(value, this.publication.text.length) } };
  }

  async setPresentation(settings: PresentationSettings, task: TaskContext): Promise<Result<ReaderSnapshot>> {
    const unavailable = this.available(task); if (unavailable) return unavailable;
    if (settings.kind !== "reflowable") return fail("unsupported-format", "EPUB 不支援 fixed-layout 設定。");
    if (settings.fontSizePx) this.pageSize = Math.max(300, Math.round(1_200 * 18 / settings.fontSizePx));
    return { ok: true, value: this.snapshot() };
  }
  async setDecorations(items: readonly ReaderDecoration[], task: TaskContext): Promise<Result<void>> { const unavailable = this.available(task); if (unavailable) return unavailable; this.decorations = items; return { ok: true, value: undefined }; }
  subscribe(listener: (event: ReaderEvent) => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  async close(): Promise<void> {
    this.closed = true;
    this.renderCleanup?.();
    this.renderCleanup = undefined;
    this.listeners.clear();
    this.decorations = [];
    for (const url of this.imageUrls.values()) {
      if (url.startsWith("blob:") && typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(url);
    }
    this.imageUrls.clear();
  }

  /** 書中自帶印刷頁碼優先；沒有時回退為目前排版下的 Rendered Page 序號。 */
  private pageLabelFor(offset: number): string | undefined {
    const pages = this.publication.printedPages;
    if (pages.length > 0) {
      let found: string | undefined;
      for (const page of pages) {
        if (page.offset > offset) break;
        found = page.label;
      }
      // 書中有印刷頁碼時只顯示真實頁碼；封面等第一個 anchor 之前的位置本來就沒有頁碼。
      return found ? `第 ${found} 頁` : undefined;
    }
    const total = Math.max(1, Math.ceil(this.publication.text.length / this.pageSize));
    return `${Math.floor(offset / this.pageSize) + 1} / ${total}`;
  }

  private linksOnPage(start: number, end: number): RenderableLink[] {
    const length = this.publication.text.length;
    return this.publication.links
      .filter((link) => link.end > start && link.start < end)
      .map((link) => ({
        start: link.start,
        end: link.end,
        location: epubLocation(link.offset, length),
      }));
  }

  private imageFor(index: number): RenderableImage | undefined {
    const image = this.publication.images[index];
    if (!image) return undefined;
    let url = this.imageUrls.get(index);
    if (!url) {
      url = createImageUrl(image);
      this.imageUrls.set(index, url);
    }
    return { url, alt: image.alt };
  }
  private emit(event: ReaderEvent) { this.listeners.forEach((listener) => listener(event)); }
  private available(task: TaskContext): Result<never> | undefined { if (task.signal.aborted) return fail("aborted", "操作已取消。"); if (this.closed) return fail("internal", "ReaderSession 已關閉。"); return undefined; }
}
