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
import { renderTextSurface } from "../text-render-surface";

const TXT_LOCATION_CODEC = { namespace: "txt-offset", version: 1 } as const;
const TXT_RANGE_CODEC = { namespace: "txt-range", version: 1 } as const;

interface TxtAdapterOptions {
  pageSize?: number;
}

function aborted(): Result<never> {
  return {
    ok: false,
    error: { code: "aborted", message: "操作已取消。" },
  };
}

function failure(code: AdapterFailure["code"], message: string): Result<never> {
  return { ok: false, error: { code, message } };
}

function location(offset: number, length: number): LogicalLocation {
  return {
    kind: "logical-location",
    format: "txt",
    codec: TXT_LOCATION_CODEC,
    payload: { offset },
    progression: length === 0 ? 0 : Math.min(1, offset / length),
  };
}

function isJsonObject(
  value: JsonValue,
): value is { readonly [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readOffset(value: LogicalLocation): number | undefined {
  if (
    value.format !== "txt" ||
    value.codec.namespace !== TXT_LOCATION_CODEC.namespace ||
    !isJsonObject(value.payload)
  ) {
    return undefined;
  }

  const offset = value.payload.offset;
  return typeof offset === "number" && Number.isInteger(offset) ? offset : undefined;
}

function findHeadings(text: string): Array<{ label: string; offset: number }> {
  const headings: Array<{ label: string; offset: number }> = [];
  const pattern = /^(?:第\s*[0-9０-９一二三四五六七八九十百千]+\s*[章篇卷回節].*|Chapter\s+\d+.*)$/gimu;

  for (const match of text.matchAll(pattern)) {
    headings.push({ label: match[0].trim(), offset: match.index });
  }

  return headings;
}

export class TxtFormatAdapter implements FormatAdapter {
  private readonly pageSize: number;

  constructor(options: TxtAdapterOptions = {}) {
    this.pageSize = options.pageSize ?? 1_200;
  }

  async probe(source: UntrustedBookSource, task: TaskContext): Promise<ProbeResult> {
    if (task.signal.aborted) return { match: false };
    const extensionMatches = source.fileName.toLocaleLowerCase().endsWith(".txt");
    const mimeMatches = source.declaredMediaType === "text/plain";
    return { match: extensionMatches || mimeMatches, format: "txt" };
  }

  async open(
    source: UntrustedBookSource,
    task: TaskContext,
  ): Promise<Result<ReaderSession>> {
    if (task.signal.aborted) return aborted();
    if (source.bytes.size > source.limits.maxBytes) {
      return failure("resource-limit", "TXT 檔案超過允許大小。");
    }

    const text = (await source.bytes.text()).replace(/\r\n?/g, "\n");
    if (task.signal.aborted) return aborted();
    return {
      ok: true,
      value: new TxtReaderSession(source.fileName, text, this.pageSize),
    };
  }
}

class TxtReaderSession implements ReaderSession {
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
  private readonly listeners = new Set<(event: ReaderEvent) => void>();

  constructor(
    fileName: string,
    private readonly text: string,
    private pageSize: number,
  ) {
    this.metadata = {
      title: fileName.replace(/\.txt$/i, ""),
      authors: [] as string[],
    };
  }

  snapshot(): ReaderSnapshot {
    const safeOffset = Math.min(this.offset, Math.max(0, this.text.length - 1));
    const excerpt = this.text.slice(safeOffset, safeOffset + this.pageSize);
    return {
      location: location(safeOffset, this.text.length),
      label: `${Math.floor(safeOffset / this.pageSize) + 1} / ${Math.max(1, Math.ceil(this.text.length / this.pageSize))}`,
      excerpt,
      progress: this.text.length === 0 ? 0 : safeOffset / this.text.length,
      canGoPrevious: safeOffset > 0,
      canGoNext: safeOffset + this.pageSize < this.text.length,
    };
  }

  async renderCurrent(host: ReaderRenderHost, task: TaskContext): Promise<Result<void>> {
    const unavailable = this.ensureAvailable(task);
    if (unavailable) return unavailable;
    this.renderCleanup?.();
    const snapshot = this.snapshot();
    this.renderCleanup = renderTextSurface({
      format: "txt",
      text: snapshot.excerpt,
      absoluteOffset: this.offset,
      decorations: this.decorations,
      host,
    });
    return { ok: true, value: undefined };
  }

  async navigate(
    target: NavigationTarget,
    task: TaskContext,
  ): Promise<Result<ReaderSnapshot>> {
    const unavailable = this.ensureAvailable(task);
    if (unavailable) return unavailable;

    if (target.kind === "next") {
      this.offset = Math.min(this.text.length, this.offset + this.pageSize);
    } else if (target.kind === "previous") {
      this.offset = Math.max(0, this.offset - this.pageSize);
    } else {
      const targetOffset = readOffset(target.location);
      if (targetOffset === undefined || targetOffset < 0 || targetOffset > this.text.length) {
        return failure("stale-reference", "無法解析 TXT 閱讀位置。");
      }
      this.offset = targetOffset;
    }

    const snapshot = this.snapshot();
    this.emit({ type: "position-changed", snapshot });
    return { ok: true, value: snapshot };
  }

  async search(
    query: SearchQuery,
    task: TaskContext,
  ): Promise<Result<readonly SearchHit[]>> {
    const unavailable = this.ensureAvailable(task);
    if (unavailable) return unavailable;
    const needle = query.text.trim();
    if (!needle) return { ok: true, value: [] };

    const hits: SearchHit[] = [];
    const limit = Math.max(1, query.limit ?? 100);
    let index = 0;
    while (hits.length < limit) {
      if (task.signal.aborted) return aborted();
      const found = this.text.indexOf(needle, index);
      if (found < 0) break;
      hits.push({
        id: `txt-hit-${found}`,
        excerpt: this.text.slice(Math.max(0, found - 16), found + needle.length + 28),
        location: location(found, this.text.length),
      });
      index = found + Math.max(1, needle.length);
    }
    return { ok: true, value: hits };
  }

  async outline(task: TaskContext): Promise<Result<readonly OutlineItem[]>> {
    const unavailable = this.ensureAvailable(task);
    if (unavailable) return unavailable;
    const headings = findHeadings(this.text);
    if (headings.length === 0) {
      return {
        ok: true,
        value: [
          {
            id: "txt-outline-content",
            label: "全文",
            location: location(0, this.text.length),
            children: [],
          },
        ],
      };
    }
    return {
      ok: true,
      value: headings.map((heading) => ({
        id: `txt-outline-${heading.offset}`,
        label: heading.label,
        location: location(heading.offset, this.text.length),
        children: [],
        pageLabel: `${Math.floor(heading.offset / this.pageSize) + 1} / ${Math.max(1, Math.ceil(this.text.length / this.pageSize))}`,
      })),
    };
  }

  async capturePoint(
    target: LogicalLocation,
    task: TaskContext,
  ): Promise<Result<PointAnchor>> {
    const unavailable = this.ensureAvailable(task);
    if (unavailable) return unavailable;
    const targetOffset = readOffset(target);
    if (targetOffset === undefined) {
      return failure("stale-reference", "無法建立 TXT Bookmark。");
    }
    return {
      ok: true,
      value: {
        kind: "persisted-anchor",
        anchorKind: "point",
        format: "txt",
        codec: TXT_LOCATION_CODEC,
        payload: { offset: targetOffset },
        fallback: { progression: target.progression },
      },
    };
  }

  async captureRange(
    selection: SelectionToken,
    task: TaskContext,
  ): Promise<Result<RangeAnchor>> {
    const unavailable = this.ensureAvailable(task);
    if (unavailable) return unavailable;
    const match = /^txt:(\d+):(\d+)$/.exec(selection.token);
    if (!match) return failure("stale-reference", "文字選取已失效。");
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (this.text.slice(start, end) !== selection.text) {
      return failure("stale-reference", "文字選取已失效。");
    }
    return {
      ok: true,
      value: {
        kind: "persisted-anchor",
        anchorKind: "range",
        format: "txt",
        codec: TXT_RANGE_CODEC,
        payload: { start, end },
        fallback: {
          progression: this.text.length === 0 ? 0 : start / this.text.length,
          exactQuote: selection.text,
          prefix: this.text.slice(Math.max(0, start - 24), start),
          suffix: this.text.slice(end, end + 24),
        },
      },
    };
  }

  async resolve(
    anchor: PersistedAnchor,
    task: TaskContext,
  ): Promise<Result<AnchorResolution>> {
    const unavailable = this.ensureAvailable(task);
    if (unavailable) return unavailable;
    if (anchor.format !== "txt") {
      return { ok: true, value: { status: "orphaned" } };
    }

    const payload = anchor.payload;
    if (!isJsonObject(payload)) {
      return { ok: true, value: { status: "orphaned" } };
    }
    const rawOffset = anchor.anchorKind === "point" ? payload.offset : payload.start;
    if (typeof rawOffset !== "number" || rawOffset < 0 || rawOffset > this.text.length) {
      return { ok: true, value: { status: "orphaned" } };
    }
    return {
      ok: true,
      value: {
        status: "exact",
        location: location(rawOffset, this.text.length),
      },
    };
  }

  async setPresentation(
    settings: PresentationSettings,
    task: TaskContext,
  ): Promise<Result<ReaderSnapshot>> {
    const unavailable = this.ensureAvailable(task);
    if (unavailable) return unavailable;
    if (settings.kind !== "reflowable") {
      return failure("unsupported-format", "TXT 不支援 fixed-layout 設定。");
    }
    return { ok: true, value: this.snapshot() };
  }

  async setDecorations(
    items: readonly ReaderDecoration[],
    task: TaskContext,
  ): Promise<Result<void>> {
    const unavailable = this.ensureAvailable(task);
    if (unavailable) return unavailable;
    this.decorations = items;
    return { ok: true, value: undefined };
  }

  subscribe(listener: (event: ReaderEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async close(): Promise<void> {
    this.closed = true;
    this.renderCleanup?.();
    this.renderCleanup = undefined;
    this.listeners.clear();
    this.decorations = [];
  }

  private emit(event: ReaderEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  private ensureAvailable(task: TaskContext): Result<never> | undefined {
    if (task.signal.aborted) return aborted();
    if (this.closed) return failure("internal", "ReaderSession 已關閉。");
    return undefined;
  }
}
