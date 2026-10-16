import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";

import type { BookRecord } from "../domain/library";
import type { BookFileStore } from "../storage/book-file-store";
import type {
  BookmarkRecord,
  HighlightRecord,
  LibraryRepository,
} from "../storage/library-repository";

interface BackupManifest {
  schema: "codex-book-reader-backup";
  version: 1;
  kind: "reading-data" | "full-library";
  createdAt: string;
  books: BookRecord[];
  bookmarks: BookmarkRecord[];
  highlights: HighlightRecord[];
}

export interface BackupPreview {
  kind: BackupManifest["kind"];
  books: number;
  newBooks: number;
  duplicates: number;
  conflicts: number;
  missingBookFiles: number;
}

export interface RestoreDecision {
  idConflict: "skip" | "replace";
}

export interface RestoreResult {
  imported: number;
  updated: number;
  skipped: number;
}

interface ParsedBackup {
  manifest: BackupManifest;
  files: Record<string, Uint8Array>;
}

export class BackupValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackupValidationError";
  }
}

function validateManifest(value: unknown): BackupManifest {
  if (!value || typeof value !== "object") throw new BackupValidationError("Backup manifest 不是物件。");
  const manifest = value as Partial<BackupManifest>;
  if (
    manifest.schema !== "codex-book-reader-backup" ||
    manifest.version !== 1 ||
    (manifest.kind !== "reading-data" && manifest.kind !== "full-library") ||
    !Array.isArray(manifest.books) ||
    !Array.isArray(manifest.bookmarks) ||
    !Array.isArray(manifest.highlights)
  ) throw new BackupValidationError("Backup manifest schema 或 version 不受支援。");
  return manifest as BackupManifest;
}

async function parseBackup(blob: Blob): Promise<ParsedBackup> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
    let files: Record<string, Uint8Array>;
    try { files = unzipSync(bytes); }
    catch { throw new BackupValidationError("Full Library Backup ZIP 無法解開。"); }
    const manifestBytes = files["manifest.json"];
    if (!manifestBytes) throw new BackupValidationError("Backup 缺少 manifest.json。");
    try { return { manifest: validateManifest(JSON.parse(strFromU8(manifestBytes))), files }; }
    catch (error) { if (error instanceof BackupValidationError) throw error; throw new BackupValidationError("manifest.json 不是有效 JSON。"); }
  }
  try { return { manifest: validateManifest(JSON.parse(strFromU8(bytes))), files: {} }; }
  catch (error) { if (error instanceof BackupValidationError) throw error; throw new BackupValidationError("Reading Data Backup 不是有效 JSON。"); }
}

export class BackupService {
  constructor(
    private readonly repository: LibraryRepository,
    private readonly fileStore: BookFileStore,
  ) {}

  async exportReadingData(): Promise<Blob> {
    const manifest = await this.manifest("reading-data");
    return new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
  }

  async exportFullLibrary(): Promise<Blob> {
    const manifest = await this.manifest("full-library");
    const files: Record<string, Uint8Array> = {
      "manifest.json": strToU8(JSON.stringify(manifest, null, 2)),
    };
    for (const book of manifest.books) {
      const source = await this.fileStore.read(book.id);
      if (source) files[`books/${encodeURIComponent(book.id)}`] = new Uint8Array(await source.arrayBuffer());
    }
    return new Blob([zipSync(files, { level: 6 })], { type: "application/zip" });
  }

  async preview(blob: Blob): Promise<BackupPreview> {
    const parsed = await parseBackup(blob);
    const existing = await this.repository.listBooks();
    const byChecksum = new Map(existing.map((book) => [book.checksum, book]));
    const byId = new Map(existing.map((book) => [book.id, book]));
    let newBooks = 0;
    let duplicates = 0;
    let conflicts = 0;
    let missingBookFiles = 0;
    for (const book of parsed.manifest.books) {
      if (byChecksum.has(book.checksum)) duplicates += 1;
      else if (byId.has(book.id)) conflicts += 1;
      else newBooks += 1;
      if (parsed.manifest.kind === "full-library" && !parsed.files[`books/${encodeURIComponent(book.id)}`]) missingBookFiles += 1;
    }
    return { kind: parsed.manifest.kind, books: parsed.manifest.books.length, newBooks, duplicates, conflicts, missingBookFiles };
  }

  async restore(blob: Blob, decision: RestoreDecision): Promise<RestoreResult> {
    const parsed = await parseBackup(blob);
    const preview = await this.preview(blob);
    if (preview.missingBookFiles > 0) throw new BackupValidationError("Full Library Backup 有缺漏的原始書檔。");
    const existing = await this.repository.listBooks();
    const byChecksum = new Map(existing.map((book) => [book.checksum, book]));
    const byId = new Map(existing.map((book) => [book.id, book]));
    const idMap = new Map<string, string>();
    const result: RestoreResult = { imported: 0, updated: 0, skipped: 0 };

    for (const book of parsed.manifest.books) {
      const duplicate = byChecksum.get(book.checksum);
      if (duplicate) {
        idMap.set(book.id, duplicate.id);
        if (parsed.manifest.kind === "reading-data") {
          await this.repository.saveBook({
            ...duplicate,
            readingState: book.readingState,
            progress: book.progress,
            lastLocation: book.lastLocation,
            mustRead: book.mustRead,
            beloved: book.beloved,
          });
          result.updated += 1;
        } else {
          result.skipped += 1;
        }
        continue;
      }

      const idConflict = byId.get(book.id);
      if (idConflict && decision.idConflict === "skip") {
        result.skipped += 1;
        continue;
      }
      if (idConflict) {
        await this.repository.removeBook(idConflict.id);
        await this.fileStore.remove(idConflict.id);
        result.updated += 1;
      } else {
        result.imported += 1;
      }

      await this.repository.addBook(book);
      idMap.set(book.id, book.id);
      if (parsed.manifest.kind === "full-library") {
        const archived = parsed.files[`books/${encodeURIComponent(book.id)}`];
        const copied = new Uint8Array(archived.byteLength);
        copied.set(archived);
        await this.fileStore.write(book.id, new Blob([copied.buffer]));
      }
    }

    for (const bookmark of parsed.manifest.bookmarks) {
      const bookId = idMap.get(bookmark.bookId);
      if (bookId) await this.repository.saveBookmark({ ...bookmark, bookId });
    }
    for (const highlight of parsed.manifest.highlights) {
      const bookId = idMap.get(highlight.bookId);
      if (bookId) await this.repository.saveHighlight({ ...highlight, bookId });
    }
    return result;
  }

  private async manifest(kind: BackupManifest["kind"]): Promise<BackupManifest> {
    const [books, bookmarks, highlights] = await Promise.all([
      this.repository.listBooks(),
      this.repository.listAllBookmarks(),
      this.repository.listAllHighlights(),
    ]);
    return {
      schema: "codex-book-reader-backup",
      version: 1,
      kind,
      createdAt: new Date().toISOString(),
      books,
      bookmarks,
      highlights,
    };
  }
}
