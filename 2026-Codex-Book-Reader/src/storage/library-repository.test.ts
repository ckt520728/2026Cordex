import { afterEach, describe, expect, it } from "vitest";

import { createBookRecord } from "../domain/library";
import type { PointAnchor, RangeAnchor } from "../formats/types";
import {
  DuplicateBookError,
  LibraryRepository,
} from "./library-repository";

const repositories: LibraryRepository[] = [];

function createRepository(): LibraryRepository {
  const repository = new LibraryRepository(`test-${crypto.randomUUID()}`);
  repositories.push(repository);
  return repository;
}

const pointAnchor: PointAnchor = {
  kind: "persisted-anchor",
  anchorKind: "point",
  format: "txt",
  codec: { namespace: "txt-offset", version: 1 },
  payload: { offset: 12 },
  fallback: { progression: 0.2 },
};

const rangeAnchor: RangeAnchor = {
  kind: "persisted-anchor",
  anchorKind: "range",
  format: "txt",
  codec: { namespace: "txt-range", version: 1 },
  payload: { start: 12, end: 16 },
  fallback: { progression: 0.2, exactQuote: "腎功能" },
};

afterEach(async () => {
  await Promise.all(repositories.splice(0).map((repository) => repository.destroy()));
});

describe("LibraryRepository", () => {
  it("保存 Book 後可由 public API 取回", async () => {
    const repository = createRepository();
    const book = createBookRecord({
      id: "book-1",
      checksum: "sha256-one",
      fileName: "kidney.txt",
      title: "腎臟生理",
      authors: ["示例作者"],
      format: "txt",
      byteSize: 1024,
      importedAt: "2026-08-29T00:00:00.000Z",
    });

    await repository.addBook(book);

    await expect(repository.getBook("book-1")).resolves.toEqual(book);
    await expect(repository.listBooks()).resolves.toEqual([book]);
  });

  it("相同 SHA-256 的 Book 會得到明確 duplicate error", async () => {
    const repository = createRepository();
    const first = createBookRecord({
      id: "book-1",
      checksum: "same-sha256",
      fileName: "first.txt",
      title: "第一本",
      authors: [],
      format: "txt",
      byteSize: 10,
      importedAt: "2026-08-29T00:00:00.000Z",
    });
    const duplicate = { ...first, id: "book-2", fileName: "second.txt" };

    await repository.addBook(first);

    await expect(repository.addBook(duplicate)).rejects.toBeInstanceOf(DuplicateBookError);
  });

  it("刪除 Book 會一併刪除其 Bookmark 與 Highlight", async () => {
    const repository = createRepository();
    const book = createBookRecord({
      id: "book-1",
      checksum: "sha256-cascade",
      fileName: "cascade.txt",
      title: "刪除測試",
      authors: [],
      format: "txt",
      byteSize: 10,
      importedAt: "2026-08-29T00:00:00.000Z",
    });

    await repository.addBook(book);
    await repository.saveBookmark({
      id: "bookmark-1",
      bookId: book.id,
      label: "第 1 章",
      anchor: pointAnchor,
      createdAt: "2026-08-29T00:00:00.000Z",
    });
    await repository.saveHighlight({
      id: "highlight-1",
      bookId: book.id,
      quote: "腎功能",
      color: "yellow",
      anchor: rangeAnchor,
      createdAt: "2026-08-29T00:00:00.000Z",
    });

    await repository.removeBook(book.id);

    await expect(repository.getBook(book.id)).resolves.toBeUndefined();
    await expect(repository.listBookmarks(book.id)).resolves.toEqual([]);
    await expect(repository.listHighlights(book.id)).resolves.toEqual([]);
  });
});
