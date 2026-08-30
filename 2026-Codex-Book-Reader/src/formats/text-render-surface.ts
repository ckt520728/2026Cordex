import type {
  BookFormat,
} from "../domain/library";
import { imageTokenIndex } from "./text-layout";
import type {
  LogicalLocation,
  ReaderDecoration,
  ReaderRenderHost,
  SelectionToken,
} from "./types";

export interface RenderableImage {
  url: string;
  alt: string;
}

/** Book 內部連結（例如書中的 Contents 頁）在目前頁面文字中的範圍與目標。 */
export interface RenderableLink {
  start: number;
  end: number;
  location: LogicalLocation;
}

interface TextRenderSurfaceOptions {
  format: Extract<BookFormat, "epub" | "txt">;
  text: string;
  absoluteOffset: number;
  decorations: readonly ReaderDecoration[];
  host: ReaderRenderHost;
  /** 依 image token index 取得可顯示的圖片；回傳 undefined 時維持純文字。 */
  resolveImage?: (index: number) => RenderableImage | undefined;
  /** Book 內部連結，offset 與 decorations 一樣使用整本書的絕對座標。 */
  links?: readonly RenderableLink[];
}

interface HighlightRange {
  id: string;
  color: "yellow" | "green" | "blue" | "pink";
  start: number;
  end: number;
}

interface SegmentContext {
  resolveImage?: (index: number) => RenderableImage | undefined;
  links: readonly RenderableLink[];
  onInternalLink?: (location: LogicalLocation) => void;
}

function isHeading(block: string): boolean {
  return /^(?:(?:Part|Chapter|Section)\s+[0-9IVXLCDM\d]+|#+\s+|[0-9IVXLCDM]+\.\s+[A-Z一-龥]|Contents\b|Preface\b|List of\b)/i.test(block.trim())
    && block.trim().length < 90;
}

function boundaryOffset(root: Node, boundary: Node, offset: number): number | undefined {
  const owner = root.ownerDocument;
  if (!owner) return undefined;
  const walker = owner.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let total = 0;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node === boundary) return total + Math.min(offset, node.textContent?.length ?? 0);
    total += node.textContent?.length ?? 0;
  }

  if (boundary.nodeType === Node.ELEMENT_NODE && root.contains(boundary)) {
    const element = boundary as Element;
    const prefixRange = owner.createRange();
    prefixRange.selectNodeContents(root);
    prefixRange.setEnd(element, Math.min(offset, element.childNodes.length));
    return prefixRange.toString().length;
  }
  return undefined;
}

/**
 * 附加一段文字；文字中的 image token 會換成 Book Render Surface 的圖片。
 *
 * token 字元本身以 visually hidden 的節點保留，
 * 讓 Render Surface 的 text offset 與來源文字完全一致。
 */
function appendRun(
  target: HTMLElement,
  text: string,
  resolveImage?: (index: number) => RenderableImage | undefined,
): void {
  if (!text) return;
  const owner = target.ownerDocument;
  let plain = "";
  for (const character of text) {
    const index = resolveImage ? imageTokenIndex(character) : undefined;
    const image = index === undefined ? undefined : resolveImage?.(index);
    if (!image) {
      plain += character;
      continue;
    }
    if (plain) {
      target.append(plain);
      plain = "";
    }
    const figure = owner.createElement("span");
    figure.className = "reader-figure";
    const element = owner.createElement("img");
    element.className = "reader-figure-image";
    element.setAttribute("src", image.url);
    element.setAttribute("alt", image.alt);
    element.setAttribute("loading", "lazy");
    element.setAttribute("decoding", "async");
    const token = owner.createElement("span");
    token.className = "reader-image-token";
    token.textContent = character;
    figure.append(element, token);
    target.append(figure);
  }
  if (plain) target.append(plain);
}

function createLinkElement(
  owner: Document,
  link: RenderableLink,
  onInternalLink?: (location: LogicalLocation) => void,
): HTMLElement {
  const element = owner.createElement("a");
  element.className = "reader-link";
  element.setAttribute("href", "#");
  element.setAttribute("role", "link");
  element.addEventListener("click", (event) => {
    event.preventDefault();
    onInternalLink?.(link.location);
  });
  return element;
}

function appendDecoratedText(
  target: HTMLElement,
  text: string,
  sourceOffset: number,
  ranges: readonly HighlightRange[],
  context: SegmentContext,
): void {
  const boundaries = new Set([0, text.length]);
  const clamp = (value: number) => Math.min(text.length, Math.max(0, value - sourceOffset));
  for (const range of ranges) {
    const start = clamp(range.start);
    const end = clamp(range.end);
    if (start < end) {
      boundaries.add(start);
      boundaries.add(end);
    }
  }
  for (const link of context.links) {
    const start = clamp(link.start);
    const end = clamp(link.end);
    if (start < end) {
      boundaries.add(start);
      boundaries.add(end);
    }
  }
  const sorted = [...boundaries].sort((left, right) => left - right);
  for (let index = 0; index + 1 < sorted.length; index += 1) {
    const start = sorted[index];
    const end = sorted[index + 1];
    if (start === end) continue;
    const active = [...ranges].reverse().find((range) => range.start <= sourceOffset + start && range.end >= sourceOffset + end);
    const link = context.links.find((item) => item.start <= sourceOffset + start && item.end >= sourceOffset + end);
    const owner = target.ownerDocument;
    const container = link ? createLinkElement(owner, link, context.onInternalLink) : target;
    if (!active) {
      appendRun(container, text.slice(start, end), context.resolveImage);
    } else {
      const mark = owner.createElement("mark");
      mark.className = `highlight-${active.color}`;
      mark.dataset.highlightId = active.id;
      appendRun(mark, text.slice(start, end), context.resolveImage);
      container.append(mark);
    }
    if (container !== target) target.append(container);
  }
}

function renderExactText(
  content: HTMLElement,
  text: string,
  absoluteOffset: number,
  ranges: readonly HighlightRange[],
  context: SegmentContext,
): void {
  const parts = text.split(/(\n{2,})/);
  let sourceOffset = absoluteOffset;
  for (const part of parts) {
    if (!part) continue;
    if (/^\n+$/.test(part)) {
      content.append(part);
      sourceOffset += part.length;
      continue;
    }
    const block = content.ownerDocument.createElement("span");
    const lines = part.split("\n").map((line) => line.trim()).filter(Boolean);
    block.className = isHeading(part)
      ? "reader-heading"
      : lines.length > 1 && lines.some((line) => line.startsWith("• ") || line.startsWith("- ") || /^\d+\.\s+/.test(line))
        ? "reader-list-block"
        : "reader-paragraph";
    appendDecoratedText(block, part, sourceOffset, ranges, context);
    content.append(block);
    sourceOffset += part.length;
  }
}

export function renderTextSurface(options: TextRenderSurfaceOptions): () => void {
  const { format, text, absoluteOffset, host } = options;
  const ranges: HighlightRange[] = [];
  for (const decoration of options.decorations) {
    if (decoration.kind !== "highlight" || decoration.anchor.format !== format) continue;
    const payload = decoration.anchor.payload;
    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) continue;
    const fields = payload as { readonly [key: string]: import("./types").JsonValue };
    const start = fields.start;
    const end = fields.end;
    if (typeof start === "number" && typeof end === "number" && start < end) {
      ranges.push({ id: decoration.id, color: decoration.color, start, end });
    }
  }
  const context: SegmentContext = {
    resolveImage: options.resolveImage,
    links: options.links ?? [],
    onInternalLink: host.onInternalLink,
  };
  const content = host.element.ownerDocument.createElement("div");
  content.className = "reader-content";
  renderExactText(content, text, absoluteOffset, ranges, context);
  host.element.replaceChildren(content);

  const reportSelection = () => {
    const selection = content.ownerDocument.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      host.onSelectionChange(null);
      return;
    }
    const range = selection.getRangeAt(0);
    if (!content.contains(range.startContainer) || !content.contains(range.endContainer)) {
      host.onSelectionChange(null);
      return;
    }
    const rawStart = boundaryOffset(content, range.startContainer, range.startOffset);
    const rawEnd = boundaryOffset(content, range.endContainer, range.endOffset);
    if (rawStart === undefined || rawEnd === undefined || rawStart === rawEnd) {
      host.onSelectionChange(null);
      return;
    }
    const start = Math.min(rawStart, rawEnd);
    const end = Math.max(rawStart, rawEnd);
    const selected: SelectionToken = {
      token: `${format}:${absoluteOffset + start}:${absoluteOffset + end}`,
      text: text.slice(start, end),
    };
    host.onSelectionChange(selected);
  };

  content.addEventListener("pointerup", reportSelection);
  content.addEventListener("keyup", reportSelection);
  content.ownerDocument.addEventListener("selectionchange", reportSelection);

  return () => {
    content.removeEventListener("pointerup", reportSelection);
    content.removeEventListener("keyup", reportSelection);
    content.ownerDocument.removeEventListener("selectionchange", reportSelection);
    host.element.replaceChildren();
  };
}
