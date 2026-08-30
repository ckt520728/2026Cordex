---
status: accepted
reviewed: 2026-08-29
---

# FormatAdapter interface options

本文件依 `design-an-interface` 產生三種顯著不同的 public interface，再提出 synthesis。所有方案共同隱藏 EPUB CFI、TXT offset、PDF page/text coordinates、renderer engine、sanitization、worker 與 pagination internals。

## Design 1：Minimal request envelope

```ts
interface FormatAdapter {
  open(options: OpenOptions): Promise<ReaderSession>;
}

interface ReaderSession {
  request<K extends keyof OperationMap>(
    request: { type: K } & OperationMap[K]["input"],
  ): Promise<OperationMap[K]["output"]>;
  subscribe(listener: (event: ReaderEvent) => void): () => void;
}
```

只有 `open`、`request`、`subscribe`，介面很深，適合日後映射到 Worker message protocol。缺點是常見 reader flow 需要組裝 command envelope，API discoverability 較差，所有行為聚集在大型 `OperationMap`。

## Design 2：Capability-driven ports

```ts
interface PublicationSession<F extends PublicationFormat> {
  metadata: PublicationMetadata;
  presentation: PresentationProfile;
  capabilities: {
    outline: Capability<OutlinePort<F>>;
    search: Capability<SearchPort<F>>;
    pagination: Capability<PaginationPort<F>>;
    pointAnchors: Capability<AnchorPort<F, "point">>;
    rangeAnchors: Capability<AnchorPort<F, "range">>;
  };
  createView(...): Promise<Result<ReaderView<F>>>;
  close(): Promise<void>;
}
```

每一本 Book 都能精確回報 available／degraded／unavailable，並完整支援 cancellation、progress、streaming search、versioned anchors 與 future formats。缺點是 public surface 大、common-case 呼叫冗長，UI 容易被迫理解太多 ports。

## Design 3：Common-case ReaderSession

```ts
interface FormatAdapter {
  open(request: OpenBookRequest): Promise<ReaderSession>;
}

interface ReaderSession {
  renderCurrent(): Promise<ReaderSnapshot>;
  next(): Promise<ReaderSnapshot>;
  previous(): Promise<ReaderSnapshot>;
  goTo(location: LogicalLocation): Promise<ReaderSnapshot>;
  search(query: string, options?: SearchOptions): Promise<readonly SearchHit[]>;
  getOutline(): Promise<readonly OutlineItem[]>;
  highlight(selection: SelectionToken, color: HighlightColor): Promise<HighlightRecord>;
  setAppearance(patch: Partial<ReaderAppearance>): Promise<ReaderSnapshot>;
  close(): Promise<void>;
}
```

open → render → next/search/jump/highlight 的呼叫最直覺，UI 不需知道格式。缺點是若只靠 boolean capabilities，難以表達 PDF 無 Text Layer 等降級原因；failure 與 anchor migration 也需補強。

## Recommended synthesis

採用 **capability-aware ReaderSession**：

```ts
interface FormatAdapter {
  probe(source: UntrustedBookSource, task: TaskContext): Promise<ProbeResult>;
  open(source: UntrustedBookSource, task: TaskContext): Promise<Result<ReaderSession>>;
}

interface ReaderSession {
  readonly metadata: PublicationMetadata;
  readonly capabilities: ReaderCapabilities;

  snapshot(): ReaderSnapshot;
  navigate(target: NavigationTarget, task: TaskContext): Promise<Result<ReaderSnapshot>>;
  search(query: SearchQuery, task: TaskContext): Promise<Result<readonly SearchHit[]>>;
  outline(task: TaskContext): Promise<Result<readonly OutlineItem[]>>;
  capturePoint(location: LogicalLocation, task: TaskContext): Promise<Result<PointAnchor>>;
  captureRange(selection: SelectionToken, task: TaskContext): Promise<Result<RangeAnchor>>;
  resolve(anchor: PersistedAnchor, task: TaskContext): Promise<Result<AnchorResolution>>;
  setPresentation(settings: PresentationSettings, task: TaskContext): Promise<Result<ReaderSnapshot>>;
  setDecorations(items: readonly ReaderDecoration[], task: TaskContext): Promise<Result<void>>;
  subscribe(listener: (event: ReaderEvent) => void): () => void;
  close(): Promise<void>;
}
```

### Why

- 具名方法讓常見 flow 容易發現、容易測試，避免 generic request misuse。
- `ReaderCapabilities` 使用 discriminated unions 表達 available／degraded／unavailable 與原因，但不把 services 拆成多層 ports。
- `LogicalLocation` 與 persisted anchors 為 versioned、JSON-serializable、opaque；UI 不接觸 CFI／offset／PDF coordinates。
- 所有可能耗時操作接受 `TaskContext`（AbortSignal、progress），但簡單 snapshot 保持同步。
- adapter 只處理 format/rendering/anchors；Library、Bookmark/Highlight persistence、backup、external navigation 留在 app services。

## Evaluation

Minimal envelope 的方法數最少，但一個 generic `request()` 隱藏了太多合法與非法組合；對本專案的 TypeScript UI 不如具名方法安全。Capability ports 最能容納 future formats，卻使 v1 UI 承擔過多 orchestration。Common-case session 最符合 Reader 操作路徑，但需要補上精確 degradation、cancellation 與 anchor versioning。

Recommended synthesis 保持單一 session 的低認知成本，同時把最容易造成資料錯位與 iOS 卡頓的部分——capability、opaque anchors、cancellation——提升為 public contract。它比第 2 案少一層 ports，也比第 1 案更難誤用。
