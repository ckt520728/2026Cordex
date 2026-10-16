import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { BookImportService } from "./application/book-import-service";
import { BackupService, type BackupPreview } from "./application/backup-service";
import {
  setBeloved,
  setFinished,
  setMustRead,
  type BookRecord,
} from "./domain/library";
import { ReaderScreen } from "./reader/ReaderScreen";
import type { BookFileStore } from "./storage/book-file-store";
import type { LibraryRepository } from "./storage/library-repository";

export interface AppServices {
  repository: LibraryRepository;
  fileStore: BookFileStore;
  importer: BookImportService;
}

type LibraryView = "all" | "reading" | "must-read" | "beloved" | "finished";

const views: Array<{ id: LibraryView; label: string }> = [
  { id: "all", label: "全部" },
  { id: "reading", label: "閱讀中" },
  { id: "must-read", label: "必讀" },
  { id: "beloved", label: "最愛" },
  { id: "finished", label: "已讀" },
];

function matchesView(book: BookRecord, view: LibraryView): boolean {
  if (view === "all") return true;
  if (view === "reading") return book.readingState === "reading";
  if (view === "must-read") return book.mustRead;
  if (view === "beloved") return book.beloved;
  return book.readingState === "finished";
}

function formatLabel(format: BookRecord["format"]): string {
  return format.toLocaleUpperCase();
}

function formatStorageBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function isIosSafari(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const isIos =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone =
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: standalone)").matches) ||
    Boolean((navigator as unknown as { standalone?: boolean }).standalone);
  return Boolean(isIos && !isStandalone);
}

export function App({ services }: { services: AppServices }) {
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [libraryReady, setLibraryReady] = useState(false);
  const [view, setView] = useState<LibraryView>("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookRecord>();
  const [notice, setNotice] = useState("正在讀取 Device Library…");
  const [restoreFile, setRestoreFile] = useState<File>();
  const [restorePreview, setRestorePreview] = useState<BackupPreview>();
  const [storageUsage, setStorageUsage] = useState<{ usage: number; quota: number } | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateCallback, setUpdateCallback] = useState<(() => void) | null>(null);
  const [showIosGuidance, setShowIosGuidance] = useState(() => {
    try {
      return isIosSafari() && localStorage.getItem("codex-hide-ios-install") !== "true";
    } catch {
      return isIosSafari();
    }
  });
  const importRef = useRef<HTMLInputElement>(null);
  const backupService = useMemo(
    () => new BackupService(services.repository, services.fileStore),
    [services.fileStore, services.repository],
  );

  const refreshStorage = useCallback(async () => {
    if (navigator.storage?.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage !== undefined && estimate.quota !== undefined) {
          setStorageUsage({ usage: estimate.usage, quota: estimate.quota });
        }
      } catch {
        setStorageUsage(null);
      }
    } else {
      setStorageUsage(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void services.repository
      .listBooks()
      .then((items) => {
        if (!active) return;
        setBooks(items);
        setNotice(items.length === 0 ? "尚未匯入書籍" : "");
      })
      .catch((error: unknown) => {
        if (active) setNotice(error instanceof Error ? error.message : "無法讀取書庫");
      })
      .finally(() => {
        if (active) setLibraryReady(true);
      });
    return () => {
      active = false;
    };
  }, [services.repository]);

  useEffect(() => {
    const handleOfflineReady = () => setOfflineReady(true);
    const handleUpdateAvailable = (event: Event) => {
      const custom = event as CustomEvent<{ update?: () => void }>;
      setUpdateCallback(() => custom.detail?.update ?? (() => window.location.reload()));
    };
    window.addEventListener("book-reader-offline-ready", handleOfflineReady);
    window.addEventListener("book-reader-update-available", handleUpdateAvailable);
    return () => {
      window.removeEventListener("book-reader-offline-ready", handleOfflineReady);
      window.removeEventListener("book-reader-update-available", handleUpdateAvailable);
    };
  }, []);

  useEffect(() => {
    void refreshStorage();
  }, [books.length, refreshStorage]);

  const visibleBooks = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return books.filter((book) => {
      if (!matchesView(book, view)) return false;
      if (!normalized) return true;
      return [book.title, book.fileName, ...book.authors]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalized);
    });
  }, [books, query, view]);

  async function importFiles(files: FileList | null) {
    if (!libraryReady || !files?.length) return;
    setBusy(true);
    setNotice(`正在匯入 ${files.length} 本書…`);
    try {
      const imported: BookRecord[] = [];
      const failures: string[] = [];
      const selectedFiles = Array.from(files);
      for (const [index, file] of selectedFiles.entries()) {
        setNotice(`正在匯入 ${index + 1} / ${selectedFiles.length}：${file.name}`);
        try {
          imported.push(await services.importer.importBook(file));
        } catch (error) {
          const reason = error instanceof Error ? error.message : "匯入失敗。";
          failures.push(`${file.name}（${reason}）`);
        }
      }
      if (imported.length > 0) setBooks((current) => [...imported, ...current]);
      setNotice(failures.length === 0
        ? `已匯入 ${imported.length} 本書`
        : `已匯入 ${imported.length} 本；${failures.length} 本失敗：${failures.join("、")}`);
    } finally {
      setBusy(false);
      if (importRef.current) importRef.current.value = "";
    }
  }

  const updateBook = useCallback(async (updated: BookRecord) => {
    await services.repository.saveBook(updated);
    setBooks((current) => current.map((book) => (book.id === updated.id ? updated : book)));
  }, [services.repository]);

  async function exportBackup(kind: "reading-data" | "full-library") {
    setBusy(true);
    try {
      const blob = kind === "reading-data"
        ? await backupService.exportReadingData()
        : await backupService.exportFullLibrary();
      const anchor = document.createElement("a");
      const url = URL.createObjectURL(blob);
      anchor.href = url;
      anchor.download = `墨頁-${kind}-${new Date().toISOString().slice(0, 10)}.${kind === "reading-data" ? "json" : "zip"}`;
      anchor.click();
      URL.revokeObjectURL(url);
      setNotice(kind === "reading-data" ? "Reading Data Backup 已匯出" : "Full Library Backup 已匯出");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Backup 匯出失敗");
    } finally {
      setBusy(false);
    }
  }

  async function previewRestore(file: File | undefined) {
    if (!file) return;
    setRestoreFile(file);
    try {
      setRestorePreview(await backupService.preview(file));
    } catch (error) {
      setRestorePreview(undefined);
      setNotice(error instanceof Error ? error.message : "無法讀取 Backup");
    }
  }

  async function restoreBackup(idConflict: "skip" | "replace") {
    if (!restoreFile) return;
    setBusy(true);
    try {
      const result = await backupService.restore(restoreFile, { idConflict });
      setBooks(await services.repository.listBooks());
      setNotice(`還原完成：新增 ${result.imported}、更新 ${result.updated}、跳過 ${result.skipped}`);
      setRestoreFile(undefined);
      setRestorePreview(undefined);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Backup 還原失敗");
    } finally {
      setBusy(false);
    }
  }

  /** 等待中的新版 Service Worker 會直接接手並重新載入，不需要使用者自己關掉 App。 */
  async function activateWaitingWorker(registration: ServiceWorkerRegistration): Promise<boolean> {
    const waiting = registration.waiting;
    if (!waiting) return false;
    setNotice("正在套用新版本…");
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => window.location.reload(),
      { once: true },
    );
    waiting.postMessage({ type: "SKIP_WAITING" });
    return true;
  }

  async function checkUpdatesAndRecover() {
    setNotice("正在檢查更新…");
    try {
      if (!("serviceWorker" in navigator)) {
        setNotice("此環境不支援 Service Worker：Safari 私密瀏覽會停用它，離線與更新功能都無法使用。請改用一般瀏覽視窗，或從主畫面開啟已加入的 App。");
        return;
      }
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setNotice("目前無運作中的 Service Worker，重新載入即可取得最新版本。");
        return;
      }
      await registration.update();
      if (await activateWaitingWorker(registration)) return;
      if (registration.installing) {
        setNotice("正在下載新版本，完成後會自動提示更新。");
        return;
      }
      setNotice("目前已是最新版本。若仍看到舊畫面，請按「強制更新」。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "檢查更新失敗");
    }
  }

  /**
   * 強制更新：移除 Service Worker 與快取後重新載入。
   * 只清掉 App 本體的快取，Device Library 的書檔與閱讀資料不受影響。
   */
  async function forceUpdate() {
    setNotice("正在清除 App 快取並重新載入…");
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "強制更新失敗");
      return;
    }
    window.location.reload();
  }

  if (selectedBook) {
    return (
      <ReaderScreen
        book={selectedBook}
        fileStore={services.fileStore}
        repository={services.repository}
        onBookUpdated={updateBook}
        onClose={() => setSelectedBook(undefined)}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="library-sidebar" aria-label="書庫導覽">
        <div className="brand-mark" aria-hidden="true">墨</div>
        <div>
          <p className="eyebrow">DEVICE LIBRARY</p>
          <h1>墨頁</h1>
          <p className="brand-subtitle">你的離線閱讀空間</p>
        </div>
        <nav className="sidebar-nav" aria-label="書庫分類">
          {views.map((item) => (
            <button
              className={view === item.id ? "nav-item active" : "nav-item"}
              key={item.id}
              onClick={() => setView(item.id)}
              type="button"
            >
              {item.label}
              <span>{books.filter((book) => matchesView(book, item.id)).length}</span>
            </button>
          ))}
        </nav>
        <p className="privacy-note">書籍與閱讀資料只保存在這部裝置。</p>
      </aside>

      <main className="library-main">
        <header className="library-header">
          <div>
            <p className="eyebrow">PERSONAL READING ROOM</p>
            <h2>我的書庫</h2>
            <p>在安靜的頁面裡，繼續上次的思考。</p>
          </div>
          <div className="header-actions">
          <button className="update-button" onClick={() => void checkUpdatesAndRecover()} type="button">更新 App</button>
          <label className={busy || !libraryReady ? "import-button disabled" : "import-button"}>
            <span aria-hidden="true">＋</span>
            {!libraryReady ? "讀取書庫" : busy ? "匯入中" : "匯入書籍"}
            <input
              ref={importRef}
              aria-label="匯入電子書"
              disabled={busy || !libraryReady}
              multiple
              onChange={(event) => void importFiles(event.target.files)}
              type="file"
            />
          </label>
          </div>
        </header>

        <div className="mobile-view-tabs" aria-label="書庫分類">
          {views.map((item) => (
            <button
              aria-pressed={view === item.id}
              key={item.id}
              onClick={() => setView(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <section className="library-tools" aria-label="書庫工具">
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">搜尋書庫</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜尋 title、author 或檔名"
              type="search"
              value={query}
            />
          </label>
          <span className="book-count">{visibleBooks.length} 本</span>
        </section>

        <section className="backup-tools" aria-label="備份工具">
          <button disabled={busy} onClick={() => void exportBackup("reading-data")} type="button">Reading Data Backup</button>
          <button disabled={busy} onClick={() => void exportBackup("full-library")} type="button">Full Library Backup</button>
          <button disabled={busy} onClick={() => void checkUpdatesAndRecover()} type="button">檢查更新</button>
          <button disabled={busy} onClick={() => void forceUpdate()} type="button">強制更新</button>
          <label>
            還原 Backup
            <input
              aria-label="選擇 Backup 檔案"
              onChange={(event) => void previewRestore(event.target.files?.[0])}
              type="file"
            />
          </label>
        </section>

        {restorePreview && (
          <section className="restore-preview" aria-label="還原預覽">
            <p>{restorePreview.kind === "full-library" ? "Full Library" : "Reading Data"}：{restorePreview.books} 本；新增 {restorePreview.newBooks}、重複 {restorePreview.duplicates}、ID 衝突 {restorePreview.conflicts}</p>
            <button disabled={restorePreview.missingBookFiles > 0} onClick={() => void restoreBackup("skip")} type="button">跳過衝突並還原</button>
            {restorePreview.conflicts > 0 && <button onClick={() => void restoreBackup("replace")} type="button">覆寫 ID 衝突並還原</button>}
            <button onClick={() => { setRestoreFile(undefined); setRestorePreview(undefined); }} type="button">取消</button>
          </section>
        )}

        {updateCallback && (
          <aside className="pwa-update-banner" role="status" aria-label="應用程式更新提示">
            <div className="update-banner-content">
              <strong>發現新版本</strong>
              <p>墨頁有新版本可用。更新會重新載入 app，不會刪除 Device Library 與閱讀紀錄。</p>
            </div>
            <div className="banner-actions">
              <button
                className="primary-button"
                onClick={() => {
                  updateCallback();
                  setUpdateCallback(null);
                }}
                type="button"
              >
                立即更新
              </button>
              <button onClick={() => setUpdateCallback(null)} type="button">
                稍後提醒
              </button>
            </div>
          </aside>
        )}

        {notice && <p className="notice" role="status">{notice}</p>}
        {offlineReady && <p className="notice">Offline app shell 已準備完成。</p>}
        {(() => {
          const percent = storageUsage && storageUsage.quota > 0 ? (storageUsage.usage / storageUsage.quota) * 100 : 0;
          const isHigh = percent >= 80;
          return (
            <div className={`storage-usage ${isHigh ? "warning" : ""}`} aria-label="裝置儲存空間">
              <div className="storage-usage-text">
                <span>
                  {storageUsage
                    ? `Device Library 約使用 ${formatStorageBytes(storageUsage.usage)}／可用配額 ${formatStorageBytes(storageUsage.quota)} (${percent.toFixed(1)}%)`
                    : "此瀏覽器無法估算 Device Library 使用量；匯入大型書檔前請確認裝置剩餘空間。"}
                </span>
                {isHigh && <strong className="storage-warning-tag">空間偏高（即將不足）</strong>}
              </div>
              <button
                aria-label="重新整理空間估算"
                className="storage-refresh-button"
                onClick={() => void refreshStorage()}
                type="button"
              >
                ↻
              </button>
            </div>
          );
        })()}
        {showIosGuidance && (
          <aside className="install-guidance" aria-label="iOS 安裝說明">
            <div className="install-guidance-header">
              <span>在 Safari 點「分享」→「加入主畫面」，即可像 app 一樣開啟並離線使用。</span>
              <button
                aria-label="關閉安裝說明"
                className="close-guidance-button"
                onClick={() => {
                  setShowIosGuidance(false);
                  try {
                    localStorage.setItem("codex-hide-ios-install", "true");
                  } catch {
                    // ignore
                  }
                }}
                type="button"
              >
                ✕
              </button>
            </div>
          </aside>
        )}

        {visibleBooks.length > 0 ? (
          <section className="book-grid" aria-label="書籍">
            {visibleBooks.map((book, index) => (
              <article className="book-card" key={book.id}>
                <div className={`book-cover tone-${index % 5}`}>
                  <span>{formatLabel(book.format)}</span>
                  <strong>{book.title.slice(0, 8)}</strong>
                </div>
                <div className="book-card-body">
                  <div className="book-meta-line">
                    <span>{formatLabel(book.format)}</span>
                    <span>{Math.round(book.progress * 100)}%</span>
                  </div>
                  <h3>{book.title}</h3>
                  <p>{book.authors.join("、") || "未知作者"}</p>
                  <div className="progress-track" aria-label={`閱讀進度 ${Math.round(book.progress * 100)}%`}>
                    <span style={{ width: `${book.progress * 100}%` }} />
                  </div>
                  <button
                    aria-label={`${book.progress > 0 ? "繼續閱讀" : "開始閱讀"}：${book.title}`}
                    className="read-book-button"
                    onClick={() => setSelectedBook(book)}
                    type="button"
                  >
                    {book.progress > 0 ? "繼續閱讀" : "開始閱讀"}
                  </button>
                  <div className="book-actions">
                    <button
                      aria-label={`${book.mustRead ? "移出必讀" : "加入必讀"}：${book.title}`}
                      aria-pressed={book.mustRead}
                      onClick={() => void updateBook(setMustRead(book, !book.mustRead))}
                      type="button"
                    >
                      {book.mustRead ? "必讀 ✓" : "必讀"}
                    </button>
                    <button
                      aria-label={`${book.beloved ? "移出最愛" : "加入最愛"}：${book.title}`}
                      aria-pressed={book.beloved}
                      onClick={() => void updateBook(setBeloved(book, !book.beloved))}
                      type="button"
                    >
                      {book.beloved ? "♥" : "♡"}
                    </button>
                    <button
                      aria-label={`${book.readingState === "finished" ? "取消已讀" : "標記已讀"}：${book.title}`}
                      aria-pressed={book.readingState === "finished"}
                      onClick={() => void updateBook(setFinished(book, book.readingState !== "finished"))}
                      type="button"
                    >
                      {book.readingState === "finished" ? "已讀" : "完成"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="empty-library">
            <div aria-hidden="true" className="empty-glyph">書</div>
            <h3>{books.length === 0 ? "從第一本書開始" : "沒有符合條件的書"}</h3>
            <p>{books.length === 0 ? "匯入 EPUB、TXT 或 PDF，離線閱讀資料只留在裝置上。" : "調整搜尋內容或選擇其他分類。"}</p>
            {books.length === 0 && (
              <button onClick={() => importRef.current?.click()} type="button">選擇書籍</button>
            )}
            <details className="import-help">
              <summary>在 iPhone／iPad 要怎麼匯入書？</summary>
              <ol>
                <li>先在 Google Drive／Dropbox app 開啟該書 → 「⋯」→「開啟方式」或「匯出」→「儲存到檔案」，存到「iCloud 雲碟」或「我的 iPhone／iPad」。</li>
                <li>回到墨頁按「匯入書籍」，在 Files 面板選剛才存下的檔案；也可直接切到「瀏覽」中的 Google Drive／Dropbox 位置選取。</li>
                <li>Email 附件、Safari 下載的書，可先按「分享」→「儲存到檔案」，再用同一個步驟匯入。</li>
                <li>只支援 DRM-free 的 EPUB、TXT、PDF；Apple Books 購買的書有 DRM，無法匯入。</li>
              </ol>
            </details>
          </section>
        )}
      </main>
    </div>
  );
}
