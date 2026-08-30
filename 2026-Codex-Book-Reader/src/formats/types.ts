import type { BookFormat } from "../domain/library";

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export interface CodecIdentity {
  namespace: string;
  version: number;
}

export interface LogicalLocation {
  kind: "logical-location";
  format: BookFormat;
  codec: CodecIdentity;
  payload: JsonValue;
  progression: number;
}

export interface PointAnchor {
  kind: "persisted-anchor";
  anchorKind: "point";
  format: BookFormat;
  codec: CodecIdentity;
  payload: JsonValue;
  fallback: {
    progression: number;
    prefix?: string;
    suffix?: string;
  };
}

export interface RangeAnchor {
  kind: "persisted-anchor";
  anchorKind: "range";
  format: BookFormat;
  codec: CodecIdentity;
  payload: JsonValue;
  fallback: {
    progression: number;
    exactQuote: string;
    prefix?: string;
    suffix?: string;
  };
}

export type PersistedAnchor = PointAnchor | RangeAnchor;

export interface TaskProgress {
  stage: string;
  completed?: number;
  total?: number;
}

export interface TaskContext {
  signal: AbortSignal;
  reportProgress?: (progress: TaskProgress) => void;
}

export type AdapterFailureCode =
  | "aborted"
  | "unsupported-format"
  | "corrupt-publication"
  | "security-rejection"
  | "resource-limit"
  | "stale-reference"
  | "internal";

export interface AdapterFailure {
  code: AdapterFailureCode;
  message: string;
}

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: AdapterFailure };

export interface PublicationMetadata {
  title: string;
  authors: readonly string[];
  language?: string;
  cover?: Blob;
}

export type Capability =
  | { support: "available" }
  | { support: "degraded"; limitations: readonly string[] }
  | {
      support: "unavailable";
      reason:
        | "format-does-not-support"
        | "document-has-no-text-layer"
        | "document-has-no-outline"
        | "security-policy"
        | "adapter-limitation";
    };

export interface ReaderCapabilities {
  search: Capability;
  highlight: Capability;
  outline: Capability;
  typography: Capability;
  pageModel: "reflowable" | "document-pages";
}

export interface ReaderSnapshot {
  location: LogicalLocation;
  label: string;
  excerpt: string;
  progress: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export type NavigationTarget =
  | { kind: "next" }
  | { kind: "previous" }
  | { kind: "location"; location: LogicalLocation };

export interface SearchQuery {
  text: string;
  limit?: number;
}

export interface SearchHit {
  id: string;
  excerpt: string;
  location: LogicalLocation;
}

export interface OutlineItem {
  id: string;
  label: string;
  location: LogicalLocation;
  children: readonly OutlineItem[];
  /**
   * 顯示用頁碼。Fixed-layout Book 為實際頁次；Reflowable Book 優先使用書中自帶的
   * 印刷頁碼 anchor，沒有時才回退為目前排版下的 Rendered Page 序號。
   */
  pageLabel?: string;
}

export interface SelectionToken {
  token: string;
  text: string;
}

export interface ReaderRenderHost {
  element: HTMLElement;
  onSelectionChange(selection: SelectionToken | null): void;
  /** Book 內部連結（例如書中的 Contents 頁）被點擊時要求導覽。 */
  onInternalLink?(location: LogicalLocation): void;
}

export interface AnchorResolution {
  status: "exact" | "recovered" | "orphaned";
  location?: LogicalLocation;
  strategy?: "quote" | "context" | "progression";
}

export interface PresentationSettings {
  kind: "reflowable" | "fixed-layout";
  theme: "light" | "sepia" | "dark";
  fontFamily?: "system-sans" | "system-serif";
  fontSizePx?: number;
  lineHeight?: number;
  zoom?: number;
}

export type ReaderDecoration =
  | { kind: "bookmark"; id: string; anchor: PointAnchor }
  | {
      kind: "highlight";
      id: string;
      color: "yellow" | "green" | "blue" | "pink";
      anchor: RangeAnchor;
    };

export type ReaderEvent =
  | { type: "position-changed"; snapshot: ReaderSnapshot }
  | { type: "selection-changed"; selection: SelectionToken | null }
  | { type: "external-link-requested"; url: string }
  | { type: "failure"; error: AdapterFailure };

export interface UntrustedBookSource {
  fileName: string;
  declaredMediaType?: string;
  bytes: Blob;
  limits: {
    maxBytes: number;
    maxExpandedBytes: number;
    maxResourceCount: number;
  };
}

export interface ProbeResult {
  match: boolean;
  format?: BookFormat;
}

export interface ReaderSession {
  readonly metadata: PublicationMetadata;
  readonly capabilities: ReaderCapabilities;

  snapshot(): ReaderSnapshot;
  renderCurrent(host: ReaderRenderHost, task: TaskContext): Promise<Result<void>>;
  navigate(target: NavigationTarget, task: TaskContext): Promise<Result<ReaderSnapshot>>;
  search(query: SearchQuery, task: TaskContext): Promise<Result<readonly SearchHit[]>>;
  outline(task: TaskContext): Promise<Result<readonly OutlineItem[]>>;
  capturePoint(location: LogicalLocation, task: TaskContext): Promise<Result<PointAnchor>>;
  captureRange(selection: SelectionToken, task: TaskContext): Promise<Result<RangeAnchor>>;
  resolve(anchor: PersistedAnchor, task: TaskContext): Promise<Result<AnchorResolution>>;
  setPresentation(
    settings: PresentationSettings,
    task: TaskContext,
  ): Promise<Result<ReaderSnapshot>>;
  setDecorations(
    items: readonly ReaderDecoration[],
    task: TaskContext,
  ): Promise<Result<void>>;
  subscribe(listener: (event: ReaderEvent) => void): () => void;
  close(): Promise<void>;
}

export interface FormatAdapter {
  probe(source: UntrustedBookSource, task: TaskContext): Promise<ProbeResult>;
  open(source: UntrustedBookSource, task: TaskContext): Promise<Result<ReaderSession>>;
}
