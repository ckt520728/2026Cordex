import Dexie, { type EntityTable } from "dexie";

import type { BookRecord } from "../domain/library";
import type { PointAnchor, RangeAnchor } from "../formats/types";

export interface BookmarkRecord {
  id: string;
  bookId: string;
  label: string;
  anchor: PointAnchor;
  createdAt: string;
}

export interface HighlightRecord {
  id: string;
  bookId: string;
  quote: string;
  color: "yellow" | "green" | "blue" | "pink";
  anchor: RangeAnchor;
  createdAt: string;
}

export class DuplicateBookError extends Error {
  constructor(readonly checksum: string) {
    super("此書籍已存在於 Device Library。");
    this.name = "DuplicateBookError";
  }
}

class ReaderDatabase extends Dexie {
  books!: EntityTable<BookRecord, "id">;
  bookmarks!: EntityTable<BookmarkRecord, "id">;
  highlights!: EntityTable<HighlightRecord, "id">;

  constructor(name: string) {
    super(name);
    this.version(1).stores({
      books: "id, &checksum, importedAt, readingState, mustRead, beloved",
      bookmarks: "id, bookId, [bookId+createdAt]",
      highlights: "id, bookId, [bookId+createdAt]",
    });
  }
}

export class LibraryRepository {
  private readonly database: ReaderDatabase;

  constructor(private readonly databaseName = "codex-book-reader") {
    this.database = new ReaderDatabase(databaseName);
  }

  async addBook(book: BookRecord): Promise<void> {
    if (await this.database.books.where("checksum").equals(book.checksum).first()) {
      throw new DuplicateBookError(book.checksum);
    }

    try {
      await this.database.books.add(book);
    } catch (error) {
      if (error instanceof Dexie.ConstraintError) {
        throw new DuplicateBookError(book.checksum);
      }
      throw error;
    }
  }

  async getBook(bookId: string): Promise<BookRecord | undefined> {
    return this.database.books.get(bookId);
  }

  async listBooks(): Promise<BookRecord[]> {
    return this.database.books.orderBy("importedAt").reverse().toArray();
  }

  async saveBook(book: BookRecord): Promise<void> {
    await this.database.books.put(book);
  }

  async saveBookmark(bookmark: BookmarkRecord): Promise<void> {
    await this.database.bookmarks.put(bookmark);
  }

  async listBookmarks(bookId: string): Promise<BookmarkRecord[]> {
    return this.database.bookmarks.where("bookId").equals(bookId).sortBy("createdAt");
  }

  async listAllBookmarks(): Promise<BookmarkRecord[]> {
    return this.database.bookmarks.toArray();
  }

  async removeBookmark(bookmarkId: string): Promise<void> {
    await this.database.bookmarks.delete(bookmarkId);
  }

  async saveHighlight(highlight: HighlightRecord): Promise<void> {
    await this.database.highlights.put(highlight);
  }

  async listHighlights(bookId: string): Promise<HighlightRecord[]> {
    return this.database.highlights.where("bookId").equals(bookId).sortBy("createdAt");
  }

  async listAllHighlights(): Promise<HighlightRecord[]> {
    return this.database.highlights.toArray();
  }

  async removeHighlight(highlightId: string): Promise<void> {
    await this.database.highlights.delete(highlightId);
  }

  async removeBook(bookId: string): Promise<void> {
    await this.database.transaction(
      "rw",
      [this.database.books, this.database.bookmarks, this.database.highlights],
      async () => {
        await Promise.all([
          this.database.books.delete(bookId),
          this.database.bookmarks.where("bookId").equals(bookId).delete(),
          this.database.highlights.where("bookId").equals(bookId).delete(),
        ]);
      },
    );
  }

  async destroy(): Promise<void> {
    this.database.close();
    await Dexie.delete(this.databaseName);
  }
}
