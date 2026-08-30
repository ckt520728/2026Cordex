import { useEffect, useRef, useState } from "react";

import { googleAiModeUrl, webSearchUrl } from "../application/external-lookup";
import { markBookOpened, type BookRecord } from "../domain/library";
import { EpubFormatAdapter } from "../formats/epub/epub-adapter";
import { PdfFormatAdapter } from "../formats/pdf/pdf-adapter";
import { TxtFormatAdapter } from "../formats/txt/txt-adapter";
import type {
  FormatAdapter,
  LogicalLocation,
  OutlineItem,
  PersistedAnchor,
  ReaderDecoration,
  ReaderSession,
  ReaderSnapshot,
  SearchHit,
  SelectionToken,
} from "../formats/types";
import type { BookFileStore } from "../storage/book-file-store";
import type {
  BookmarkRecord,
  HighlightRecord,
  LibraryRepository,
} from "../storage/library-repository";

type ReaderPanel = "outline" | "search" | "bookmarks" | "highlights" | "appearance";
type HighlightColor = HighlightRecord["color"];

interface ReaderScreenProps {
  book: BookRecord;
  fileStore: BookFileStore;
  repository: LibraryRepository;
  onBookUpdated: (book: BookRecord) => Promise<void>;
  onClose: () => void;
}

function task() {
  return { signal: new AbortController().signal };
}

function adapterFor(book: BookRecord): FormatAdapter {
  if (book.format === "txt") return new TxtFormatAdapter();
  if (book.format === "epub") return new EpubFormatAdapter();
  return new PdfFormatAdapter();
}

function anchorKey(anchor: PersistedAnchor): string {
  return `${anchor.format}:${anchor.codec.namespace}:${JSON.stringify(anchor.payload)}`;
}

function highlightDecorations(items: readonly HighlightRecord[]): ReaderDecoration[] {
  return items.map((item) => ({
    kind: "highlight",
    id: item.id,
    color: item.color,
    anchor: item.anchor,
  }));
}

export function ReaderScreen({
  book,
  fileStore,
  repository,
  onBookUpdated,
  onClose,
}: ReaderScreenProps) {
  const sessionRef = useRef<ReaderSession | undefined>(undefined);
  const renderHostRef = useRef<HTMLElement | null>(null);
  const currentBookRef = useRef(book);
  const touchStartRef = useRef<number | undefined>(undefined);
  const [snapshot, setSnapshot] = useState<ReaderSnapshot>();
  const [message, setMessage] = useState("正在開啟書籍…");
  const [panel, setPanel] = useState<ReaderPanel>();
  const [outline, setOutline] = useState<readonly OutlineItem[]>([]);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<readonly SearchHit[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [highlights, setHighlights] = useState<HighlightRecord[]>([]);
  const [selection, setSelection] = useState<SelectionToken | null>(null);
  const [fontSize, setFontSize] = useState(19);
  const [lineHeight, setLineHeight] = useState(1.9);
  const [fontFamily, setFontFamily] = useState<"system-serif" | "system-sans">("system-serif");
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function openBook() {
      const bytes = await fileStore.read(book.id);
      if (!active || controller.signal.aborted) return;
      if (!bytes) {
        setMessage("找不到這本書的原始檔案。");
        return;
      }

      const [storedBookmarks, storedHighlights] = await Promise.all([
        repository.listBookmarks(book.id),
        repository.listHighlights(book.id),
      ]);
      if (!active) return;
      setBookmarks(storedBookmarks);
      setHighlights(storedHighlights);

      const result = await adapterFor(book).open(
        {
          fileName: book.fileName,
          declaredMediaType: bytes.type,
          bytes,
          limits: {
            maxBytes: 100 * 1024 * 1024,
            maxExpandedBytes: 500 * 1024 * 1024,
            maxResourceCount: 10_000,
          },
        },
        { signal: controller.signal },
      );
      if (!active || controller.signal.aborted) return;
      if (!result.ok) {
        setMessage(result.error.message.trim());
        return;
      }

      sessionRef.current = result.value;
      await result.value.setDecorations(highlightDecorations(storedHighlights), { signal: controller.signal });
      let initial = result.value.snapshot();
      if (book.lastLocation) {
        const resumed = await result.value.navigate(
          { kind: "location", location: book.lastLocation },
          { signal: controller.signal },
        );
        if (resumed.ok) initial = resumed.value;
      }
      setSnapshot(initial);
      setMessage("");
      const opened = markBookOpened(book);
      currentBookRef.current = opened;
      await onBookUpdated(opened);
    }

    void openBook().catch((error: unknown) => {
      if (active) setMessage(error instanceof Error ? error.message : "無法開啟書籍。");
    });

    return () => {
      active = false;
      controller.abort();
      const session = sessionRef.current;
      sessionRef.current = undefined;
      if (session) void session.close();
    };
  }, [book, fileStore, onBookUpdated, repository]);

  useEffect(() => {
    const session = sessionRef.current;
    const element = renderHostRef.current;
    if (!session || !element || !snapshot || message) return;
    const controller = new AbortController();
    let active = true;
    void session.renderCurrent(
      {
        element,
        onSelectionChange: (nextSelection) => {
          if (active) setSelection(nextSelection);
        },
        onInternalLink: (location) => {
          if (active) void jumpToLocation(location);
        },
      },
      { signal: controller.signal },
    ).then((result) => {
      if (active && !result.ok) setMessage(result.error.message.trim());
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [fontFamily, fontSize, highlights, lineHeight, message, snapshot, zoom]);

  async function persistPosition(next: ReaderSnapshot) {
    const updated: BookRecord = {
      ...currentBookRef.current,
      progress: next.progress,
      lastLocation: next.location,
      readingState: next.canGoNext ? "reading" : "finished",
    };
    currentBookRef.current = updated;
    await onBookUpdated(updated);
  }

  async function go(target: "previous" | "next" | LogicalLocation) {
    const session = sessionRef.current;
    if (!session) return;
    const result = await session.navigate(
      typeof target === "string" ? { kind: target } : { kind: "location", location: target },
      task(),
    );
    if (!result.ok) {
      setMessage(result.error.message.trim());
      return;
    }
    setSnapshot(result.value);
    setSelection(null);
    await persistPosition(result.value);
  }

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") void go("previous");
      if (event.key === "ArrowRight") void go("next");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  async function openPanel(nextPanel: ReaderPanel) {
    setPanel((current) => current === nextPanel ? undefined : nextPanel);
    const session = sessionRef.current;
    if (!session) return;
    if (nextPanel === "outline") {
      const result = await session.outline(task());
      if (result.ok) setOutline(result.value);
    }
  }

  async function searchBook() {
    const session = sessionRef.current;
    if (!session) return;
    const result = await session.search({ text: query, limit: 100 }, task());
    if (result.ok) setHits(result.value);
    else setMessage(result.error.message.trim());
  }

  async function toggleBookmark() {
    const session = sessionRef.current;
    if (!session || !snapshot) return;
    const captured = await session.capturePoint(snapshot.location, task());
    if (!captured.ok) return setMessage(captured.error.message.trim());
    const existing = bookmarks.find((item) => anchorKey(item.anchor) === anchorKey(captured.value));
    if (existing) {
      await repository.removeBookmark(existing.id);
      setBookmarks((items) => items.filter((item) => item.id !== existing.id));
      return;
    }
    const bookmark: BookmarkRecord = {
      id: crypto.randomUUID(),
      bookId: book.id,
      label: `位置 ${snapshot.label}`,
      anchor: captured.value,
      createdAt: new Date().toISOString(),
    };
    await repository.saveBookmark(bookmark);
    setBookmarks((items) => [...items, bookmark]);
  }

  const [returnLocation, setReturnLocation] = useState<{ location: LogicalLocation; label: string } | undefined>(undefined);

  async function jumpToLocation(targetLocation: LogicalLocation) {
    if (snapshot) {
      setReturnLocation({
        location: snapshot.location,
        label: snapshot.label,
      });
    }
    setPanel(undefined);
    await go(targetLocation);
  }

  async function returnToOriginalPage() {
    if (!returnLocation) return;
    const target = returnLocation.location;
    setReturnLocation(undefined);
    await go(target);
  }

  async function jumpToAnchor(anchor: PersistedAnchor) {
    const session = sessionRef.current;
    if (!session) return;
    const resolved = await session.resolve(anchor, task());
    if (resolved.ok && resolved.value.location) {
      await jumpToLocation(resolved.value.location);
    }
  }

  async function highlightSelection(color: HighlightColor) {
    const session = sessionRef.current;
    if (!session || !selection) return;
    const captured = await session.captureRange(selection, task());
    if (!captured.ok) return setMessage(captured.error.message.trim());
    const highlight: HighlightRecord = {
      id: crypto.randomUUID(),
      bookId: book.id,
      quote: selection.text,
      color,
      anchor: captured.value,
      createdAt: new Date().toISOString(),
    };
    await repository.saveHighlight(highlight);
    const nextHighlights = [...highlights, highlight];
    await session.setDecorations(highlightDecorations(nextHighlights), task());
    setHighlights(nextHighlights);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }

  async function removeHighlight(id: string) {
    const session = sessionRef.current;
    await repository.removeHighlight(id);
    const nextHighlights = highlights.filter((item) => item.id !== id);
    if (session) await session.setDecorations(highlightDecorations(nextHighlights), task());
    setHighlights(nextHighlights);
  }

  async function updateAppearance(next: { fontSize?: number; lineHeight?: number; fontFamily?: "system-serif" | "system-sans" }) {
    const session = sessionRef.current;
    if (!session) return;
    const nextFontSize = next.fontSize ?? fontSize;
    const nextLineHeight = next.lineHeight ?? lineHeight;
    const nextFamily = next.fontFamily ?? fontFamily;
    setFontSize(nextFontSize);
    setLineHeight(nextLineHeight);
    setFontFamily(nextFamily);
    const result = await session.setPresentation(
      { kind: "reflowable", theme: "light", fontSizePx: nextFontSize, lineHeight: nextLineHeight, fontFamily: nextFamily },
      task(),
    );
    if (result.ok) setSnapshot(result.value);
  }

  async function updateZoom(nextZoom: number) {
    const session = sessionRef.current;
    if (!session) return;
    setZoom(nextZoom);
    const result = await session.setPresentation(
      { kind: "fixed-layout", theme: "light", zoom: nextZoom },
      task(),
    );
    if (result.ok) setSnapshot(result.value);
  }

  const currentBookmark = snapshot && bookmarks.some((item) =>
    anchorKey(item.anchor) === `${snapshot.location.format}:${snapshot.location.codec.namespace}:${JSON.stringify(snapshot.location.payload)}`,
  );
  const capability = sessionRef.current?.capabilities;

  return (
    <main className="reader-screen">
      <header className="reader-toolbar">
        <button onClick={onClose} type="button">返回書庫</button>
        <div>
          <p className="eyebrow">NOW READING</p>
          <h1>{book.title}</h1>
        </div>
        <span aria-label={`閱讀進度 ${Math.round((snapshot?.progress ?? book.progress) * 100)}%`} className="reader-progress-value">
          {Math.round((snapshot?.progress ?? book.progress) * 100)}%
        </span>
      </header>

      <nav className="reader-feature-bar" aria-label="閱讀工具">
        <button onClick={() => void openPanel("outline")} type="button">目錄</button>
        <button disabled={capability?.search.support === "unavailable"} onClick={() => void openPanel("search")} type="button">搜尋</button>
        <button aria-pressed={Boolean(currentBookmark)} onClick={() => void toggleBookmark()} type="button">{currentBookmark ? "已加書籤" : "書籤"}</button>
        <button onClick={() => void openPanel("bookmarks")} type="button">書籤清單</button>
        <button onClick={() => void openPanel("highlights")} type="button">Highlights</button>
        <button onClick={() => void openPanel("appearance")} type="button">{book.format === "pdf" ? "縮放" : "字體"}</button>
      </nav>

      <div className="reader-workspace">
        {message ? (
          <p className="reader-message" role="status">{message}</p>
        ) : (
          <article
            ref={renderHostRef}
            className={`reader-page ${book.format === "pdf" ? "pdf-reader-page" : ""}`}
            aria-label="閱讀文字"
            onTouchEnd={(event) => {
              const start = touchStartRef.current;
              const end = event.changedTouches[0]?.clientX;
              if (start !== undefined && end !== undefined && Math.abs(end - start) > 60) void go(end < start ? "next" : "previous");
            }}
            onTouchStart={(event) => { touchStartRef.current = event.touches[0]?.clientX; }}
            style={{
              fontFamily: fontFamily === "system-serif" ? "ui-serif, 'Songti TC', 'Noto Serif TC', serif" : "ui-sans-serif, -apple-system, system-ui, sans-serif",
              fontSize: `${fontSize}px`,
              lineHeight,
            }}
          />
        )}

        {panel && (
          <aside className="reader-panel" aria-label="閱讀功能面板">
            <header><h2>{panel === "appearance" && book.format === "pdf" ? "PDF 縮放" : ({ outline: "目錄", search: "書內搜尋", bookmarks: "書籤", highlights: "Highlights", appearance: "閱讀外觀" } as const)[panel]}</h2><button onClick={() => setPanel(undefined)} type="button">關閉</button></header>
            {panel === "outline" && <ul>{outline.map((item) => <li key={item.id}><button onClick={() => void jumpToLocation(item.location)} type="button"><span className="outline-label">{item.label}</span>{item.pageLabel && <span className="outline-page">{item.pageLabel}</span>}</button></li>)}</ul>}
            {panel === "search" && <><form onSubmit={(event) => { event.preventDefault(); void searchBook(); }}><input aria-label="搜尋目前書籍" onChange={(event) => setQuery(event.target.value)} type="search" value={query}/><button type="submit">搜尋</button></form><ul>{hits.map((hit) => <li key={hit.id}><button onClick={() => void jumpToLocation(hit.location)} type="button">{hit.excerpt}</button></li>)}</ul></>}
            {panel === "bookmarks" && <ul>{bookmarks.map((item) => <li key={item.id}><button onClick={() => void jumpToAnchor(item.anchor)} type="button">{item.label}</button><button aria-label={`刪除書籤：${item.label}`} onClick={() => void repository.removeBookmark(item.id).then(() => setBookmarks((items) => items.filter((candidate) => candidate.id !== item.id)))} type="button">刪除</button></li>)}</ul>}
            {panel === "highlights" && <ul>{highlights.map((item) => <li key={item.id}><button onClick={() => void jumpToAnchor(item.anchor)} type="button"><mark className={`highlight-${item.color}`}>{item.quote}</mark></button><button aria-label={`刪除 Highlight：${item.quote}`} onClick={() => void removeHighlight(item.id)} type="button">刪除</button></li>)}</ul>}
            {panel === "appearance" && (book.format === "pdf"
              ? <div className="appearance-controls"><label>PDF 縮放 {Math.round(zoom * 100)}%<input aria-label={`PDF 縮放 ${Math.round(zoom * 100)}%`} max="3" min="0.5" onChange={(event) => void updateZoom(Number(event.target.value))} step="0.1" type="range" value={zoom}/></label><p>PDF 保持原始頁面 geometry；不提供字級重排。</p></div>
              : <div className="appearance-controls"><label>字體<select onChange={(event) => void updateAppearance({ fontFamily: event.target.value as "system-serif" | "system-sans" })} value={fontFamily}><option value="system-serif">System Serif</option><option value="system-sans">System Sans</option></select></label><label>字級 {fontSize}px<input max="32" min="14" onChange={(event) => void updateAppearance({ fontSize: Number(event.target.value) })} type="range" value={fontSize}/></label><label>行距 {lineHeight.toFixed(1)}<input max="2" min="1.4" onChange={(event) => void updateAppearance({ lineHeight: Number(event.target.value) })} step="0.1" type="range" value={lineHeight}/></label></div>)}
          </aside>
        )}
      </div>

      {returnLocation && (
        <div className="return-location-banner" role="status" aria-label="返回跳轉前位置">
          <span>已跳轉至章節</span>
          <button onClick={() => void returnToOriginalPage()} type="button">
            ↩ 返回跳轉前頁面 ({returnLocation.label})
          </button>
          <button
            aria-label="關閉返回提示"
            className="return-location-dismiss"
            onClick={() => setReturnLocation(undefined)}
            type="button"
          >
            ✕
          </button>
        </div>
      )}

      {selection && (
        <div className="selection-actions" role="toolbar" aria-label="選取文字工具">
          <strong>{selection.text}</strong>
          {(["yellow", "green", "blue", "pink"] as const).map((color) => <button aria-label={`以 ${color} Highlight`} className={`color-${color}`} key={color} onClick={() => void highlightSelection(color)} type="button" />)}
          <button onClick={() => window.open(webSearchUrl(selection.text), "_blank", "noopener,noreferrer")} type="button">Web Search</button>
          <button onClick={() => window.open(googleAiModeUrl(selection.text), "_blank", "noopener,noreferrer")} type="button">Google AI Mode 摘要</button>
        </div>
      )}

      <footer className="reader-navigation" aria-label="翻頁控制">
        <button disabled={!snapshot?.canGoPrevious} onClick={() => void go("previous")} type="button">上一頁</button>
        <span>{snapshot?.label ?? "—"}</span>
        <button disabled={!snapshot?.canGoNext} onClick={() => void go("next")} type="button">下一頁</button>
      </footer>
    </main>
  );
}
