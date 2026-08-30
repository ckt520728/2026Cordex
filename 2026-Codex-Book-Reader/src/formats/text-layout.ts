/**
 * Text layout and typography reconstruction utility for PDF and EPUB formats.
 * Restores sentence structure, line breaks, paragraph flow, and collapses
 * spaced small-caps/tracking kerning artifacts from academic publications.
 */

export function collapseSpacedLetters(text: string): string {
  if (!text) return "";

  // 1. Spaced uppercase letters (e.g., "S U S A N  C L O N I N G E R" or "D A V I D  C.  F U N D E R")
  // Matches 2 or more uppercase letters each followed by 1 or more spaces
  let result = text.replace(/(?:[A-ZÀ-ÖØ-ß]\s+){2,}[A-ZÀ-ÖØ-ß](?:\.|\b)/g, (match) => {
    // If there are wide gaps (2+ spaces) between words, preserve word separation
    if (/\s{2,}/.test(match)) {
      return match
        .split(/\s{2,}/)
        .map((word) => word.replace(/\s+/g, ""))
        .join(" ");
    }
    return match.replace(/\s+/g, "");
  });

  // 2. Also handle single initials like "M . " -> "M. " or "A . " -> "A. "
  result = result.replace(/\b([A-Z])\s+\.\s*/g, "$1. ");

  // 3. Clean up space before punctuation
  result = result.replace(/\s+([,.;:!?])/g, "$1");

  // 4. Normalize multiple spaces to single space within a line
  result = result.replace(/[ \t]{2,}/g, " ");

  return result.trim();
}

export interface RawPdfTextItem {
  str: string;
  dir?: string;
  width?: number;
  height?: number;
  transform?: number[];
  hasEOL?: boolean;
}

/**
 * Reconstructs 2D PDF text items into semantic lines, paragraphs, and list items.
 */
export function reconstructPdfPageText(rawItems: RawPdfTextItem[]): string {
  const valid = rawItems.filter(
    (item): item is Required<Pick<RawPdfTextItem, "str" | "transform">> & RawPdfTextItem =>
      Boolean(item && typeof item.str === "string" && Array.isArray(item.transform) && item.transform.length >= 6),
  );

  if (valid.length === 0) {
    return rawItems
      .map((item) => item?.str || "")
      .join(" ")
      .trim();
  }

  // Extract coordinates: transform[4] is X, transform[5] is Y
  const positioned = valid.map((item) => ({
    str: item.str,
    x: item.transform[4],
    y: item.transform[5],
    width: item.width || 0,
    height: item.height || Math.abs(item.transform[3]) || 10,
    hasEOL: Boolean(item.hasEOL),
  }));

  // Group into visual lines based on vertical Y proximity
  const lineTolerance = 3.5;
  const lineBuckets: Array<{
    y: number;
    height: number;
    hasEOL: boolean;
    items: Array<{ str: string; x: number; width: number; height: number }>;
  }> = [];

  // Sort from top to bottom (descending Y in PDF coordinates)
  positioned.sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > lineTolerance) return yDiff;
    return a.x - b.x;
  });

  for (const item of positioned) {
    const match = lineBuckets.find((line) => Math.abs(line.y - item.y) <= Math.max(item.height * 0.4, lineTolerance));
    if (match) {
      match.items.push(item);
      match.height = Math.max(match.height, item.height);
      if (item.hasEOL) match.hasEOL = true;
    } else {
      lineBuckets.push({
        y: item.y,
        height: item.height,
        hasEOL: item.hasEOL,
        items: [item],
      });
    }
  }

  // Sort lines from top of page to bottom
  lineBuckets.sort((a, b) => b.y - a.y);

  // Reconstruct text for each line
  const lines: Array<{ text: string; y: number; height: number; hasEOL: boolean }> = [];
  for (const bucket of lineBuckets) {
    bucket.items.sort((a, b) => a.x - b.x);

    let lineText = "";
    let prevX = -1;
    let prevWidth = 0;
    let prevHeight = bucket.height;

    for (const item of bucket.items) {
      if (!item.str) continue;

      if (prevX >= 0) {
        const gap = item.x - (prevX + prevWidth);
        // If there is an intentional gap between words
        if (gap > Math.max(1.2, prevHeight * 0.12)) {
          // Check if wide gap (word boundary)
          if (gap > prevHeight * 0.45) {
            if (!lineText.endsWith("  ")) lineText += "  ";
          } else if (!lineText.endsWith(" ") && !item.str.startsWith(" ")) {
            lineText += " ";
          }
        }
      }

      lineText += item.str;
      prevX = item.x;
      prevWidth = item.width;
      prevHeight = item.height;
    }

    const cleaned = collapseSpacedLetters(lineText.trim());
    if (cleaned) {
      lines.push({
        text: cleaned,
        y: bucket.y,
        height: bucket.height,
        hasEOL: bucket.hasEOL,
      });
    }
  }

  if (lines.length === 0) return "";

  // Assemble lines into paragraphs with proper sentence structure
  let result = "";
  for (let i = 0; i < lines.length; i++) {
    const current = lines[i];
    const prev = i > 0 ? lines[i - 1] : undefined;

    if (!prev) {
      result = current.text;
      continue;
    }

    const deltaY = prev.y - current.y;
    const avgHeight = (prev.height + current.height) / 2;

    const isHeadingOrList = /^(?:(?:[0-9IVXLCDM]+\.|\d+\)|\([0-9a-zA-Z]+\)|•|-|\*)\s+|Part\s+|Chapter\s+|Section\s+|Contents\b|Preface\b|List of\b|Editors['’]?\s+)/i.test(
      current.text,
    );
    const isPrevHeading = /^(?:Part\s+[0-9IVXLCDM]+|Chapter\s+\d+|Contents\b|Preface\b|List of\b|[0-9IVXLCDM]+\.\s+)/i.test(
      prev.text,
    );
    const isContributorOrAffiliation = /^[A-Z\s.,'-]+,\s+[A-Za-z\s]+/.test(current.text);
    const isBigGap = deltaY > avgHeight * 1.55;

    if (isBigGap || isHeadingOrList || isPrevHeading || isContributorOrAffiliation) {
      result += "\n\n" + current.text;
    } else {
      // Check for word hyphenation at line end (e.g. "psycho-", "perspec-")
      if (/[a-zA-Z]-$/.test(prev.text) && /^[a-zA-Z]/.test(current.text)) {
        result = result.slice(0, -1) + current.text;
      } else {
        result += "\n" + current.text;
      }
    }
  }

  return result.trim();
}

/**
 * Image placeholder token for Reflowable Book text streams.
 *
 * 使用 Private Use Area 的單一 code unit，讓 token 永遠不會被分頁切半，
 * 且在 Render Surface 中以 1 個字元對應 1 張圖片，
 * 完整保留 Highlight／Bookmark 依賴的 text offset。
 */
const IMAGE_TOKEN_BASE = 0xe000;
export const IMAGE_TOKEN_CAPACITY = 0x18ff;

export function imageToken(index: number): string | undefined {
  if (!Number.isInteger(index) || index < 0 || index >= IMAGE_TOKEN_CAPACITY) return undefined;
  return String.fromCharCode(IMAGE_TOKEN_BASE + index);
}

export function imageTokenIndex(character: string): number | undefined {
  if (character.length !== 1) return undefined;
  const index = character.charCodeAt(0) - IMAGE_TOKEN_BASE;
  return index >= 0 && index < IMAGE_TOKEN_CAPACITY ? index : undefined;
}

export interface StructuredDomTextOptions {
  /** 回傳圖片 token；回傳 undefined 表示該圖片不可用，維持原本純文字行為。 */
  onImage?: (element: Element) => string | undefined;
}

/** 抽取文字時記錄的來源語意位置，offset 以抽取結果的字元為單位。 */
export type DomTextMark =
  | { kind: "link"; href: string; start: number; end: number }
  | { kind: "anchor"; id: string; start: number };

export interface StructuredDomText {
  text: string;
  marks: DomTextMark[];
}

const EMPTY: StructuredDomText = { text: "", marks: [] };

function shiftMarks(marks: readonly DomTextMark[], delta: number): DomTextMark[] {
  if (delta === 0) return [...marks];
  return marks.map((mark) => mark.kind === "link"
    ? { ...mark, start: mark.start + delta, end: mark.end + delta }
    : { ...mark, start: mark.start + delta });
}

/** 依 trim 後的內容調整 mark；落在被裁掉範圍內的 mark 會被夾到有效區間。 */
function trimFragment(fragment: StructuredDomText, prefix: string, suffix: string): StructuredDomText {
  const lead = fragment.text.length - fragment.text.trimStart().length;
  const trimmed = fragment.text.trim();
  if (!trimmed) return EMPTY;
  const delta = prefix.length - lead;
  const min = prefix.length;
  const max = prefix.length + trimmed.length;
  const marks: DomTextMark[] = [];
  for (const mark of shiftMarks(fragment.marks, delta)) {
    if (mark.kind === "anchor") {
      if (mark.start >= min && mark.start <= max) marks.push(mark);
      continue;
    }
    const start = Math.max(min, mark.start);
    const end = Math.min(max, mark.end);
    if (start < end) marks.push({ ...mark, start, end });
  }
  return { text: prefix + trimmed + suffix, marks };
}

function joinFragments(parts: readonly StructuredDomText[]): StructuredDomText {
  let text = "";
  const marks: DomTextMark[] = [];
  for (const part of parts) {
    marks.push(...shiftMarks(part.marks, text.length));
    text += part.text;
  }
  return { text, marks };
}

/**
 * Recursively extracts structured text from an EPUB chapter DOM element,
 * maintaining paragraph breaks, headings, lists, tables, and typography.
 *
 * 同時回傳 link 與 id anchor 的位置，供 in-book 目錄連結與印刷頁碼使用。
 */
export function extractStructuredDom(node?: Node | null, options?: StructuredDomTextOptions): StructuredDomText {
  if (!node) return EMPTY;
  if (node.nodeType === Node.TEXT_NODE) {
    return { text: node.textContent?.replace(/[\t\r\n ]+/g, " ") ?? "", marks: [] };
  }

  if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_NODE) {
    return EMPTY;
  }

  const element = node as Element;
  const tag = element.tagName.toUpperCase();

  // Ignore script, style, and iframe elements
  if (["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "OBJECT"].includes(tag)) {
    return EMPTY;
  }

  if (tag === "BR") return { text: "\n", marks: [] };
  if (tag === "HR") return { text: "\n\n---\n\n", marks: [] };

  if (tag === "IMG" || tag === "IMAGE") {
    const token = options?.onImage?.(element);
    return token ? { text: "\n\n" + token + "\n\n", marks: [] } : EMPTY;
  }

  const id = element.getAttribute?.("id")?.trim();
  const href = tag === "A" ? element.getAttribute("href")?.trim() : undefined;

  const decorate = (fragment: StructuredDomText): StructuredDomText => {
    if (!href && !id) return fragment;
    const marks = [...fragment.marks];
    if (href && fragment.text.trim()) {
      marks.push({ kind: "link", href, start: 0, end: fragment.text.length });
    }
    if (id) marks.unshift({ kind: "anchor", id, start: 0 });
    return { text: fragment.text, marks };
  };

  if (tag === "OL" || tag === "UL") {
    const items = Array.from(element.children).filter((child) => child.tagName.toUpperCase() === "LI");
    if (items.length > 0) {
      const parts: StructuredDomText[] = [];
      let pageLabels: string[] = [];
      const flushPageLabels = () => {
        if (pageLabels.length === 0) return;
        parts.push({
          text: pageLabels.length > 1 ? "\n• " + pageLabels.join(" · ") : "\n• " + pageLabels[0],
          marks: [],
        });
        pageLabels = [];
      };
      for (const item of items) {
        const children: StructuredDomText[] = [];
        for (let child = item.firstChild; child !== null; child = child.nextSibling) {
          children.push(extractStructuredDom(child, options));
        }
        const itemFragment = joinFragments(children);
        const trimmed = itemFragment.text.trim();
        if (/^(?:[ivxlcdm]+|\d+)$/i.test(trimmed)) {
          pageLabels.push(trimmed);
        } else {
          flushPageLabels();
          if (trimmed) parts.push(trimFragment(itemFragment, "\n• ", ""));
        }
      }
      flushPageLabels();
      return decorate(joinFragments(parts));
    }
  }

  const children: StructuredDomText[] = [];
  for (let child = node.firstChild; child !== null; child = child.nextSibling) {
    children.push(extractStructuredDom(child, options));
  }
  const childrenFragment = joinFragments(children);

  if (["P", "DIV", "SECTION", "ARTICLE", "BLOCKQUOTE", "FIGURE", "FIGCAPTION"].includes(tag)) {
    return decorate(trimFragment(childrenFragment, "\n\n", "\n\n"));
  }

  if (["H1", "H2", "H3", "H4", "H5", "H6"].includes(tag)) {
    const raw = childrenFragment.text.trim();
    const collapsed = collapseSpacedLetters(raw);
    if (!collapsed) return EMPTY;
    // collapseSpacedLetters 只在真的改寫文字時才會讓 offset 失效，此時才丟棄標題內的 mark。
    if (collapsed === raw) return decorate(trimFragment(childrenFragment, "\n\n", "\n\n"));
    const marks: DomTextMark[] = id ? [{ kind: "anchor", id, start: 2 }] : [];
    return { text: "\n\n" + collapsed + "\n\n", marks };
  }

  if (tag === "LI") {
    return decorate(trimFragment(childrenFragment, "\n• ", ""));
  }

  if (tag === "TR") {
    return decorate(trimFragment(childrenFragment, "\n", ""));
  }

  if (["TD", "TH"].includes(tag)) {
    if (!childrenFragment.text.trim()) return { text: " ", marks: [] };
    return decorate(trimFragment(childrenFragment, "  ", "  "));
  }

  return decorate(childrenFragment);
}

export function extractStructuredDomText(node?: Node | null, options?: StructuredDomTextOptions): string {
  return extractStructuredDom(node, options).text;
}

/** cleanStructuredText 的字元保留決策，供 mark offset 重新對位使用。 */
function keptCharacters(raw: string): boolean[] {
  const kept = new Array<boolean>(raw.length).fill(true);

  // 1. 每行去除前後空白
  let lineStart = 0;
  for (let index = 0; index <= raw.length; index += 1) {
    if (index < raw.length && raw[index] !== "\n") continue;
    let start = lineStart;
    let end = index;
    while (start < end && /\s/.test(raw[start])) kept[start++] = false;
    while (end > start && /\s/.test(raw[end - 1])) kept[--end] = false;
    lineStart = index + 1;
  }

  // 2. 連續 3 個以上換行壓成 2 個
  let run = 0;
  for (let index = 0; index < raw.length; index += 1) {
    if (!kept[index]) continue;
    if (raw[index] === "\n") {
      run += 1;
      if (run > 2) kept[index] = false;
    } else {
      run = 0;
    }
  }

  // 3. 頭尾整體 trim
  for (let index = 0; index < raw.length; index += 1) {
    if (!kept[index]) continue;
    if (/\s/.test(raw[index])) kept[index] = false;
    else break;
  }
  for (let index = raw.length - 1; index >= 0; index -= 1) {
    if (!kept[index]) continue;
    if (/\s/.test(raw[index])) kept[index] = false;
    else break;
  }

  return kept;
}

export function cleanStructuredText(raw: string): string {
  if (!raw) return "";
  return raw
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** 與 cleanStructuredText 產生相同文字，並把 mark 重新對位到清理後的 offset。 */
export function cleanStructuredDom(fragment: StructuredDomText): StructuredDomText {
  const raw = fragment.text;
  if (!raw) return EMPTY;
  const kept = keptCharacters(raw);

  let text = "";
  const map = new Array<number>(raw.length + 1);
  for (let index = 0; index < raw.length; index += 1) {
    map[index] = text.length;
    if (kept[index]) text += raw[index];
  }
  map[raw.length] = text.length;
  const at = (value: number) => map[Math.min(Math.max(value, 0), raw.length)];

  const marks: DomTextMark[] = [];
  for (const mark of fragment.marks) {
    if (mark.kind === "anchor") {
      marks.push({ ...mark, start: at(mark.start) });
      continue;
    }
    const start = at(mark.start);
    const end = at(mark.end);
    if (start < end) marks.push({ ...mark, start, end });
  }

  return { text, marks };
}
