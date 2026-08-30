import { afterEach, describe, expect, it } from "vitest";

import { DuplicateBookError, LibraryRepository } from "../storage/library-repository";
import type { BookFileStore } from "../storage/book-file-store";
import { BookImportService } from "./book-import-service";

class MemoryBookFileStore implements BookFileStore {
  readonly files = new Map<string, Blob>();

  async write(bookId: string, file: Blob): Promise<void> {
    this.files.set(bookId, file);
  }

  async read(bookId: string): Promise<Blob | undefined> {
    return this.files.get(bookId);
  }

  async remove(bookId: string): Promise<void> {
    this.files.delete(bookId);
  }
}

const repositories: LibraryRepository[] = [];

function setup() {
  const repository = new LibraryRepository(`import-test-${crypto.randomUUID()}`);
  const files = new MemoryBookFileStore();
  repositories.push(repository);
  return {
    repository,
    files,
    service: new BookImportService(repository, files),
  };
}

afterEach(async () => {
  await Promise.all(repositories.splice(0).map((repository) => repository.destroy()));
});

describe("BookImportService", () => {
  it("匯入 TXT 時保存 SHA-256、Book metadata 與原始檔", async () => {
    const { repository, files, service } = setup();
    const file = new File(["第 1 章 腎臟\n內容"], "腎臟生理.txt", {
      type: "text/plain",
    });

    const imported = await service.importBook(file, "2026-08-29T00:00:00.000Z");

    expect(imported).toMatchObject({
      title: "腎臟生理",
      fileName: "腎臟生理.txt",
      format: "txt",
      readingState: "unread",
      progress: 0,
    });
    expect(imported.checksum).toMatch(/^[a-f0-9]{64}$/);
    await expect(repository.getBook(imported.id)).resolves.toEqual(imported);
    await expect(files.read(imported.id)).resolves.toBe(file);
  });

  it("duplicate import 失敗時 rollback 新寫入的書檔", async () => {
    const { files, service } = setup();
    const first = new File(["相同內容"], "first.txt", { type: "text/plain" });
    const second = new File(["相同內容"], "second.txt", { type: "text/plain" });

    const imported = await service.importBook(first, "2026-08-29T00:00:00.000Z");

    await expect(
      service.importBook(second, "2026-08-29T00:01:00.000Z"),
    ).rejects.toBeInstanceOf(DuplicateBookError);
    expect([...files.files.keys()]).toEqual([imported.id]);
  });

  it("拒絕 scope 外的檔案格式且不寫入 storage", async () => {
    const { files, service } = setup();
    const file = new File(["data"], "book.mobi", {
      type: "application/x-mobipocket-ebook",
    });

    await expect(service.importBook(file)).rejects.toThrow("只支援 EPUB、TXT、PDF");
    expect(files.files.size).toBe(0);
  });
});
